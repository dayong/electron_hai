const { app, BrowserWindow, session, screen } = require('electron');
const path = require('path');

const { RESUME_JSON_TEMP }  = require('./config')


app.commandLine.appendSwitch('disable-blink-features', 'AutomationControlled');
// 可选：去掉扩展/自动化标记
app.commandLine.appendSwitch('disable-features', 'EnableAutomation'); // 试试，有时有效


let win;
let browser_status = 0;
let parent

let userAgentList = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
]

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function createCrawlerWindow(parent) {
    // 获取主屏幕的可用工作区大小
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  const winWidth = 600;
  const winHeight = 600;

  // 计算窗口位置（右下角）
  const x = screenWidth - winWidth;
  const y = screenHeight - winHeight;


  // 隐藏窗口 (headless-like)
  const win = new BrowserWindow({
    show: true,
    width:winWidth,
    height:winHeight,
    x:x,
    y:y,
    webPreferences: {
      // 根据需要开/关
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'), // optional
    }
  });


  // 设置 UA（可选）
  win.webContents.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // 可选：拦截图片/字体以加速加载
  const ses = win.webContents.session;
  await ses.clearCache();

  ses.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
    const url = details.url.toLowerCase();
    // 阻止图片和第三方大文件
    if (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.gif') || url.includes('google-analytics') ) {
      return callback({ cancel: true });
    }
    callback({ cancel: false });
  });

  ///打开调试
//   win.webContents.openDevTools({ mode: 'detach' })

  return win;
}



async function doubao_parser(resume_text, parent) {
    console.log('doubao_parser 开始');
    win = win ? win : (await createCrawlerWindow(parent));
  const url = 'https://www.doubao.com/chat/';

  


  try {
    // 导航并等待 load 完成 (networkidle 类似需自实现)
    await win.loadURL(url, { waitUntil: 'load' });

    await sleep(10000);

    // 简单的 "等待元素出现" 实现（轮询）
    // await waitForSelector(win.webContents, 'div#main', 10000);


    // 也可以执行复杂脚本并拿回结构化数据
    
    const message_from_doubao = await win.webContents.executeJavaScript(`
      (async function(){
        let status = 'none';
        let timer = null;

        function sleep(ms){
            return new Promise(function(resolve){
                setTimeout(resolve, ms)
            })
        };

        function isDialog(){
            return document.querySelector('#semi-modal-body') ? true : false;
        };

        function isLogin(){
            //alert(localStorage.getItem('hasEnterGuest'));
            //return localStorage.getItem('hasEnterGuest') === '0' ? true : false
            var result = false;
            var r = /passport_fe_beating_status=([^;]+)/;
            if(r.test(document.cookie)){
                var arr = r.exec(document.cookie);
                result = arr[1] == 'false' ? false : true;
            }
            return result;
        }
  
        async function e_init(){
            let src_data = '';
            //未登录
            if(!isLogin()){
                //弹窗存在
                if(isDialog()){
                    status = '弹窗存在'
                }else{
                    
                    status = '弹窗部存在'
                    document.querySelector('button[data-testid="to_login_button"]').click();

                
                    await sleep(1000);
                    status = '切换二维码弹窗'
                    document.querySelector('div[data-testid="qrcode_switcher"]').click();
                    await sleep(1000);

             
                    src_data = document.querySelector('img[data-testid="qrcode_image"]').src;

                }

            }else{
                status = '已经是登录状态'
            }
            return src_data
        };

        let src_data = await e_init();

        return src_data
      })();
    `);
    

    // 条件命中说明未登录 展示二维码
    if(message_from_doubao){
        return {
            status: 1,  //1 是未登录拿到二维码信息
            data: message_from_doubao
        }
    }

    await waitForSelector(win.webContents, 'textarea', 10000);

    let template = JSON.stringify(RESUME_JSON_TEMP);

    let text = `请从下面简历文本内容中，按照模版 ${template} 简历JSON结构,返回结构化json。注意：1.如果模版中字段不够，请自行创建新字段。 2.如果模版中字段没有匹配到合适内容，也要返回这个字段,字段为空字符串。3.不需要创建英文字段(例如name:"张三",name_en:"zhang san")。4.在对话中返回json文本（不要返回让我下载的json文件）。5.最后增加个解析完毕字段：parse_from:'doubao'`
  
    console.log('138==============')

    // 模拟人工输入
    const question = `${text}:${resume_text}`;

    console.log('question',encodeURIComponent(question))

    // 写入剪贴板
    await win.webContents.executeJavaScript(`(async function(txt){

        txt = decodeURIComponent(txt);

        function sleep(ms){
            return new Promise(function(resolve){
                setTimeout(resolve, ms)
            })
        };

        const el = document.querySelector("textarea");
        const lastValue = el.value;
    
        // 原生 setter，兼容 React/Vue 受控组件
        const proto = Object.getPrototypeOf(el);
        const desc = Object.getOwnPropertyDescriptor(proto, "value");
        desc.set.call(el, txt);
    
        // React hack
        if (el._valueTracker) {
        el._valueTracker.setValue(lastValue);
        }
    
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));

        await sleep(2000);

        document.querySelector('textarea').dispatchEvent(new KeyboardEvent("keydown", {key:"Enter", code:"Enter", keyCode:13, which:13, bubbles:true}));


    })("${encodeURIComponent(question)}");`);


    // await sleep(2000); // 等 30 秒


    let f = await waitForElmCount(win);

    if(!f){
        return {
            status : 4
        }
    }
  
    console.log(193, f)


    // const reply = await win.webContents.executeJavaScript(`(async function(){
    //     let els = document.querySelectorAll('div[data-testid="message_text_content"][theme-mode]');
    //     let len = els.length;
    //     return els[len-1].innerHTML;
    // })()`);

    const reply = await win.webContents.executeJavaScript(`(async function(){
        let list = document.querySelectorAll('div[data-testid="receive_message"]');
        let len = list.length;
        return list[len-1].innerHTML;
    })()`);

    console.log(237, reply)

  
    browser_status = 2;
  
    return {
        status: 2,  //2 是拿到了解析后的html
        data: reply   //html 文本
    };

    // 截图（Buffer）
    // const image = await win.webContents.capturePage();
    // const pngBuffer = image.toPNG();

    // 关闭窗口
    // win.destroy();
    // return { html, data, screenshot: pngBuffer };

  } catch (err) {

    // win.destroy();
    // throw err;

  }finally{
    if(browser_status == 2){
        console.log('browser_status = 2 browser关闭')
        // await browser.close();
        // browser = null;
        // page = null;
    }
}
}



// 小工具：在 webContents 上轮询等待 selector
async function waitForSelector(webContents, selector, timeout = 10000, interval = 200) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const exists = await webContents.executeJavaScript(`!!document.querySelector(${JSON.stringify(selector)})`);
    if (exists) return;
    await new Promise(r => setTimeout(r, interval));
  }
  throw new Error('waitForSelector timeout: ' + selector);
}



async function close(){
    if(win){
        // 关闭窗口
        // win.destroy();
        win.close();
        win = null;
    }
}


async function waitForElmCount(win) {
   

    return new Promise(resolve => {
        let start_time = new Date().getTime();
        
        // let a = false;
        // let b = false;
        // let c = false;

        if (!win) {
            console.warn("Page 已关闭，跳过本次任务");
            return;
          }

        let timer = setInterval(async function(){
            let current_time = new Date().getTime();
            
            var className_text;

            try{
                // className_text = await win.webContents.executeJavaScript(`(function(){
                //     let els = document.querySelectorAll('div[data-testid ="chat_input_local_break_button"]');

                //     let final = '';
             
                //     if(els.length){
                //         final = els[0].className
                //     }
                //     return final

                // })()`);

                className_text = await win.webContents.executeJavaScript(`(function(){
                    let r = /parse_from[^\u4e00-\u9fa5{}a-zA-Z]+"doubao/;
                    return r.test(document.body.innerHTML) ? true : false;
                })()`);

            }catch(err){
                console.log("frame 已经不存在了", err.message)
                clearInterval(timer);
                timer = null;
                resolve(false)
            }



            let diff_time = (current_time - start_time)/1000;


            // console.log(className_text, diff_time)
            // if(className_text && /hidden/.test(className_text) && diff_time > 5){

            if(className_text && diff_time > 5){
                // console.log('命中',className_text, diff_time)
                clearInterval(timer);
                timer = null;
                resolve(true)
            }
            
        }, 300);
    });
  }


async function doubao_qrcode_refresh(){
    console.log('doubao_qrcode_refresh');

    if(win){

        let result = await win.webContents.executeJavaScript(`(function() {
            
            let data = '';
            function sleep(ms){
                return new Promise(function(resolve){
                    setTimeout(resolve, ms)
                })
            }


            async function r_init(){
                let src_data = '';
                
                document.querySelector('#semi-modal-body span[class="semi-icon semi-icon-default"]').click();

                await sleep(500);
                
                src_data = document.querySelector('img[data-testid="qrcode_image"]').src;

                return src_data
            }


            let r = /二维码失效/;
            let target_obj = document.querySelector('#semi-modal-body');
            if(target_obj && r.test(target_obj.innerHTML)){
                data = r_init();
            }


            return data;

        })();`);

        console.log(result);

        return {
            status: 3,  //
            data: result
        }
    }
}



//检测是否状态
async function doubao_get_login_status(){
    try {
        if(win){
    
            let status_data = await win.webContents.executeJavaScript(`(function(){
                function is_qrcode_expired(){
                    let r = /二维码失效/;
                    let target_obj = document.getElementById('semi-modal-body');
                    return !!target_obj && r.test(target_obj.innerHTML);
                }
    
                function isLogin(){
                    return localStorage.getItem('hasEnterGuest') === '0' ? true : false
                }

                return {
                    is_login:isLogin(),
                    is_qrcode_expired: is_qrcode_expired()
                }
                
            })();`)
            

            // 条件命中说明未登录 展示二维码
            return status_data
        }
    }catch(error){
        console.error('检查登录状态时出错:', error.message);
        return null;
    }
    

}


module.exports = {
    doubao_parser,
    close,
    doubao_qrcode_refresh,
    doubao_get_login_status
};

