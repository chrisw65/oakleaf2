import React, { useState } from 'react';
import {
  Modal,
  Card,
  Button,
  Space,
  Typography,
  Input,
  Select,
  Form,
  Switch,
  Tag,
  List,
  Divider,
  Alert,
  message,
  Tooltip,
  Row,
  Col,
  TimePicker,
} from 'antd';
import {
  RobotOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  MessageOutlined,
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  LinkedinOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface AutoReplyRule {
  id: string;
  name: string;
  enabled: boolean;
  platforms: ('facebook' | 'instagram' | 'twitter' | 'linkedin')[];
  triggerType: 'keyword' | 'greeting' | 'question' | 'all' | 'off-hours';
  keywords?: string[];
  response: string;
  delay?: number; // seconds
  onlyFirstMessage: boolean;
  businessHours?: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  stats?: {
    triggered: number;
    replied: number;
    satisfaction: number;
  };
}

interface AutoReplyRulesManagerProps {
  visible: boolean;
  onClose: () => void;
}

const AutoReplyRulesManager: React.FC<AutoReplyRulesManagerProps> = ({
  visible,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoReplyRule | null>(null);

  const [rules, setRules] = useState<AutoReplyRule[]>([
    {
      id: 'rule-1',
      name: 'Pricing Inquiry Auto-Response',
      enabled: true,
      platforms: ['facebook', 'instagram', 'twitter'],
      triggerType: 'keyword',
      keywords: ['pricing', 'price', 'cost', 'how much', 'plans'],
      response: 'Thanks for your interest! 🎉 Our pricing starts at $49/month. Visit https://yoursite.com/pricing for full details, or I can schedule a quick demo to show you everything. Which works better for you?',
      delay: 2,
      onlyFirstMessage: false,
      stats: {
        triggered: 145,
        replied: 145,
        satisfaction: 87,
      },
    },
    {
      id: 'rule-2',
      name: 'After-Hours Auto-Response',
      enabled: true,
      platforms: ['facebook', 'instagram', 'twitter', 'linkedin'],
      triggerType: 'off-hours',
      response: 'Thanks for reaching out! 🌙 We\'re currently offline but we\'ll respond within 2 hours during business hours (9 AM - 6 PM EST). For urgent matters, email support@yoursite.com',
      delay: 1,
      onlyFirstMessage: true,
      businessHours: {
        enabled: true,
        start: '09:00',
        end: '18:00',
        timezone: 'America/New_York',
      },
      stats: {
        triggered: 89,
        replied: 89,
        satisfaction: 92,
      },
    },
    {
      id: 'rule-3',
      name: 'Welcome New Followers',
      enabled: true,
      platforms: ['instagram', 'twitter'],
      triggerType: 'greeting',
      keywords: ['hi', 'hello', 'hey'],
      response: 'Hey! 👋 Welcome to our community! I\'m here to help. Are you looking for info about our funnel builder, pricing, or something else?',
      delay: 3,
      onlyFirstMessage: true,
      stats: {
        triggered: 234,
        replied: 234,
        satisfaction: 94,
      },
    },
    {
      id: 'rule-4',
      name: 'FAQ: Integration Questions',
      enabled: true,
      platforms: ['facebook', 'linkedin'],
      triggerType: 'keyword',
      keywords: ['integrate', 'integration', 'connect', 'api', 'zapier', 'webhook'],
      response: 'Great question! We integrate with 50+ tools including Stripe, Mailchimp, Shopify, and more. Check our full integration list: https://yoursite.com/integrations\n\nNeed help with a specific integration? Let me know!',
      delay: 2,
      onlyFirstMessage: false,
      stats: {
        triggered: 67,
        replied: 67,
        satisfaction: 88,
      },
    },
  ]);

  const presetRules = [
    {
      name: 'Demo Request Handler',
      triggerType: 'keyword',
      keywords: ['demo', 'demonstration', 'show me', 'see it'],
      response: 'I\'d love to show you a demo! 🚀 You can:\n\n1. Watch a 5-min video: [link]\n2. Try it free for 14 days: [link]\n3. Book a live demo: [calendly-link]\n\nWhich option works best for you?',
    },
    {
      name: 'Support Ticket Auto-Create',
      triggerType: 'keyword',
      keywords: ['help', 'issue', 'problem', 'bug', 'error', 'not working'],
      response: 'I\'m sorry you\'re experiencing an issue! I\'ve created a support ticket for you. Our team typically responds within 2 hours.\n\nTicket #: [auto-generated]\n\nCan you share more details about what\'s happening?',
    },
    {
      name: 'Trial Signup Nudge',
      triggerType: 'keyword',
      keywords: ['trial', 'free trial', 'try', 'test'],
      response: 'Start your free 14-day trial now! No credit card required 🎉\n\n👉 [signup-link]\n\nYou\'ll get:\n✅ Full access to all features\n✅ Unlimited funnels\n✅ Premium templates\n✅ Priority support',
    },
  ];

  const handleCreateRule = () => {
    form.validateFields().then((values) => {
      const newRule: AutoReplyRule = {
        id: `rule-${Date.now()}`,
        name: values.name,
        enabled: true,
        platforms: values.platforms,
        triggerType: values.triggerType,
        keywords: values.keywords,
        response: values.response,
        delay: values.delay || 0,
        onlyFirstMessage: values.onlyFirstMessage || false,
        businessHours: values.businessHours,
        stats: {
          triggered: 0,
          replied: 0,
          satisfaction: 0,
        },
      };

      setRules([...rules, newRule]);
      setIsCreating(false);
      form.resetFields();
      message.success('Auto-reply rule created successfully!');
    });
  };

  const handleEditRule = (rule: AutoReplyRule) => {
    setEditingRule(rule);
    setIsCreating(true);
    form.setFieldsValue(rule);
  };

  const handleDeleteRule = (ruleId: string) => {
    Modal.confirm({
      title: 'Delete Auto-Reply Rule',
      content: 'Are you sure you want to delete this rule?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        setRules(rules.filter(r => r.id !== ruleId));
        message.success('Rule deleted successfully');
      },
    });
  };

  const handleToggleRule = (ruleId: string) => {
    setRules(rules.map(r =>
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ));
    message.success('Rule updated');
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

  const getTriggerLabel = (type: string) => {
    const labels: any = {
      keyword: 'Keyword Match',
      greeting: 'Greeting',
      question: 'Question',
      'off-hours': 'After Hours',
      all: 'All Messages',
    };
    return labels[type] || type;
  };

  const loadPresetRule = (preset: any) => {
    form.setFieldsValue({
      name: preset.name,
      triggerType: preset.triggerType,
      keywords: preset.keywords,
      response: preset.response,
      platforms: ['facebook', 'instagram', 'twitter', 'linkedin'],
      delay: 2,
      onlyFirstMessage: false,
    });
    setIsCreating(true);
    message.info('Preset loaded! Customize and save.');
  };

  return (
    <Modal
      title={
        <Space>
          <RobotOutlined style={{ fontSize: 24, color: '#6366f1' }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Auto-Reply Rules Manager
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Automate responses to common messages across all platforms
            </Text>
          </div>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={null}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Stats Overview */}
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card size="small">
              <Space direction="vertical">
                <Text type="secondary">Active Rules</Text>
                <Title level={2} style={{ margin: 0 }}>
                  {rules.filter(r => r.enabled).length}
                </Title>
              </Space>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Space direction="vertical">
                <Text type="secondary">Messages Auto-Replied</Text>
                <Title level={2} style={{ margin: 0, color: '#6366f1' }}>
                  {rules.reduce((sum, r) => sum + (r.stats?.replied || 0), 0)}
                </Title>
              </Space>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small">
              <Space direction="vertical">
                <Text type="secondary">Avg Satisfaction</Text>
                <Title level={2} style={{ margin: 0, color: '#10b981' }}>
                  {Math.round(rules.reduce((sum, r) => sum + (r.stats?.satisfaction || 0), 0) / rules.length)}%
                </Title>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Preset Templates */}
        {!isCreating && (
          <Card title="Quick Start Templates" size="small">
            <Row gutter={[8, 8]}>
              {presetRules.map((preset, index) => (
                <Col span={8} key={index}>
                  <Card
                    size="small"
                    hoverable
                    onClick={() => loadPresetRule(preset)}
                    style={{ height: '100%', cursor: 'pointer' }}
                  >
                    <Space direction="vertical" size="small">
                      <Text strong style={{ fontSize: 12 }}>{preset.name}</Text>
                      <Tag color="blue" style={{ fontSize: 10 }}>
                        {getTriggerLabel(preset.triggerType)}
                      </Tag>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* Create/Edit Rule Form */}
        {isCreating ? (
          <Card
            title={editingRule ? 'Edit Rule' : 'Create New Rule'}
            size="small"
            extra={
              <Button onClick={() => {
                setIsCreating(false);
                setEditingRule(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
            }
          >
            <Form form={form} layout="vertical">
              <Form.Item
                label="Rule Name"
                name="name"
                rules={[{ required: true, message: 'Please enter rule name' }]}
              >
                <Input placeholder="e.g., Pricing Inquiry Handler" size="large" />
              </Form.Item>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    label="Platforms"
                    name="platforms"
                    rules={[{ required: true, message: 'Select at least one platform' }]}
                  >
                    <Select
                      mode="multiple"
                      size="large"
                      placeholder="Select platforms"
                    >
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
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Trigger Type"
                    name="triggerType"
                    rules={[{ required: true }]}
                  >
                    <Select size="large">
                      <Select.Option value="keyword">Keyword Match</Select.Option>
                      <Select.Option value="greeting">Greeting</Select.Option>
                      <Select.Option value="question">Question</Select.Option>
                      <Select.Option value="off-hours">After Hours</Select.Option>
                      <Select.Option value="all">All Messages</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.triggerType !== currentValues.triggerType}
              >
                {({ getFieldValue }) =>
                  ['keyword', 'greeting'].includes(getFieldValue('triggerType')) ? (
                    <Form.Item
                      label="Keywords (comma-separated)"
                      name="keywords"
                      rules={[{ required: true, message: 'Enter at least one keyword' }]}
                    >
                      <Select
                        mode="tags"
                        size="large"
                        placeholder="e.g., pricing, cost, price"
                        tokenSeparators={[',']}
                      />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>

              <Form.Item
                label="Auto-Reply Message"
                name="response"
                rules={[{ required: true, message: 'Please enter response message' }]}
              >
                <TextArea
                  rows={5}
                  placeholder="Enter your auto-reply message..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    label={
                      <Space>
                        <Text>Response Delay</Text>
                        <Tooltip title="Add a human-like delay before sending">
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    name="delay"
                    initialValue={2}
                  >
                    <Select size="large">
                      <Select.Option value={0}>Instant</Select.Option>
                      <Select.Option value={1}>1 second</Select.Option>
                      <Select.Option value={2}>2 seconds</Select.Option>
                      <Select.Option value={3}>3 seconds</Select.Option>
                      <Select.Option value={5}>5 seconds</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Reply to first message only"
                    name="onlyFirstMessage"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Alert
                message="Pro Tips"
                description={
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>Use emojis to make responses more friendly</li>
                    <li>Include links to relevant resources</li>
                    <li>Keep messages under 300 characters for best engagement</li>
                    <li>Test your rules before enabling</li>
                  </ul>
                }
                type="info"
                showIcon
              />

              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => {
                    setIsCreating(false);
                    setEditingRule(null);
                    form.resetFields();
                  }}>
                    Cancel
                  </Button>
                  <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleCreateRule}>
                    {editingRule ? 'Update Rule' : 'Create Rule'}
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>
        ) : (
          <>
            {/* Existing Rules List */}
            <Card
              title={`Active Rules (${rules.length})`}
              size="small"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsCreating(true)}
                >
                  Create Rule
                </Button>
              }
            >
              <List
                dataSource={rules}
                renderItem={(rule) => (
                  <Card
                    size="small"
                    style={{
                      marginBottom: 12,
                      borderColor: rule.enabled ? '#10b981' : '#d1d5db',
                      opacity: rule.enabled ? 1 : 0.6,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Space direction="vertical" style={{ flex: 1 }}>
                        <Space>
                          <Text strong>{rule.name}</Text>
                          <Tag color={rule.enabled ? 'success' : 'default'}>
                            {rule.enabled ? 'Active' : 'Disabled'}
                          </Tag>
                          <Tag color="blue">{getTriggerLabel(rule.triggerType)}</Tag>
                        </Space>

                        <Space wrap>
                          {rule.platforms.map(platform => (
                            <span key={platform}>{getPlatformIcon(platform)}</span>
                          ))}
                        </Space>

                        {rule.keywords && rule.keywords.length > 0 && (
                          <div>
                            <Text type="secondary" style={{ fontSize: 11 }}>Keywords: </Text>
                            <Space size={4} wrap>
                              {rule.keywords.slice(0, 5).map(keyword => (
                                <Tag key={keyword} style={{ fontSize: 10 }}>{keyword}</Tag>
                              ))}
                              {rule.keywords.length > 5 && (
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  +{rule.keywords.length - 5} more
                                </Text>
                              )}
                            </Space>
                          </div>
                        )}

                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{ margin: 0, fontSize: 12, color: '#666' }}
                        >
                          {rule.response}
                        </Paragraph>

                        {rule.stats && (
                          <Space split={<Divider type="vertical" />} style={{ fontSize: 11 }}>
                            <Text type="secondary">
                              <MessageOutlined /> {rule.stats.triggered} triggered
                            </Text>
                            <Text type="secondary">
                              <CheckCircleOutlined /> {rule.stats.satisfaction}% satisfaction
                            </Text>
                          </Space>
                        )}
                      </Space>

                      <Space>
                        <Switch
                          checked={rule.enabled}
                          onChange={() => handleToggleRule(rule.id)}
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEditRule(rule)}
                        />
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteRule(rule.id)}
                        />
                      </Space>
                    </div>
                  </Card>
                )}
              />
            </Card>
          </>
        )}
      </Space>
    </Modal>
  );
};

export default AutoReplyRulesManager;
