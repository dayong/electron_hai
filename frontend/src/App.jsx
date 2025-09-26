import React,{ useEffect,useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './components/Home/Home.jsx'
import ResumeList from './components/Resume/List'
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
  SettingOutlined,
  TeamOutlined,
  HomeOutlined
} from '@ant-design/icons';

import { Layout, Menu, theme, Button } from 'antd';

const { Header, Content, Footer, Sider } = Layout;

const siderStyle = {
  overflow: 'auto',
  height: '100vh',
  position: 'sticky',
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable',
};

const items = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">我的看板</Link>,
    },
    {
      key: '/resume',
      icon: <TeamOutlined />,
      label: <Link to="/resume">简历列表</Link>,
    },
    {
      key: '/contact',
      icon: <SettingOutlined />,
      label: <Link to="/contact">设置</Link>,
    },
  ]

const App = () => {
    const [collapsed, setCollapsed] = useState(false);
    useEffect(() => {

        const is_navigator_online = () => {
            window.api.send("message-to-main", {data:navigator.onLine, case: 'case_navigator_online'});
        }

          // 监听
          window.api.on("from_main_navigator_online", is_navigator_online);

          // 卸载时清理监听器
          return () => {
              // 卸载时清理
            window.api.off("from_main_navigator_online");
          };

    }, []);


  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout hasSider>
      <Sider style={siderStyle} collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['4']} items={items} />

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
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/resume" element={<ResumeList />} />
              </Routes>
            
            
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          haidesen ©{new Date().getFullYear()} Created by haidesen
        </Footer>
      </Layout>
    </Layout>
  );
};
export default App;
