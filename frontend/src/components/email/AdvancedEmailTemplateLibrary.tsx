import React, { useState } from 'react';
import {
  Modal,
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Input,
  Select,
  Row,
  Col,
  Badge,
  Tooltip,
  Tabs,
  List,
  Avatar,
  Divider,
  message,
  Rate,
} from 'antd';
import {
  MailOutlined,
  SearchOutlined,
  FilterOutlined,
  ThunderboltOutlined,
  StarOutlined,
  EyeOutlined,
  CopyOutlined,
  EditOutlined,
  RocketOutlined,
  TrophyOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
  GiftOutlined,
  BellOutlined,
  TeamOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  openRate: string;
  clickRate: string;
  conversionRate: string;
  industry: string[];
  useCase: string;
  preview: string;
  subject: string;
  previewText: string;
  isPremium: boolean;
  rating: number;
  usageCount: number;
  tags: string[];
  thumbnail?: string;
}

interface AdvancedEmailTemplateLibraryProps {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
}

const AdvancedEmailTemplateLibrary: React.FC<AdvancedEmailTemplateLibraryProps> = ({
  visible,
  onClose,
  onSelectTemplate,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');

  const templates: EmailTemplate[] = [
    // Welcome & Onboarding
    {
      id: 'welcome-saas-trial',
      name: 'SaaS Welcome & Trial Activation',
      category: 'welcome',
      description: 'Perfect first email for new SaaS trial users with onboarding steps',
      openRate: '68%',
      clickRate: '42%',
      conversionRate: '28%',
      industry: ['SaaS', 'Technology'],
      useCase: 'New trial signups',
      subject: 'Welcome to [Product]! Here\'s how to get started in 5 minutes',
      previewText: 'Your account is ready. Let\'s get you up and running...',
      preview: 'Clean, modern welcome email with 3-step onboarding, demo video, and quick start guide',
      isPremium: false,
      rating: 4.8,
      usageCount: 15234,
      tags: ['High Converting', 'Onboarding', 'Trial'],
    },
    {
      id: 'welcome-ecommerce',
      name: 'E-Commerce Welcome & First Purchase',
      category: 'welcome',
      description: 'Convert new subscribers to first-time buyers with exclusive offer',
      openRate: '72%',
      clickRate: '38%',
      conversionRate: '18%',
      industry: ['E-Commerce', 'Retail'],
      useCase: 'New email subscribers',
      subject: '[Name], here\'s your exclusive 15% welcome gift',
      previewText: 'Thanks for joining! Here\'s something special just for you...',
      preview: 'Engaging welcome with discount code, bestsellers showcase, and customer reviews',
      isPremium: false,
      rating: 4.6,
      usageCount: 18923,
      tags: ['Discount', 'First Purchase', 'Welcome'],
    },
    // Promotional
    {
      id: 'flash-sale-urgency',
      name: 'Flash Sale with Countdown Timer',
      category: 'promotional',
      description: 'High-urgency promotional email with countdown and scarcity triggers',
      openRate: '58%',
      clickRate: '45%',
      conversionRate: '22%',
      industry: ['E-Commerce', 'Retail', 'SaaS'],
      useCase: 'Limited-time offers',
      subject: '⚡ FLASH SALE: 48 Hours Only - Up to 60% Off',
      previewText: 'This is your chance! Sale ends in 47h 23m...',
      preview: 'Dynamic countdown timer, featured products, social proof, and clear CTA',
      isPremium: true,
      rating: 4.9,
      usageCount: 12456,
      tags: ['Urgency', 'Countdown', 'High Converting'],
    },
    {
      id: 'product-launch',
      name: 'New Product Launch Announcement',
      category: 'promotional',
      description: 'Build excitement for new product with early bird offer',
      openRate: '64%',
      clickRate: '40%',
      conversionRate: '16%',
      industry: ['E-Commerce', 'SaaS', 'Info Products'],
      useCase: 'Product launches',
      subject: '🚀 Introducing [Product Name] - Early Access Inside',
      previewText: 'You\'re getting first access to our latest innovation...',
      preview: 'Product showcase with benefits, video demo, and exclusive launch pricing',
      isPremium: true,
      rating: 4.7,
      usageCount: 8934,
      tags: ['Launch', 'Early Bird', 'Exclusive'],
    },
    // Re-engagement
    {
      id: 'winback-lapsed',
      name: 'Win-Back Lapsed Customers',
      category: 're-engagement',
      description: 'Re-engage inactive customers with compelling offer and nostalgia',
      openRate: '42%',
      clickRate: '35%',
      conversionRate: '14%',
      industry: ['E-Commerce', 'SaaS', 'Subscription'],
      useCase: 'Inactive 90+ days',
      subject: 'We miss you, [Name]! Here\'s 25% off to welcome you back',
      previewText: 'It\'s been a while. We\'d love to see you again...',
      preview: 'Emotional reconnection with personalized message, big incentive, and easy return',
      isPremium: false,
      rating: 4.5,
      usageCount: 11234,
      tags: ['Win-Back', 'Incentive', 'Personalized'],
    },
    {
      id: 'cart-abandonment-series',
      name: 'Cart Abandonment 3-Email Series',
      category: 're-engagement',
      description: 'Proven 3-email sequence to recover abandoned carts (24h, 48h, 72h)',
      openRate: '52%',
      clickRate: '38%',
      conversionRate: '32%',
      industry: ['E-Commerce', 'Retail'],
      useCase: 'Abandoned carts',
      subject: 'Did you forget something? Your cart is waiting...',
      previewText: 'Complete your order now and save your items...',
      preview: 'Product reminder, customer reviews, limited stock notice, and increasing incentives',
      isPremium: true,
      rating: 4.9,
      usageCount: 24567,
      tags: ['Cart Recovery', 'Series', 'High ROI'],
    },
    // Educational
    {
      id: 'drip-educational',
      name: '5-Day Educational Drip Course',
      category: 'educational',
      description: 'Build authority and trust with value-first educational series',
      openRate: '61%',
      clickRate: '34%',
      conversionRate: '19%',
      industry: ['Coaching', 'SaaS', 'Info Products'],
      useCase: 'Lead nurturing',
      subject: 'Day [X]: [Lesson Title] - Your Daily Insight',
      previewText: 'Today you\'ll learn how to [specific benefit]...',
      preview: 'Daily lesson with actionable tips, case study, and soft CTA to main offer',
      isPremium: true,
      rating: 4.8,
      usageCount: 9876,
      tags: ['Educational', 'Series', 'Nurture'],
    },
    {
      id: 'case-study-showcase',
      name: 'Case Study Success Story',
      category: 'educational',
      description: 'Social proof email highlighting customer transformation',
      openRate: '56%',
      clickRate: '41%',
      conversionRate: '21%',
      industry: ['Coaching', 'SaaS', 'Agency'],
      useCase: 'Building credibility',
      subject: 'How [Customer] achieved [Result] in [Timeframe]',
      previewText: 'Real results from a customer just like you...',
      preview: 'Before/after story, specific numbers, customer quote, and clear path to similar results',
      isPremium: false,
      rating: 4.7,
      usageCount: 7654,
      tags: ['Case Study', 'Social Proof', 'Results'],
    },
    // Event & Webinar
    {
      id: 'webinar-invitation',
      name: 'Webinar Invitation High-Converting',
      category: 'event',
      description: 'Get 40%+ registration rates with this webinar invitation template',
      openRate: '59%',
      clickRate: '47%',
      conversionRate: '41%',
      industry: ['Coaching', 'SaaS', 'Info Products'],
      useCase: 'Webinar promotion',
      subject: '[LIVE Training]: How to [Achieve Outcome] in [Timeframe]',
      previewText: 'Reserve your spot for this exclusive training session...',
      preview: 'Compelling hook, bullet benefits, speaker credibility, and easy registration',
      isPremium: true,
      rating: 4.9,
      usageCount: 13456,
      tags: ['Webinar', 'High Registration', 'Live Event'],
    },
    {
      id: 'webinar-reminder-series',
      name: 'Webinar Reminder Sequence (3 emails)',
      category: 'event',
      description: 'Maximize show-up rate with strategic reminder sequence',
      openRate: '67%',
      clickRate: '52%',
      conversionRate: '45%',
      industry: ['Coaching', 'SaaS', 'Info Products'],
      useCase: 'Webinar reminders',
      subject: 'Reminder: [Event] starts in [Time]',
      previewText: 'Don\'t miss it! We\'re going live soon...',
      preview: '24h, 1h, and 15min reminders with increasing urgency and value reinforcement',
      isPremium: true,
      rating: 4.8,
      usageCount: 11234,
      tags: ['Reminder', 'Show-up Rate', 'Series'],
    },
    // Transactional
    {
      id: 'order-confirmation-upsell',
      name: 'Order Confirmation + Upsell',
      category: 'transactional',
      description: 'Turn confirmation into revenue with strategic upsell',
      openRate: '85%',
      clickRate: '28%',
      conversionRate: '12%',
      industry: ['E-Commerce', 'Retail'],
      useCase: 'Post-purchase',
      subject: 'Order Confirmed! (#[OrderNumber]) + Special Offer Inside',
      previewText: 'Thanks for your order! Here\'s your confirmation...',
      preview: 'Order details, shipping info, and complementary product upsell',
      isPremium: false,
      rating: 4.6,
      usageCount: 19876,
      tags: ['Transactional', 'Upsell', 'High Open Rate'],
    },
    {
      id: 'shipping-notification',
      name: 'Shipping Notification with Cross-sell',
      category: 'transactional',
      description: 'Keep customers engaged with shipping updates and recommendations',
      openRate: '82%',
      clickRate: '22%',
      conversionRate: '8%',
      industry: ['E-Commerce', 'Retail'],
      useCase: 'Order shipped',
      subject: 'Your order has shipped! Track it here',
      previewText: 'Great news! Your items are on the way...',
      preview: 'Tracking info, delivery date, and "customers also bought" recommendations',
      isPremium: false,
      rating: 4.5,
      usageCount: 18234,
      tags: ['Shipping', 'Cross-sell', 'Customer Service'],
    },
    // Newsletter
    {
      id: 'newsletter-modern',
      name: 'Modern Content Newsletter',
      category: 'newsletter',
      description: 'Engaging weekly newsletter with curated content and CTA',
      openRate: '48%',
      clickRate: '18%',
      conversionRate: '7%',
      industry: ['All'],
      useCase: 'Regular communication',
      subject: '[Week] Edition: [Main Topic]',
      previewText: 'This week: [Preview of main content]...',
      preview: 'Clean layout with hero article, quick links, featured content, and subtle CTA',
      isPremium: false,
      rating: 4.4,
      usageCount: 14567,
      tags: ['Newsletter', 'Content', 'Regular'],
    },
    // Holiday & Seasonal
    {
      id: 'black-friday-cyber-monday',
      name: 'Black Friday / Cyber Monday Mega Sale',
      category: 'seasonal',
      description: 'Maximum impact holiday promotion with tiered offers',
      openRate: '71%',
      clickRate: '51%',
      conversionRate: '29%',
      industry: ['E-Commerce', 'SaaS', 'Info Products'],
      useCase: 'Holiday sales',
      subject: '🎁 BLACK FRIDAY: Up to 70% OFF Everything',
      previewText: 'The biggest sale of the year is here!',
      preview: 'Bold design, countdown timer, tiered discounts, and doorbusters',
      isPremium: true,
      rating: 4.9,
      usageCount: 16789,
      tags: ['Holiday', 'Mega Sale', 'Seasonal'],
    },
    // Feedback & Survey
    {
      id: 'feedback-request-nps',
      name: 'NPS Survey & Feedback Request',
      category: 'feedback',
      description: 'Gather valuable feedback with high response rate',
      openRate: '54%',
      clickRate: '36%',
      conversionRate: '32%',
      industry: ['All'],
      useCase: 'Customer feedback',
      subject: 'Quick question: How are we doing?',
      previewText: 'Your opinion matters! 2-minute survey inside...',
      preview: 'Simple NPS scale, open feedback box, and incentive for completion',
      isPremium: false,
      rating: 4.5,
      usageCount: 8934,
      tags: ['Feedback', 'NPS', 'Survey'],
    },
  ];

  const categories = [
    { value: 'all', label: 'All Templates', icon: <MailOutlined />, count: templates.length },
    { value: 'welcome', label: 'Welcome & Onboarding', icon: <HeartOutlined />, count: templates.filter(t => t.category === 'welcome').length },
    { value: 'promotional', label: 'Promotional', icon: <ThunderboltOutlined />, count: templates.filter(t => t.category === 'promotional').length },
    { value: 're-engagement', label: 'Re-engagement', icon: <RocketOutlined />, count: templates.filter(t => t.category === 're-engagement').length },
    { value: 'educational', label: 'Educational', icon: <TrophyOutlined />, count: templates.filter(t => t.category === 'educational').length },
    { value: 'event', label: 'Events & Webinars', icon: <CalendarOutlined />, count: templates.filter(t => t.category === 'event').length },
    { value: 'transactional', label: 'Transactional', icon: <ShoppingCartOutlined />, count: templates.filter(t => t.category === 'transactional').length },
    { value: 'newsletter', label: 'Newsletters', icon: <BellOutlined />, count: templates.filter(t => t.category === 'newsletter').length },
    { value: 'seasonal', label: 'Holiday & Seasonal', icon: <GiftOutlined />, count: templates.filter(t => t.category === 'seasonal').length },
    { value: 'feedback', label: 'Feedback & Surveys', icon: <TeamOutlined />, count: templates.filter(t => t.category === 'feedback').length },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchText.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesIndustry = selectedIndustry === 'all' || template.industry.includes(selectedIndustry);
    const matchesPremium = !showPremiumOnly || template.isPremium;

    return matchesSearch && matchesCategory && matchesIndustry && matchesPremium;
  });

  const handleSelectTemplate = (templateId: string) => {
    onSelectTemplate(templateId);
    message.success('Template loaded successfully!');
    onClose();
  };

  const handlePreview = (template: EmailTemplate) => {
    message.info('Opening preview...');
  };

  const handleCopyTemplate = (template: EmailTemplate) => {
    message.success('Template copied to clipboard!');
  };

  return (
    <Modal
      title={
        <Space>
          <MailOutlined style={{ fontSize: 24, color: '#6366f1' }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Advanced Email Template Library
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {filteredTemplates.length} professional templates with proven conversion rates
            </Text>
          </div>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={null}
      bodyStyle={{ padding: '24px 0' }}
    >
      <div style={{ padding: '0 24px 24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Search and Filters */}
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Search
                placeholder="Search templates by name, description, or tags..."
                allowClear
                size="large"
                prefix={<SearchOutlined />}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col span={6}>
              <Select
                size="large"
                style={{ width: '100%' }}
                value={selectedIndustry}
                onChange={setSelectedIndustry}
                placeholder="Filter by industry"
                suffixIcon={<FilterOutlined />}
              >
                <Select.Option value="all">All Industries</Select.Option>
                <Select.Option value="E-Commerce">E-Commerce</Select.Option>
                <Select.Option value="SaaS">SaaS</Select.Option>
                <Select.Option value="Coaching">Coaching</Select.Option>
                <Select.Option value="Info Products">Info Products</Select.Option>
                <Select.Option value="Agency">Agency</Select.Option>
                <Select.Option value="Retail">Retail</Select.Option>
              </Select>
            </Col>
            <Col span={6}>
              <Button
                size="large"
                block
                type={showPremiumOnly ? 'primary' : 'default'}
                icon={<StarOutlined />}
                onClick={() => setShowPremiumOnly(!showPremiumOnly)}
              >
                {showPremiumOnly ? 'Show All' : 'Premium Only'}
              </Button>
            </Col>
          </Row>

          {/* Category Tabs */}
          <Tabs
            activeKey={selectedCategory}
            onChange={setSelectedCategory}
            items={categories.map(cat => ({
              key: cat.value,
              label: (
                <span>
                  {cat.icon}
                  <span style={{ marginLeft: 8 }}>{cat.label}</span>
                  <Badge
                    count={cat.count}
                    style={{ backgroundColor: '#6366f1', marginLeft: 8 }}
                  />
                </span>
              ),
            }))}
          />

          {/* Template Grid */}
          <Row gutter={[16, 16]}>
            {filteredTemplates.map((template) => (
              <Col span={12} key={template.id}>
                <Badge.Ribbon
                  text={template.isPremium ? 'Premium' : 'Free'}
                  color={template.isPremium ? '#6366f1' : '#10b981'}
                >
                  <Card
                    hoverable
                    style={{ height: '100%' }}
                    actions={[
                      <Tooltip title="Preview">
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() => handlePreview(template)}
                        >
                          Preview
                        </Button>
                      </Tooltip>,
                      <Tooltip title="Copy Template">
                        <Button
                          type="text"
                          icon={<CopyOutlined />}
                          onClick={() => handleCopyTemplate(template)}
                        >
                          Copy
                        </Button>
                      </Tooltip>,
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleSelectTemplate(template.id)}
                      >
                        Use Template
                      </Button>,
                    ]}
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Title level={5} style={{ margin: 0 }}>
                          {template.name}
                        </Title>
                        <Rate disabled defaultValue={template.rating} style={{ fontSize: 12 }} />
                      </div>

                      <Paragraph
                        type="secondary"
                        style={{ margin: 0, fontSize: 12 }}
                        ellipsis={{ rows: 2 }}
                      >
                        {template.description}
                      </Paragraph>

                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '8px 0' }}>
                        {template.tags.map(tag => (
                          <Tag key={tag} color="blue" style={{ fontSize: 11, margin: '2px 0' }}>
                            {tag}
                          </Tag>
                        ))}
                      </div>

                      <Divider style={{ margin: '8px 0' }} />

                      <Row gutter={[8, 8]}>
                        <Col span={8}>
                          <Tooltip title="Average open rate">
                            <div style={{ textAlign: 'center' }}>
                              <Text strong style={{ fontSize: 16, color: '#10b981' }}>
                                {template.openRate}
                              </Text>
                              <div>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  Open Rate
                                </Text>
                              </div>
                            </div>
                          </Tooltip>
                        </Col>
                        <Col span={8}>
                          <Tooltip title="Average click rate">
                            <div style={{ textAlign: 'center' }}>
                              <Text strong style={{ fontSize: 16, color: '#6366f1' }}>
                                {template.clickRate}
                              </Text>
                              <div>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  Click Rate
                                </Text>
                              </div>
                            </div>
                          </Tooltip>
                        </Col>
                        <Col span={8}>
                          <Tooltip title="Average conversion rate">
                            <div style={{ textAlign: 'center' }}>
                              <Text strong style={{ fontSize: 16, color: '#f59e0b' }}>
                                {template.conversionRate}
                              </Text>
                              <div>
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  CVR
                                </Text>
                              </div>
                            </div>
                          </Tooltip>
                        </Col>
                      </Row>

                      <Divider style={{ margin: '8px 0' }} />

                      <div>
                        <Text strong style={{ fontSize: 11 }}>Subject: </Text>
                        <Text style={{ fontSize: 11 }} type="secondary">
                          {template.subject}
                        </Text>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          Used {template.usageCount.toLocaleString()}x
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {template.industry.join(', ')}
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </Badge.Ribbon>
              </Col>
            ))}
          </Row>

          {filteredTemplates.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <MailOutlined style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 16 }} />
              <Title level={4} type="secondary">
                No templates found
              </Title>
              <Text type="secondary">
                Try adjusting your search criteria or filters
              </Text>
            </div>
          )}
        </Space>
      </div>
    </Modal>
  );
};

export default AdvancedEmailTemplateLibrary;
