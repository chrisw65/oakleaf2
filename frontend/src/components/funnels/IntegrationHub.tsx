import React, { useState } from 'react';
import {
  Modal,
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Tag,
  Input,
  Form,
  Tabs,
  Badge,
  Alert,
  Switch,
  Select,
  message,
} from 'antd';
import {
  SearchOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  LinkOutlined,
  DollarOutlined,
  MailOutlined,
  MessageOutlined,
  PhoneOutlined,
  BarChartOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  ApiOutlined,
  CloudOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface Integration {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  description: string;
  isConnected: boolean;
  isPremium?: boolean;
  features: string[];
  setupDifficulty: 'Easy' | 'Medium' | 'Advanced';
  popular?: boolean;
}

interface IntegrationHubProps {
  visible: boolean;
  onCancel: () => void;
  funnelId?: string;
}

const IntegrationHub: React.FC<IntegrationHubProps> = ({
  visible,
  onCancel,
  funnelId,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [form] = Form.useForm();

  const categories = [
    { value: 'all', label: 'All Integrations' },
    { value: 'payment', label: 'Payment Processors', icon: <DollarOutlined /> },
    { value: 'email', label: 'Email Marketing', icon: <MailOutlined /> },
    { value: 'crm', label: 'CRM', icon: <TeamOutlined /> },
    { value: 'sms', label: 'SMS', icon: <MessageOutlined /> },
    { value: 'analytics', label: 'Analytics', icon: <BarChartOutlined /> },
    { value: 'webinar', label: 'Webinar', icon: <PhoneOutlined /> },
    { value: 'ecommerce', label: 'E-Commerce', icon: <ShoppingCartOutlined /> },
    { value: 'automation', label: 'Automation', icon: <ThunderboltOutlined /> },
  ];

  const integrations: Integration[] = [
    // Payment Processors
    {
      id: 'stripe',
      name: 'Stripe',
      category: 'payment',
      icon: <DollarOutlined style={{ color: '#6772e5' }} />,
      description: 'Accept credit cards, subscriptions, and manage payments',
      isConnected: false,
      features: ['One-time payments', 'Subscriptions', 'Payment plans', 'Refunds'],
      setupDifficulty: 'Easy',
      popular: true,
    },
    {
      id: 'paypal',
      name: 'PayPal',
      category: 'payment',
      icon: <DollarOutlined style={{ color: '#003087' }} />,
      description: 'Accept PayPal payments and major credit cards',
      isConnected: false,
      features: ['One-time payments', 'Checkout integration', 'Express checkout'],
      setupDifficulty: 'Easy',
      popular: true,
    },
    {
      id: 'square',
      name: 'Square',
      category: 'payment',
      icon: <DollarOutlined style={{ color: '#000' }} />,
      description: 'Payment processing with Square',
      isConnected: false,
      features: ['Card payments', 'Mobile payments', 'Point of sale'],
      setupDifficulty: 'Medium',
    },
    // Email Marketing
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      category: 'email',
      icon: <MailOutlined style={{ color: '#ffe01b' }} />,
      description: 'Email marketing and automation platform',
      isConnected: false,
      features: ['Email campaigns', 'Automation', 'Segmentation', 'Analytics'],
      setupDifficulty: 'Easy',
      popular: true,
    },
    {
      id: 'activecampaign',
      name: 'ActiveCampaign',
      category: 'email',
      icon: <MailOutlined style={{ color: '#356ae6' }} />,
      description: 'Advanced email marketing automation',
      isConnected: false,
      features: ['Email automation', 'CRM', 'Sales automation', 'SMS'],
      setupDifficulty: 'Medium',
      popular: true,
    },
    {
      id: 'convertkit',
      name: 'ConvertKit',
      category: 'email',
      icon: <MailOutlined style={{ color: '#fb6970' }} />,
      description: 'Email marketing for creators',
      isConnected: false,
      features: ['Landing pages', 'Email sequences', 'Tagging', 'Automation'],
      setupDifficulty: 'Easy',
    },
    {
      id: 'sendinblue',
      name: 'Sendinblue',
      category: 'email',
      icon: <MailOutlined style={{ color: '#0092ff' }} />,
      description: 'Email, SMS, and chat platform',
      isConnected: false,
      features: ['Email campaigns', 'SMS marketing', 'Chat', 'CRM'],
      setupDifficulty: 'Easy',
    },
    // CRM
    {
      id: 'hubspot',
      name: 'HubSpot',
      category: 'crm',
      icon: <TeamOutlined style={{ color: '#ff7a59' }} />,
      description: 'Complete CRM platform',
      isConnected: false,
      features: ['Contact management', 'Deal tracking', 'Email integration', 'Reporting'],
      setupDifficulty: 'Medium',
      popular: true,
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      category: 'crm',
      icon: <TeamOutlined style={{ color: '#00a1e0' }} />,
      description: 'Enterprise CRM solution',
      isConnected: false,
      isPremium: true,
      features: ['Lead management', 'Opportunity tracking', 'Forecasting', 'Analytics'],
      setupDifficulty: 'Advanced',
    },
    {
      id: 'pipedrive',
      name: 'Pipedrive',
      category: 'crm',
      icon: <TeamOutlined style={{ color: '#000' }} />,
      description: 'Sales-focused CRM',
      isConnected: false,
      features: ['Pipeline management', 'Activity tracking', 'Email integration'],
      setupDifficulty: 'Easy',
    },
    // SMS
    {
      id: 'twilio',
      name: 'Twilio',
      category: 'sms',
      icon: <MessageOutlined style={{ color: '#f22f46' }} />,
      description: 'SMS and voice communication',
      isConnected: false,
      features: ['SMS messaging', 'Phone calls', 'WhatsApp', 'Verification'],
      setupDifficulty: 'Medium',
      popular: true,
    },
    // Analytics
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      category: 'analytics',
      icon: <BarChartOutlined style={{ color: '#e37400' }} />,
      description: 'Web analytics and reporting',
      isConnected: false,
      features: ['Traffic analysis', 'Conversion tracking', 'Custom reports', 'Real-time data'],
      setupDifficulty: 'Easy',
      popular: true,
    },
    {
      id: 'facebook-pixel',
      name: 'Facebook Pixel',
      category: 'analytics',
      icon: <BarChartOutlined style={{ color: '#1877f2' }} />,
      description: 'Track conversions for Facebook Ads',
      isConnected: false,
      features: ['Conversion tracking', 'Retargeting', 'Custom audiences', 'Optimization'],
      setupDifficulty: 'Easy',
      popular: true,
    },
    // Webinar
    {
      id: 'zoom',
      name: 'Zoom',
      category: 'webinar',
      icon: <PhoneOutlined style={{ color: '#2d8cff' }} />,
      description: 'Video conferencing and webinars',
      isConnected: false,
      features: ['Webinars', 'Meetings', 'Registration', 'Recording'],
      setupDifficulty: 'Easy',
    },
    {
      id: 'webinarjam',
      name: 'WebinarJam',
      category: 'webinar',
      icon: <PhoneOutlined style={{ color: '#ff6b00' }} />,
      description: 'Live webinar platform',
      isConnected: false,
      features: ['Live webinars', 'Automated replays', 'Chat', 'Offers'],
      setupDifficulty: 'Medium',
    },
    // Automation
    {
      id: 'zapier',
      name: 'Zapier',
      category: 'automation',
      icon: <ThunderboltOutlined style={{ color: '#ff4a00' }} />,
      description: 'Connect 5000+ apps with automation',
      isConnected: false,
      features: ['App connections', 'Workflows', 'Multi-step zaps', 'Scheduling'],
      setupDifficulty: 'Medium',
      popular: true,
    },
    {
      id: 'make',
      name: 'Make (Integromat)',
      category: 'automation',
      icon: <ThunderboltOutlined style={{ color: '#6d3de8' }} />,
      description: 'Advanced automation scenarios',
      isConnected: false,
      features: ['Visual builder', 'Complex scenarios', 'Data transformation', 'Scheduling'],
      setupDifficulty: 'Advanced',
    },
    // E-commerce
    {
      id: 'shopify',
      name: 'Shopify',
      category: 'ecommerce',
      icon: <ShoppingCartOutlined style={{ color: '#96bf48' }} />,
      description: 'Connect your Shopify store',
      isConnected: false,
      features: ['Product sync', 'Order fulfillment', 'Inventory management', 'Abandoned carts'],
      setupDifficulty: 'Medium',
    },
    {
      id: 'woocommerce',
      name: 'WooCommerce',
      category: 'ecommerce',
      icon: <ShoppingCartOutlined style={{ color: '#96588a' }} />,
      description: 'WordPress e-commerce integration',
      isConnected: false,
      features: ['Product sync', 'Orders', 'Customers', 'Webhooks'],
      setupDifficulty: 'Medium',
    },
  ];

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchText.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchText.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || integration.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleConnect = (integration: Integration) => {
    setConfiguring(integration.id);
  };

  const handleSaveIntegration = async () => {
    try {
      const values = await form.validateFields();
      message.success(`${configuring} connected successfully!`);
      setConfiguring(null);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const renderConfigurationForm = (integrationId: string) => {
    const integration = integrations.find((i) => i.id === integrationId);
    if (!integration) return null;

    // Different forms for different integration types
    if (integration.category === 'payment') {
      return (
        <Form form={form} layout="vertical">
          <Alert
            message="Secure Connection"
            description="Your API keys are encrypted and stored securely. We never see your customers' payment information."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form.Item
            label="API Key"
            name="apiKey"
            rules={[{ required: true, message: 'Please enter your API key' }]}
          >
            <Input.Password placeholder="sk_live_..." />
          </Form.Item>
          <Form.Item label="Webhook Secret" name="webhookSecret">
            <Input.Password placeholder="whsec_..." />
          </Form.Item>
          <Form.Item label="Test Mode" name="testMode" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      );
    }

    if (integration.category === 'email') {
      return (
        <Form form={form} layout="vertical">
          <Form.Item
            label="API Key"
            name="apiKey"
            rules={[{ required: true, message: 'Please enter your API key' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item label="Default List" name="defaultList">
            <Select placeholder="Select a list">
              <Select.Option value="list1">Main Newsletter</Select.Option>
              <Select.Option value="list2">Leads</Select.Option>
              <Select.Option value="list3">Customers</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Double Opt-in" name="doubleOptin" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      );
    }

    // Generic form for other integrations
    return (
      <Form form={form} layout="vertical">
        <Form.Item
          label="API Key / Token"
          name="apiKey"
          rules={[{ required: true, message: 'Please enter your API credentials' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item label="Additional Settings" name="settings">
          <Input.TextArea rows={3} placeholder="Additional configuration (optional)" />
        </Form.Item>
      </Form>
    );
  };

  return (
    <>
      <Modal
        title={
          <div>
            <Title level={3} style={{ marginBottom: 8 }}>
              <ApiOutlined style={{ marginRight: 8, color: '#6366f1' }} />
              Integration Hub
            </Title>
            <Text type="secondary">
              Connect your favorite tools in seconds. No coding required.
            </Text>
          </div>
        }
        open={visible && !configuring}
        onCancel={onCancel}
        footer={null}
        width={1200}
        bodyStyle={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Search and Filter */}
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Input
                size="large"
                placeholder="Search integrations..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                size="large"
                style={{ width: '100%' }}
                value={selectedCategory}
                onChange={setSelectedCategory}
              >
                {categories.map((cat) => (
                  <Select.Option key={cat.value} value={cat.value}>
                    {cat.icon && cat.icon} {cat.label}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>

          {/* Integration Grid */}
          <Row gutter={[16, 16]}>
            {filteredIntegrations.map((integration) => (
              <Col xs={24} sm={12} lg={8} key={integration.id}>
                <Badge.Ribbon
                  text={integration.popular ? 'Popular' : integration.isPremium ? 'Premium' : ''}
                  color={integration.popular ? '#10b981' : '#6366f1'}
                  style={{ display: integration.popular || integration.isPremium ? 'block' : 'none' }}
                >
                  <Card
                    hoverable
                    actions={[
                      integration.isConnected ? (
                        <Button type="link">Manage</Button>
                      ) : (
                        <Button
                          type="primary"
                          onClick={() => handleConnect(integration)}
                          icon={<LinkOutlined />}
                        >
                          Connect
                        </Button>
                      ),
                    ]}
                  >
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontSize: 32 }}>{integration.icon}</div>
                        <div style={{ flex: 1 }}>
                          <Title level={5} style={{ margin: 0 }}>
                            {integration.name}
                          </Title>
                          <Tag color="blue" style={{ marginTop: 4 }}>
                            {integration.setupDifficulty}
                          </Tag>
                          {integration.isConnected && (
                            <Tag color="success" icon={<CheckCircleOutlined />}>
                              Connected
                            </Tag>
                          )}
                        </div>
                      </div>

                      <Paragraph
                        ellipsis={{ rows: 2 }}
                        style={{ color: '#64748b', marginBottom: 8 }}
                      >
                        {integration.description}
                      </Paragraph>

                      <div>
                        <Text strong style={{ fontSize: 12 }}>
                          Features:
                        </Text>
                        <div style={{ marginTop: 8 }}>
                          {integration.features.slice(0, 3).map((feature) => (
                            <Tag key={feature} style={{ margin: '2px' }}>
                              {feature}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </Space>
                  </Card>
                </Badge.Ribbon>
              </Col>
            ))}
          </Row>

          {/* Bottom CTA */}
          <div
            style={{
              textAlign: 'center',
              padding: '24px',
              background: '#f8fafc',
              borderRadius: 8,
              marginTop: 24,
            }}
          >
            <ApiOutlined style={{ fontSize: 32, color: '#6366f1', marginBottom: 12 }} />
            <Title level={5}>Need a custom integration?</Title>
            <Text type="secondary">
              We can build custom integrations for your specific needs.
            </Text>
            <br />
            <Button type="primary" style={{ marginTop: 16 }}>
              Request Integration
            </Button>
          </div>
        </Space>
      </Modal>

      {/* Configuration Modal */}
      <Modal
        title={`Configure ${integrations.find((i) => i.id === configuring)?.name}`}
        open={!!configuring}
        onCancel={() => {
          setConfiguring(null);
          form.resetFields();
        }}
        onOk={handleSaveIntegration}
        okText="Connect"
        width={600}
      >
        {configuring && renderConfigurationForm(configuring)}
      </Modal>
    </>
  );
};

export default IntegrationHub;
