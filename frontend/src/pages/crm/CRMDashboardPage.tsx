import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, Table, Typography, Spin, Alert, Tag } from 'antd';
import {
  DollarOutlined,
  TrophyOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  FallOutlined,
  UserOutlined,
} from '@ant-design/icons';
import crmService, { DashboardMetrics } from '../../services/crmService';

const { Title, Text } = Typography;

const CRMDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await crmService.getDashboardMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
      console.error('Error loading dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Loading dashboard metrics...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Dashboard"
        description={error}
        type="error"
        showIcon
        style={{ marginBottom: 24 }}
      />
    );
  }

  if (!metrics) {
    return (
      <Alert
        message="No Data Available"
        description="Dashboard metrics are not available at this time."
        type="warning"
        showIcon
      />
    );
  }

  const pipelineByStageColumns = [
    {
      title: 'Stage',
      dataIndex: 'stageName',
      key: 'stageName',
    },
    {
      title: 'Opportunities',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: any, b: any) => a.count - b.count,
    },
    {
      title: 'Total Value',
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => formatCurrency(value),
      sorter: (a: any, b: any) => a.value - b.value,
    },
    {
      title: 'Average Deal Size',
      key: 'avgValue',
      render: (record: any) => formatCurrency(record.count > 0 ? record.value / record.count : 0),
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        CRM Dashboard
      </Title>

      {/* Pipeline Metrics */}
      <Title level={4} style={{ marginBottom: 16 }}>
        Pipeline Performance
      </Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Pipeline Value"
              value={metrics.pipeline.totalValue}
              formatter={(value) => formatCurrency(value as number)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <Text type="secondary">{metrics.pipeline.totalCount} opportunities</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Pipeline"
              value={metrics.pipeline.activeValue}
              formatter={(value) => formatCurrency(value as number)}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Text type="secondary">{metrics.pipeline.activeCount} active deals</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Won Value"
              value={metrics.pipeline.wonValue}
              formatter={(value) => formatCurrency(value as number)}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Text type="secondary">{metrics.pipeline.wonCount} deals won</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Win Rate"
              value={metrics.pipeline.winRate}
              formatter={(value) => formatPercentage(value as number)}
              suffix="%"
              valueStyle={{
                color: metrics.pipeline.winRate >= 30 ? '#52c41a' : metrics.pipeline.winRate >= 20 ? '#faad14' : '#ff4d4f',
              }}
            />
            <div style={{ marginTop: 8 }}>
              <Progress
                percent={metrics.pipeline.winRate}
                showInfo={false}
                strokeColor={
                  metrics.pipeline.winRate >= 30 ? '#52c41a' : metrics.pipeline.winRate >= 20 ? '#faad14' : '#ff4d4f'
                }
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Average Deal Size"
              value={metrics.pipeline.averageDealSize}
              formatter={(value) => formatCurrency(value as number)}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Lost Value"
              value={metrics.pipeline.lostValue}
              formatter={(value) => formatCurrency(value as number)}
              prefix={<FallOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
            <Text type="secondary">{metrics.pipeline.lostCount} deals lost</Text>
          </Card>
        </Col>
      </Row>

      {/* Pipeline by Stage */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24}>
          <Card title="Pipeline by Stage">
            <Table
              dataSource={metrics.pipeline.byStage}
              columns={pipelineByStageColumns}
              rowKey="stageName"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Tasks Metrics */}
      <Title level={4} style={{ marginBottom: 16 }}>
        Task Overview
      </Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Tasks"
              value={metrics.tasks.total}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Overdue Tasks"
              value={metrics.tasks.overdue}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: metrics.tasks.overdue > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Due Today"
              value={metrics.tasks.dueToday}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: metrics.tasks.dueToday > 0 ? '#faad14' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={metrics.tasks.completionRate}
              formatter={(value) => formatPercentage(value as number)}
              suffix="%"
              valueStyle={{
                color:
                  metrics.tasks.completionRate >= 80 ? '#52c41a' : metrics.tasks.completionRate >= 60 ? '#faad14' : '#ff4d4f',
              }}
            />
            <div style={{ marginTop: 8 }}>
              <Progress
                percent={metrics.tasks.completionRate}
                showInfo={false}
                strokeColor={
                  metrics.tasks.completionRate >= 80 ? '#52c41a' : metrics.tasks.completionRate >= 60 ? '#faad14' : '#ff4d4f'
                }
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Contact Metrics */}
      <Title level={4} style={{ marginBottom: 16 }}>
        Contact Summary
      </Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Contacts"
              value={metrics.contacts.total}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="New This Month"
              value={metrics.contacts.newThisMonth}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Leads"
              value={metrics.contacts.activeLeads}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Customers"
              value={metrics.contacts.customers}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Average Lead Score"
              value={metrics.contacts.averageScore}
              precision={1}
              suffix="/ 100"
              valueStyle={{
                color:
                  metrics.contacts.averageScore >= 70
                    ? '#52c41a'
                    : metrics.contacts.averageScore >= 50
                    ? '#faad14'
                    : '#ff4d4f',
              }}
            />
            <div style={{ marginTop: 8 }}>
              <Progress
                percent={metrics.contacts.averageScore}
                showInfo={false}
                strokeColor={
                  metrics.contacts.averageScore >= 70
                    ? '#52c41a'
                    : metrics.contacts.averageScore >= 50
                    ? '#faad14'
                    : '#ff4d4f'
                }
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Forecast */}
      <Title level={4} style={{ marginBottom: 16 }}>
        Sales Forecast
      </Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Current Month Forecast"
              value={metrics.forecast.currentMonth}
              formatter={(value) => formatCurrency(value as number)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Tag color="blue" style={{ marginTop: 8 }}>
              Weighted by probability
            </Tag>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Next Month Forecast"
              value={metrics.forecast.nextMonth}
              formatter={(value) => formatCurrency(value as number)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Tag color="green" style={{ marginTop: 8 }}>
              Weighted by probability
            </Tag>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Current Quarter Forecast"
              value={metrics.forecast.currentQuarter}
              formatter={(value) => formatCurrency(value as number)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Tag color="purple" style={{ marginTop: 8 }}>
              Weighted by probability
            </Tag>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CRMDashboardPage;
