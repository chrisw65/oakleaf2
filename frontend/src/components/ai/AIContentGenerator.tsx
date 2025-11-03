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
  Tag,
  Divider,
  Alert,
  message,
  Tabs,
  Radio,
  Row,
  Col,
  Spin,
  List,
  Tooltip,
} from 'antd';
import {
  RobotOutlined,
  ThunderboltOutlined,
  CopyOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  StarOutlined,
  BulbOutlined,
  MailOutlined,
  MessageOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  FacebookOutlined,
  InstagramOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface AIContentGeneratorProps {
  visible: boolean;
  onClose: () => void;
  contentType?: 'email' | 'social';
  onContentGenerated?: (content: string) => void;
}

interface GeneratedContent {
  id: string;
  content: string;
  tone: string;
  rating: number;
}

const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  visible,
  onClose,
  contentType = 'email',
  onContentGenerated,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState(contentType);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [selectedTone, setSelectedTone] = useState('professional');

  // Simulated AI generation (in real app, this would call an AI API)
  const generateContent = async (type: string, params: any) => {
    setGenerating(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    let generated: GeneratedContent[] = [];

    if (type === 'email-subject') {
      generated = [
        {
          id: '1',
          content: `${params.product ? params.product : 'Your Product'}: ${params.tone === 'urgent' ? '⚡ Last Chance - ' : ''}${params.goal === 'click' ? 'Don\'t Miss This' : 'Open to Discover'}`,
          tone: params.tone,
          rating: 4.8,
        },
        {
          id: '2',
          content: `[${params.audience || 'Name'}] ${params.goal === 'open' ? 'You\'re Going to Love This' : 'Quick Question For You'} ${params.tone === 'urgent' ? '⏰' : ''}`,
          tone: params.tone,
          rating: 4.6,
        },
        {
          id: '3',
          content: `${params.tone === 'friendly' ? '👋 Hey!' : ''} ${params.product ? `${params.product} is here` : 'Something special just for you'}`,
          tone: params.tone,
          rating: 4.7,
        },
      ];
    } else if (type === 'email-body') {
      const toneIntros: Record<string, string> = {
        professional: 'I hope this email finds you well.',
        friendly: 'Hey there! 👋',
        urgent: 'I need to share something important with you.',
        casual: 'Quick note for you...',
      };

      generated = [
        {
          id: '1',
          content: `${toneIntros[params.tone] || 'Hi there,'}\n\n${params.goal === 'sale' ? 'I wanted to reach out because' : 'I thought you might be interested in'} ${params.product || 'our latest offering'}.\n\n${params.benefit || 'It can help you achieve your goals faster.'}\n\nHere's what makes it special:\n• Feature 1: ${params.feature1 || 'Saves you time'}\n• Feature 2: ${params.feature2 || 'Easy to use'}\n• Feature 3: ${params.feature3 || 'Proven results'}\n\n${params.tone === 'urgent' ? 'This offer expires soon, so don\'t wait!' : 'Would love to hear your thoughts.'}\n\nBest regards,\n[Your Name]`,
          tone: params.tone,
          rating: 4.9,
        },
        {
          id: '2',
          content: `Subject: ${params.product || 'Your Solution'}\n\n${toneIntros[params.tone] || 'Hello,'}\n\nI noticed you're interested in ${params.category || 'improving your results'}. ${params.product || 'Our solution'} might be exactly what you need.\n\n✅ ${params.benefit || 'Get results faster'}\n✅ Join ${Math.floor(Math.random() * 10000 + 1000)} satisfied customers\n✅ Risk-free guarantee\n\n${params.goal === 'click' ? 'Click here to learn more:' : 'Ready to get started?'} [CTA Button]\n\n${params.tone === 'professional' ? 'Looking forward to helping you succeed.' : 'Can\'t wait to see your success!'}`,
          tone: params.tone,
          rating: 4.7,
        },
      ];
    } else if (type === 'social-post') {
      const platform = params.platform || 'twitter';
      const emojis: Record<string, string[]> = {
        twitter: ['🚀', '💡', '🔥', '👇', '✨'],
        linkedin: ['💼', '📊', '🎯', '💡', '🚀'],
        facebook: ['👋', '😊', '🎉', '💯', '❤️'],
        instagram: ['✨', '💫', '🌟', '💕', '🔥'],
      };

      const chars = platform === 'twitter' ? 280 : 2000;
      const usedEmojis = emojis[platform].slice(0, 2).join(' ');

      generated = [
        {
          id: '1',
          content: `${usedEmojis} ${params.topic || 'Just launched something exciting!'}\n\n${params.message || 'This is going to change the game.'}\n\n${platform === 'twitter' ? '🧵 Thread below:' : '👇 Check it out:'}\n\n#${params.hashtag1 || 'Marketing'} #${params.hashtag2 || 'Growth'} #${params.hashtag3 || 'Business'}`,
          tone: params.tone,
          rating: 4.8,
        },
        {
          id: '2',
          content: `${params.tone === 'professional' ? '📢' : '🎉'} ${params.topic || 'Big announcement!'}\n\nWe've been working on something ${params.tone === 'casual' ? 'awesome' : 'incredible'} and can't wait to share it with you.\n\n${params.benefit || 'It\'s going to help you achieve more.'}\n\n${platform === 'linkedin' ? 'Thoughts? Let me know in the comments. 👇' : 'What do you think? Drop a comment! 💬'}`,
          tone: params.tone,
          rating: 4.6,
        },
        {
          id: '3',
          content: `Quick question ${platform === 'twitter' ? '🤔' : '💭'}\n\nHow many of you struggle with ${params.painPoint || 'getting results'}?\n\n${params.solution || 'We just solved this problem'} and ${params.tone === 'urgent' ? 'you NEED to see this' : 'I think you\'ll love it'}.\n\nLink in ${platform === 'instagram' ? 'bio' : 'comments'} 👇`,
          tone: params.tone,
          rating: 4.9,
        },
      ];
    }

    setGeneratedContent(generated);
    setGenerating(false);
  };

  const handleGenerate = () => {
    form.validateFields().then((values) => {
      if (activeTab === 'email') {
        generateContent(values.emailType || 'email-body', values);
      } else {
        generateContent('social-post', values);
      }
    });
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    message.success('Copied to clipboard!');
  };

  const handleUseContent = (content: string) => {
    if (onContentGenerated) {
      onContentGenerated(content);
    }
    message.success('Content applied!');
    onClose();
  };

  const toneOptions = [
    { value: 'professional', label: 'Professional', icon: '💼' },
    { value: 'friendly', label: 'Friendly', icon: '😊' },
    { value: 'casual', label: 'Casual', icon: '👋' },
    { value: 'urgent', label: 'Urgent', icon: '⚡' },
    { value: 'humorous', label: 'Humorous', icon: '😄' },
  ];

  return (
    <Modal
      title={
        <Space>
          <RobotOutlined style={{ fontSize: 24, color: '#6366f1' }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              AI Content Generator
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Generate high-converting copy powered by AI
            </Text>
          </div>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={null}
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'email' | 'social')}
        items={[
          {
            key: 'email',
            label: (
              <span>
                <MailOutlined />
                Email Content
              </span>
            ),
            children: (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Alert
                  message="AI-Powered Email Generation"
                  description="Our AI analyzes millions of high-performing emails to generate copy that converts. Just provide a few details and watch the magic happen!"
                  type="info"
                  showIcon
                  icon={<ThunderboltOutlined />}
                />

                <Form form={form} layout="vertical">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Form.Item label="What to generate?" name="emailType" initialValue="email-body">
                        <Select size="large">
                          <Select.Option value="email-subject">Subject Lines Only</Select.Option>
                          <Select.Option value="email-body">Full Email Body</Select.Option>
                          <Select.Option value="both">Both Subject & Body</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="Tone" name="tone" initialValue="professional">
                        <Select size="large">
                          {toneOptions.map(opt => (
                            <Select.Option key={opt.value} value={opt.value}>
                              {opt.icon} {opt.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="Primary Goal" name="goal" initialValue="open">
                        <Select size="large">
                          <Select.Option value="open">Increase Opens</Select.Option>
                          <Select.Option value="click">Drive Clicks</Select.Option>
                          <Select.Option value="sale">Generate Sales</Select.Option>
                          <Select.Option value="engage">Build Engagement</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="Target Audience" name="audience">
                        <Input size="large" placeholder="e.g., Small business owners" />
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <Form.Item label="Product/Service Name" name="product">
                        <Input size="large" placeholder="e.g., Funnel Pro Platform" />
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <Form.Item label="Key Benefit" name="benefit">
                        <TextArea
                          rows={2}
                          placeholder="e.g., Build high-converting funnels in minutes without coding"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Button
                    type="primary"
                    size="large"
                    icon={generating ? <Spin /> : <ThunderboltOutlined />}
                    onClick={handleGenerate}
                    loading={generating}
                    block
                  >
                    {generating ? 'Generating Magic...' : 'Generate Content'}
                  </Button>
                </Form>

                {generatedContent.length > 0 && (
                  <>
                    <Divider />
                    <Title level={5}>
                      <StarOutlined style={{ color: '#f59e0b' }} /> Generated Content ({generatedContent.length})
                    </Title>

                    <List
                      dataSource={generatedContent}
                      renderItem={(item) => (
                        <Card
                          size="small"
                          style={{ marginBottom: 12 }}
                          extra={
                            <Space>
                              <Tooltip title="AI Confidence Score">
                                <Tag color="success">
                                  <StarOutlined /> {item.rating}/5.0
                                </Tag>
                              </Tooltip>
                            </Space>
                          }
                        >
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Paragraph
                              style={{
                                whiteSpace: 'pre-wrap',
                                marginBottom: 12,
                                padding: 12,
                                background: '#f8fafc',
                                borderRadius: 8,
                              }}
                            >
                              {item.content}
                            </Paragraph>

                            <Space>
                              <Button
                                icon={<CopyOutlined />}
                                onClick={() => handleCopy(item.content)}
                                size="small"
                              >
                                Copy
                              </Button>
                              <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleUseContent(item.content)}
                                size="small"
                              >
                                Use This
                              </Button>
                              <Button
                                icon={<ReloadOutlined />}
                                onClick={handleGenerate}
                                size="small"
                              >
                                Regenerate
                              </Button>
                            </Space>
                          </Space>
                        </Card>
                      )}
                    />
                  </>
                )}
              </Space>
            ),
          },
          {
            key: 'social',
            label: (
              <span>
                <MessageOutlined />
                Social Posts
              </span>
            ),
            children: (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Alert
                  message="Social Media Content Generator"
                  description="Generate engaging posts optimized for each platform's algorithm and best practices."
                  type="info"
                  showIcon
                  icon={<BulbOutlined />}
                />

                <Form form={form} layout="vertical">
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Form.Item label="Platform" name="platform" initialValue="twitter">
                        <Radio.Group size="large" buttonStyle="solid">
                          <Radio.Button value="twitter">
                            <TwitterOutlined /> Twitter
                          </Radio.Button>
                          <Radio.Button value="linkedin">
                            <LinkedinOutlined /> LinkedIn
                          </Radio.Button>
                          <Radio.Button value="facebook">
                            <FacebookOutlined /> Facebook
                          </Radio.Button>
                          <Radio.Button value="instagram">
                            <InstagramOutlined /> Instagram
                          </Radio.Button>
                        </Radio.Group>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="Tone" name="tone" initialValue="professional">
                        <Select size="large">
                          {toneOptions.map(opt => (
                            <Select.Option key={opt.value} value={opt.value}>
                              {opt.icon} {opt.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="Post Goal" name="postGoal" initialValue="engage">
                        <Select size="large">
                          <Select.Option value="engage">Drive Engagement</Select.Option>
                          <Select.Option value="traffic">Drive Traffic</Select.Option>
                          <Select.Option value="awareness">Build Awareness</Select.Option>
                          <Select.Option value="leads">Generate Leads</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <Form.Item label="Topic/Announcement" name="topic" rules={[{ required: true }]}>
                        <Input size="large" placeholder="e.g., New feature launch, Product update" />
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <Form.Item label="Key Message" name="message">
                        <TextArea
                          rows={3}
                          placeholder="What do you want to communicate? (optional - AI will expand on this)"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item label="Hashtag 1" name="hashtag1">
                        <Input size="large" placeholder="Marketing" />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item label="Hashtag 2" name="hashtag2">
                        <Input size="large" placeholder="GrowthHacking" />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item label="Hashtag 3" name="hashtag3">
                        <Input size="large" placeholder="SaaS" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Button
                    type="primary"
                    size="large"
                    icon={generating ? <Spin /> : <ThunderboltOutlined />}
                    onClick={handleGenerate}
                    loading={generating}
                    block
                  >
                    {generating ? 'Crafting Your Post...' : 'Generate Posts'}
                  </Button>
                </Form>

                {generatedContent.length > 0 && (
                  <>
                    <Divider />
                    <Title level={5}>
                      <StarOutlined style={{ color: '#f59e0b' }} /> Generated Posts ({generatedContent.length})
                    </Title>

                    <List
                      dataSource={generatedContent}
                      renderItem={(item) => (
                        <Card
                          size="small"
                          style={{ marginBottom: 12 }}
                          extra={
                            <Space>
                              <Tag color="success">
                                <StarOutlined /> {item.rating}/5.0
                              </Tag>
                              <Tag>{item.content.length} chars</Tag>
                            </Space>
                          }
                        >
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Paragraph
                              style={{
                                whiteSpace: 'pre-wrap',
                                marginBottom: 12,
                                padding: 12,
                                background: '#f8fafc',
                                borderRadius: 8,
                                fontFamily: 'system-ui',
                              }}
                            >
                              {item.content}
                            </Paragraph>

                            <Space>
                              <Button
                                icon={<CopyOutlined />}
                                onClick={() => handleCopy(item.content)}
                                size="small"
                              >
                                Copy
                              </Button>
                              <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleUseContent(item.content)}
                                size="small"
                              >
                                Use This
                              </Button>
                              <Button
                                icon={<ReloadOutlined />}
                                onClick={handleGenerate}
                                size="small"
                              >
                                Regenerate
                              </Button>
                            </Space>
                          </Space>
                        </Card>
                      )}
                    />
                  </>
                )}
              </Space>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default AIContentGenerator;
