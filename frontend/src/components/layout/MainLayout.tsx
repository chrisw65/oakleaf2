import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  ShoppingOutlined,
  MailOutlined,
  FunnelPlotOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  ShopOutlined,
  BarChartOutlined,
  ApiOutlined,
  DollarOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/contacts',
      icon: <TeamOutlined />,
      label: 'CRM',
      children: [
        { key: '/contacts', label: 'Contacts' },
        { key: '/opportunities', label: 'Opportunities' },
        { key: '/pipelines', label: 'Pipelines' },
      ],
    },
    {
      key: '/products',
      icon: <ShopOutlined />,
      label: 'Products',
    },
    {
      key: '/orders',
      icon: <ShoppingOutlined />,
      label: 'Orders',
    },
    {
      key: '/email',
      icon: <MailOutlined />,
      label: 'Email Marketing',
      children: [
        { key: '/email/campaigns', label: 'Campaigns' },
        { key: '/email/templates', label: 'Templates' },
        { key: '/email/sequences', label: 'Sequences' },
        { key: '/email/segments', label: 'Segments' },
      ],
    },
    {
      key: '/funnels',
      icon: <FunnelPlotOutlined />,
      label: 'Funnels',
    },
    {
      key: '/affiliates',
      icon: <DollarOutlined />,
      label: 'Affiliates',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
    {
      key: '/webhooks',
      icon: <ApiOutlined />,
      label: 'Webhooks',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      children: [
        { key: '/settings/profile', label: 'Profile' },
        { key: '/settings/users', label: 'Users' },
        { key: '/settings/roles', label: 'Roles & Permissions' },
        { key: '/settings/api-keys', label: 'API Keys' },
        { key: '/settings/domains', label: 'Custom Domains' },
      ],
    },
    {
      key: '/audit',
      icon: <AuditOutlined />,
      label: 'Audit Logs',
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/settings/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        theme="dark"
        width={250}
      >
        <div
          style={{
            height: 32,
            margin: 16,
            textAlign: 'center',
            color: 'white',
            fontSize: 18,
            fontWeight: 'bold',
          }}
        >
          {collapsed ? 'FP' : 'Funnel Platform'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} />
              <Text>{user?.firstName} {user?.lastName}</Text>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
