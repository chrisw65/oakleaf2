import React from 'react';
import { Row, Col, Card, Statistic, Typography, Space } from 'antd';
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2}>Welcome back, {user?.firstName}!</Title>
          <Typography.Text type="secondary">
            Here's what's happening with your business today.
          </Typography.Text>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Contacts"
                value={1234}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Orders"
                value={93}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Revenue"
                value={28450}
                precision={2}
                prefix={<DollarOutlined />}
                suffix="USD"
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Conversion Rate"
                value={11.28}
                precision={2}
                suffix="%"
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Recent Activity" style={{ height: 300 }}>
              <Typography.Text type="secondary">
                Recent activity will be displayed here
              </Typography.Text>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Quick Actions" style={{ height: 300 }}>
              <Typography.Text type="secondary">
                Quick action buttons will be displayed here
              </Typography.Text>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default DashboardPage;
