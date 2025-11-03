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
  Modal,
  Form,
  Switch,
  Alert,
  Empty,
} from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StarOutlined,
  FilterOutlined,
  SearchOutlined,
  PlusOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  LinkOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Search } = Input;

interface DMMessage {
  id: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  sender: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    verified: boolean;
  };
  message: string;
  timestamp: Date;
  read: boolean;
  replied: boolean;
  starred: boolean;
  tags: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
}

interface SocialMediaDMHubProps {
  // Props if needed
}

const SocialMediaDMHub: React.FC<SocialMediaDMHubProps> = () => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedConversation, setSelectedConversation] = useState<DMMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [form] = Form.useForm();

  // Mock data for demonstration
  const dms: DMMessage[] = [
    {
      id: 'dm-1',
      platform: 'facebook',
      sender: {
        id: 'user1',
        name: 'Sarah Johnson',
        username: '@sarahj',
        avatar: undefined,
        verified: false,
      },
      message: 'Hi! I\'m interested in your funnel building software. Can you tell me more about the pricing plans?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
      replied: false,
      starred: true,
      tags: ['sales', 'pricing'],
      sentiment: 'positive',
    },
    {
      id: 'dm-2',
      platform: 'instagram',
      sender: {
        id: 'user2',
        name: 'Mike Chen',
        username: '@mikechen',
        avatar: undefined,
        verified: true,
      },
      message: 'Love your product! Quick question about the email automation features - do they integrate with Mailchimp?',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      read: true,
      replied: false,
      starred: false,
      tags: ['product-question', 'integration'],
      sentiment: 'positive',
    },
    {
      id: 'dm-3',
      platform: 'twitter',
      sender: {
        id: 'user3',
        name: 'Emma Davis',
        username: '@emmadavis',
        avatar: undefined,
        verified: false,
      },
      message: 'I saw your ad and I\'m really curious about how the AI coach feature works. Is there a demo I can watch?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: true,
      replied: true,
      starred: false,
      tags: ['demo-request'],
      sentiment: 'neutral',
    },
    {
      id: 'dm-4',
      platform: 'linkedin',
      sender: {
        id: 'user4',
        name: 'James Wilson',
        username: '@jameswilson',
        avatar: undefined,
        verified: true,
      },
      message: 'We\'re a 50-person company looking for a funnel solution. Do you offer enterprise plans with dedicated support?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      read: true,
      replied: false,
      starred: true,
      tags: ['enterprise', 'sales'],
      sentiment: 'positive',
    },
    {
      id: 'dm-5',
      platform: 'facebook',
      sender: {
        id: 'user5',
        name: 'Lisa Anderson',
        username: '@lisaa',
        avatar: undefined,
        verified: false,
      },
      message: 'Is there a free trial available? I want to test it before committing to a paid plan.',
      timestamp: new Date(Date.now() - 1000 * 60 * 90),
      read: true,
      replied: true,
      starred: false,
      tags: ['trial', 'free'],
      sentiment: 'neutral',
    },
  ];

  const connectedPlatforms = [
    { platform: 'facebook', connected: true, username: '@yourcompany', unreadCount: 3 },
    { platform: 'instagram', connected: true, username: '@yourcompany', unreadCount: 1 },
    { platform: 'twitter', connected: true, username: '@yourcompany', unreadCount: 0 },
    { platform: 'linkedin', connected: false, username: null, unreadCount: 0 },
  ];

  const getPlatformIcon = (platform: string) => {
    const icons: any = {
      facebook: <FacebookOutlined style={{ color: '#1877f2' }} />,
      instagram: <InstagramOutlined style={{ color: '#e4405f' }} />,
      twitter: <TwitterOutlined style={{ color: '#1da1f2' }} />,
      linkedin: <LinkedinOutlined style={{ color: '#0a66c2' }} />,
    };
    return icons[platform] || <MessageOutlined />;
  };

  const getPlatformColor = (platform: string) => {
    const colors: any = {
      facebook: '#1877f2',
      instagram: '#e4405f',
      twitter: '#1da1f2',
      linkedin: '#0a66c2',
    };
    return colors[platform] || '#6366f1';
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return '#10b981';
      case 'negative':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getSentimentLabel = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'Positive';
      case 'negative':
        return 'Negative';
      default:
        return 'Neutral';
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

  const filteredDMs = dms.filter(dm => {
    const matchesPlatform = selectedPlatform === 'all' || dm.platform === selectedPlatform;
    const matchesSearch = dm.sender.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         dm.message.toLowerCase().includes(searchText.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  const handleSendReply = () => {
    if (!replyMessage.trim()) {
      message.warning('Please enter a message');
      return;
    }

    message.success('Message sent successfully!');
    setReplyMessage('');
  };

  const handleQuickReply = (template: string) => {
    setReplyMessage(template);
  };

  const quickReplyTemplates = [
    'Thanks for reaching out! I\'d be happy to help.',
    'Let me look into that and get back to you shortly.',
    'Great question! Here\'s what you need to know...',
    'I appreciate your interest! Let me share more details.',
  ];

  const aiSuggestedReplies = [
    'Hi Sarah! Our pricing starts at $49/mo for the Starter plan with unlimited funnels. Would you like me to send you our full pricing sheet?',
    'I\'d recommend our Professional plan at $99/mo which includes everything you mentioned. Can I schedule a quick demo for you?',
    'Great timing! We\'re running a promotion this week. I can offer you 20% off your first 3 months. Interested?',
  ];

  const handleConnectPlatform = (platform: string) => {
    setShowConnectModal(true);
    form.setFieldsValue({ platform });
  };

  const handleDisconnectPlatform = (platform: string) => {
    Modal.confirm({
      title: 'Disconnect Platform',
      content: `Are you sure you want to disconnect ${platform}? You will no longer receive DMs from this platform.`,
      onOk: () => {
        message.success(`${platform} disconnected successfully`);
      },
    });
  };

  return (
    <Card
      title={
        <Space>
          <MessageOutlined style={{ fontSize: 24, color: '#6366f1' }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Social Media DM Hub
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Manage all your social media conversations in one place
            </Text>
          </div>
        </Space>
      }
      extra={
        <Space>
          <Button icon={<SettingOutlined />} onClick={() => setShowConnectModal(true)}>
            Manage Connections
          </Button>
        </Space>
      }
    >
      <Row gutter={[24, 24]}>
        {/* Connected Platforms Overview */}
        <Col span={24}>
          <Row gutter={[16, 16]}>
            {connectedPlatforms.map((platform) => (
              <Col span={6} key={platform.platform}>
                <Card
                  size="small"
                  style={{
                    borderColor: platform.connected ? getPlatformColor(platform.platform) : '#d1d5db',
                    opacity: platform.connected ? 1 : 0.6,
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 24 }}>
                        {getPlatformIcon(platform.platform)}
                      </div>
                      {platform.connected && platform.unreadCount > 0 && (
                        <Badge count={platform.unreadCount} />
                      )}
                    </div>
                    <div>
                      <Text strong style={{ fontSize: 12, textTransform: 'capitalize' }}>
                        {platform.platform}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {platform.connected ? platform.username : 'Not connected'}
                      </Text>
                    </div>
                    {platform.connected ? (
                      <Button
                        size="small"
                        type="text"
                        danger
                        block
                        onClick={() => handleDisconnectPlatform(platform.platform)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        type="primary"
                        block
                        icon={<LinkOutlined />}
                        onClick={() => handleConnectPlatform(platform.platform)}
                      >
                        Connect
                      </Button>
                    )}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        {/* Main DM Interface */}
        <Col span={24}>
          <Row gutter={[16, 16]}>
            {/* Conversations List */}
            <Col span={10}>
              <Card
                title="Conversations"
                size="small"
                extra={
                  <Space>
                    <Select
                      size="small"
                      value={selectedPlatform}
                      onChange={setSelectedPlatform}
                      style={{ width: 120 }}
                      suffixIcon={<FilterOutlined />}
                    >
                      <Select.Option value="all">All Platforms</Select.Option>
                      <Select.Option value="facebook">
                        <FacebookOutlined /> Facebook
                      </Select.Option>
                      <Select.Option value="instagram">
                        <InstagramOutlined /> Instagram
                      </Select.Option>
                      <Select.Option value="twitter">
                        <TwitterOutlined /> Twitter
                      </Select.Option>
                      <Select.Option value="linkedin">
                        <LinkedinOutlined /> LinkedIn
                      </Select.Option>
                    </Select>
                  </Space>
                }
              >
                <Search
                  placeholder="Search conversations..."
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ marginBottom: 16 }}
                  prefix={<SearchOutlined />}
                />

                <List
                  dataSource={filteredDMs}
                  renderItem={(dm) => (
                    <List.Item
                      onClick={() => setSelectedConversation(dm)}
                      style={{
                        cursor: 'pointer',
                        background: selectedConversation?.id === dm.id ? '#f8fafc' : 'transparent',
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 8,
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge dot={!dm.read} offset={[-5, 35]}>
                            <Avatar
                              icon={<UserOutlined />}
                              style={{ background: getPlatformColor(dm.platform) }}
                            />
                          </Badge>
                        }
                        title={
                          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                            <Space>
                              <Text strong>{dm.sender.name}</Text>
                              {dm.sender.verified && (
                                <CheckCircleOutlined style={{ color: '#1da1f2' }} />
                              )}
                            </Space>
                            <Space size={4}>
                              {dm.starred && <StarOutlined style={{ color: '#f59e0b' }} />}
                              {getPlatformIcon(dm.platform)}
                            </Space>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" style={{ width: '100%' }} size={4}>
                            <Text
                              ellipsis
                              type="secondary"
                              style={{ fontSize: 12, display: 'block' }}
                            >
                              {dm.message}
                            </Text>
                            <Space size={8}>
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                <ClockCircleOutlined style={{ marginRight: 4 }} />
                                {formatTimestamp(dm.timestamp)}
                              </Text>
                              {dm.replied && (
                                <Tag color="success" style={{ fontSize: 10, margin: 0 }}>
                                  Replied
                                </Tag>
                              )}
                              {!dm.read && (
                                <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>
                                  New
                                </Tag>
                              )}
                            </Space>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                  locale={{
                    emptyText: (
                      <Empty
                        description="No conversations found"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    ),
                  }}
                />
              </Card>
            </Col>

            {/* Conversation Detail & Reply */}
            <Col span={14}>
              {selectedConversation ? (
                <Card title="Conversation" size="small">
                  <Space direction="vertical" style={{ width: '100%' }} size="large">
                    {/* Contact Info */}
                    <Card size="small" style={{ background: '#f8fafc' }}>
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Space>
                          <Avatar
                            size={48}
                            icon={<UserOutlined />}
                            style={{ background: getPlatformColor(selectedConversation.platform) }}
                          />
                          <div>
                            <Text strong>{selectedConversation.sender.name}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {selectedConversation.sender.username} • {getPlatformIcon(selectedConversation.platform)}
                            </Text>
                          </div>
                        </Space>
                        <Space>
                          <Tag color={getSentimentColor(selectedConversation.sentiment)}>
                            {getSentimentLabel(selectedConversation.sentiment)}
                          </Tag>
                          <Button type="text" icon={<StarOutlined />} />
                        </Space>
                      </Space>
                    </Card>

                    {/* Message Thread */}
                    <div style={{ maxHeight: 300, overflowY: 'auto', padding: 16, background: '#f8fafc', borderRadius: 8 }}>
                      <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                          <div
                            style={{
                              background: 'white',
                              padding: '12px 16px',
                              borderRadius: 16,
                              maxWidth: '70%',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            }}
                          >
                            <Text>{selectedConversation.message}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {formatTimestamp(selectedConversation.timestamp)}
                            </Text>
                          </div>
                        </div>
                      </Space>
                    </div>

                    {/* AI Suggested Replies */}
                    <Alert
                      message={
                        <Space>
                          <RobotOutlined />
                          <Text strong>AI Suggested Replies</Text>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
                          {aiSuggestedReplies.map((reply, index) => (
                            <Button
                              key={index}
                              type="dashed"
                              block
                              size="small"
                              onClick={() => handleQuickReply(reply)}
                              style={{ textAlign: 'left', height: 'auto', padding: '8px 12px' }}
                            >
                              <Text style={{ fontSize: 12 }}>{reply}</Text>
                            </Button>
                          ))}
                        </Space>
                      }
                      type="info"
                      icon={<ThunderboltOutlined />}
                    />

                    {/* Reply Box */}
                    <div>
                      <TextArea
                        rows={4}
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply..."
                        style={{ marginBottom: 8 }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Space>
                          {quickReplyTemplates.map((template, index) => (
                            <Button
                              key={index}
                              size="small"
                              onClick={() => handleQuickReply(template)}
                            >
                              Quick {index + 1}
                            </Button>
                          ))}
                        </Space>
                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          onClick={handleSendReply}
                        >
                          Send Reply
                        </Button>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Tags:
                      </Text>
                      <Space style={{ marginTop: 8 }} wrap>
                        {selectedConversation.tags.map((tag) => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                        <Button size="small" type="dashed" icon={<PlusOutlined />}>
                          Add Tag
                        </Button>
                      </Space>
                    </div>
                  </Space>
                </Card>
              ) : (
                <Card>
                  <Empty
                    description="Select a conversation to view and reply"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </Card>
              )}
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Connect Platform Modal */}
      <Modal
        title="Connect Social Media Platform"
        open={showConnectModal}
        onCancel={() => setShowConnectModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowConnectModal(false)}>
            Cancel
          </Button>,
          <Button
            key="connect"
            type="primary"
            onClick={() => {
              message.success('Platform connected successfully!');
              setShowConnectModal(false);
            }}
          >
            Connect
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Alert
            message="OAuth Integration"
            description="You'll be redirected to authorize access to your social media account. We only request permissions to read and send direct messages."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item label="Platform" name="platform" rules={[{ required: true }]}>
            <Select size="large">
              <Select.Option value="facebook">
                <FacebookOutlined /> Facebook Messenger
              </Select.Option>
              <Select.Option value="instagram">
                <InstagramOutlined /> Instagram Direct
              </Select.Option>
              <Select.Option value="twitter">
                <TwitterOutlined /> Twitter DMs
              </Select.Option>
              <Select.Option value="linkedin">
                <LinkedinOutlined /> LinkedIn Messages
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Enable Auto-Responses" name="autoResponse" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="Enable AI Sentiment Analysis" name="sentiment" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default SocialMediaDMHub;
