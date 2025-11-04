import React, { useState } from 'react';
import { Modal, Card, Row, Col, Input, Select, Tag, Button, Typography, Space, Badge, Divider, Statistic } from 'antd';
import {
  SearchOutlined,
  ThunderboltOutlined,
  ShoppingOutlined,
  VideoCameraOutlined,
  TeamOutlined,
  BookOutlined,
  RocketOutlined,
  CrownOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface FunnelTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  thumbnail: string;
  pages: number;
  conversionRate: string;
  isPremium?: boolean;
  tags: string[];
  previewUrl?: string;
}

interface FunnelTemplateLibraryProps {
  visible: boolean;
  onCancel: () => void;
  onSelectTemplate: (templateId: string) => void;
}

const FunnelTemplateLibrary: React.FC<FunnelTemplateLibraryProps> = ({
  visible,
  onCancel,
  onSelectTemplate,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<FunnelTemplate | null>(null);

  const categories = [
    { value: 'all', label: 'All Templates', icon: <ThunderboltOutlined /> },
    { value: 'lead-gen', label: 'Lead Generation', icon: <TeamOutlined /> },
    { value: 'ecommerce', label: 'E-Commerce', icon: <ShoppingOutlined /> },
    { value: 'webinar', label: 'Webinar', icon: <VideoCameraOutlined /> },
    { value: 'course', label: 'Online Course', icon: <BookOutlined /> },
    { value: 'product-launch', label: 'Product Launch', icon: <RocketOutlined /> },
  ];

  const templates: FunnelTemplate[] = [
    {
      id: 'lead-magnet-pro',
      name: 'Lead Magnet Pro',
      description: 'High-converting lead capture funnel with thank you page and email sequence integration',
      category: 'lead-gen',
      icon: <TeamOutlined />,
      thumbnail: '/templates/lead-magnet.jpg',
      pages: 3,
      conversionRate: '42%',
      isPremium: true,
      tags: ['Lead Capture', 'Email Marketing', 'High-Converting'],
    },
    {
      id: 'tripwire-funnel',
      name: 'Tripwire Sales Funnel',
      description: 'Low-ticket offer funnel with upsell and downsell sequence for maximum revenue',
      category: 'ecommerce',
      icon: <ShoppingOutlined />,
      thumbnail: '/templates/tripwire.jpg',
      pages: 5,
      conversionRate: '38%',
      tags: ['Sales', 'Upsell', 'Revenue Optimizer'],
    },
    {
      id: 'webinar-registration',
      name: 'Webinar Registration',
      description: 'Complete webinar funnel with registration, reminder emails, and replay sequence',
      category: 'webinar',
      icon: <VideoCameraOutlined />,
      thumbnail: '/templates/webinar.jpg',
      pages: 4,
      conversionRate: '45%',
      isPremium: true,
      tags: ['Webinar', 'Live Event', 'Automated'],
    },
    {
      id: 'product-launch',
      name: 'Product Launch Blueprint',
      description: 'Jeff Walker style product launch with video series and cart open/close automation',
      category: 'product-launch',
      icon: <RocketOutlined />,
      thumbnail: '/templates/product-launch.jpg',
      pages: 8,
      conversionRate: '52%',
      isPremium: true,
      tags: ['Launch', 'Scarcity', 'Video Series'],
    },
    {
      id: 'course-enrollment',
      name: 'Course Enrollment',
      description: 'Educational course funnel with payment plans and member area access',
      category: 'course',
      icon: <BookOutlined />,
      thumbnail: '/templates/course.jpg',
      pages: 4,
      conversionRate: '35%',
      tags: ['Education', 'Membership', 'Payment Plans'],
    },
    {
      id: 'simple-optin',
      name: 'Simple Opt-in',
      description: 'Clean and minimal opt-in page for building your email list fast',
      category: 'lead-gen',
      icon: <TeamOutlined />,
      thumbnail: '/templates/simple-optin.jpg',
      pages: 2,
      conversionRate: '48%',
      tags: ['Quick Setup', 'Minimal', 'Email List'],
    },
    {
      id: 'challenge-funnel',
      name: '5-Day Challenge',
      description: 'Multi-day challenge funnel with daily content delivery and conversion event',
      category: 'lead-gen',
      icon: <ThunderboltOutlined />,
      thumbnail: '/templates/challenge.jpg',
      pages: 6,
      conversionRate: '41%',
      isPremium: true,
      tags: ['Challenge', 'Engagement', 'Community'],
    },
    {
      id: 'vsl-funnel',
      name: 'Video Sales Letter',
      description: 'Long-form video sales letter with order form and one-time offers',
      category: 'ecommerce',
      icon: <VideoCameraOutlined />,
      thumbnail: '/templates/vsl.jpg',
      pages: 3,
      conversionRate: '44%',
      tags: ['VSL', 'Long-Form', 'Direct Response'],
    },
    {
      id: 'application-funnel',
      name: 'Application Funnel',
      description: 'High-ticket application funnel with qualification questions and booking',
      category: 'lead-gen',
      icon: <CrownOutlined />,
      thumbnail: '/templates/application.jpg',
      pages: 4,
      conversionRate: '28%',
      isPremium: true,
      tags: ['High-Ticket', 'Qualification', 'Booking'],
    },
    {
      id: 'survey-funnel',
      name: 'Survey Funnel',
      description: 'Interactive survey funnel that segments leads and personalizes offers',
      category: 'lead-gen',
      icon: <ThunderboltOutlined />,
      thumbnail: '/templates/survey.jpg',
      pages: 4,
      conversionRate: '39%',
      tags: ['Segmentation', 'Personalization', 'Interactive'],
    },
    {
      id: 'summit-funnel',
      name: 'Virtual Summit',
      description: 'Multi-speaker virtual summit with registration and all-access pass upsell',
      category: 'webinar',
      icon: <VideoCameraOutlined />,
      thumbnail: '/templates/summit.jpg',
      pages: 5,
      conversionRate: '36%',
      isPremium: true,
      tags: ['Summit', 'Multi-Speaker', 'All-Access'],
    },
    {
      id: 'book-funnel',
      name: 'Free Book Funnel',
      description: 'Give away physical book, customer pays shipping, with order bump and upsells',
      category: 'ecommerce',
      icon: <BookOutlined />,
      thumbnail: '/templates/book.jpg',
      pages: 4,
      conversionRate: '47%',
      tags: ['Free+Shipping', 'Physical Product', 'Order Bump'],
    },
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchText.toLowerCase()) ||
      template.description.toLowerCase().includes(searchText.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchText.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Get category-specific gradient for funnel templates
  const getCategoryGradient = (category: string): string => {
    const gradients: Record<string, string> = {
      'lead-gen': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'ecommerce': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'webinar': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'course': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'product-launch': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    };
    return gradients[category] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  return (
    <Modal
      title={
        <div>
          <Title level={3} style={{ marginBottom: 8 }}>
            <ThunderboltOutlined style={{ marginRight: 8, color: '#6366f1' }} />
            Funnel Template Library
          </Title>
          <Text type="secondary">
            Start with proven templates that convert. All templates are fully customizable.
          </Text>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1200}
      bodyStyle={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Search and Filters */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Input
              size="large"
              placeholder="Search templates..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={12}>
            <Select
              size="large"
              style={{ width: '100%' }}
              value={selectedCategory}
              onChange={setSelectedCategory}
            >
              {categories.map((cat) => (
                <Select.Option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>

        {/* Template Grid */}
        <Row gutter={[16, 16]}>
          {filteredTemplates.map((template) => (
            <Col xs={24} sm={12} lg={8} key={template.id}>
              <Badge.Ribbon
                text="Premium"
                color="#6366f1"
                style={{ display: template.isPremium ? 'block' : 'none' }}
              >
                <Card
                  hoverable
                  cover={
                    <div
                      style={{
                        height: 200,
                        background: getCategoryGradient(template.category),
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 56,
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Background pattern */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          opacity: 0.1,
                          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)',
                        }}
                      />

                      {/* Icon with shadow */}
                      <div
                        style={{
                          position: 'relative',
                          zIndex: 1,
                          textShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        }}
                      >
                        {template.icon}
                      </div>

                      {/* Pages indicator */}
                      <div
                        style={{
                          marginTop: 16,
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          padding: '6px 16px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          position: 'relative',
                          zIndex: 1,
                        }}
                      >
                        {template.pages} Pages
                      </div>
                    </div>
                  }
                  actions={[
                    <div style={{ display: 'flex', gap: 8, margin: '0 16px' }}>
                      <Button
                        icon={<EyeOutlined />}
                        onClick={() => setPreviewTemplate(template)}
                        style={{ flex: 1 }}
                      >
                        Preview
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => onSelectTemplate(template.id)}
                        style={{ flex: 1 }}
                      >
                        Use Template
                      </Button>
                    </div>,
                  ]}
                >
                  <Card.Meta
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{template.name}</span>
                        {template.isPremium && (
                          <CrownOutlined style={{ color: '#f59e0b', fontSize: 16 }} />
                        )}
                      </div>
                    }
                    description={
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{ marginBottom: 12, color: '#64748b' }}
                        >
                          {template.description}
                        </Paragraph>

                        <div style={{ marginBottom: 12, textAlign: 'center' }}>
                          <Tag
                            color="success"
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              padding: '4px 16px',
                              borderRadius: 16,
                            }}
                          >
                            ⚡ Avg CVR: {template.conversionRate}
                          </Tag>
                        </div>

                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {template.tags.slice(0, 3).map((tag) => (
                            <Tag key={tag} color="blue" style={{ fontSize: 11, margin: 0 }}>
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      </Space>
                    }
                  />
                </Card>
              </Badge.Ribbon>
            </Col>
          ))}
        </Row>

        {filteredTemplates.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Text type="secondary">No templates found matching your criteria.</Text>
          </div>
        )}

        {/* Bottom Info */}
        <div
          style={{
            textAlign: 'center',
            padding: '24px',
            background: '#f8fafc',
            borderRadius: 8,
            marginTop: 24,
          }}
        >
          <ThunderboltOutlined style={{ fontSize: 32, color: '#6366f1', marginBottom: 12 }} />
          <Title level={5}>Can't find what you need?</Title>
          <Text type="secondary">
            Start with a blank funnel and build exactly what you want using our drag-and-drop
            builder.
          </Text>
        </div>
      </Space>
    </Modal>

      {/* Preview Modal */}
      {previewTemplate && (
        <Modal
          title={
            <div>
              <Title level={4} style={{ marginBottom: 4 }}>
                {previewTemplate.name}
                {previewTemplate.isPremium && (
                  <CrownOutlined style={{ color: '#f59e0b', fontSize: 18, marginLeft: 8 }} />
                )}
              </Title>
              <Text type="secondary">{previewTemplate.category.replace('-', ' ').toUpperCase()}</Text>
            </div>
          }
          open={true}
          onCancel={() => setPreviewTemplate(null)}
          width={900}
          footer={[
            <Button key="cancel" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>,
            <Button
              key="use"
              type="primary"
              onClick={() => {
                onSelectTemplate(previewTemplate.id);
                setPreviewTemplate(null);
              }}
            >
              Use This Template
            </Button>,
          ]}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Template Preview Visualization */}
            <div
              style={{
                height: 300,
                background: getCategoryGradient(previewTemplate.category),
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 80,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Background pattern */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.1,
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)',
                }}
              />
              <div style={{ position: 'relative', zIndex: 1, textShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
                {previewTemplate.icon}
              </div>
            </div>

            {/* Stats Row */}
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Funnel Pages"
                    value={previewTemplate.pages}
                    suffix="pages"
                    valueStyle={{ color: '#6366f1' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic
                    title="Avg Conversion"
                    value={previewTemplate.conversionRate}
                    valueStyle={{ color: '#10b981' }}
                    prefix="⚡"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>Template Type</div>
                    <Tag color="blue" style={{ fontSize: 13, padding: '4px 12px' }}>
                      {previewTemplate.isPremium ? 'Premium' : 'Standard'}
                    </Tag>
                  </div>
                </Card>
              </Col>
            </Row>

            <Divider />

            {/* Description */}
            <div>
              <Title level={5}>About This Template</Title>
              <Paragraph style={{ fontSize: 15, color: '#475569' }}>
                {previewTemplate.description}
              </Paragraph>
            </div>

            {/* Tags */}
            <div>
              <Title level={5}>Features & Tags</Title>
              <Space wrap>
                {previewTemplate.tags.map((tag) => (
                  <Tag key={tag} color="blue" style={{ fontSize: 13, padding: '6px 14px' }}>
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>

            {/* What's Included */}
            <div>
              <Title level={5}>What's Included</Title>
              <ul style={{ fontSize: 14, color: '#475569' }}>
                <li>{previewTemplate.pages} professionally designed pages</li>
                <li>Pre-configured email sequences and automation</li>
                <li>Mobile-responsive design</li>
                <li>Conversion-optimized layout</li>
                <li>Customizable colors, fonts, and content</li>
                {previewTemplate.isPremium && <li>Priority support and updates</li>}
              </ul>
            </div>
          </Space>
        </Modal>
      )}
  );
};

export default FunnelTemplateLibrary;
