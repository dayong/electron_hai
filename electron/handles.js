const fs = require("fs");
const axios = require("axios");
const path = require("path")
const os = require("os")
const { base_url } = require("./config");


async function case_parsed_resume_json_handle(resume_json){
    // console.log('handles.js',resume_json)
    try{
        const response = await axios.post(
            `${base_url}/resume/create_resume`,
             resume_json,
             { responseType: "arraybuffer" }
             );
        console.log('Response:', response.data); // 打印响应数据
        // 保存路径（下载到用户的 Downloads 文件夹）
        const downloadsPath = path.join(os.homedir(), "Downloads");
        const fileName = `${resume_json.basic_info.name || "resume"}.docx`;
        const filePath = path.join(downloadsPath, fileName);

        // 写入文件
        fs.writeFileSync(filePath, response.data);
        return { success: true, path: filePath };; // 返回响应数据

    }catch(e){
        console.error('Error during POST request:', e); // 打印错误信息
        return { success: false, error: e.message };
    }
    
}


module.exports = {
    case_parsed_resume_json_handle
};



