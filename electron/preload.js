const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("api", {
    selectPdf: () => ipcRenderer.invoke("select-pdf"),
    selectPdfAndWord: () => ipcRenderer.invoke("select-pdf-and-word"),
    getResumes: (params) => ipcRenderer.invoke("get-resumes", params),
    delResume: (id) => ipcRenderer.invoke("del_resume", id),
    refreshQrcode: () => ipcRenderer.invoke("refresh-qrcode"),
    
      // 你也可以暴露一个发送消息到主进程的方法（双向通信）
    sendToMain: (message) => {
        ipcRenderer.send('message-to-main', message);
    },
    // ✅ 通用事件监听
    on: (channel, callback) => {
        ipcRenderer.removeAllListeners(channel); // 先清理，避免重复
        ipcRenderer.on(channel, (event, ...args) => callback(...args));
    },

    // ✅ 移除监听
    off: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    },

    // ✅ 发送消息
    send: (channel, message) => {
        ipcRenderer.send(channel, message);
    }
});


