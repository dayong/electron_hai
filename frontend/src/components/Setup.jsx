import React, { useState, useEffect } from "react";
import { Routes, Route } from 'react-router-dom'
import {Row, Col, Card, Form, Input, Button,  Layout, Menu, Table, Image, Progress, Flex } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Header, Content, Sider } = Layout;


function App() {
    const [file, setFile] = useState('');
    const [jsonStr, setJsonStr] = useState('');
    const [src, setSrc] = useState(null);
    const [refresh_btn, setRefresh_btn] = useState('');
    const [isLogin, set_login_status] = useState(true);
    const [isLoading, set_loading_status] = useState(false);
    const [progress, set_progress] = useState(0);

    const [form1] = Form.useForm();


    useEffect(() => {
        

      

        

    }, []);


    const onFinish = values => {
        console.log(values);
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
                    { required: true, message: "请输入邮箱！" },
                    { type: "email", message: "邮箱格式不正确！" }
                ]}
                >
                    <Input  size="large" />
                </Form.Item>

                
                <Form.Item name="company_info" label="公司简介">
                    <Input.TextArea />
                </Form.Item>

                <Form.Item name="kanban_config" label="看板配置">
                    <Input.TextArea />
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
