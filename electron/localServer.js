const express = require('express');
const path = require('path');
const fs = require('fs');

const { get_resumes} = require("./db");

class LocalServer {
  constructor() {
    this.server = null;
    this.port = 3001; // 默认端口
  }

  startServer(port = 3001) {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.stopServer();
      }

      const expressApp = express();
      this.port = port;

      // 中间件
      expressApp.use(express.json());
      expressApp.use(express.static(path.join(__dirname, 'public')));

      // 提供静态文件服务（PDF 文件等）
      expressApp.use('/files', express.static(path.join(__dirname, 'files')));

      // 示例 API 路由
      expressApp.get('/api/get_resume', (req, res) => {
          console.log(29, req.query);

          var { keys} = req.query;

          var resumes = get_resumes({page:1, pageSize:10, keys})

        res.json({ 
          message: 'Electron 本地服务',
          data: resumes,
          timestamp: new Date().toISOString()
        });
      });

      // 获取文件列表
      expressApp.get('/api/files', (req, res) => {
        const filesDir = path.join(__dirname, 'files');
        fs.readdir(filesDir, (err, files) => {
          if (err) {
            return res.status(500).json({ error: '无法读取文件目录' });
          }
          res.json({ files });
        });
      });

      expressApp.get('/api/pdfs', (req, res) => {
        const path = req.query.path;
        console.log(req, path);
        if (!fs.existsSync(path)) {
            return res.status(404).json({ error: '文件不存在' });
          }else{
              return path
          }
          return path
      });

      // 服务 PDF 文件
      expressApp.get('/api/pdf/:filename', (req, res) => {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, 'files', filename);
        
        // 安全检查：防止路径遍历攻击
        const safePath = path.normalize(filePath);
        if (!safePath.startsWith(path.join(__dirname, 'files'))) {
          return res.status(403).json({ error: '禁止访问' });
        }

        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
          fs.createReadStream(filePath).pipe(res);
        } else {
          res.status(404).json({ error: '文件未找到' });
        }
      });

      // 上传文件
      expressApp.post('/api/upload', express.raw({ type: '*/*', limit: '10mb' }), (req, res) => {
        const filename = `file-${Date.now()}.dat`;
        const filePath = path.join(__dirname, 'files', filename);
        
        fs.writeFile(filePath, req.body, (err) => {
          if (err) {
            return res.status(500).json({ error: '保存文件失败' });
          }
          res.json({ success: true, filename });
        });
      });

      // 启动服务
      this.server = expressApp.listen(this.port, '127.0.0.1', (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`本地服务运行在 http://127.0.0.1:${this.port}`);
          resolve(this.port);
        }
      });
    });
  }

  stopServer() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.server = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  getServerUrl() {
    return this.server ? `http://127.0.0.1:${this.port}` : null;
  }
}

module.exports = {
    LocalServer
};

