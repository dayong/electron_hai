import React, { useState, useEffect } from "react";
import { Routes, Route } from 'react-router-dom'
import { Layout, Menu, Button, Table, Image, Progress, Flex } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { del_html } from "../../tools.js"

const { Header, Content, Sider } = Layout;


function Home() {
    const [file, setFile] = useState('');
    const [jsonStr, setJsonStr] = useState('');
    const [src, setSrc] = useState(null);
    const [refresh_btn, setRefresh_btn] = useState('');
    const [isLogin, set_login_status] = useState(true);
    const [isLoading, set_loading_status] = useState(false);
    const [progress, set_progress] = useState(0);


    useEffect(() => {
        const parsed_resume_handleStatus = (data) => {
            console.log("收到主进程简历解析:", data);
            // setJsonStr(JSON.stringify(data, null, 2));
            if(data && data.success){
                console.log('解析后存储路径',data.path);


                setJsonStr(data.path)

                //关闭puppeeter
                window.api.send("message-to-main", {data:true, case: 'case_close_puppeteer'});

            }
        };


        const handleStatus = (data) => {
            console.log('38 登录状态 Received data in Renderer:', data);
                if(!data){
                    return
                }
            
                set_login_status(data.is_login)

                if(data.is_login){
                    //登录成功后 main中移除监听及关闭窗口
                    window.api.send("message-to-main", {data:true, case: 'case_login_success'});
                }
                
                if(data.is_qrcode_expired){
                    setSrc(null);
                    setRefresh_btn("二维码过期，请点击刷新")
                }
        };

        const is_navigator_online = () => {
            window.api.send("message-to-main", {data:navigator.onLine, case: 'case_navigator_online'});
        }


          // 监听
          window.api.on("message-from-main_doubao_login_status", handleStatus);

          window.api.on("from_main_parsed_resume", parsed_resume_handleStatus);

          window.api.on("from_main_navigator_online", is_navigator_online);

          // 卸载时清理监听器
          return () => {
              // 卸载时清理
            window.api.off("message-from-main_doubao_login_status");
            window.api.off("from_main_parsed_resume");
          };

    }, []);


    

    // const handleUpload = async () => {
    //     const result = await window.electronAPI.selectPdf();
        
    //     if (result) {
    //       setFile(result);
    
    //       // 这里调用 Python FastAPI
    //       const response = await fetch("http://127.0.0.1:8000/other/upload_resume_from_electron", {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify({
    //           file_path: result,
    //           parsed: {
    //             name: "张三",
    //             education: "清华大学 计算机本科",
    //             skills: ["Python", "Java"]
    //           }
    //         }),
    //       });
    //       console.log(await response.json());
    //     }
    //   };
    let timer = null
    function pregress_fn(start_time){
        timer = setInterval(function(){
            var current_time = (new Date()).getTime();
            var diff_time = Math.floor(((current_time - start_time)/1000/200) * 100);
            if(diff_time > 0 && diff_time <= 100){
                set_progress(diff_time)
            }
        },2000)
    }

    const handleUpload = async () => {
        const result = await window.api.selectPdfAndWord();
        console.log(result)
        
    }


    const handleParse = async () => {
        set_progress(0)
        set_loading_status(true)
        var start_time = (new Date()).getTime();
        pregress_fn(start_time);
        const result = await window.api.selectPdf();
        if (result) {
            // let html = del_html(result)
            let {status, data, cell, name} =  result;


            if(status === 1){
                set_loading_status(false)
                setSrc(data)
            }else if(status === 2){
                
                console.log('140140', status, data, cell, name);
                

                data = data.replace('张三', name)
                data = data.replace('13888888888', cell)
                
                set_progress(100)

                set_loading_status(false)

                if(timer){
                    clearInterval(timer)
                    timer = null;
                }

                let json_str = del_html(data);

                let resume_json = JSON.parse(json_str);

                // 拿到解析后的json str 发到main
                window.api.send("message-to-main", {data:resume_json, case: 'case_parsed_resume_json'});

 
            }
            // setFile(html);
      
            // console.log('result', html);
            // 调用豆包解析
            // var resume_html = doubao_parser(result);
          }
        
      };

    const refresh_qrcode = async () => {
        const result = await window.api.refreshQrcode();
        let {status, data} =  result;

            if(status === 3){
                setSrc(data)
                setRefresh_btn('')
            }
    }

      

//   const dataSource = [
//     { key: 1, name: "Alice111" },
//     { key: 2, name: "Bob" },
//   ];

//   const columns = [
//     { title: "ID", dataIndex: "key", key: "id" },
//     { title: "姓名", dataIndex: "name", key: "name" },
//   ];


  return (
          <Content style={{ background: "#fff", padding: 20 ,height: "100vh",width:"100%"}}>
          <div>
            <h1>简历解析</h1>
            <div style={{padding:20}}>
                {isLoading && (<Progress type="circle" percent={progress} />)}
            </div>

            <Flex gap="small" wrap>
                <Button type="primary" onClick={handleUpload}>
                    上传单一简历
                </Button>
                <Button type="primary" onClick={handleParse}>
                    解析 PDF
                </Button>
                <Button type="primary" >
                    Dashed
                </Button>
            </Flex>


            
            {file && <p>已选择: {file}</p>}
            
            {!isLogin && (<div><div>请用手机豆包扫码登录</div><Image style={{height:158, width: 158}} src={src} />
            <a onClick={refresh_qrcode}>{refresh_btn}</a></div>)}
            

            <div>{jsonStr}</div>
          </div>
            
          </Content>
  );
}

export default Home;
