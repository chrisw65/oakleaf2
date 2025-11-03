import React, { useState } from 'react';
import {
  Modal,
  Card,
  Table,
  Progress,
  Space,
  Typography,
  Tag,
  Button,
  Tabs,
  Row,
  Col,
  Statistic,
  Alert,
  List,
  Avatar,
  Tooltip,
  Badge,
  Select,
} from 'antd';
import {
  WarningOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  MailOutlined,
  DollarOutlined,
  UserDeleteOutlined,
  BulbOutlined,
  LineChartOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { Column } from '@ant-design/plots';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface ChurnPredictionProps {
  visible: boolean;
  onClose: () => void;
  onTakeAction?: (contactId: string, action: string) => void;
}

interface ChurnContact {
  id: string;
  name: string;
  email: string;
  churnRisk: number;
  riskLevel: 'high' | 'medium' | 'low';
  lastActivity: string;
  engagementTrend: 'down' | 'stable' | 'up';
  lifetimeValue: number;
  daysSinceLastPurchase: number;
  indicators: ChurnIndicator[];
  recommendations: string[];
}

interface ChurnIndicator {
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  icon: React.ReactNode;
}

const ChurnPrediction: React.FC<ChurnPredictionProps> = ({
  visible,
  onClose,
  onTakeAction,
}) => {
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedContact, setSelectedContact] = useState<ChurnContact | null>(null);

  // Simulated ML-predicted churn contacts
  const churnContacts: ChurnContact[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      churnRisk: 87,
      riskLevel: 'high',
      lastActivity: '45 days ago',
      engagementTrend: 'down',
      lifetimeValue: 2847,
      daysSinceLastPurchase: 92,
      indicators: [
        {
          type: 'No email opens',
          severity: 'high',
          description: 'No email opens in 45 days (previously 60% open rate)',
          icon: <MailOutlined />,
        },
        {
          type: 'Declining engagement',
          severity: 'high',
          description: 'Engagement dropped 78% in last 60 days',
          icon: <FallOutlined />,
        },
        {
          type: 'Support ticket',
          severity: 'medium',
          description: 'Submitted 2 support tickets recently',
          icon: <WarningOutlined />,
        },
      ],
      recommendations: [
        'Send personalized re-engagement email with special offer',
        'Offer 1-on-1 customer success call',
        'Provide exclusive VIP discount (20-30% off)',
        'Survey to understand pain points',
      ],
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      churnRisk: 82,
      riskLevel: 'high',
      lastActivity: '38 days ago',
      engagementTrend: 'down',
      lifetimeValue: 1523,
      daysSinceLastPurchase: 120,
      indicators: [
        {
          type: 'Login frequency dropped',
          severity: 'high',
          description: 'From daily to once per month',
          icon: <ClockCircleOutlined />,
        },
        {
          type: 'Feature usage declined',
          severity: 'high',
          description: 'Using only 15% of features (was 80%)',
          icon: <FallOutlined />,
        },
        {
          type: 'Competitor research',
          severity: 'medium',
          description: 'Visited competitor sites 3 times',
          icon: <WarningOutlined />,
        },
      ],
      recommendations: [
        'Share success stories and case studies',
        'Offer training session on advanced features',
        'Highlight ROI they\'ve gained',
        'Limited-time renewal incentive',
      ],
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@example.com',
      churnRisk: 76,
      riskLevel: 'high',
      lastActivity: '28 days ago',
      engagementTrend: 'down',
      lifetimeValue: 3421,
      daysSinceLastPurchase: 67,
      indicators: [
        {
          type: 'Cart abandonment',
          severity: 'medium',
          description: 'Abandoned cart 3 times in last 2 weeks',
          icon: <DollarOutlined />,
        },
        {
          type: 'Email unsubscribe attempt',
          severity: 'high',
          description: 'Clicked unsubscribe (didn\'t complete)',
          icon: <MailOutlined />,
        },
        {
          type: 'Reduced purchase value',
          severity: 'medium',
          description: 'Average order down 45%',
          icon: <FallOutlined />,
        },
      ],
      recommendations: [
        'Send abandoned cart reminder with free shipping',
        'Offer product bundle discount',
        'Ask for feedback on recent experience',
        'Highlight new products matching interests',
      ],
    },
    {
      id: '4',
      name: 'David Park',
      email: 'david.park@example.com',
      churnRisk: 64,
      riskLevel: 'medium',
      lastActivity: '21 days ago',
      engagementTrend: 'down',
      lifetimeValue: 892,
      daysSinceLastPurchase: 45,
      indicators: [
        {
          type: 'Engagement slowdown',
          severity: 'medium',
          description: 'Opens down 35% month over month',
          icon: <FallOutlined />,
        },
        {
          type: 'Session duration decreased',
          severity: 'low',
          description: 'From 8 min to 3 min average',
          icon: <ClockCircleOutlined />,
        },
      ],
      recommendations: [
        'Send "We miss you" re-engagement campaign',
        'Share new feature announcements',
        'Offer early access to beta features',
      ],
    },
    {
      id: '5',
      name: 'Jessica Taylor',
      email: 'jessica.taylor@example.com',
      churnRisk: 58,
      riskLevel: 'medium',
      lastActivity: '18 days ago',
      engagementTrend: 'stable',
      lifetimeValue: 1247,
      daysSinceLastPurchase: 54,
      indicators: [
        {
          type: 'Decreased page views',
          severity: 'medium',
          description: 'Page views down 40%',
          icon: <FallOutlined />,
        },
        {
          type: 'No social engagement',
          severity: 'low',
          description: 'Hasn\'t engaged on social in 30 days',
          icon: <MailOutlined />,
        },
      ],
      recommendations: [
        'Invite to exclusive webinar or event',
        'Send personalized product recommendations',
        'Highlight community success stories',
      ],
    },
    {
      id: '6',
      name: 'Robert Kim',
      email: 'robert.kim@example.com',
      churnRisk: 42,
      riskLevel: 'low',
      lastActivity: '12 days ago',
      engagementTrend: 'stable',
      lifetimeValue: 567,
      daysSinceLastPurchase: 35,
      indicators: [
        {
          type: 'Slightly decreased engagement',
          severity: 'low',
          description: 'Opens down 15%',
          icon: <FallOutlined />,
        },
      ],
      recommendations: [
        'Send regular value-add content',
        'Invite to rate recent purchase',
        'Share relevant blog posts',
      ],
    },
    {
      id: '7',
      name: 'Amanda White',
      email: 'amanda.white@example.com',
      churnRisk: 28,
      riskLevel: 'low',
      lastActivity: '5 days ago',
      engagementTrend: 'up',
      lifetimeValue: 2134,
      daysSinceLastPurchase: 18,
      indicators: [
        {
          type: 'Healthy engagement',
          severity: 'low',
          description: 'Regular activity and opens',
          icon: <CheckCircleOutlined />,
        },
      ],
      recommendations: [
        'Continue current engagement strategy',
        'Upsell premium features',
        'Request testimonial or referral',
      ],
    },
  ];

  const filteredContacts = selectedRiskLevel === 'all'
    ? churnContacts
    : churnContacts.filter(c => c.riskLevel === selectedRiskLevel);

  const riskLevelCounts = {
    high: churnContacts.filter(c => c.riskLevel === 'high').length,
    medium: churnContacts.filter(c => c.riskLevel === 'medium').length,
    low: churnContacts.filter(c => c.riskLevel === 'low').length,
  };

  const avgChurnRisk = Math.round(
    churnContacts.reduce((sum, c) => sum + c.churnRisk, 0) / churnContacts.length
  );

  const totalAtRisk = riskLevelCounts.high + riskLevelCounts.medium;

  const potentialRevenueLoss = churnContacts
    .filter(c => c.riskLevel === 'high')
    .reduce((sum, c) => sum + c.lifetimeValue, 0);

  // Churn trend data for chart
  const churnTrendData = [
    { month: 'Jan', count: 12, risk: 45 },
    { month: 'Feb', count: 15, risk: 48 },
    { month: 'Mar', count: 18, risk: 52 },
    { month: 'Apr', count: 14, risk: 47 },
    { month: 'May', count: 10, risk: 42 },
    { month: 'Jun', count: 8, risk: 38 },
    { month: 'Jul', count: totalAtRisk, risk: avgChurnRisk },
  ];

  const trendConfig = {
    data: churnTrendData,
    xField: 'month',
    yField: 'count',
    seriesField: 'type',
    color: '#ef4444',
    columnStyle: {
      radius: [8, 8, 0, 0],
    },
    label: {
      position: 'top' as const,
      style: {
        fill: '#666',
        fontSize: 12,
      },
    },
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <WarningOutlined />;
      case 'medium':
        return <ClockCircleOutlined />;
      default:
        return <CheckCircleOutlined />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <RiseOutlined style={{ color: '#10b981' }} />;
      case 'down':
        return <FallOutlined style={{ color: '#ef4444' }} />;
      default:
        return null;
    }
  };

  const columns = [
    {
      title: 'Contact',
      key: 'contact',
      width: 250,
      render: (_: any, record: ChurnContact) => (
        <Space>
          <Avatar
            style={{
              backgroundColor: getRiskColor(record.riskLevel),
            }}
          >
            {record.name.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <div>
            <div>
              <Text strong>{record.name}</Text>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Churn Risk',
      key: 'risk',
      width: 150,
      sorter: (a: ChurnContact, b: ChurnContact) => b.churnRisk - a.churnRisk,
      render: (_: any, record: ChurnContact) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Text strong style={{ color: getRiskColor(record.riskLevel) }}>
              {record.churnRisk}%
            </Text>
            <Badge
              count={record.riskLevel.toUpperCase()}
              style={{
                backgroundColor: getRiskColor(record.riskLevel),
                fontSize: 10,
              }}
            />
          </Space>
          <Progress
            percent={record.churnRisk}
            strokeColor={getRiskColor(record.riskLevel)}
            showInfo={false}
            size="small"
          />
        </Space>
      ),
    },
    {
      title: 'Lifetime Value',
      key: 'value',
      width: 120,
      sorter: (a: ChurnContact, b: ChurnContact) => b.lifetimeValue - a.lifetimeValue,
      render: (_: any, record: ChurnContact) => (
        <Text strong>${record.lifetimeValue.toLocaleString()}</Text>
      ),
    },
    {
      title: 'Last Activity',
      key: 'activity',
      width: 120,
      render: (_: any, record: ChurnContact) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>{record.lastActivity}</Text>
          <Space size={4}>
            {getTrendIcon(record.engagementTrend)}
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.engagementTrend}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Risk Indicators',
      key: 'indicators',
      width: 100,
      render: (_: any, record: ChurnContact) => (
        <Tag color={getRiskColor(record.riskLevel)}>
          {record.indicators.length} signals
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_: any, record: ChurnContact) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => setSelectedContact(record)}
          >
            View Details
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={
          <Space>
            <UserDeleteOutlined style={{ fontSize: 24, color: '#ef4444' }} />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                Churn Prediction Dashboard
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                ML-powered early warning system for at-risk customers
              </Text>
            </div>
          </Space>
        }
        open={visible}
        onCancel={onClose}
        width={1400}
        footer={null}
        style={{ top: 20 }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Overview Stats */}
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="At Risk Contacts"
                  value={totalAtRisk}
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: '#ef4444' }}
                  suffix={`/ ${churnContacts.length}`}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="High Risk"
                  value={riskLevelCounts.high}
                  prefix={<UserDeleteOutlined />}
                  valueStyle={{ color: '#ef4444' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Avg Churn Risk"
                  value={avgChurnRisk}
                  suffix="%"
                  prefix={<LineChartOutlined />}
                  valueStyle={{ color: '#f59e0b' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Potential Revenue Loss"
                  value={potentialRevenueLoss}
                  prefix="$"
                  valueStyle={{ color: '#6b7280' }}
                />
              </Card>
            </Col>
          </Row>

          <Alert
            message="AI-Powered Churn Detection"
            description="Our machine learning model analyzes 50+ behavioral signals to predict churn risk. Act early to retain valuable customers before they leave."
            type="warning"
            showIcon
            icon={<BulbOutlined />}
          />

          {/* Tabs */}
          <Tabs defaultActiveKey="contacts">
            <TabPane tab="At-Risk Contacts" key="contacts">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* Filter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <FilterOutlined />
                    <Text>Filter by risk level:</Text>
                    <Select
                      value={selectedRiskLevel}
                      onChange={setSelectedRiskLevel}
                      style={{ width: 150 }}
                    >
                      <Select.Option value="all">All Levels</Select.Option>
                      <Select.Option value="high">High Risk</Select.Option>
                      <Select.Option value="medium">Medium Risk</Select.Option>
                      <Select.Option value="low">Low Risk</Select.Option>
                    </Select>
                  </Space>
                  <Text type="secondary">
                    Showing {filteredContacts.length} of {churnContacts.length} contacts
                  </Text>
                </div>

                {/* Contacts Table */}
                <Table
                  dataSource={filteredContacts}
                  columns={columns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Space>
            </TabPane>

            <TabPane tab="Churn Trends" key="trends">
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card title="Monthly At-Risk Contacts">
                  <Column {...trendConfig} />
                </Card>

                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card title="Top Churn Indicators">
                      <List
                        dataSource={[
                          { indicator: 'No email opens (30+ days)', count: 12, severity: 'high' },
                          { indicator: 'Declining engagement trend', count: 9, severity: 'high' },
                          { indicator: 'Login frequency dropped', count: 7, severity: 'medium' },
                          { indicator: 'Support ticket submitted', count: 5, severity: 'medium' },
                          { indicator: 'Cart abandonment increase', count: 4, severity: 'medium' },
                        ]}
                        renderItem={(item) => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={
                                <Avatar
                                  style={{
                                    backgroundColor: item.severity === 'high' ? '#ef4444' : '#f59e0b',
                                  }}
                                >
                                  {item.count}
                                </Avatar>
                              }
                              title={item.indicator}
                              description={
                                <Badge
                                  count={item.severity.toUpperCase()}
                                  style={{
                                    backgroundColor: item.severity === 'high' ? '#ef4444' : '#f59e0b',
                                    fontSize: 10,
                                  }}
                                />
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>

                  <Col span={12}>
                    <Card title="🎯 AI Insights">
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div>
                          <Space>
                            <TrophyOutlined style={{ color: '#10b981', fontSize: 20 }} />
                            <Text strong>Win-back success rate: 68%</Text>
                          </Space>
                          <Paragraph type="secondary" style={{ marginLeft: 28, marginBottom: 0 }}>
                            Contacts re-engaged within 14 days of intervention
                          </Paragraph>
                        </div>

                        <div>
                          <Space>
                            <ClockCircleOutlined style={{ color: '#f59e0b', fontSize: 20 }} />
                            <Text strong>Average churn window: 45 days</Text>
                          </Space>
                          <Paragraph type="secondary" style={{ marginLeft: 28, marginBottom: 0 }}>
                            Act within this timeframe for best retention results
                          </Paragraph>
                        </div>

                        <div>
                          <Space>
                            <DollarOutlined style={{ color: '#6366f1', fontSize: 20 }} />
                            <Text strong>Retention ROI: 5.2x</Text>
                          </Space>
                          <Paragraph type="secondary" style={{ marginLeft: 28, marginBottom: 0 }}>
                            Every $1 spent on retention saves $5.20 in lost revenue
                          </Paragraph>
                        </div>

                        <div>
                          <Space>
                            <BulbOutlined style={{ color: '#8b5cf6', fontSize: 20 }} />
                            <Text strong>Best retention tactic: Personalized offers</Text>
                          </Space>
                          <Paragraph type="secondary" style={{ marginLeft: 28, marginBottom: 0 }}>
                            72% success rate with exclusive discounts + personal touch
                          </Paragraph>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </Space>
            </TabPane>
          </Tabs>
        </Space>
      </Modal>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <Modal
          title={
            <Space>
              <Avatar
                size={48}
                style={{
                  backgroundColor: getRiskColor(selectedContact.riskLevel),
                }}
              >
                {selectedContact.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <div>
                <div>{selectedContact.name}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {selectedContact.email}
                </Text>
              </div>
            </Space>
          }
          open={!!selectedContact}
          onCancel={() => setSelectedContact(null)}
          width={800}
          footer={
            <Space>
              <Button onClick={() => setSelectedContact(null)}>Close</Button>
              <Button type="primary" icon={<MailOutlined />}>
                Send Win-back Campaign
              </Button>
            </Space>
          }
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Risk Overview */}
            <Card>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <Progress
                        type="circle"
                        percent={selectedContact.churnRisk}
                        strokeColor={getRiskColor(selectedContact.riskLevel)}
                        width={120}
                        format={() => (
                          <div>
                            <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                              {selectedContact.churnRisk}%
                            </div>
                            <div style={{ fontSize: 12 }}>
                              {selectedContact.riskLevel} risk
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </Col>
                <Col span={16}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Statistic
                      title="Lifetime Value"
                      value={selectedContact.lifetimeValue}
                      prefix="$"
                    />
                    <Statistic
                      title="Last Activity"
                      value={selectedContact.lastActivity}
                    />
                    <Statistic
                      title="Days Since Last Purchase"
                      value={selectedContact.daysSinceLastPurchase}
                    />
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Risk Indicators */}
            <Card title="⚠️ Risk Indicators">
              <List
                dataSource={selectedContact.indicators}
                renderItem={(indicator) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={indicator.icon}
                          style={{
                            backgroundColor: getRiskColor(indicator.severity),
                          }}
                        />
                      }
                      title={
                        <Space>
                          <Text strong>{indicator.type}</Text>
                          <Badge
                            count={indicator.severity.toUpperCase()}
                            style={{
                              backgroundColor: getRiskColor(indicator.severity),
                              fontSize: 10,
                            }}
                          />
                        </Space>
                      }
                      description={indicator.description}
                    />
                  </List.Item>
                )}
              />
            </Card>

            {/* AI Recommendations */}
            <Card
              title="💡 AI-Recommended Actions"
              extra={
                <Tag color="blue">AI Confidence: 89%</Tag>
              }
            >
              <List
                dataSource={selectedContact.recommendations}
                renderItem={(recommendation, index) => (
                  <List.Item>
                    <Space>
                      <Avatar
                        size="small"
                        style={{ backgroundColor: '#6366f1' }}
                      >
                        {index + 1}
                      </Avatar>
                      <Text>{recommendation}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Space>
        </Modal>
      )}
    </>
  );
};

export default ChurnPrediction;
