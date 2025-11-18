import React, { useState, useEffect } from "react";
import {Form, Input, Button,  Layout, message } from "antd";

import axios from "axios";

const { Content } = Layout;


function App() {
 
    const [form1] = Form.useForm();


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // //获取用户信息
        // const fetchUser = async () => {
        //     try {
        //         let res = await axios.get("http://127.0.0.1:8000/member/find_member",{
        //             headers: {
        //                 'Authorization': `${token}`
        //             }
        //         });
        //         console.log(81, res.data);

        //         if(res.data.msg == 'login success'){
        //             setEmail(res.data.email)
        //         }

        //     } catch (err) {
        //         console.log(25, err);
        //         navigate("/login");
        //     } finally {
              
        //     }
        //   };
        


        // fetchUser();


    }, []);


    const onFinish = async values => {
        console.log(77777, values);
        const {username, password, confirm} = values;

        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        try{
            let res = await axios.post(
                "http://127.0.0.1:8000/member/create_employee",
                { username, password },
                {
                    headers: {
                        'Authorization': `${token}`
                    }
                }
            );

            
    
            console.log(17, res);
    
            if(res.data.message == '创建成功'){
                alert('创建成功')
            }
            
    
            
        }catch(e){
            console.log(25, e);

            
        }
        
    };

    const layout = {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
    };

    


  return (
          <Content style={{ background: "#fff", padding: 20 ,height: "100vh",width:"100%"}}>
            <Form
                {...layout}
                name="nest-messages"
                onFinish={onFinish}
                style={{ maxWidth: 600 }}
            >
                <Form.Item
                name='username'
                label="昵称"
                rules={[
                    { required: true, message: "请输入昵称！" }
                ]}
                >
                    <Input placeholder="昵称"  />
                </Form.Item>

                <Form.Item
                label="密码"
                name="password"
                rules={[
                  { required: true, message: "请输入密码！" },
                  { min: 6, message: "密码至少6位！" },
                ]}
                hasFeedback
              >
                <Input.Password
                  placeholder="密码"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="确认密码"
                name="confirm"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  { required: true, message: "请确认密码！" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("两次输入的密码不一致！"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder="确认密码"
                  size="large"
                />
              </Form.Item>

                <Form.Item label={null}>
                <Button type="primary" htmlType="submit">
                    提交
                </Button>
                </Form.Item>
            </Form>
          </Content>
  );
}

export default App;
