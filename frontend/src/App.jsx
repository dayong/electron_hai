import React from "react";
import { Layout, Menu, Button, Table } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Header, Content, Sider } = Layout;

function App() {
  const dataSource = [
    { key: 1, name: "Alice" },
    { key: 2, name: "Bob" },
  ];

  const columns = [
    { title: "ID", dataIndex: "key", key: "id" },
    { title: "姓名", dataIndex: "name", key: "name" },
  ];

  return (
    <Layout style={{ height: "100vh" }}>
      <Header style={{ color: "#fff" }}>Electron + React + Ant Design</Header>
      <Layout>
        <Sider width={200}>
          <Menu
            mode="inline"
            defaultSelectedKeys={["1"]}
            items={[{ key: "1", icon: <UserOutlined />, label: "用户管理" }]}
          />
        </Sider>
        <Layout style={{ padding: 20 }}>
          <Content style={{ background: "#fff", padding: 20 }}>
            <Button type="primary" onClick={() => alert(window.api.hello())}>
              测试 Electron API
            </Button>
            <Table dataSource={dataSource} columns={columns} />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;
