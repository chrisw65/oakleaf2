import React, { useState } from 'react';
import {
  Modal,
  Steps,
  Form,
  Input,
  Select,
  Radio,
  Button,
  Card,
  Space,
  Typography,
  Tag,
  Alert,
  Divider,
  List,
  Progress,
  message,
} from 'antd';
import {
  RocketOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  UserOutlined,
  DollarOutlined,
  AimOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface SmartTemplateCustomizerProps {
  visible: boolean;
  templateId: string;
  templateName: string;
  onCancel: () => void;
  onComplete: (customizations: any) => void;
}

const SmartTemplateCustomizer: React.FC<SmartTemplateCustomizerProps> = ({
  visible,
  templateId,
  templateName,
  onCancel,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [customizations, setCustomizations] = useState<any>({});

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      setCustomizations({ ...customizations, ...values });

      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        // Complete customization
        onComplete({ ...customizations, ...values });
        message.success('Template customized successfully!');
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const getIndustryRecommendations = (industry: string) => {
    const recommendations: Record<string, any> = {
      'saas': {
        headline: 'Focus on the transformation and time savings',
        cta: 'Use trial language: "Start Free Trial" or "Try Free for 14 Days"',
        pricing: 'Show monthly vs annual savings prominently',
        social: 'Emphasize company logos and integration partners',
        tips: [
          'Lead with the problem your software solves',
          'Show the interface/dashboard in hero section',
          'Add calculator or ROI tool',
          'Emphasize security and compliance badges',
        ],
      },
      'coaching': {
        headline: 'Lead with the transformation or outcome',
        cta: 'Use action words: "Book Strategy Call" or "Apply Now"',
        pricing: 'Emphasize payment plans and value stack',
        social: 'Show before/after results and video testimonials',
        tips: [
          'Lead with founder/coach story and credentials',
          'Show transformation timeline',
          'Use case studies prominently',
          'Add FAQ about your process',
        ],
      },
      'ecommerce': {
        headline: 'Focus on the unique benefit or experience',
        cta: 'Remove friction: "Add to Cart" or "Buy Now with 1-Click"',
        pricing: 'Show savings, bundle deals, and guarantees',
        social: 'Display review count and ratings prominently',
        tips: [
          'Use high-quality product images (6+ angles)',
          'Add video demonstrations',
          'Show size/style variations clearly',
          'Emphasize fast shipping and returns',
        ],
      },
      'info-products': {
        headline: 'Promise specific, measurable outcome',
        cta: 'Create urgency: "Get Instant Access Now"',
        pricing: 'Show full curriculum and bonus stack',
        social: 'Feature student success stories and results',
        tips: [
          'Show what\'s inside with module breakdown',
          'Add curriculum preview or sample lesson',
          'Emphasize exclusive community access',
          'Use earnings disclaimer if showing income',
        ],
      },
    };

    return recommendations[industry] || recommendations['saas'];
  };

  const getAudienceInsights = (audience: string) => {
    const insights: Record<string, string[]> = {
      'entrepreneurs': [
        'Focus on ROI and time savings',
        'Use aspirational language and lifestyle imagery',
        'Emphasize scalability and automation',
        'Address "doing it all alone" pain point',
      ],
      'small-business': [
        'Emphasize ease of implementation',
        'Show local business success stories',
        'Focus on customer retention and growth',
        'Address limited budget concerns',
      ],
      'enterprise': [
        'Lead with security, compliance, and scale',
        'Emphasize integration capabilities',
        'Show enterprise client logos',
        'Provide detailed documentation and support info',
      ],
      'consumers': [
        'Use emotional triggers and lifestyle benefits',
        'Simple, clear value proposition',
        'Emphasize ease of use and immediate gratification',
        'Show social proof from "people like them"',
      ],
    };

    return insights[audience] || insights['consumers'];
  };

  const steps = [
    {
      title: 'Industry',
      icon: <AimOutlined />,
    },
    {
      title: 'Audience',
      icon: <UserOutlined />,
    },
    {
      title: 'Goal',
      icon: <TrophyOutlined />,
    },
    {
      title: 'Customize',
      icon: <ThunderboltOutlined />,
    },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message="AI-Powered Customization"
              description="Answer a few questions and we'll customize this template with proven strategies for your industry"
              type="info"
              showIcon
              icon={<BulbOutlined />}
            />

            <Form.Item
              label="What industry are you in?"
              name="industry"
              rules={[{ required: true, message: 'Please select your industry' }]}
            >
              <Select size="large" placeholder="Select your industry">
                <Select.Option value="saas">SaaS / Software</Select.Option>
                <Select.Option value="coaching">Coaching / Consulting</Select.Option>
                <Select.Option value="ecommerce">E-Commerce / Physical Products</Select.Option>
                <Select.Option value="info-products">Info Products / Courses</Select.Option>
                <Select.Option value="agency">Agency / Services</Select.Option>
                <Select.Option value="real-estate">Real Estate</Select.Option>
                <Select.Option value="health-fitness">Health / Fitness</Select.Option>
                <Select.Option value="finance">Finance / Investment</Select.Option>
                <Select.Option value="other">Other</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="What\'s your average ticket price?"
              name="pricePoint"
              rules={[{ required: true }]}
            >
              <Select size="large" placeholder="Select price range">
                <Select.Option value="free">Free / Lead Gen</Select.Option>
                <Select.Option value="low">$1 - $100</Select.Option>
                <Select.Option value="medium">$100 - $1,000</Select.Option>
                <Select.Option value="high">$1,000 - $5,000</Select.Option>
                <Select.Option value="premium">$5,000+</Select.Option>
              </Select>
            </Form.Item>

            <Card size="small" style={{ background: '#f8fafc' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>💡 Why we ask:</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Different industries and price points require different funnel strategies. We'll
                  customize headlines, CTAs, and content specifically for your market.
                </Text>
              </Space>
            </Card>
          </Space>
        );

      case 1:
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message="Understanding Your Audience"
              description="Tell us about your target customer so we can craft the perfect messaging"
              type="info"
              showIcon
            />

            <Form.Item
              label="Who is your primary audience?"
              name="audience"
              rules={[{ required: true }]}
            >
              <Radio.Group size="large">
                <Space direction="vertical">
                  <Radio value="entrepreneurs">Entrepreneurs / Solopreneurs</Radio>
                  <Radio value="small-business">Small Business Owners</Radio>
                  <Radio value="enterprise">Enterprise / Corporate</Radio>
                  <Radio value="consumers">General Consumers</Radio>
                  <Radio value="professionals">Professionals (Doctors, Lawyers, etc.)</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="What\'s their biggest pain point?"
              name="painPoint"
              rules={[{ required: true, message: 'Describe their main problem' }]}
            >
              <TextArea
                rows={3}
                placeholder="e.g., They\'re struggling to generate consistent leads and spending too much time on manual tasks"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="What\'s their desired outcome?"
              name="desiredOutcome"
              rules={[{ required: true }]}
            >
              <TextArea
                rows={3}
                placeholder="e.g., They want to 3X their lead flow while cutting their workload in half"
                size="large"
              />
            </Form.Item>

            <Card size="small" style={{ background: '#f0fdf4', borderColor: '#10b981' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong style={{ color: '#10b981' }}>
                  <CheckCircleOutlined /> Smart Tip
                </Text>
                <Text style={{ fontSize: 12 }}>
                  The more specific you are about pain points and outcomes, the more persuasive
                  your funnel will be. We'll use this to craft headlines and copy that resonates.
                </Text>
              </Space>
            </Card>
          </Space>
        );

      case 2:
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message="Define Your Goal"
              description="What action do you want visitors to take?"
              type="info"
              showIcon
            />

            <Form.Item
              label="Primary funnel goal"
              name="goal"
              rules={[{ required: true }]}
            >
              <Select size="large" placeholder="Select your main goal">
                <Select.Option value="lead">Capture Leads (Email/Contact Info)</Select.Option>
                <Select.Option value="sale">Make a Sale</Select.Option>
                <Select.Option value="booking">Book a Call/Demo</Select.Option>
                <Select.Option value="webinar">Webinar Registration</Select.Option>
                <Select.Option value="download">Download/Access Content</Select.Option>
                <Select.Option value="trial">Start Free Trial</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="What are you offering?"
              name="offerName"
              rules={[{ required: true }]}
            >
              <Input
                size="large"
                placeholder="e.g., Free Marketing Audit, 30-Day Trial, Strategy Call"
              />
            </Form.Item>

            <Form.Item
              label="Do you have an upsell/next step?"
              name="hasUpsell"
              rules={[{ required: true }]}
            >
              <Radio.Group size="large">
                <Space direction="vertical">
                  <Radio value="yes">Yes - I have a natural next step/upsell</Radio>
                  <Radio value="no">No - This is a single step funnel</Radio>
                  <Radio value="planning">Not yet - Help me plan one</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            <Card size="small" style={{ background: '#fef3c7', borderColor: '#f59e0b' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong style={{ color: '#d97706' }}>
                  <RocketOutlined /> Maximize Revenue
                </Text>
                <Text style={{ fontSize: 12 }}>
                  Funnels with strategic upsells earn 3-5X more per customer. We'll show you
                  exactly where to add them for maximum conversions.
                </Text>
              </Space>
            </Card>
          </Space>
        );

      case 3:
        const industry = form.getFieldValue('industry') || 'saas';
        const audience = form.getFieldValue('audience') || 'entrepreneurs';
        const recommendations = getIndustryRecommendations(industry);
        const audienceInsights = getAudienceInsights(audience);

        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message="🎉 Your Custom Strategy Is Ready!"
              description="We've analyzed your inputs and prepared personalized recommendations"
              type="success"
              showIcon
            />

            <Card title="Your Optimized Headline Strategy" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Recommendation:</Text>
                <Paragraph style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                  {recommendations.headline}
                </Paragraph>

                <Form.Item
                  label="Your headline"
                  name="headline"
                  rules={[{ required: true }]}
                >
                  <Input
                    size="large"
                    placeholder="We'll help you craft the perfect headline based on your answers"
                  />
                </Form.Item>
              </Space>
            </Card>

            <Card title="Call-to-Action Strategy" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Recommendation:</Text>
                <Paragraph style={{ background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                  {recommendations.cta}
                </Paragraph>

                <Form.Item
                  label="Button text"
                  name="ctaText"
                  rules={[{ required: true }]}
                >
                  <Input size="large" placeholder="e.g., Get My Free Audit Now" />
                </Form.Item>
              </Space>
            </Card>

            <Card title={`Insights for ${audience.replace('-', ' ')}`} size="small">
              <List
                size="small"
                dataSource={audienceInsights}
                renderItem={(item) => (
                  <List.Item>
                    <CheckCircleOutlined style={{ color: '#10b981', marginRight: 8 }} />
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>

            <Card title="Recommended Elements" size="small">
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text strong>We'll add these high-converting elements:</Text>
                {recommendations.tips.map((tip: string, index: number) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'start', gap: 8 }}>
                    <CheckCircleOutlined style={{ color: '#10b981', marginTop: 4 }} />
                    <Text>{tip}</Text>
                  </div>
                ))}
              </Space>
            </Card>

            <Progress
              percent={100}
              strokeColor="#10b981"
              format={() => 'Ready to Build!'}
            />
          </Space>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title={
        <Space>
          <ThunderboltOutlined style={{ color: '#6366f1' }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Customize "{templateName}"
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              AI-powered customization for maximum conversions
            </Text>
          </div>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Space>
            {currentStep > 0 && (
              <Button onClick={handlePrevious}>Previous</Button>
            )}
            <Button type="primary" onClick={handleNext}>
              {currentStep < 3 ? 'Next' : 'Create My Funnel'}
            </Button>
          </Space>
        </div>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Steps current={currentStep} items={steps} />

        <Form form={form} layout="vertical">
          {renderStep()}
        </Form>
      </Space>
    </Modal>
  );
};

export default SmartTemplateCustomizer;
