import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Steps,
  Form,
  Input,
  Button,
  Typography,
  message,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  NumberOutlined,
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";

import axios from "axios";

import {base_url} from '../config'

const { Title } = Typography;

export default function Register() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const [status, setStatus] = useState(""); // success | error | validating | ""
  const [help, setHelp] = useState("");

  const [status_email, setStatus_email] = useState(""); // success | error | validating | ""
  const [help_email, setHelp_email] = useState("");

  // 倒计时逻辑
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // 模拟发送验证码
  const sendCode = async () => {
    const email = form1.getFieldValue("email");
    if (!email) {
      message.warning("请先输入邮箱！");
      return;
    }
    try {
      setLoading(true);

      const res = await axios.post(`${base_url}/member/send_code`, {
        email: email
        });

      console.log('res', res)

      message.success(`验证码已发送到邮箱 ${email}`);

      setCountdown(60); // 开始倒计时 60 秒
    } catch {
      message.error("发送失败，请重试！");
    } finally {
      setLoading(false);
    }
  };

  const onStep1Finish = async (values) => {
    console.log("邮箱验证成功:", values);
    let { email, code, password } = values;

    setStatus("validating");
    setHelp("正在验证中...");

    setStatus_email("validating");
    setHelp_email("正在验证中...");

    if(!email){
        setStatus_email("error");
        setHelp_email("邮箱不能为空");
        return;
    }

    if(!/@[^@\.]+\.[a-z]+/.test(email)){
        setStatus_email("error");
        setHelp_email("邮箱格式错误");
        return;
    }

    if(!code){
        setStatus("error");
        setHelp("验证码不能为空");
        return;
    }

    

    try{
        let res = await axios.post(`${base_url}/member/verify_code_and_register`, { email, code, password });

        console.log(81, res);

        setHelp(res.data.message);

        // message.success(res.data.message);
        //528904
        // setCurrentStep(1);
    }catch(e){
        console.log(102, e.response.data.detail)
        // message.success(e.message);
        if(e.response.data.detail.key == 'code'){
            setStatus("error");
            setHelp(e.response.data.detail.message);
        }else if(e.response.data.detail.key == 'email'){
            setStatus_email("error");
            setHelp_email(e.response.data.detail.message);
        } 
    }

    
  };

  const onStep2Finish = async (values) => {
    console.log("注册信息:", values);

    setStatus("validating");
    setHelp("正在验证中...");

    const email = form1.getFieldValue("email");

    let { password, confirm } = values;

    try{
        let res = await axios.post(`${base_url}/member/electron_register`, {email, password, confirm });

        console.log(101, res);

        // message.success(res.data.message);
        // message.success("注册成功！");

        //navigate("/login");

    }catch(e){
        console.log(129, e)
    }

    
    
  };

  return (
    <Row
      justify="center"
      align="middle"
      style={{ height: "100vh", background: "#f5f5f5" }}
    >
      <Col xs={22} sm={16} md={10} lg={8} xl={6}>
        <Card
          bordered={false}
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
        >
          <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
            注册账号
          </Title>

          <Steps
            current={currentStep}
            size="small"
            items={[{ title: "邮箱验证" }, { title: "设置密码" }]}
            style={{ marginBottom: 24 }}
          />

          {/* 步骤1 */}
          {currentStep === 0 && (
            <Form form={form1} onFinish={onStep1Finish} layout="vertical">
              <Form.Item
                label="邮箱"
                name="email"
                validateStatus={status_email}
                help={help_email}
                
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="请输入邮箱"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="验证码"
                name="code"
                validateStatus={status}
                help={help}

              >
                <Input
                  prefix={<NumberOutlined />}
                  placeholder="请输入验证码"
                  size="large"
                  addonAfter={
                    <Button
                      type="link"
                      onClick={sendCode}
                      loading={loading}
                      disabled={countdown > 0}
                      style={{ padding: 0 }}
                    >
                      {countdown > 0
                        ? `重新发送 (${countdown}s)`
                        : "获取验证码"}
                    </Button>
                  }
                />
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
                  prefix={<LockOutlined />}
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
                  prefix={<LockOutlined />}
                  placeholder="确认密码"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large">
                  提交
                </Button>
              </Form.Item>

              <div style={{ textAlign: "center" }}>
                已有账号？<Link to="/login">去登录</Link>
              </div>
            </Form>
          )}

          {/* 步骤2 */}
          {currentStep === 1 && (
            <Form form={form2} onFinish={onStep2Finish} layout="vertical">
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
                  prefix={<LockOutlined />}
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
                  prefix={<LockOutlined />}
                  placeholder="确认密码"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block size="large">
                  完成注册
                </Button>
              </Form.Item>

              <div style={{ textAlign: "center" }}>
                <Button
                  type="link"
                  onClick={() => setCurrentStep(0)}
                  style={{ padding: 0 }}
                >
                  返回上一步
                </Button>
              </div>
            </Form>
          )}
        </Card>
      </Col>
    </Row>
  );
}
