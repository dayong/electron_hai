import React,{ useEffect,useState } from 'react';
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    AppstoreOutlined,
    BarChartOutlined,
    CloudOutlined,
    ShopOutlined,
    UploadOutlined,
    UserOutlined,
    VideoCameraOutlined,
    LogoutOutlined,
    SettingOutlined,
    TeamOutlined,
    HomeOutlined
} from '@ant-design/icons';

import { Layout, Menu, theme, Button } from 'antd';

import axios from "axios";

import {base_url} from '../../config'

const { Header, Content, Footer, Sider } = Layout;

const siderStyle = {
  overflow: 'auto',
  height: '100vh',
  position: 'sticky',
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable'
};

const items = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '我的看板',
    },
    {
      key: '/resume',
      icon: <TeamOutlined />,
      label: '人才',
    },
    {
        key: '/company_position',
        icon: <TeamOutlined />,
        label: '客户&职位',
        children: [
            { key: 'company_position', label: '客户列表' },
            { key: 'position_list', label: '职位列表' },
            { key: 'cp_create_company', label: '新增客户' },
            { key: 'cp_create_position', label: '新增职位' }
          ]
    },
    {
        icon: <SettingOutlined />,
        label: '员工账号',
        children: [
            { key: 'employee', label: '列表' },
            { key: 'create_employee', label: '创建' }
          ],
    },
    {
        key: '/tools',
        icon: <SettingOutlined />,
        label: '解析工具',
    },
    {
        key: '/setup',
        icon: <SettingOutlined />,
        label: '设置'
    }
  ]

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
//   const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        //获取用户信息
        const fetchUser = async () => {
            try {
                let res = await axios.get(`${base_url}/member/find_member`,{
                    headers: {
                        'Authorization': `${token}`
                    }
                });
                console.log(94, res.data);

                if(res.data.msg == 'login success'){
                    setEmail(res.data.email_or_username)
                }

            } catch (err) {
                console.log(25, err);
                navigate("/login");
            } finally {
              
            }
          };
        // try{
        //     // let res = await axios.get("http://127.0.0.1:8000/member/find_member");
    
        //     // console.log(17, res);
    
        //     // if(res.data.message == '登录成功'){
        //     //     navigate("/");
        //     // }

        // }catch(e){
        //     // console.log(25, e);
        //     // navigate("/login");
        //     // console.log(80);
        //     // message.success(e.message);
        //     // if(e.response.data.detail.key == 'code'){
        //     //     setStatus("error");
        //     //     setHelp(e.response.data.detail.message);
        //     // }else if(e.response.data.detail.key == 'email'){
        //     //     setStatus_email("error");
        //     //     setHelp_email(e.response.data.detail.message);
        //     // } 
        // }

        fetchUser();



        const is_navigator_online = () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            window.api.send("message-to-main", {data:navigator.onLine, case: 'case_navigator_online', token});
        }

        // 监听
        try{
        window.api.on("from_main_navigator_online", is_navigator_online);
        }catch(e){}
          

        // 卸载时清理监听器
        return () => {
            // 卸载时清理
            try{
            window.api.off("from_main_navigator_online");
            }catch(e){}
        
        };

    }, []);


    const handleMenuClick = (e) => {
        if (e.key === "logout") {
          navigate("/login");
        } else {
          navigate(e.key);
        }
      };


    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
  return (
    <Layout hasSider>
      <Sider style={siderStyle} collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']} 
        items={[
            ...items,
            { key: "logout", label: "退出登录", icon: <LogoutOutlined /> }
        ]} onClick={handleMenuClick} />

      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
        <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <span>{email}</span>
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div
            style={{
              padding: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              height:'100vh'
            }}
          >
              <Outlet />
              
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          haidesen ©{new Date().getFullYear()} Created by haidesen
        </Footer>
      </Layout>
    </Layout>
  );
};
export default MainLayout;
