const Database = require('better-sqlite3');
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");

const { app } = require("electron");




function getDatabasePath() {
    if (process.env.NODE_ENV === "development") {
        return path.join(__dirname, "../resources/resume.db");
    } else {

    // const userDataPath = app.getPath("userData");
    // const dbPath = path.join(userDataPath, "resume.db");

    // 获取用户数据路径
    const userDbPath = path.join(app.getPath("userData"), "resume.db");

    //默认数据库路径
    const defaultDbPath = path.join(process.resourcesPath, "resume.db");

    // if (!fs.existsSync(dbPath)) {
    //     // 如果没有数据库，就新建一个空的
    //     const db = new Database(dbPath);
    //     db.close();
    // }

    // 如果数据库不存在，就复制一份默认数据库
if (!fs.existsSync(userDbPath)) {
    try {
      if (fs.existsSync(defaultDbPath)) {
        fs.copyFileSync(defaultDbPath, userDbPath);
        console.log("✅ 已复制默认数据库到:", userDbPath);
      } else {
        console.log("⚠️ 未找到默认数据库，将创建一个空库");
      }
    } catch (err) {
      console.error("❌ 初始化数据库失败:", err);
    }
  }

    return userDbPath;
    }
}



let db,
dbPath = getDatabasePath();

console.log(53, dbPath)


try {
  db = new Database(dbPath);
  console.log("✅ 数据库已连接:", dbPath);
} catch (err) {
  console.error("❌ 无法打开数据库:", err);
  process.exit(1);
}





// 初始化简历表
db.exec(`
CREATE TABLE IF NOT EXISTS list (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_path TEXT,
  file_hash TEXT,
  name TEXT,
  phone TEXT,
  resume_text TEXT,
  server_id TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'success', 'failed')),
  is_parse INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)
`);

/**
 * 构建多关键词 AND 查询的 SQL 语句
 * @param {string[]} keywords - 搜索关键词数组
 * @param {string} column - 要搜索的列名 (比如 name, cell)
 * @returns {{ sql: string, params: string[] }}
 */
function buildSearchSql(keywords, column = "name") {
    if (!keywords || keywords.length === 0) {
      return { sql: "", params: [] };
    }
  
    // 每个关键词拼接成 column LIKE ?
    const conditions = keywords.map(() => `${column} LIKE ?`).join(" AND ");
  
    // 参数绑定
    const params = keywords.map(k => `%${k}%`);
  
    return {
      sql: `(${conditions})`,
      params
    };
  }
  
  // 示例用法
//   const { sql, params } = buildSearchSql(["张三", "北京"], "name");

  

function add_task(filePath, status) {
    const stmt = db.prepare("INSERT INTO list (file_path, status) VALUES (?, ?)");
    stmt.run(filePath, status);
}

const insertMany = db.transaction((resumes) => {
    const stmt = db.prepare('INSERT INTO list (file_path, status) VALUES (?, ?)');
    for (const resume of resumes) {
      stmt.run(resume, 'pending');
    }
    return {'success':true}
  });

// function get_resumes(){
//     const resumes = db.prepare('SELECT * FROM list order by id desc').all();
//     return resumes;
// }

function del_resume(id){
    try {
        console.log('开始移除..', id);
        const stmt = db.prepare("DELETE FROM list WHERE id = ?");
        const info = stmt.run(id);
    
        console.log("✅ 删除成功:", info.changes);
        return { success: true, changes: info.changes };
      } catch (err) {
        console.log("❌ 删除失败:", err.message);
        return { success: false, error: err.message };
      }
}


function get_resumes(resume_params) {
    console.log('get_resumes', resume_params)
    let {page, pageSize, keys} = resume_params;

    const offset = (page - 1) * pageSize;

    let query,stmt,rows,result;


    if(keys){
        let key_arr = keys.split(/\s|,/);
        const { sql, params } = buildSearchSql(key_arr, "resume_text");
         query = `SELECT * FROM list WHERE ${sql} ORDER BY created_at DESC LIMIT ? OFFSET ? `;
         stmt = db.prepare(`SELECT COUNT(*) as count FROM list WHERE ${sql}`);
         rows = db.prepare(query).all(...params,pageSize, offset);
         result = stmt.get(...params);  // 展开参数
    }else{
         query = `SELECT * FROM list ORDER BY created_at DESC LIMIT ? OFFSET ? `;
         stmt = db.prepare(`SELECT COUNT(*) as count FROM list`);
         rows = db.prepare(query).all(pageSize, offset);
         result = stmt.get();  // 展开参数
    }
    
   

    const total = result.count;

    console.log('total', total, rows);
  
    return { data: rows, total, page};
  }


async function uploadFile(task) {
    console.log('开始上传....')
    try {
      const form = new FormData();
      form.append("file", fs.createReadStream(task.file_path));
  
      let result = await axios.post("http://127.0.0.1:8000/resume/parse_resume_from_electron", form, {
        headers: form.getHeaders(),
      });

      console.log('同步后返回', result.data)
      if(result.data){
        result = result.data;
      }

      db.prepare("UPDATE list SET status = ?,name = ?,phone=?,resume_text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run("success",result.name, result.cell,result.source_text, task.id);
      
      console.log("✅ 上传成功:", task.file_path);
      return {success:true}
    } catch (err) {
      console.log("❌ 上传失败，稍后重试:", task.file_path, err.message);
      return {success:false}
    }
  }
  
  // 扫描任务
  async function processPendingUploads() {
    console.log('processPendingUploads');
    const rows = db.prepare("SELECT * FROM list WHERE status = 'pending'").all();
    
    
      if (rows && rows.length) {
        for (let task of rows) {
          await uploadFile(task);
        }
      }
    
  }

function start_task(is_online){
      console.log('start_task',is_online)
        if (is_online) { // Electron/浏览器里可用，Node 里用 ping
            processPendingUploads();
        } else {
            console.log("🚫 当前无网络，等待重试...");
        }
       
  }

module.exports = {
    add_task,
    insertMany,
    get_resumes,
    del_resume,
    start_task
};

