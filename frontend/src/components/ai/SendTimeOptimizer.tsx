import React, { useState } from 'react';
import {
  Modal,
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Row,
  Col,
  Statistic,
  Progress,
  Alert,
  List,
  Tooltip,
  Select,
  Switch,
  Divider,
} from 'antd';
import {
  ClockCircleOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  UserOutlined,
  CalendarOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { Column, Heatmap } from '@ant-design/plots';

const { Title, Text, Paragraph } = Typography;

interface SendTimeOptimizerProps {
  visible: boolean;
  onClose: () => void;
  onSelectTime?: (time: Date) => void;
}

interface TimeSlot {
  day: string;
  hour: number;
  openRate: number;
  clickRate: number;
  score: number;
}

const SendTimeOptimizer: React.FC<SendTimeOptimizerProps> = ({
  visible,
  onClose,
  onSelectTime,
}) => {
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [useAI, setUseAI] = useState(true);

  // Simulated ML predictions
  const topTimes: TimeSlot[] = [
    { day: 'Tuesday', hour: 10, openRate: 45.2, clickRate: 12.8, score: 95 },
    { day: 'Thursday', hour: 14, openRate: 43.8, clickRate: 11.9, score: 92 },
    { day: 'Wednesday', hour: 9, openRate: 42.1, clickRate: 11.2, score: 88 },
    { day: 'Tuesday', hour: 15, openRate: 41.3, clickRate: 10.8, score: 85 },
    { day: 'Friday', hour: 11, openRate: 39.7, clickRate: 10.1, score: 82 },
  ];

  const heatmapData = [
    // Monday
    { day: 'Mon', hour: '6 AM', value: 15 },
    { day: 'Mon', hour: '9 AM', value: 35 },
    { day: 'Mon', hour: '12 PM', value: 42 },
    { day: 'Mon', hour: '3 PM', value: 38 },
    { day: 'Mon', hour: '6 PM', value: 22 },

    // Tuesday
    { day: 'Tue', hour: '6 AM', value: 18 },
    { day: 'Tue', hour: '9 AM', value: 42 },
    { day: 'Tue', hour: '12 PM', value: 45 },
    { day: 'Tue', hour: '3 PM', value: 43 },
    { day: 'Tue', hour: '6 PM', value: 25 },

    // Wednesday
    { day: 'Wed', hour: '6 AM', value: 20 },
    { day: 'Wed', hour: '9 AM', value: 42 },
    { day: 'Wed', hour: '12 PM', value: 40 },
    { day: 'Wed', hour: '3 PM', value: 37 },
    { day: 'Wed', hour: '6 PM', value: 23 },

    // Thursday
    { day: 'Thu', hour: '6 AM', value: 17 },
    { day: 'Thu', hour: '9 AM', value: 38 },
    { day: 'Thu', hour: '12 PM', value: 41 },
    { day: 'Thu', hour: '3 PM', value: 44 },
    { day: 'Thu', hour: '6 PM', value: 28 },

    // Friday
    { day: 'Fri', hour: '6 AM', value: 16 },
    { day: 'Fri', hour: '9 AM', value: 35 },
    { day: 'Fri', hour: '12 PM', value: 39 },
    { day: 'Fri', hour: '3 PM', value: 32 },
    { day: 'Fri', hour: '6 PM', value: 20 },
  ];

  const performanceByDay = [
    { day: 'Monday', openRate: 35.2, clickRate: 9.8 },
    { day: 'Tuesday', openRate: 45.2, clickRate: 12.8 },
    { day: 'Wednesday', openRate: 42.1, clickRate: 11.2 },
    { day: 'Thursday', openRate: 43.8, clickRate: 11.9 },
    { day: 'Friday', openRate: 39.7, clickRate: 10.1 },
    { day: 'Saturday', openRate: 25.3, clickRate: 6.2 },
    { day: 'Sunday', openRate: 22.8, clickRate: 5.8 },
  ];

  const insights = [
    {
      title: 'Peak Engagement Time',
      description: 'Tuesday at 10 AM shows 45.2% open rate - 28% above average',
      icon: <TrophyOutlined style={{ color: '#10b981' }} />,
      improvement: '+28%',
    },
    {
      title: 'Avoid Weekend Sends',
      description: 'Weekend engagement drops 42% compared to weekdays',
      icon: <LineChartOutlined style={{ color: '#ef4444' }} />,
      improvement: '-42%',
    },
    {
      title: 'Mid-Week Wins',
      description: 'Tuesday-Thursday consistently outperform other days',
      icon: <CheckCircleOutlined style={{ color: '#6366f1' }} />,
      improvement: '+35%',
    },
    {
      title: 'Morning Performance',
      description: '9-11 AM time slots have highest engagement across all segments',
      icon: <ClockCircleOutlined style={{ color: '#f59e0b' }} />,
      improvement: '+22%',
    },
  ];

  const heatmapConfig = {
    data: heatmapData,
    xField: 'hour',
    yField: 'day',
    colorField: 'value',
    color: ['#e0f2fe', '#7dd3fc', '#0ea5e9', '#0369a1', '#1e40af'],
    meta: {
      hour: { alias: 'Hour' },
      day: { alias: 'Day' },
      value: { alias: 'Engagement Score' },
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: 'Engagement',
          value: `${datum.value}% open rate`,
        };
      },
    },
  };

  const columnConfig = {
    data: performanceByDay,
    xField: 'day',
    yField: 'openRate',
    seriesField: 'type',
    columnStyle: {
      radius: [8, 8, 0, 0],
    },
    color: '#6366f1',
    label: {
      position: 'top' as const,
      formatter: (datum: any) => `${datum.openRate}%`,
      style: {
        fill: '#6b7280',
        fontSize: 11,
      },
    },
  };

  const handleSelectTime = (slot: TimeSlot) => {
    if (onSelectTime) {
      // Calculate next occurrence of this day/hour
      const now = new Date();
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDay = daysOfWeek.indexOf(slot.day);

      const nextDate = new Date(now);
      nextDate.setDate(now.getDate() + ((targetDay + 7 - now.getDay()) % 7 || 7));
      nextDate.setHours(slot.hour, 0, 0, 0);

      onSelectTime(nextDate);
    }
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <ClockCircleOutlined style={{ fontSize: 24, color: '#6366f1' }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              AI Send Time Optimizer
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ML-powered predictions for maximum engagement
            </Text>
          </div>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={null}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Settings */}
        <Card size="small">
          <Row gutter={[16, 16]} align="middle">
            <Col span={12}>
              <Space>
                <Text strong>Target Segment:</Text>
                <Select
                  value={selectedSegment}
                  onChange={setSelectedSegment}
                  style={{ width: 200 }}
                >
                  <Select.Option value="all">All Contacts</Select.Option>
                  <Select.Option value="engaged">Engaged Users</Select.Option>
                  <Select.Option value="inactive">Inactive Users</Select.Option>
                  <Select.Option value="new">New Subscribers</Select.Option>
                </Select>
              </Space>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Space>
                <Text strong>AI Predictions:</Text>
                <Switch checked={useAI} onChange={setUseAI} />
                <Tooltip title="Uses machine learning to predict optimal send times based on historical data">
                  <Tag color={useAI ? 'success' : 'default'}>
                    {useAI ? 'Enabled' : 'Disabled'}
                  </Tag>
                </Tooltip>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Top Recommended Times */}
        <Card
          title={
            <Space>
              <TrophyOutlined style={{ color: '#f59e0b' }} />
              <Text strong>Top 5 Recommended Send Times</Text>
              <Tag color="success">Based on {selectedSegment === 'all' ? '50,000+ sends' : '12,000+ sends'}</Tag>
            </Space>
          }
          size="small"
        >
          <List
            dataSource={topTimes}
            renderItem={(slot, index) => (
              <Card
                size="small"
                style={{
                  marginBottom: 12,
                  borderColor: index === 0 ? '#10b981' : undefined,
                  borderWidth: index === 0 ? 2 : 1,
                }}
              >
                <Row gutter={[16, 16]} align="middle">
                  <Col span={1}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: index === 0 ? '#10b981' : '#6366f1',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                      }}
                    >
                      #{index + 1}
                    </div>
                  </Col>

                  <Col span={5}>
                    <Space direction="vertical" size={0}>
                      <Text strong style={{ fontSize: 16 }}>{slot.day}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {slot.hour === 0 ? '12 AM' : slot.hour < 12 ? `${slot.hour} AM` : slot.hour === 12 ? '12 PM' : `${slot.hour - 12} PM`}
                      </Text>
                    </Space>
                  </Col>

                  <Col span={4}>
                    <Statistic
                      title="Open Rate"
                      value={slot.openRate}
                      suffix="%"
                      valueStyle={{ fontSize: 18, color: '#10b981' }}
                    />
                  </Col>

                  <Col span={4}>
                    <Statistic
                      title="Click Rate"
                      value={slot.clickRate}
                      suffix="%"
                      valueStyle={{ fontSize: 18, color: '#6366f1' }}
                    />
                  </Col>

                  <Col span={5}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>AI Confidence</Text>
                      <Progress
                        percent={slot.score}
                        size="small"
                        strokeColor={{
                          '0%': '#6366f1',
                          '100%': '#10b981',
                        }}
                      />
                    </div>
                  </Col>

                  <Col span={5} style={{ textAlign: 'right' }}>
                    <Button
                      type={index === 0 ? 'primary' : 'default'}
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleSelectTime(slot)}
                    >
                      {index === 0 ? 'Use Best Time' : 'Select'}
                    </Button>
                  </Col>
                </Row>
              </Card>
            )}
          />
        </Card>

        {/* Performance Heatmap */}
        <Card title="Engagement Heatmap (Last 30 Days)" size="small">
          <Heatmap {...heatmapConfig} height={200} />
          <Alert
            message="How to Read: Darker colors indicate higher engagement. Focus your sends on the darker cells."
            type="info"
            showIcon
            style={{ marginTop: 16 }}
            banner
          />
        </Card>

        {/* Day Performance */}
        <Card title="Performance by Day of Week" size="small">
          <Column {...columnConfig} height={250} />
        </Card>

        {/* AI Insights */}
        <Card
          title={
            <Space>
              <ThunderboltOutlined style={{ color: '#6366f1' }} />
              <Text strong>AI-Powered Insights</Text>
            </Space>
          }
          size="small"
        >
          <Row gutter={[16, 16]}>
            {insights.map((insight, index) => (
              <Col span={12} key={index}>
                <Card size="small" style={{ height: '100%' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                      {insight.icon}
                      <Text strong>{insight.title}</Text>
                      <Tag color={insight.improvement.startsWith('+') ? 'success' : 'error'}>
                        {insight.improvement}
                      </Tag>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {insight.description}
                    </Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Stats Summary */}
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Emails Analyzed"
                value={53247}
                prefix={<MailOutlined />}
                suffix={<Tag color="blue">Last 90 days</Tag>}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Avg Improvement"
                value={28.4}
                suffix="%"
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#10b981' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Prediction Accuracy"
                value={94.2}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#6366f1' }}
              />
            </Card>
          </Col>
        </Row>

        <Alert
          message="Pro Tip: Enable 'Auto-Optimize' in your campaign settings to automatically send at the best predicted time for each contact based on their individual behavior."
          type="success"
          showIcon
          icon={<ThunderboltOutlined />}
        />
      </Space>
    </Modal>
  );
};

export default SendTimeOptimizer;
