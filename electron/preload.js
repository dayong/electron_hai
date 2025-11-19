const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("api", {
    selectPdf: (token) => ipcRenderer.invoke("select-pdf", token),
    readPdfFile: (filePath) => ipcRenderer.invoke("read-pdf-file", filePath),
    selectPdfAndWord: () => ipcRenderer.invoke("select-pdf-and-word"),
    getResumes: (params) => ipcRenderer.invoke("get-resumes", params),
    delResume: (id) => ipcRenderer.invoke("del_resume", id),
    refreshQrcode: () => ipcRenderer.invoke("refresh-qrcode"),
    httpRequest: (options) => ipcRenderer.invoke('http-request', options),
    
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



// preload.js
// 更完整的 "stealth" evasion 列表 - 供 Electron preload 使用
// 放在 BrowserWindow 的 webPreferences.preload 中，确保 contextIsolation: true, nodeIntegration: false
(function () {
    'use strict';
  
    // ==== helpers ====
    const makeNativeString = (name) => `function ${name}() { [native code] }`;
  
    // 用来把一个函数的 toString 呈现为原生样式
    function patchToString(func, name) {
      try {
        const nativeStr = makeNativeString(name || func.name || 'anonymous');
        Object.defineProperty(func, 'toString', {
          value: function () { return nativeStr; },
          configurable: true,
          writable: false,
        });
      } catch (e) {
        // best-effort
      }
    }
  
    // 安全地 defineProperty（避免目标已经不可配置导致抛错）
    function safeDefine(obj, prop, descriptor) {
      try {
        Object.defineProperty(obj, prop, descriptor);
      } catch (e) {
        // ignore
      }
    }
  
    // ==== 1) navigator.webdriver === false ====
    try {
      safeDefine(navigator, 'webdriver', {
        get: () => false,
        configurable: true
      });
    } catch (e) {}
  
    // ==== 2) navigator.languages === ['en-US','en'] ====
    try {
      safeDefine(navigator, 'languages', {
        get: () => ['en-US', 'en'],
        configurable: true
      });
    } catch (e) {}
  
    // ==== 3) navigator.plugins & mimeTypes (简单模拟 PluginArray/MimeTypeArray) ====
    (function () {
      try {
        // 简单的 fake plugin/mime data —— 按需改成更丰富的列表
        const fakePlugins = [
          {
            name: 'Chrome PDF Plugin',
            filename: 'internal-pdf-viewer',
            description: 'Portable Document Format'
          },
          {
            name: 'Widevine Content Decryption Module',
            filename: 'widevinecdm',
            description: ''
          }
        ];
  
        function makePlugin(plugin) {
          return {
            name: plugin.name,
            filename: plugin.filename,
            description: plugin.description,
            length: 0
          };
        }
  
        // PluginArray-like
        const PluginArrayProto = {
          length: fakePlugins.length,
          item: function (i) { return this[i]; },
          namedItem: function (name) {
            for (let i = 0; i < this.length; i++) {
              if (this[i].name === name) return this[i];
            }
            return null;
          }
        };
  
        const pluginArray = [];
        for (let i = 0; i < fakePlugins.length; i++) {
          pluginArray[i] = makePlugin(fakePlugins[i]);
        }
        Object.setPrototypeOf(pluginArray, PluginArrayProto);
  
        safeDefine(navigator, 'plugins', {
          get: () => pluginArray,
          configurable: true
        });
  
        // mimeTypes 简单匹配 plugins (不模拟太复杂)
        const mimeArray = [];
        Object.setPrototypeOf(mimeArray, {
          length: pluginArray.length,
          item: function (i) { return this[i]; },
          namedItem: function (name) { return null; }
        });
        safeDefine(navigator, 'mimeTypes', {
          get: () => mimeArray,
          configurable: true
        });
      } catch (e) {}
    })();
  
    // ==== 4) window.chrome 对象 ====
    try {
      if (!window.chrome) {
        // 简单地提供 runtime 等常见属性
        safeDefine(window, 'chrome', {
          writable: false,
          configurable: true,
          value: {
            runtime: {},
            // add other members as needed
          }
        });
      } else {
        // ensure runtime exists
        try { window.chrome.runtime = window.chrome.runtime || {}; } catch (e) {}
      }
    } catch (e) {}
  
    // ==== 5) navigator.permissions.query 补丁（绕过检测） ====
    (function () {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const origQuery = navigator.permissions.query.bind(navigator.permissions);
          const patchedQuery = (parameters) => {
            // 一些检测会询问 notifications 权限
            if (parameters && parameters.name === 'notifications') {
              return Promise.resolve({ state: Notification.permission });
            }
            return origQuery(parameters);
          };
          patchToString(patchedQuery, 'query');
          safeDefine(navigator.permissions, 'query', {
            value: patchedQuery,
            configurable: true,
            writable: false
          });
        }
      } catch (e) {}
    })();
  
    // ==== 6) navigator.userAgent 覆盖（如果需要） ====
    // 注意：通常推荐在创建 BrowserWindow 时从主进程就设置好 userAgent。
    try {
      const ua = navigator.userAgent.replace('HeadlessChrome', 'Chrome');
      safeDefine(navigator, 'userAgent', {
        get: () => ua,
        configurable: true
      });
    } catch (e) {}
  
    // ==== 7) navigator.hardwareConcurrency & deviceMemory ====
    try {
      safeDefine(navigator, 'hardwareConcurrency', {
        get: () => 4, // 真实设备请按需设置
        configurable: true
      });
    } catch (e) {}
  
    try {
      safeDefine(navigator, 'deviceMemory', {
        get: () => 8, // GB，按需设置
        configurable: true
      });
    } catch (e) {}
  
    // ==== 8) WebGL vendor/renderer 伪装（常被 fingerprint 库读取） ====
    (function () {
      try {
        // patch getParameter of WebGLRenderingContext.prototype and WebGL2RenderingContext.prototype
        const getParamPatcher = (proto) => {
          if (!proto) return;
          const origGetParam = proto.getParameter;
          function getParameterPatched(param) {
            // 0x1F01 = VENDOR, 0x1F02 = RENDERER
            if (param === 0x1F01) { // VENDOR
              return 'Intel Inc.';
            }
            if (param === 0x1F02) { // RENDERER
              return 'Intel Iris OpenGL Engine';
            }
            return origGetParam.apply(this, arguments);
          }
          try {
            safeDefine(proto, 'getParameter', {
              value: getParameterPatched,
              configurable: true,
              writable: false
            });
            patchToString(getParameterPatched, 'getParameter');
          } catch (e) {}
        };
  
        getParamPatcher(window.WebGLRenderingContext && window.WebGLRenderingContext.prototype);
        getParamPatcher(window.WebGL2RenderingContext && window.WebGL2RenderingContext.prototype);
      } catch (e) {}
    })();
  
    // ==== 9) 覆盖 navigator.mediaDevices.enumerateDevices（减少真实设备信息泄露） ====
    (function () {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const orig = navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
          const patched = function () {
            return orig().then((devices) => {
              // 过滤掉 label（避免公开真实麦克风/摄像头名称），并返回常见数量
              const out = devices.map(d => {
                return {
                  deviceId: d.deviceId,
                  kind: d.kind,
                  label: '',
                  groupId: d.groupId || ''
                };
              });
              return out;
            });
          };
          patchToString(patched, 'enumerateDevices');
          safeDefine(navigator.mediaDevices, 'enumerateDevices', {
            value: patched,
            configurable: true
          });
        }
      } catch (e) {}
    })();
  
    // ==== 10) 覆盖 navigator.webdriver 在 prototype 链上也不可见 ====
    (function () {
      try {
        // 有些检测会检查 Object.getOwnPropertyDescriptor(Navigator.prototype, 'webdriver')
        const proto = Object.getPrototypeOf(navigator);
        if (proto && proto.hasOwnProperty('webdriver')) {
          try {
            safeDefine(proto, 'webdriver', {
              get: () => false,
              configurable: true
            });
          } catch (e) {}
        }
      } catch (e) {}
    })();
  
    // ==== 11) Function.prototype.toString 伪装（让被覆盖的函数看起来像 native） ====
    (function () {
      try {
        const origToString = Function.prototype.toString;
        const nativeRegex = /\{\s*\[native code\]\s*\}/;
        function patchedFunctionToString() {
          // 如果是我们自己patch过的函数，尝试给出 native-like 字符串（best-effort）
          try {
            if (this && this.__isPatchedByStealth) {
              return makeNativeString(this.name || 'anonymous');
            }
          } catch (e) {}
          return origToString.apply(this, arguments);
        }
        // 标记已 patch 的函数时，我们会给它 __isPatchedByStealth = true
        // 覆盖 Function.prototype.toString（best-effort）
        try {
          safeDefine(Function.prototype, 'toString', {
            value: patchedFunctionToString,
            configurable: true,
            writable: true
          });
        } catch (e) {}
      } catch (e) {}
    })();
  
    // ==== 12) 标记并 patch 一些函数的 toString（把我们替换后的函数伪装成 native） ====
    (function () {
      try {
        // 标记之前定义的 patched functions
        const mark = (fn) => {
          try {
            safeDefine(fn, '__isPatchedByStealth', {
              value: true,
              configurable: true
            });
            patchToString(fn, fn.name || 'patched');
          } catch (e) {}
        };
  
        // patch examples we've created above (permissions.query / enumerateDevices / getParameter)
        try {
          if (navigator.permissions && navigator.permissions.query) mark(navigator.permissions.query);
        } catch (e) {}
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) mark(navigator.mediaDevices.enumerateDevices);
        } catch (e) {}
        try {
          if (window.WebGLRenderingContext && window.WebGLRenderingContext.prototype.getParameter) {
            mark(window.WebGLRenderingContext.prototype.getParameter);
          }
        } catch (e) {}
        try {
          if (window.WebGL2RenderingContext && window.WebGL2RenderingContext.prototype.getParameter) {
            mark(window.WebGL2RenderingContext.prototype.getParameter);
          }
        } catch (e) {}
  
      } catch (e) {}
    })();
  
    // ==== 13) navigator.connection 伪装（有些 fingerprinting 会读取 downlink/effectiveType） ====
    (function () {
      try {
        if (navigator.connection) {
          try {
            safeDefine(navigator.connection, 'effectiveType', { get: () => '4g', configurable: true });
            safeDefine(navigator.connection, 'downlink', { get: () => 10, configurable: true });
            safeDefine(navigator.connection, 'rtt', { get: () => 50, configurable: true });
          } catch (e) {}
        } else {
          // 创建一个简单的 connection 对象
          safeDefine(navigator, 'connection', {
            get: () => ({
              effectiveType: '4g',
              downlink: 10,
              rtt: 50,
              saveData: false
            }),
            configurable: true
          });
        }
      } catch (e) {}
    })();
  
    // ==== 14) 覆盖 navigator.getBattery（某些检测会读取 battery 信息） ====
    (function () {
      try {
        if (navigator.getBattery) {
          const orig = navigator.getBattery.bind(navigator);
          const patched = function () {
            return orig().then((b) => {
              // 复制但修改对象，只修改少量字段以减少差异
              return {
                charging: true,
                level: 1,
                chargingTime: 0,
                dischargingTime: Infinity,
                // 保留接口方法
                onchargingchange: b.onchargingchange,
                onlevelchange: b.onlevelchange
              };
            });
          };
          patchToString(patched, 'getBattery');
          safeDefine(navigator, 'getBattery', { value: patched, configurable: true });
        }
      } catch (e) {}
    })();
  
    // ==== 15) 其它常见小修补（document.hidden 等） ====
    try {
      safeDefine(Document.prototype, 'hidden', {
        get: function () { return false; },
        configurable: true
      });
      safeDefine(Document.prototype, 'visibilityState', {
        get: function () { return 'visible'; },
        configurable: true
      });
    } catch (e) {}
  
    // ==== 结束语（打印下日志，便于调试 - 可删） ====
    try {
      // 在页面 console 中输出一次（便于确认 preload 已执行）
      console.info('[preload-stealth] applied stealth patches');
    } catch (e) {}
  
  })();
  


