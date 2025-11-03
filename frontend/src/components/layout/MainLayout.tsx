import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, theme, Badge, Space } from 'antd';
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
  BellOutlined,
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
      danger: true,
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
        width={260}
        style={{
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Logo Area */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          }}
        >
          {!collapsed ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                F
              </div>
              <div>
                <div
                  style={{
                    color: 'white',
                    fontSize: 18,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    letterSpacing: '-0.5px',
                  }}
                >
                  Funnel Pro
                </div>
                <div
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: '0.5px',
                  }}
                >
                  PLATFORM
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              F
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{
            borderRight: 0,
            paddingTop: 8,
          }}
        />
      </Sider>

      <Layout>
        {/* Header */}
        <Header
          style={{
            padding: '0 32px',
            background: colorBgContainer,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Search & Breadcrumb Area (can be expanded later) */}
          <div style={{ flex: 1 }} />

          {/* Right Actions */}
          <Space size="large">
            {/* Notifications */}
            <Badge count={3} size="small">
              <BellOutlined
                style={{
                  fontSize: 20,
                  color: '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#6366f1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#64748b';
                }}
              />
            </Badge>

            {/* User Menu */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  borderRadius: 8,
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Avatar
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                  }}
                  icon={<UserOutlined />}
                />
                <div style={{ textAlign: 'left' }}>
                  <Text
                    strong
                    style={{
                      display: 'block',
                      fontSize: 14,
                      color: '#1e293b',
                    }}
                  >
                    {user?.firstName} {user?.lastName}
                  </Text>
                  <Text
                    type="secondary"
                    style={{
                      display: 'block',
                      fontSize: 12,
                      color: '#64748b',
                    }}
                  >
                    {user?.email}
                  </Text>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* Main Content */}
        <Content
          style={{
            margin: '24px 24px 0',
            overflow: 'initial',
          }}
        >
          <div
            className="page-enter"
            style={{
              padding: 32,
              minHeight: 'calc(100vh - 112px)',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
          >
            <Outlet />
          </div>
        </Content>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            padding: '24px 0',
            color: '#64748b',
            fontSize: 12,
          }}
        >
          Funnel Pro Platform © {new Date().getFullYear()} - Built with precision
        </div>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
