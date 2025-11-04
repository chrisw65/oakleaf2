import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Space, Progress, Tag, Button, List, Avatar } from 'antd';
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  MailOutlined,
  FunnelPlotOutlined,
  TeamOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { Area, Column, Pie } from '@ant-design/plots';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text, Paragraph } = Typography;

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Mock data for charts
  const revenueData = [
    { month: 'Jan', value: 12400 },
    { month: 'Feb', value: 15200 },
    { month: 'Mar', value: 18900 },
    { month: 'Apr', value: 21300 },
    { month: 'May', value: 24100 },
    { month: 'Jun', value: 28450 },
  ];

  const conversionData = [
    { stage: 'Visitors', count: 10000 },
    { stage: 'Leads', count: 3500 },
    { stage: 'Qualified', count: 1200 },
    { stage: 'Customers', count: 420 },
  ];

  const trafficSourceData = [
    { type: 'Organic Search', value: 45 },
    { type: 'Direct', value: 28 },
    { type: 'Social Media', value: 18 },
    { type: 'Email', value: 9 },
  ];

  const recentActivities = [
    {
      title: 'New contact added',
      description: 'John Doe was added to CRM',
      time: '2 minutes ago',
      icon: <UserOutlined />,
      color: '#6366f1',
    },
    {
      title: 'Order completed',
      description: 'Order #1234 for $299.00',
      time: '15 minutes ago',
      icon: <ShoppingOutlined />,
      color: '#10b981',
    },
    {
      title: 'Email campaign sent',
      description: 'Summer Sale to 2,450 contacts',
      time: '1 hour ago',
      icon: <MailOutlined />,
      color: '#f59e0b',
    },
    {
      title: 'Funnel published',
      description: 'Product Launch funnel is now live',
      time: '3 hours ago',
      icon: <FunnelPlotOutlined />,
      color: '#8b5cf6',
    },
  ];

  const topPerformers = [
    { name: 'Jane Smith', value: '$24,500', change: '+12%', avatar: 'JS' },
    { name: 'Mike Johnson', value: '$21,300', change: '+8%', avatar: 'MJ' },
    { name: 'Sarah Williams', value: '$19,800', change: '+15%', avatar: 'SW' },
  ];

  // Area Chart Config
  const areaConfig = {
    data: revenueData,
    xField: 'month',
    yField: 'value',
    smooth: true,
    areaStyle: {
      fill: 'l(270) 0:#6366f1 0.5:#8b5cf6 1:#ffffff',
      fillOpacity: 0.3,
    },
    line: {
      color: '#6366f1',
    },
    point: {
      size: 5,
      shape: 'circle',
      style: {
        fill: '#6366f1',
        stroke: '#fff',
        lineWidth: 2,
      },
    },
  };

  // Column Chart Config
  const columnConfig = {
    data: conversionData,
    xField: 'stage',
    yField: 'count',
    color: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'],
    columnStyle: {
      radius: [8, 8, 0, 0],
    },
    label: {
      position: 'top' as const,
      style: {
        fill: '#1e293b',
        fontWeight: 600,
      },
    },
  };

  // Pie Chart Config
  const pieConfig = {
    data: trafficSourceData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    color: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b'],
    label: {
      formatter: (datum: any) => {
        if (!datum || !datum.type || typeof datum.value === 'undefined') return '';
        return `${datum.type}: ${datum.value}%`;
      },
      style: {
        fontSize: 12,
      },
    },
    statistic: {
      title: {
        offsetY: -8,
        content: 'Total',
        style: {
          fontSize: '14px',
          color: '#64748b',
        },
      },
      content: {
        offsetY: 4,
        content: '100%',
        style: {
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#1e293b',
        },
      },
    },
  };

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Welcome Section */}
        <div>
          <Title level={2} style={{ marginBottom: 8, color: '#1e293b' }}>
            Welcome back, {user?.firstName}! 👋
          </Title>
          <Paragraph style={{ fontSize: 16, color: '#64748b', marginBottom: 0 }}>
            Here's what's happening with your business today. You're doing great!
          </Paragraph>
        </div>

        {/* Key Metrics */}
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Total Contacts</span>}
                value={1234}
                prefix={<UserOutlined style={{ color: 'white' }} />}
                suffix={
                  <Tag color="success" style={{ marginLeft: 8 }}>
                    <ArrowUpOutlined /> 12%
                  </Tag>
                }
                valueStyle={{ color: 'white', fontWeight: 700 }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Total Orders</span>}
                value={93}
                prefix={<ShoppingOutlined style={{ color: 'white' }} />}
                suffix={
                  <Tag color="success" style={{ marginLeft: 8 }}>
                    <ArrowUpOutlined /> 8%
                  </Tag>
                }
                valueStyle={{ color: 'white', fontWeight: 700 }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Revenue</span>}
                value={28450}
                precision={2}
                prefix={<DollarOutlined style={{ color: 'white' }} />}
                valueStyle={{ color: 'white', fontWeight: 700 }}
                suffix={
                  <Tag color="success" style={{ marginLeft: 8 }}>
                    <ArrowUpOutlined /> 23%
                  </Tag>
                }
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Conversion Rate</span>}
                value={11.28}
                precision={2}
                suffix="%"
                prefix={<RiseOutlined style={{ color: 'white' }} />}
                valueStyle={{ color: 'white', fontWeight: 700 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Row */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DollarOutlined style={{ color: '#6366f1' }} />
                  <span style={{ fontWeight: 600 }}>Revenue Overview</span>
                  <Tag color="success" style={{ marginLeft: 'auto' }}>
                    <ArrowUpOutlined /> 23% vs last period
                  </Tag>
                </div>
              }
              bordered={false}
              style={{ height: 400 }}
            >
              <Area {...areaConfig} height={300} />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <EyeOutlined style={{ color: '#8b5cf6' }} />
                  <span style={{ fontWeight: 600 }}>Traffic Sources</span>
                </div>
              }
              bordered={false}
              style={{ height: 400 }}
            >
              <Pie {...pieConfig} height={300} />
            </Card>
          </Col>
        </Row>

        {/* Second Row */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FunnelPlotOutlined style={{ color: '#10b981' }} />
                  <span style={{ fontWeight: 600 }}>Conversion Funnel</span>
                </div>
              }
              bordered={false}
              style={{ height: 400 }}
            >
              <Column {...columnConfig} height={300} />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ClockCircleOutlined style={{ color: '#f59e0b' }} />
                  <span style={{ fontWeight: 600 }}>Recent Activity</span>
                </div>
              }
              bordered={false}
              style={{ height: 400 }}
            >
              <List
                dataSource={recentActivities}
                renderItem={(item) => (
                  <List.Item style={{ border: 'none', padding: '12px 0' }}>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{
                            backgroundColor: item.color,
                            boxShadow: `0 2px 8px ${item.color}40`,
                          }}
                          icon={item.icon}
                        />
                      }
                      title={<Text strong>{item.title}</Text>}
                      description={
                        <>
                          <Text type="secondary">{item.description}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {item.time}
                          </Text>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        {/* Bottom Row */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TeamOutlined style={{ color: '#6366f1' }} />
                  <span style={{ fontWeight: 600 }}>Quick Stats</span>
                </div>
              }
              bordered={false}
            >
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: '#6366f1' }}>87%</div>
                    <Text type="secondary">Email Open Rate</Text>
                    <Progress percent={87} strokeColor="#6366f1" showInfo={false} />
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: '#10b981' }}>64%</div>
                    <Text type="secondary">Lead Quality Score</Text>
                    <Progress percent={64} strokeColor="#10b981" showInfo={false} />
                  </div>
                </Col>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: '#f59e0b' }}>92%</div>
                    <Text type="secondary">Customer Satisfaction</Text>
                    <Progress percent={92} strokeColor="#f59e0b" showInfo={false} />
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrophyOutlined style={{ color: '#f59e0b' }} />
                  <span style={{ fontWeight: 600 }}>Top Performers</span>
                </div>
              }
              bordered={false}
            >
              <List
                dataSource={topPerformers}
                renderItem={(item, index) => (
                  <List.Item style={{ border: 'none', padding: '12px 0' }}>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{
                            backgroundColor: '#6366f1',
                            fontWeight: 'bold',
                          }}
                        >
                          {item.avatar}
                        </Avatar>
                      }
                      title={<Text strong>{item.name}</Text>}
                      description={
                        <Space>
                          <Text style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
                            {item.value}
                          </Text>
                          <Tag color="success">{item.change}</Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default DashboardPage;
