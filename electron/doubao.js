// deepseek.js
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
const path = require("path");

const { app } = require("electron");

const { RESUME_JSON_TEMP }  = require('./config')



let browser = null;

let page = null;

let browser_status = 0;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }




async function waitForElmCount(page) {
   

    return new Promise(resolve => {
        let start_time = new Date().getTime();
        
        // let a = false;
        // let b = false;
        // let c = false;

        if (page.isClosed()) {
            console.warn("Page 已关闭，跳过本次任务");
            return;
          }

        let timer = setInterval(async function(){
            let current_time = new Date().getTime();
            
            var className_text;

            try{
                className_text = await page.$$eval('div[data-testid ="chat_input_local_break_button"]', els => {
                    let final = '';
                    console.log(els.length, els)
                    if(els.length){
                        // resolve
                        final =  els[0].className
                    }
                    return final
                });

            }catch(err){
                console.log("frame 已经不存在了", err.message)
                clearInterval(timer);
                timer = null;
                resolve(false)
            }



            let diff_time = (current_time - start_time)/1000;


            // console.log(className_text, diff_time)

            if(className_text && /\!hidden/.test(className_text) && diff_time > 5){
                // console.log('命中',className_text, diff_time)
                clearInterval(timer);
                timer = null;
                resolve(true)
            }

            // console.log(targets.length , targets, diff_time);
       
            // if(targets.length && /\!hidden/.test(targets[0].className)){
            //     resolve
            // }
            
        }, 300);
    });
  }
  
  // 使用
 

puppeteer.use(StealthPlugin());

// const COOKIE_PATH = "./cookies.json"; // 存储 DeepSeek 登录态


function is_login(){

}

async function doubao_qrcode_refresh(){
    let r = ''
    if(browser && page){

        let result = await page.evaluate(() => {
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
            
        }, '');

        return {
            status: 3,  //
            data: result
        }
    }
}

//检测状态
async function doubao_get_login_status(){
    try {
        if(browser && page){
            // 检查页面是否关闭
            if (page.isClosed()) {
                console.log('页面已关闭，无法执行 evaluate');
                return null;
            }
    
            // 检查主frame是否可用
            if (!page.mainFrame() || page.mainFrame().isDetached()) {
                console.log('主Frame已分离，无法执行 evaluate');
                return null;
            }
    
    
            let status_data = await page.evaluate(() => {
    
    
    
                function is_qrcode_expired(){
                    let r = /二维码失效/;
                    let target_obj = document.getElementById('semi-modal-body');
                    return !!target_obj && r.test(target_obj.innerHTML);
                }
          
    
                function isLogin(){
                    return document.querySelector('button[data-testid="to_login_button"]') ? false : true;
                }
    
                
                return {
                    is_login:isLogin(),
                    is_qrcode_expired: is_qrcode_expired()
                }
                
    
            }, '');
    
            // console.log('status_data = ', status_data)
    
    
            // 条件命中说明未登录 展示二维码
            return status_data
        }
    }catch(error){
        console.error('检查登录状态时出错:', error.message);
        return null;
    }
    

}






let userDataDir;
if (process.env.NODE_ENV === "development") {
    userDataDir = path.join(__dirname, "myProfile");
} else {
    userDataDir = path.join(app.getPath("userData"), "myProfile");
}


async function doubao_parser(resume_text){
    console.log('doubao_parser开始。。。')
    try{
        // 启动浏览器
  browser = browser || (await puppeteer.launch({
    headless: false, // 打开可见浏览器方便调试
    userDataDir: userDataDir, // 保存用户数据目录
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  }));

  page = page || (await browser.newPage());

//   // 如果有 cookies，先加载
//   if (fs.existsSync(COOKIE_PATH)) {
//     const cookies = JSON.parse(fs.readFileSync(COOKIE_PATH));
//     await page.setCookie(...cookies);
//   }

  // 进入 DeepSeek 网站
  await page.goto("https://www.doubao.com/chat/", { waitUntil: "networkidle2" });

  await sleep(1000); // 等 3 秒

  



//   page.click(page.$(".cursor-pointer"))

  // 如果第一次运行，需要手动登录，登录后保存 cookie
//   if (!fs.existsSync(COOKIE_PATH)) {
//     console.log("请手动完成登录...");
//     // await page.waitForTimeout(30000); // 给30秒完成登录
//     await sleep(30000); // 等 30 秒
//     const cookies = await page.cookies();
//     fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2));
//     console.log("✅ Cookies 已保存，下次可直接复用");
//   }


  let message_from_doubao = await page.evaluate(() => {

            function sleep(ms){
                return new Promise(function(resolve){
                    setTimeout(resolve, ms)
                })
            }
      
            function isDialog(){
                return document.querySelector('#semi-modal-body') ? true : false;
            }

            function isLogin(){
                return document.querySelector('button[data-testid="to_login_button"]') ? false : true;
            }

            let status = 'none'


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
                        await sleep(500);

                        
                        src_data = document.querySelector('img[data-testid="qrcode_image"]').src;
                          
                    }

                }else{
                    status = '已经是登录状态'
                }
                return src_data
            }


            let src_data = e_init();
            
            

            return src_data

        }, '');

        console.log('message_from_doubao = ', message_from_doubao)


    // 条件命中说明未登录 展示二维码
    if(message_from_doubao){
        return {
            status: 1,  //1 是未登录拿到二维码信息
            data: message_from_doubao
        }
    }


  // 等待输入框出现
  await page.waitForSelector("textarea");


  let template = JSON.stringify(RESUME_JSON_TEMP);


  let text = `请从下面简历文本内容中，按照模版 ${template} 简历JSON结构,返回结构化json。注意：1.如果模版中字段不够，请自行创建新字段。 2.如果模版中字段没有匹配到合适内容，也要返回这个字段,字段为空字符串。3.不需要创建英文字段(例如name:"张三",name_en:"zhang san")`
  
  console.log('prompt',text)

  // 模拟人工输入
  const question = `${text}:${resume_text}`;


  // 写入剪贴板
  await page.evaluate((txt) => {
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
  }, question);
  



//   await page.type("textarea", 'end', { delay: 80 + Math.random() * 40 });
  
  // 粘贴到 textarea



  await sleep(2000); // 等 30 秒

  await page.keyboard.press("Enter");


//   await sleep(20000); // 等 30 秒

  // 等待 AI 回复
//   await page.waitForSelector(".message", { timeout: 60000 });
  //data-testid="message_action_bar"

  // 提取最后一条消息
  console.log(351)


  let f = await waitForElmCount(page);

  if(!f){
      return {
          status : 4
      }
  }

  console.log(854, f)


  const reply = await page.$$eval('div[data-testid="message_text_content"][theme-mode]', els => {
      let len = els.length;
      return els[len-1].innerHTML;
  });

    browser_status = 2;

  return {
      status: 2,  //2 是拿到了解析后的html
      data: reply   //html 文本
  };

  console.log("🤖 DeepSeek 回复：", reply);
    }
    catch(e){
        console.log(e)
    }
    finally{
        if(browser_status == 2){
            console.log('browser_status = 2 browser关闭')
            await browser.close();
            browser = null;
            page = null;
        }
    }
}


async function close(){
    if(!browser) return;
    await browser.close();
    browser = null;
    page = null;
}


module.exports = {
    doubao_parser,
    close,
    doubao_qrcode_refresh,
    doubao_get_login_status
};



