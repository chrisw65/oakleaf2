import React, { useState } from 'react';
import { Layout, Menu, Breadcrumb, Avatar, Dropdown, Space, Typography } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  AreaChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  CrownOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: 'back-to-app',
      icon: <ArrowLeftOutlined />,
      label: 'Back to Main App',
      style: { borderBottom: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: 8 },
    },
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'User Management',
    },
    {
      key: '/admin/analytics',
      icon: <AreaChartOutlined />,
      label: 'Analytics',
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const userMenuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Main Dashboard',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        localStorage.removeItem('token');
        navigate('/login');
      },
    },
  ];

  // Get current page name from location
  const getCurrentPageName = () => {
    const item = menuItems.find(item => item.key === location.pathname);
    return item?.label || 'Dashboard';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <CrownOutlined style={{ fontSize: 24, color: '#ffd700' }} />
          {!collapsed && (
            <Text
              strong
              style={{
                marginLeft: 12,
                fontSize: 18,
                color: '#fff',
              }}
            >
              Admin Panel
            </Text>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => {
            if (key === 'back-to-app') {
              navigate('/dashboard');
            } else {
              navigate(key);
            }
          }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Space>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
              style: { fontSize: 18, cursor: 'pointer' },
            })}
            <Breadcrumb
              items={[
                { title: 'Admin' },
                { title: getCurrentPageName() },
              ]}
            />
          </Space>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<CrownOutlined />} style={{ backgroundColor: '#ffd700', color: '#000' }} />
              <Text strong>Admin</Text>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: 0,
            minHeight: 280,
            background: '#f0f2f5',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
