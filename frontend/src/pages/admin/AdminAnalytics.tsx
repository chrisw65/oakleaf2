import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Space,
  Statistic,
  Typography,
  Spin,
  message,
  Button,
} from 'antd';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  RiseOutlined,
  FallOutlined,
  UserOutlined,
  DollarOutlined,
  ShoppingOutlined,
  AreaChartOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import adminService from '../../services/adminService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AdminAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAnalyticsData(timeRange);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      message.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // Calculate growth metrics
  const calculateGrowth = (data: any[], key: string) => {
    if (data.length < 2) return 0;
    const recent = data.slice(-7).reduce((sum, item) => sum + (item[key] || 0), 0);
    const previous = data.slice(-14, -7).reduce((sum, item) => sum + (item[key] || 0), 0);
    if (previous === 0) return 100;
    return ((recent - previous) / previous) * 100;
  };

  const userGrowth = calculateGrowth(analytics, 'users');
  const revenueGrowth = calculateGrowth(analytics, 'revenue');
  const orderGrowth = calculateGrowth(analytics, 'orders');

  // Aggregate data for pie charts
  const totalRevenue = analytics.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalOrders = analytics.reduce((sum, item) => sum + (item.orders || 0), 0);
  const totalUsers = analytics.reduce((sum, item) => sum + (item.users || 0), 0);
  const totalContacts = analytics.reduce((sum, item) => sum + (item.contacts || 0), 0);

  const distributionData = [
    { name: 'Users', value: totalUsers },
    { name: 'Contacts', value: totalContacts },
    { name: 'Orders', value: totalOrders },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={2} style={{ margin: 0 }}>
              <AreaChartOutlined /> Analytics & Insights
            </Title>
            <Space>
              <Select
                value={timeRange}
                onChange={setTimeRange}
                style={{ width: 150 }}
              >
                <Option value={7}>Last 7 Days</Option>
                <Option value={14}>Last 14 Days</Option>
                <Option value={30}>Last 30 Days</Option>
                <Option value={60}>Last 60 Days</Option>
                <Option value={90}>Last 90 Days</Option>
              </Select>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadAnalytics}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </Space>
        </Col>
      </Row>

      {/* Growth Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="User Growth (7d)"
              value={Math.abs(userGrowth).toFixed(1)}
              precision={1}
              suffix="%"
              prefix={userGrowth >= 0 ? <RiseOutlined /> : <FallOutlined />}
              valueStyle={{ color: userGrowth >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Revenue Growth (7d)"
              value={Math.abs(revenueGrowth).toFixed(1)}
              precision={1}
              suffix="%"
              prefix={revenueGrowth >= 0 ? <RiseOutlined /> : <FallOutlined />}
              valueStyle={{ color: revenueGrowth >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Order Growth (7d)"
              value={Math.abs(orderGrowth).toFixed(1)}
              precision={1}
              suffix="%"
              prefix={orderGrowth >= 0 ? <RiseOutlined /> : <FallOutlined />}
              valueStyle={{ color: orderGrowth >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Line Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="User Growth Trend">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="New Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Revenue Trend">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                  name="Revenue ($)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Bar Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Orders & Contacts">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#8884d8" name="Orders" />
                <Bar dataKey="contacts" fill="#82ca9d" name="Contacts" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Activity Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }: any) =>
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Summary Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={`Total Users (${timeRange}d)`}
              value={totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={`Total Revenue (${timeRange}d)`}
              value={totalRevenue}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={`Total Orders (${timeRange}d)`}
              value={totalOrders}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={`Total Contacts (${timeRange}d)`}
              value={totalContacts}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminAnalytics;
