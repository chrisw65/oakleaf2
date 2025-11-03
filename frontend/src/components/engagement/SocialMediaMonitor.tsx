import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Input,
  Avatar,
  List,
  Badge,
  Divider,
  Row,
  Col,
  Tabs,
  Select,
  Tooltip,
  message,
  Timeline,
  Statistic,
  Progress,
  Alert,
  Empty,
  DatePicker,
} from 'antd';
import {
  EyeOutlined,
  HeartOutlined,
  MessageOutlined,
  ShareAltOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  BellOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  LineChartOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { Area } from '@ant-design/plots';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

interface SocialMention {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  type: 'mention' | 'comment' | 'share' | 'tag';
  user: {
    name: string;
    username: string;
    avatar?: string;
    verified: boolean;
    followers: number;
  };
  content: string;
  url: string;
  timestamp: Date;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
  };
  sentiment: 'positive' | 'neutral' | 'negative';
  priority: 'high' | 'medium' | 'low';
  responded: boolean;
}

interface SocialMediaMonitorProps {
  // Props if needed
}

const SocialMediaMonitor: React.FC<SocialMediaMonitorProps> = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<any>(null);

  // Mock data for demonstration
  const mentions: SocialMention[] = [
    {
      id: 'mention-1',
      platform: 'twitter',
      type: 'mention',
      user: {
        name: 'Tech Influencer Pro',
        username: '@techinfluencer',
        verified: true,
        followers: 125000,
      },
      content: 'Just discovered @yourcompany\'s funnel builder and I\'m blown away! 🚀 The AI features are game-changing. Finally, a ClickFunnels alternative that actually innovates!',
      url: 'https://twitter.com/techinfluencer/status/123',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      engagement: {
        likes: 342,
        comments: 28,
        shares: 67,
      },
      sentiment: 'positive',
      priority: 'high',
      responded: false,
    },
    {
      id: 'mention-2',
      platform: 'instagram',
      type: 'comment',
      user: {
        name: 'Sarah Marketing',
        username: '@sarahmarketing',
        verified: false,
        followers: 8500,
      },
      content: 'This looks interesting! Does it integrate with Shopify? Thinking about switching from my current tool.',
      url: 'https://instagram.com/p/abc123',
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      engagement: {
        likes: 12,
        comments: 3,
        shares: 0,
      },
      sentiment: 'neutral',
      priority: 'medium',
      responded: true,
    },
    {
      id: 'mention-3',
      platform: 'linkedin',
      type: 'mention',
      user: {
        name: 'David Thompson',
        username: '@davidthompson',
        verified: true,
        followers: 45000,
      },
      content: 'Been testing @yourcompany for my agency clients. The template library alone is worth the price. Highly recommend for digital marketers!',
      url: 'https://linkedin.com/feed/update/123',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      engagement: {
        likes: 189,
        comments: 14,
        shares: 31,
      },
      sentiment: 'positive',
      priority: 'high',
      responded: true,
    },
    {
      id: 'mention-4',
      platform: 'facebook',
      type: 'share',
      user: {
        name: 'Marketing Masters Group',
        username: '@marketingmasters',
        verified: false,
        followers: 32000,
      },
      content: 'Check out this new funnel builder! Has anyone tried it? Looking for alternatives to our current setup.',
      url: 'https://facebook.com/groups/123/posts/456',
      timestamp: new Date(Date.now() - 1000 * 60 * 90),
      engagement: {
        likes: 67,
        comments: 23,
        shares: 8,
      },
      sentiment: 'neutral',
      priority: 'medium',
      responded: false,
    },
    {
      id: 'mention-5',
      platform: 'twitter',
      type: 'mention',
      user: {
        name: 'Startup Critic',
        username: '@startucritic',
        verified: false,
        followers: 15000,
      },
      content: 'Tried @yourcompany but the learning curve is steep. Wish there was better onboarding documentation. Anyone else feel this way?',
      url: 'https://twitter.com/startucritic/status/456',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      engagement: {
        likes: 8,
        comments: 12,
        shares: 2,
      },
      sentiment: 'negative',
      priority: 'high',
      responded: false,
    },
  ];

  const overallStats = {
    totalMentions: 1247,
    totalReach: 3450000,
    avgEngagementRate: 4.2,
    sentimentScore: 82,
    trendingUp: true,
  };

  const sentimentBreakdown = {
    positive: 72,
    neutral: 18,
    negative: 10,
  };

  const topHashtags = [
    { tag: '#funnelbuilder', count: 342 },
    { tag: '#digitalmarketing', count: 289 },
    { tag: '#saas', count: 156 },
    { tag: '#marketingautomation', count: 134 },
    { tag: '#entrepreneurship', count: 98 },
  ];

  // Chart data
  const mentionsChartData = [
    { date: '2025-10-28', mentions: 45 },
    { date: '2025-10-29', mentions: 52 },
    { date: '2025-10-30', mentions: 61 },
    { date: '2025-10-31', mentions: 48 },
    { date: '2025-11-01', mentions: 73 },
    { date: '2025-11-02', mentions: 89 },
    { date: '2025-11-03', mentions: 95 },
  ];

  const areaConfig = {
    data: mentionsChartData,
    xField: 'date',
    yField: 'mentions',
    smooth: true,
    areaStyle: {
      fill: 'l(270) 0:#6366f1 0.5:#8b5cf6 1:#a855f7',
      fillOpacity: 0.3,
    },
    line: {
      color: '#6366f1',
      size: 3,
    },
  };

  const getPlatformIcon = (platform: string) => {
    const icons: any = {
      facebook: <FacebookOutlined style={{ color: '#1877f2' }} />,
      instagram: <InstagramOutlined style={{ color: '#e4405f' }} />,
      twitter: <TwitterOutlined style={{ color: '#1da1f2' }} />,
      linkedin: <LinkedinOutlined style={{ color: '#0a66c2' }} />,
    };
    return icons[platform];
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <CheckCircleOutlined style={{ color: '#10b981' }} />;
      case 'negative':
        return <CloseCircleOutlined style={{ color: '#ef4444' }} />;
      default:
        return <ExclamationCircleOutlined style={{ color: '#6b7280' }} />;
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

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 1000 / 60);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  const filteredMentions = mentions.filter(mention => {
    const matchesSentiment = selectedSentiment === 'all' || mention.sentiment === selectedSentiment;
    const matchesSearch = mention.content.toLowerCase().includes(searchText.toLowerCase()) ||
                         mention.user.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesTab = activeTab === 'all' ||
                      (activeTab === 'unresponded' && !mention.responded) ||
                      (activeTab === 'high-priority' && mention.priority === 'high');
    return matchesSentiment && matchesSearch && matchesTab;
  });

  const handleRespond = (mention: SocialMention) => {
    message.success('Opening response composer...');
  };

  const handleViewPost = (mention: SocialMention) => {
    window.open(mention.url, '_blank');
  };

  return (
    <Card
      title={
        <Space>
          <BellOutlined style={{ fontSize: 24, color: '#6366f1' }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Social Media Monitor
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Track mentions, comments, and engagement across all platforms
            </Text>
          </div>
        </Space>
      }
      extra={
        <RangePicker onChange={setDateRange} />
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Overview Stats */}
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Mentions"
                value={overallStats.totalMentions}
                prefix={<MessageOutlined />}
                suffix={
                  <Tag
                    color={overallStats.trendingUp ? 'success' : 'error'}
                    icon={overallStats.trendingUp ? <RiseOutlined /> : <FallOutlined />}
                  >
                    {overallStats.trendingUp ? '+12%' : '-8%'}
                  </Tag>
                }
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Reach"
                value={overallStats.totalReach}
                prefix={<EyeOutlined />}
                suffix="users"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Engagement Rate"
                value={overallStats.avgEngagementRate}
                prefix={<ThunderboltOutlined />}
                suffix="%"
                valueStyle={{ color: '#6366f1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Sentiment Score"
                value={overallStats.sentimentScore}
                prefix={<TrophyOutlined />}
                suffix="/100"
                valueStyle={{ color: '#10b981' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Mentions Chart */}
        <Card title="Mentions Trend (Last 7 Days)" size="small">
          <Area {...areaConfig} height={200} />
        </Card>

        {/* Sentiment & Tags */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card title="Sentiment Breakdown" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text>Positive</Text>
                    <Text strong>{sentimentBreakdown.positive}%</Text>
                  </div>
                  <Progress
                    percent={sentimentBreakdown.positive}
                    strokeColor="#10b981"
                    showInfo={false}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text>Neutral</Text>
                    <Text strong>{sentimentBreakdown.neutral}%</Text>
                  </div>
                  <Progress
                    percent={sentimentBreakdown.neutral}
                    strokeColor="#6b7280"
                    showInfo={false}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text>Negative</Text>
                    <Text strong>{sentimentBreakdown.negative}%</Text>
                  </div>
                  <Progress
                    percent={sentimentBreakdown.negative}
                    strokeColor="#ef4444"
                    showInfo={false}
                  />
                </div>
              </Space>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Top Hashtags" size="small">
              <List
                dataSource={topHashtags}
                renderItem={(item) => (
                  <List.Item>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text strong>{item.tag}</Text>
                      <Badge
                        count={item.count}
                        style={{ backgroundColor: '#6366f1' }}
                      />
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters and Search */}
        <Row gutter={[16, 16]} align="middle">
          <Col span={12}>
            <Input
              size="large"
              placeholder="Search mentions and comments..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              size="large"
              style={{ width: '100%' }}
              value={selectedSentiment}
              onChange={setSelectedSentiment}
              suffixIcon={<FilterOutlined />}
            >
              <Select.Option value="all">All Sentiments</Select.Option>
              <Select.Option value="positive">
                <CheckCircleOutlined style={{ color: '#10b981' }} /> Positive
              </Select.Option>
              <Select.Option value="neutral">
                <ExclamationCircleOutlined style={{ color: '#6b7280' }} /> Neutral
              </Select.Option>
              <Select.Option value="negative">
                <CloseCircleOutlined style={{ color: '#ef4444' }} /> Negative
              </Select.Option>
            </Select>
          </Col>
          <Col span={6}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                { key: 'all', label: `All (${mentions.length})` },
                { key: 'unresponded', label: `Unresponded (${mentions.filter(m => !m.responded).length})` },
                { key: 'high-priority', label: `High Priority (${mentions.filter(m => m.priority === 'high').length})` },
              ]}
            />
          </Col>
        </Row>

        {/* Mentions List */}
        <List
          dataSource={filteredMentions}
          renderItem={(mention) => (
            <Card
              size="small"
              style={{ marginBottom: 16 }}
              extra={
                <Space>
                  {!mention.responded && (
                    <Badge status="processing" text="New" />
                  )}
                  <Tag color={getPriorityColor(mention.priority)}>
                    {mention.priority} priority
                  </Tag>
                </Space>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {/* User Info */}
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space>
                    <Avatar icon={<UserOutlined />} />
                    <div>
                      <Space>
                        <Text strong>{mention.user.name}</Text>
                        {mention.user.verified && (
                          <CheckCircleOutlined style={{ color: '#1da1f2' }} />
                        )}
                      </Space>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {mention.user.username} • {mention.user.followers.toLocaleString()} followers
                      </Text>
                    </div>
                  </Space>
                  <Space>
                    {getPlatformIcon(mention.platform)}
                    {getSentimentIcon(mention.sentiment)}
                  </Space>
                </Space>

                {/* Content */}
                <Paragraph style={{ margin: '12px 0' }}>
                  {mention.content}
                </Paragraph>

                {/* Engagement Stats */}
                <Space split={<Divider type="vertical" />}>
                  <Tooltip title="Likes">
                    <Space size={4}>
                      <HeartOutlined style={{ color: '#ef4444' }} />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {mention.engagement.likes}
                      </Text>
                    </Space>
                  </Tooltip>
                  <Tooltip title="Comments">
                    <Space size={4}>
                      <MessageOutlined style={{ color: '#6366f1' }} />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {mention.engagement.comments}
                      </Text>
                    </Space>
                  </Tooltip>
                  <Tooltip title="Shares">
                    <Space size={4}>
                      <ShareAltOutlined style={{ color: '#10b981' }} />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {mention.engagement.shares}
                      </Text>
                    </Space>
                  </Tooltip>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <ClockCircleOutlined /> {formatTimestamp(mention.timestamp)}
                  </Text>
                </Space>

                {/* Actions */}
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewPost(mention)}
                  >
                    View Post
                  </Button>
                  {!mention.responded && (
                    <Button
                      size="small"
                      type="primary"
                      icon={<MessageOutlined />}
                      onClick={() => handleRespond(mention)}
                    >
                      Respond
                    </Button>
                  )}
                  {mention.responded && (
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      Responded
                    </Tag>
                  )}
                </div>
              </Space>
            </Card>
          )}
          locale={{
            emptyText: (
              <Empty
                description="No mentions found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />

        {filteredMentions.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button type="link">Load More Mentions</Button>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default SocialMediaMonitor;
