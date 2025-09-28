const { app, BrowserWindow,globalShortcut, ipcMain, dialog } = require("electron");
const path = require("path");

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const { add_task, insertMany, get_resumes, start_task ,del_resume} = require("./db");

const { base_url } = require("./config");

const {
    doubao_parser,
    doubao_qrcode_refresh,
    doubao_get_login_status,
    close
} = require("./doubao");

const { case_parsed_resume_json_handle } = require("./handles");

app.disableHardwareAcceleration(); // 禁用 GPU

// 捕获未处理的 Promise 拒绝，避免进程崩溃
process.on("unhandledRejection", (reason, promise) => {
    console.error("⚠️ 未处理的 Promise Rejection:", reason);
  });

  
// 捕获同步异常
process.on("uncaughtException", (err) => {
    console.error("❌ 未捕获的异常:", err);
  });
   

var win;
function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });

    if (process.env.NODE_ENV === "development") {
        win.loadURL("http://localhost:5173");

        // win.loadFile(path.join(__dirname, "../frontend/dist/index.html"));
        
    } else {
        win.loadFile(path.join(__dirname, "../frontend/dist/index.html"));
    }

    // 注册全局快捷键：Ctrl+Shift+I 打开 DevTools
    globalShortcut.register('CommandOrControl+Shift+I', () => {
        if (win && win.webContents) {
            win.webContents.openDevTools({ mode: 'detach' })
        }
    });

    // win.webContents.openDevTools();

    

    ipcMain.on("message-to-main", async (event, message) => {
        let result;
        if (message && message.case) {
            switch (message.case) {
                // 大模型提取json后 -> 生成word简历
                case "case_parsed_resume_json":
                    console.log('case_parsed_resume_json_handle==========>', message.data)
                    result = await case_parsed_resume_json_handle(message.data);
                    // event.reply('from_main_parsed_resume', result);
                    console.log("send from_main_parsed_resume", result);
                    win.webContents.send("from_main_parsed_resume", result);
                    break;
                // 关闭puppeteer浏览器
                case "case_close_puppeteer":
                    console.log("main 关闭浏览器");
                    if(obj && obj.timer){
                        clearInterval(obj.timer)
                    }
                    await close();
                    break;
                //拿到网络状态后，自动同步 ，断点续传
                case "case_navigator_online":
                    console.log('网络状态',message.data);
                    start_task(message.data)
                    break;
                case "case_login_success":
                    console.log("登录成功");
                    // if(obj && obj.timer){
                    //     clearInterval(obj.timer)
                    // }
                    // await close();
                    break;
            }
        }
    });
}

app.whenReady().then(() => {
    createWindow();

    setInterval(function() {
        if (win) {
            win.webContents.send(
                "from_main_navigator_online",
                {}
            );
        }
    }, 50000);

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});



// 定义方法

var obj = {};

function doubao_status(win) {
    obj.timer = setInterval(async function() {
        if (win) {
            let result = await doubao_get_login_status();
            win.webContents.send(
                "message-from-main_doubao_login_status",
                result
            );
        }
    }, 1000);
}

ipcMain.handle("refresh-qrcode", async () => {
    let result = await doubao_qrcode_refresh();

    // 保存到 SQLite
    // saveResume(filePath, "uploaded");
    return result;
});

ipcMain.handle("select-pdf", async () => {
    let result = null;
    const { canceled, filePaths } = await dialog.showOpenDialog({
        filters: [{ name: "file", extensions: ["pdf", "docx"] }],
        properties: ["openFile"]
    });
    if (canceled) return null;

    const filePath = filePaths[0];
    const form = new FormData();

    form.append("file", fs.createReadStream(filePath));

    win.webContents.send("from_main_log", '发到服务提取text')

    // 发到服务提取text
    const res = await axios.post(
        `${base_url}/resume/parse_resume_from_electron`,
        form,
        {
            headers: {...form.getHeaders(),}
        }
    );



    win.webContents.send("from_main_log", res.data)

    console.log('发到服务提取text', res);

    
    if (res && res.data) {
        let { text, name, cell } = res.data;


        // return;

        // 解析简历  
        /*
        result = {
            status: 2,    //2 是拿到了解析后的html
            data: reply   //html 文本
        }
        */
       win.webContents.send("from_main_log", {'msg':"doubao_parser"})

       try{
        result = await doubao_parser(text);
       }catch(e){
        win.webContents.send("from_main_log", {'msg':"doubao_parser error"})
       }

       win.webContents.send("from_main_log", {'msg':"doubao_parser result", 'result':result})
        

        doubao_status(win);
        
        console.log("解析简历=================>>>>>>>>", result);
        if(result.data && result.status && result.status == 2){
            result.name = name
            result.cell = cell
        }
        
        console.log("解析简历=================>>>>>>>>", result);

        // return
    }

    return result;

    // console.log('res.data', res.data)
});


ipcMain.handle("select-pdf-and-word", async () => {
    // let result = null;
    const { canceled, filePaths } = await dialog.showOpenDialog({
        filters: [{ name: "file", extensions: ["pdf", "docx"] }],
        properties: ["openFile","multiSelections"]
    });
    if (canceled) return null;

    console.log('filePaths', filePaths)


    insertMany(filePaths)

    // 


    return filePaths;

    // console.log('res.data', res.data)
});

// 获取简历
ipcMain.handle("get-resumes", async (event, params) => {

    console.log('get-resumes收到的参数:', params);

    // let {page, pageSize, key} = params;
    /*
    resumes = {data,page,  total}
    */
    let resumes = get_resumes(params)

    // 
    return resumes;

    // console.log('res.data', res.data)
});

//删除简历   
ipcMain.handle("del_resume", async (event, id) => {

    console.log('del_resume收到的参数:', id);
    return del_resume(id)
});


//   ipcMain.handle("parse-resume", async (event) => {
//         const { canceled, filePaths } = await dialog.showOpenDialog({
//             filters: [{ name: "file", extensions: ["pdf", "docx"] }],
//             properties: ["openFile"],
//         });
//         if (canceled) return null;

//         const filePath = filePaths[0];

//     const form = new FormData();

//     form.append("file", fs.createReadStream(filePath));

//     const res = await axios.post("http://127.0.0.1:8000/resume/parse_resume_from_electron", form, {
//       headers: form.getHeaders(),
//     });

//     // console.log(98, res.data)

//     if(res && res.data){
//         let text = res.data.text;
//         // 解析简历
//         resume_html = await doubao_parser(text)
//         console.log(resume_html)
//     }

//     return resume_html
//   });

const userDataPath = process.env.NODE_ENV === "development"
  ? path.join(__dirname, 'myProfile')
  : path.join(app.getPath('userData'), 'app-data'); // 打包时使用系统目录

  app.setPath('userData', userDataPath);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

// 退出时注销快捷键
app.on('will-quit', () => {
    globalShortcut.unregisterAll()
});
