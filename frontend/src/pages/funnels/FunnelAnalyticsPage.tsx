import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  DatePicker,
  Space,
  Table,
  Breadcrumb,
  Empty,
} from 'antd';
import type { TableProps } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  EyeOutlined,
  ShoppingOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import { useParams, Link } from 'react-router-dom';
import { Line, Funnel as FunnelChart } from '@ant-design/charts';
import dayjs, { Dayjs } from 'dayjs';
import {
  Funnel,
  FunnelAnalytics,
  funnelService,
} from '../../services/funnelService';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const FunnelAnalyticsPage: React.FC = () => {
  const { funnelId } = useParams<{ funnelId: string }>();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [analytics, setAnalytics] = useState<FunnelAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);

  useEffect(() => {
    if (funnelId) {
      fetchFunnel();
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funnelId, dateRange]);

  const fetchFunnel = async () => {
    if (!funnelId) return;
    try {
      const data = await funnelService.getFunnel(funnelId);
      setFunnel(data);
    } catch (error: any) {
      console.error('Failed to load funnel:', error);
    }
  };

  const fetchAnalytics = async () => {
    if (!funnelId) return;
    setLoading(true);
    try {
      const data = await funnelService.getAnalytics(
        funnelId,
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD')
      );
      setAnalytics(data);
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  const topPagesColumns: TableProps<any>['columns'] = [
    {
      title: 'Page Name',
      dataIndex: 'pageName',
      key: 'pageName',
    },
    {
      title: 'Views',
      dataIndex: 'views',
      key: 'views',
      render: (value) => value?.toLocaleString() || 0,
      sorter: (a, b) => a.views - b.views,
    },
    {
      title: 'Conversions',
      dataIndex: 'conversions',
      key: 'conversions',
      render: (value) => value?.toLocaleString() || 0,
      sorter: (a, b) => a.conversions - b.conversions,
    },
    {
      title: 'Conversion Rate',
      dataIndex: 'conversionRate',
      key: 'conversionRate',
      render: (value) => `${(value || 0).toFixed(2)}%`,
      sorter: (a, b) => a.conversionRate - b.conversionRate,
    },
  ];

  const trafficColumns: TableProps<any>['columns'] = [
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: 'Visitors',
      dataIndex: 'visitors',
      key: 'visitors',
      render: (value) => value?.toLocaleString() || 0,
      sorter: (a, b) => a.visitors - b.visitors,
    },
    {
      title: 'Conversions',
      dataIndex: 'conversions',
      key: 'conversions',
      render: (value) => value?.toLocaleString() || 0,
      sorter: (a, b) => a.conversions - b.conversions,
    },
    {
      title: 'Conversion Rate',
      dataIndex: 'conversionRate',
      key: 'conversionRate',
      render: (value) => `${(value || 0).toFixed(2)}%`,
      sorter: (a, b) => a.conversionRate - b.conversionRate,
    },
  ];

  // Transform chart data for multiple series BEFORE config
  const chartData = analytics?.chartData.flatMap((item) => [
    { date: item.date, value: item.views, type: 'Views' },
    { date: item.date, value: item.conversions, type: 'Conversions' },
    { date: item.date, value: item.revenue, type: 'Revenue' },
  ]) || [];

  const lineChartConfig = {
    data: chartData,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    height: 300,
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  // Funnel visualization data
  const funnelData = analytics?.steps.map((step) => ({
    stage: step.name,
    value: step.views,
  })) || [];

  const funnelChartConfig = {
    data: funnelData,
    xField: 'stage',
    yField: 'value',
    height: 400,
    legend: false,
    label: {
      formatter: (datum: any) => `${datum.value.toLocaleString()} views`,
    },
  };

  if (!funnel || !analytics) {
    return (
      <div>
        <Card>
          <Empty description="Loading analytics..." />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link to="/funnels">Funnels</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to={`/funnels/${funnelId}/builder`}>{funnel.name}</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Analytics</Breadcrumb.Item>
      </Breadcrumb>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>
            {funnel.name} - Analytics
          </Title>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            format="YYYY-MM-DD"
          />
        </div>
      </Card>

      {/* Overview Stats */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Views"
              value={analytics.overview.totalViews}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Unique Visitors"
              value={analytics.overview.uniqueVisitors}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Conversions"
              value={analytics.overview.totalConversions}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Conversion Rate"
              value={analytics.overview.conversionRate}
              precision={2}
              suffix="%"
              prefix={<PercentageOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={analytics.overview.totalRevenue}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic
              title="Average Order Value"
              value={analytics.overview.averageOrderValue}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Chart */}
      <Card title="Performance Over Time" style={{ marginBottom: 16 }}>
        <Line {...lineChartConfig} />
      </Card>

      {/* Funnel Visualization */}
      <Card title="Funnel Steps" style={{ marginBottom: 16 }}>
        {funnelData.length > 0 ? (
          <>
            <FunnelChart {...funnelChartConfig} />
            <div style={{ marginTop: 16 }}>
              {analytics.steps.map((step, index) => (
                <div
                  key={step.id}
                  style={{
                    padding: '12px',
                    marginBottom: 8,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Space>
                    <Text strong>Step {index + 1}:</Text>
                    <Text>{step.name}</Text>
                  </Space>
                  <Space size="large">
                    <Text>Views: {step.views.toLocaleString()}</Text>
                    <Text type="danger">Drop-off: {step.dropoffRate.toFixed(2)}%</Text>
                  </Space>
                </div>
              ))}
            </div>
          </>
        ) : (
          <Empty description="No funnel steps data available" />
        )}
      </Card>

      {/* Top Pages */}
      <Card title="Top Performing Pages" style={{ marginBottom: 16 }}>
        <Table
          columns={topPagesColumns}
          dataSource={analytics.topPages}
          rowKey="pageId"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* Traffic Sources */}
      <Card title="Traffic Sources">
        <Table
          columns={trafficColumns}
          dataSource={analytics.traffic}
          rowKey="source"
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default FunnelAnalyticsPage;
