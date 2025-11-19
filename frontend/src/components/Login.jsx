import { Row, Col, Card, Form, Input, Button, Typography, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";

import axios from "axios";

import {base_url} from '../config'

const { Title } = Typography;

export default function Login() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    console.log("登录信息:", values);
    let { email_or_username, password } = values;

    try{

        // POST 请求
        const res = await window.api.httpRequest({
            method: 'POST',
            url: `${base_url}/member/login`, // 会自动拼接 BASE_URL
            data: { email_or_username, password }
        });


        // let res = await axios.post(`${base_url}/member/login`, { email_or_username, password });

        console.log(30, res);

        if(res.data.message == '登录成功'){
            localStorage.setItem('token', res.data.hai_access_token)
            navigate("/");
        }
        

        // navigate("/");

        // setHelp(res.data.message);

        // message.success(res.data.message);
        //528904
        // setCurrentStep(1);
    }catch(e){
        console.log(25, e);
        // message.success(e.message);
        // if(e.response.data.detail.key == 'code'){
        //     setStatus("error");
        //     setHelp(e.response.data.detail.message);
        // }else if(e.response.data.detail.key == 'email'){
        //     setStatus_email("error");
        //     setHelp_email(e.response.data.detail.message);
        // } 
    }
    
    
  };

  return (
    <Row
      justify="center"
      align="middle"
      style={{
        height: "100vh",
        background: "#f5f5f5",
      }}
    >
      <Col xs={22} sm={16} md={10} lg={8} xl={6}>
        <Card bordered={false} style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
            登录
          </Title>

          <Form name="login" onFinish={onFinish}>
            <Form.Item
              name="email_or_username"
              rules={[
                { required: true, message: "请输入用户名或邮箱！" }
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="用户名或邮箱" size="large" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "请输入密码！" }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large">
                登录
              </Button>
            </Form.Item>

            <div style={{ textAlign: "center" }}>
              没有账号？<Link to="/register">立即注册</Link>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
