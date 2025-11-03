import React, { useState } from 'react';
import {
  Modal,
  Card,
  Button,
  Space,
  Typography,
  Tag,
  List,
  Row,
  Col,
  Statistic,
  Progress,
  Alert,
  Switch,
  Tooltip,
  Badge,
  Divider,
  message,
} from 'antd';
import {
  ThunderboltOutlined,
  TeamOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  MailOutlined,
  StarOutlined,
  UserAddOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface SmartSegmentationProps {
  visible: boolean;
  onClose: () => void;
  onCreateSegment?: (segment: any) => void;
}

interface Segment {
  id: string;
  name: string;
  description: string;
  size: number;
  avgEngagement: number;
  avgValue: number;
  trend: 'up' | 'down' | 'stable';
  criteria: string[];
  autoUpdate: boolean;
  priority: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
  color: string;
}

const SmartSegmentation: React.FC<SmartSegmentationProps> = ({
  visible,
  onClose,
  onCreateSegment,
}) => {
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);

  // AI-generated segments based on behavior patterns
  const aiSegments: Segment[] = [
    {
      id: 'high-value',
      name: 'High-Value Champions',
      description: 'Highly engaged customers with purchase history >$500',
      size: 2847,
      avgEngagement: 87.3,
      avgValue: 1247,
      trend: 'up',
      criteria: [
        'Purchase value > $500',
        'Open rate > 60%',
        'Last activity < 7 days',
        'Avg session > 5 min',
      ],
      autoUpdate: true,
      priority: 'high',
      icon: <TrophyOutlined />,
      color: '#10b981',
    },
    {
      id: 'at-risk',
      name: 'At-Risk Customers',
      description: 'Previously engaged users showing declining activity',
      size: 4523,
      avgEngagement: 23.1,
      avgValue: 342,
      trend: 'down',
      criteria: [
        'No opens in 30 days',
        'Previously 40%+ open rate',
        'Last purchase > 90 days',
        'Decreasing engagement trend',
      ],
      autoUpdate: true,
      priority: 'high',
      icon: <FallOutlined />,
      color: '#ef4444',
    },
    {
      id: 'new-subscribers',
      name: 'New Subscribers (7 Days)',
      description: 'Recently joined, high conversion potential',
      size: 1234,
      avgEngagement: 68.2,
      avgValue: 0,
      trend: 'up',
      criteria: [
        'Subscribed < 7 days',
        'Email verified',
        'Opened welcome email',
        'No purchase yet',
      ],
      autoUpdate: true,
      priority: 'high',
      icon: <UserAddOutlined />,
      color: '#6366f1',
    },
    {
      id: 'power-users',
      name: 'Power Users',
      description: 'Most active users, great for beta testing',
      size: 892,
      avgEngagement: 92.7,
      avgValue: 847,
      trend: 'up',
      criteria: [
        'Daily active users',
        'Feature adoption > 80%',
        'Sent feedback/support',
        'Referrals made',
      ],
      autoUpdate: true,
      priority: 'medium',
      icon: <StarOutlined />,
      color: '#f59e0b',
    },
    {
      id: 'cart-abandoners',
      name: 'Cart Abandoners (24h)',
      description: 'Added to cart but didn\'t complete purchase',
      size: 3156,
      avgEngagement: 45.8,
      avgValue: 156,
      trend: 'stable',
      criteria: [
        'Cart value > $0',
        'Cart abandoned < 24h',
        'No purchase',
        'Viewed checkout page',
      ],
      autoUpdate: true,
      priority: 'high',
      icon: <ClockCircleOutlined />,
      color: '#8b5cf6',
    },
    {
      id: 'inactive',
      name: 'Inactive (90+ Days)',
      description: 'Haven\'t engaged in 3+ months, re-engagement needed',
      size: 8934,
      avgEngagement: 8.2,
      avgValue: 89,
      trend: 'down',
      criteria: [
        'No opens in 90 days',
        'No clicks in 90 days',
        'No purchases in 90 days',
        'Still subscribed',
      ],
      autoUpdate: true,
      priority: 'medium',
      icon: <MailOutlined />,
      color: '#6b7280',
    },
    {
      id: 'big-spenders',
      name: 'Big Spenders',
      description: 'Top 10% by revenue, VIP treatment recommended',
      size: 567,
      avgEngagement: 78.9,
      avgValue: 3247,
      trend: 'up',
      criteria: [
        'Total spend > $1000',
        'Multiple purchases',
        'Top 10% revenue',
        'Premium products',
      ],
      autoUpdate: true,
      priority: 'high',
      icon: <DollarOutlined />,
      color: '#14b8a6',
    },
    {
      id: 'mobile-users',
      name: 'Mobile-First Users',
      description: 'Primarily engage via mobile devices',
      size: 12456,
      avgEngagement: 52.3,
      avgValue: 234,
      trend: 'up',
      criteria: [
        '80%+ mobile opens',
        'Mobile app installed',
        'Push notifications enabled',
        'Location services on',
      ],
      autoUpdate: true,
      priority: 'medium',
      icon: <MailOutlined />,
      color: '#3b82f6',
    },
  ];

  const handleToggleSegment = (segmentId: string) => {
    if (selectedSegments.includes(segmentId)) {
      setSelectedSegments(selectedSegments.filter(id => id !== segmentId));
    } else {
      setSelectedSegments([...selectedSegments, segmentId]);
    }
  };

  const handleCreateSelected = () => {
    const segments = aiSegments.filter(s => selectedSegments.includes(s.id));
    segments.forEach(segment => {
      if (onCreateSegment) {
        onCreateSegment(segment);
      }
    });
    message.success(`Created ${segments.length} smart segment${segments.length > 1 ? 's' : ''}!`);
    setSelectedSegments([]);
    onClose();
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <Modal
      title={
        <Space>
          <ThunderboltOutlined style={{ fontSize: 24, color: '#6366f1' }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Smart Segmentation Engine
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              AI-discovered segments based on behavior patterns
            </Text>
          </div>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text type="secondary">
            {selectedSegments.length} segment{selectedSegments.length !== 1 ? 's' : ''} selected
          </Text>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              disabled={selectedSegments.length === 0}
              onClick={handleCreateSelected}
            >
              Create Selected Segments ({selectedSegments.length})
            </Button>
          </Space>
        </div>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Overview Stats */}
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Segments Discovered"
                value={aiSegments.length}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#6366f1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Contacts"
                value={aiSegments.reduce((sum, s) => sum + s.size, 0).toLocaleString()}
                prefix={<UserAddOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Avg Engagement"
                value={Math.round(aiSegments.reduce((sum, s) => sum + s.avgEngagement, 0) / aiSegments.length)}
                suffix="%"
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#10b981' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="High Priority"
                value={aiSegments.filter(s => s.priority === 'high').length}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#ef4444' }}
              />
            </Card>
          </Col>
        </Row>

        <Alert
          message="AI-Powered Segmentation"
          description="These segments are automatically discovered by analyzing user behavior, engagement patterns, and purchase history. They update in real-time as your contacts' behavior changes."
          type="info"
          showIcon
          icon={<ThunderboltOutlined />}
        />

        {/* Segment List */}
        <List
          dataSource={aiSegments}
          renderItem={(segment) => {
            const isSelected = selectedSegments.includes(segment.id);
            return (
              <Card
                size="small"
                style={{
                  marginBottom: 12,
                  borderColor: isSelected ? segment.color : undefined,
                  borderWidth: isSelected ? 2 : 1,
                  cursor: 'pointer',
                }}
                onClick={() => handleToggleSegment(segment.id)}
              >
                <Row gutter={[16, 16]} align="middle">
                  <Col span={1}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: segment.color,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                      }}
                    >
                      {segment.icon}
                    </div>
                  </Col>

                  <Col span={8}>
                    <Space direction="vertical" size={0}>
                      <Space>
                        <Text strong style={{ fontSize: 16 }}>{segment.name}</Text>
                        {getTrendIcon(segment.trend)}
                        <Badge
                          count={segment.priority.toUpperCase()}
                          style={{
                            backgroundColor: getPriorityColor(segment.priority),
                            fontSize: 10,
                          }}
                        />
                      </Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {segment.description}
                      </Text>
                    </Space>
                  </Col>

                  <Col span={3}>
                    <Statistic
                      title="Contacts"
                      value={segment.size.toLocaleString()}
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Col>

                  <Col span={3}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Engagement
                      </Text>
                      <div>
                        <Text strong style={{ fontSize: 18 }}>
                          {segment.avgEngagement}%
                        </Text>
                      </div>
                      <Progress
                        percent={segment.avgEngagement}
                        size="small"
                        showInfo={false}
                        strokeColor={segment.color}
                      />
                    </div>
                  </Col>

                  <Col span={3}>
                    <Statistic
                      title="Avg Value"
                      value={segment.avgValue}
                      prefix="$"
                      valueStyle={{ fontSize: 16, color: segment.color }}
                    />
                  </Col>

                  <Col span={4}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                        Auto-Update
                      </Text>
                      <Switch
                        checked={segment.autoUpdate}
                        size="small"
                        onClick={(checked, e) => e.stopPropagation()}
                      />
                      <Tooltip title="Segment updates automatically as contacts meet criteria">
                        <Tag style={{ marginLeft: 8, fontSize: 10 }}>
                          Live
                        </Tag>
                      </Tooltip>
                    </div>
                  </Col>

                  <Col span={2} style={{ textAlign: 'right' }}>
                    {isSelected && (
                      <CheckCircleOutlined
                        style={{ fontSize: 24, color: segment.color }}
                      />
                    )}
                  </Col>
                </Row>

                {/* Criteria Tags */}
                <Divider style={{ margin: '12px 0' }} />
                <Space wrap>
                  <Text type="secondary" style={{ fontSize: 11 }}>Criteria:</Text>
                  {segment.criteria.map((criterion, index) => (
                    <Tag key={index} style={{ fontSize: 10 }}>
                      {criterion}
                    </Tag>
                  ))}
                </Space>
              </Card>
            );
          }}
        />

        {/* Pro Tips */}
        <Card
          title="💡 Pro Tips for Smart Segments"
          size="small"
          style={{ background: '#f8fafc' }}
        >
          <Space direction="vertical" size="small">
            <Paragraph style={{ margin: 0, fontSize: 12 }}>
              <strong>1. High-Priority First:</strong> Focus on "High-Value Champions" and "At-Risk Customers" for immediate impact.
            </Paragraph>
            <Paragraph style={{ margin: 0, fontSize: 12 }}>
              <strong>2. Personalized Messaging:</strong> Each segment needs tailored content. Don't send the same message to "Power Users" and "Inactive" contacts.
            </Paragraph>
            <Paragraph style={{ margin: 0, fontSize: 12 }}>
              <strong>3. Auto-Update:</strong> Keep "Auto-Update" on to ensure segments stay current as behavior changes.
            </Paragraph>
            <Paragraph style={{ margin: 0, fontSize: 12 }}>
              <strong>4. Test & Refine:</strong> Start with 2-3 segments, test campaigns, then expand to more segments.
            </Paragraph>
          </Space>
        </Card>
      </Space>
    </Modal>
  );
};

export default SmartSegmentation;
