import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Progress,
  Alert,
  Collapse,
  Divider,
  List,
  Badge,
  Tooltip,
  Steps,
  Tabs,
  message,
} from 'antd';
import {
  RobotOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  TrophyOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  BookOutlined,
  RocketOutlined,
  FireOutlined,
  StarOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface FunnelCoachProps {
  visible: boolean;
  onClose: () => void;
  funnelType?: string;
  currentPage?: string;
  funnelData?: any;
}

interface Recommendation {
  id: string;
  category: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  action: string;
  example?: string;
}

interface BestPractice {
  title: string;
  description: string;
  examples: string[];
  cvr: string;
}

const AIFunnelCoach: React.FC<FunnelCoachProps> = ({
  visible,
  onClose,
  funnelType = 'general',
  currentPage,
  funnelData,
}) => {
  const [funnelScore, setFunnelScore] = useState(0);
  const [activeTab, setActiveTab] = useState('recommendations');

  useEffect(() => {
    if (visible) {
      // Simulate funnel analysis
      calculateFunnelScore();
    }
  }, [visible, funnelData]);

  const calculateFunnelScore = () => {
    // Simulate AI analysis
    const score = 75 + Math.floor(Math.random() * 20);
    setFunnelScore(score);
  };

  const recommendations: Recommendation[] = [
    {
      id: 'headline-power',
      category: 'high',
      title: 'Strengthen Your Headline',
      description: 'Your headline should immediately communicate the unique value proposition and grab attention within 3 seconds.',
      impact: 'Can increase conversions by 20-40%',
      action: 'Use numbers, trigger words, or ask compelling questions',
      example: 'Instead of "Get More Leads" try "Generate 10X More Qualified Leads in 30 Days (Without Paid Ads)"',
    },
    {
      id: 'social-proof',
      category: 'critical',
      title: 'Add Social Proof Above the Fold',
      description: 'Testimonials, trust badges, or client logos should appear immediately to build credibility.',
      impact: 'Increases trust and conversions by 15-30%',
      action: 'Place 2-3 micro-testimonials or trust badges near your CTA',
      example: '"This helped me 3X my revenue!" - John D., CEO',
    },
    {
      id: 'cta-clarity',
      category: 'high',
      title: 'Make Your CTA More Action-Oriented',
      description: 'Generic CTAs like "Submit" or "Click Here" convert poorly. Use benefit-driven, specific language.',
      impact: 'Can improve click-through by 25-35%',
      action: 'Replace generic CTAs with specific benefits',
      example: 'Change "Sign Up" to "Get My Free Marketing Plan Now"',
    },
    {
      id: 'urgency',
      category: 'high',
      title: 'Add Urgency and Scarcity',
      description: 'Limited-time offers or countdown timers create FOMO and drive immediate action.',
      impact: 'Increases conversions by 20-50%',
      action: 'Add a countdown timer or limited spots messaging',
      example: 'Only 7 spots left at this price! Offer expires in 23:45:12',
    },
    {
      id: 'form-optimization',
      category: 'medium',
      title: 'Optimize Form Fields',
      description: 'Each additional form field reduces conversion by ~5%. Only ask for essential information.',
      impact: 'Reduces friction, increases conversions by 10-20%',
      action: 'Remove unnecessary fields, use multi-step forms for complex data',
      example: 'Start with just email, collect more info after first conversion',
    },
    {
      id: 'benefit-bullets',
      category: 'medium',
      title: 'Use Benefit-Focused Bullet Points',
      description: 'List 3-5 key benefits (not features) that solve specific pain points.',
      impact: 'Improves clarity and conversions by 15-25%',
      action: 'Convert features to benefits using "so you can..." framework',
      example: '"Automated follow-ups" → "Never miss a lead so you can close more deals automatically"',
    },
    {
      id: 'video-engagement',
      category: 'medium',
      title: 'Add Video for Higher Engagement',
      description: 'Video can increase conversions by 80% when used strategically.',
      impact: 'Dramatically increases engagement and trust',
      action: 'Add a 2-3 minute explainer video or testimonial compilation',
      example: 'Show the transformation, demo the product, or share customer success stories',
    },
    {
      id: 'mobile-optimization',
      category: 'high',
      title: 'Optimize for Mobile Experience',
      description: '60%+ of traffic is mobile. Your funnel must work flawlessly on small screens.',
      impact: 'Can recover 30-50% of lost mobile conversions',
      action: 'Test on actual devices, use large buttons, minimize scrolling',
      example: 'CTA buttons should be at least 44x44px for easy thumb tapping',
    },
  ];

  const bestPractices: Record<string, BestPractice[]> = {
    'lead-generation': [
      {
        title: 'Lead Magnet Must Solve Immediate Problem',
        description: 'Your free offer should provide a quick win that creates desire for more.',
        examples: [
          'Checklists and templates',
          'Video training series',
          'Free tools or calculators',
          'Cheat sheets and guides',
        ],
        cvr: '35-50%',
      },
      {
        title: 'Two-Step Opt-in Process',
        description: 'Button click first, then show form. This increases conversions significantly.',
        examples: [
          'Click "Yes, Send Me the Guide" → Form appears',
          'Creates micro-commitment',
          'Reduces perceived risk',
        ],
        cvr: '40-60%',
      },
      {
        title: 'Strong Thank You Page Strategy',
        description: 'Immediately deliver value and guide to next step.',
        examples: [
          'Instant access to lead magnet',
          'Video welcome message',
          'Clear next steps',
          'Optional upsell or survey',
        ],
        cvr: '20-30% ascension',
      },
    ],
    'sales': [
      {
        title: 'Problem-Agitate-Solution Framework',
        description: 'Paint the picture of the problem, amplify the pain, present your solution.',
        examples: [
          'Start with relatable frustration',
          'Show consequences of inaction',
          'Position your offer as the bridge',
        ],
        cvr: '3-8%',
      },
      {
        title: 'Address Objections Proactively',
        description: 'Answer common concerns before they become barriers.',
        examples: [
          'FAQ section',
          'Risk reversal (money-back guarantee)',
          'Case studies showing results',
          'Price justification',
        ],
        cvr: '4-10%',
      },
      {
        title: 'Strategic Use of Bonuses',
        description: 'Stack bonuses to increase perceived value 3-5X the price.',
        examples: [
          'Limited-time bonuses',
          'Fast-action bonuses',
          'Total value stack visualization',
        ],
        cvr: '5-12%',
      },
    ],
    'webinar': [
      {
        title: 'Registration Page Formula',
        description: 'Promise of transformation + Clear topic + Authority indicators.',
        examples: [
          'Free training: "How I [specific result] in [timeframe]"',
          'Limited spots messaging',
          'Date/time scarcity',
        ],
        cvr: '30-50% registration',
      },
      {
        title: 'The Perfect Webinar Structure',
        description: 'Origin story → 3 Secrets → The Stack → Offer → Q&A',
        examples: [
          '60-90 minutes total',
          'Teach valuable content',
          'Pitch last 20 minutes',
          'Multiple close sequences',
        ],
        cvr: '3-15% sales',
      },
    ],
  };

  const conversionTips = [
    {
      icon: <FireOutlined style={{ color: '#ef4444' }} />,
      title: 'Red-Hot Tip',
      tip: 'The first 3 seconds determine if visitors stay or leave. Lead with your strongest hook immediately.',
    },
    {
      icon: <ThunderboltOutlined style={{ color: '#f59e0b' }} />,
      title: 'Quick Win',
      tip: 'Replace "Learn More" buttons with specific, benefit-driven CTAs and see conversions jump 20-30%.',
    },
    {
      icon: <StarOutlined style={{ color: '#6366f1' }} />,
      title: 'Pro Strategy',
      tip: 'Add exit-intent popups with a different offer (discount, bonus) to recover 10-15% of abandoning visitors.',
    },
    {
      icon: <ExperimentOutlined style={{ color: '#10b981' }} />,
      title: 'A/B Test This',
      tip: 'Test headline variations first - they have the biggest impact. Use emotional vs rational angles.',
    },
  ];

  const industryBenchmarks = [
    { metric: 'Landing Page CVR', average: '2-5%', excellent: '10%+', yours: '7.2%' },
    { metric: 'Email Opt-in Rate', average: '20-30%', excellent: '40%+', yours: '35%' },
    { metric: 'Sales Page CVR', average: '1-3%', excellent: '5%+', yours: '4.1%' },
    { metric: 'Cart Abandonment', average: '60-80%', excellent: '<40%', yours: '52%' },
    { metric: 'Email Open Rate', average: '15-25%', excellent: '35%+', yours: '28%' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 75) return '#3b82f6';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Needs Work';
    return 'Critical Issues';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'critical':
        return <WarningOutlined style={{ color: '#ef4444' }} />;
      case 'high':
        return <FireOutlined style={{ color: '#f59e0b' }} />;
      case 'medium':
        return <BulbOutlined style={{ color: '#3b82f6' }} />;
      default:
        return <CheckCircleOutlined style={{ color: '#10b981' }} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#3b82f6';
      default:
        return '#10b981';
    }
  };

  return (
    <Drawer
      title={
        <Space>
          <RobotOutlined style={{ fontSize: 24, color: '#6366f1' }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              AI Funnel Coach
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Expert guidance powered by conversion data from 10,000+ funnels
            </Text>
          </div>
        </Space>
      }
      placement="right"
      width={520}
      open={visible}
      onClose={onClose}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ padding: '24px' }}>
        {/* Funnel Health Score */}
        <Card
          style={{
            marginBottom: 24,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                  Funnel Health Score
                </Text>
                <Title level={2} style={{ color: 'white', margin: '8px 0' }}>
                  {funnelScore}/100
                </Title>
                <Tag color={getScoreColor(funnelScore)} style={{ marginTop: 4 }}>
                  {getScoreLabel(funnelScore)}
                </Tag>
              </div>
              <TrophyOutlined style={{ fontSize: 64, opacity: 0.3 }} />
            </div>

            <Progress
              percent={funnelScore}
              strokeColor="white"
              trailColor="rgba(255,255,255,0.3)"
              showInfo={false}
            />

            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>
              Based on 15 conversion factors. Follow recommendations below to improve your score.
            </Text>
          </Space>
        </Card>

        {/* Tabs for different sections */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'recommendations',
              label: (
                <span>
                  <BulbOutlined /> Recommendations
                </span>
              ),
              children: (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {/* Quick Wins Alert */}
                  <Alert
                    message="🚀 Quick Wins Available"
                    description="Implement these 3 changes first for maximum impact"
                    type="success"
                    showIcon
                  />

                  {/* Recommendations List */}
                  <Collapse
                    defaultActiveKey={['headline-power', 'social-proof', 'cta-clarity']}
                    expandIconPosition="end"
                  >
                    {recommendations.map((rec) => (
                      <Panel
                        key={rec.id}
                        header={
                          <Space>
                            {getCategoryIcon(rec.category)}
                            <Text strong>{rec.title}</Text>
                          </Space>
                        }
                        extra={
                          <Tag color={getCategoryColor(rec.category)}>
                            {rec.impact}
                          </Tag>
                        }
                      >
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Paragraph>{rec.description}</Paragraph>

                          <div
                            style={{
                              background: '#f8fafc',
                              padding: 12,
                              borderRadius: 8,
                              borderLeft: '3px solid #6366f1',
                            }}
                          >
                            <Text strong style={{ color: '#6366f1' }}>
                              Action:
                            </Text>
                            <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                              {rec.action}
                            </Paragraph>
                          </div>

                          {rec.example && (
                            <div
                              style={{
                                background: '#f0fdf4',
                                padding: 12,
                                borderRadius: 8,
                                borderLeft: '3px solid #10b981',
                              }}
                            >
                              <Text strong style={{ color: '#10b981' }}>
                                Example:
                              </Text>
                              <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                                {rec.example}
                              </Paragraph>
                            </div>
                          )}

                          <Button
                            type="primary"
                            block
                            onClick={() => message.success('Recommendation applied to your funnel!')}
                          >
                            Apply This Recommendation
                          </Button>
                        </Space>
                      </Panel>
                    ))}
                  </Collapse>
                </Space>
              ),
            },
            {
              key: 'best-practices',
              label: (
                <span>
                  <BookOutlined /> Best Practices
                </span>
              ),
              children: (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Alert
                    message="Industry-Proven Strategies"
                    description="These frameworks are used by top marketers generating millions"
                    type="info"
                    showIcon
                  />

                  {Object.entries(bestPractices).map(([type, practices]) => (
                    <Card key={type} title={type.replace('-', ' ').toUpperCase()} size="small">
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        {practices.map((practice, index) => (
                          <div key={index}>
                            <Space style={{ marginBottom: 8 }}>
                              <RocketOutlined style={{ color: '#6366f1' }} />
                              <Text strong>{practice.title}</Text>
                              <Tag color="success">CVR: {practice.cvr}</Tag>
                            </Space>
                            <Paragraph type="secondary" style={{ marginLeft: 24 }}>
                              {practice.description}
                            </Paragraph>
                            <List
                              size="small"
                              dataSource={practice.examples}
                              renderItem={(item) => (
                                <List.Item style={{ border: 'none', padding: '4px 0 4px 24px' }}>
                                  <Text>• {item}</Text>
                                </List.Item>
                              )}
                            />
                            {index < practices.length - 1 && <Divider style={{ margin: '12px 0' }} />}
                          </div>
                        ))}
                      </Space>
                    </Card>
                  ))}
                </Space>
              ),
            },
            {
              key: 'tips',
              label: (
                <span>
                  <ThunderboltOutlined /> Pro Tips
                </span>
              ),
              children: (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {conversionTips.map((tip, index) => (
                    <Card key={index} size="small" hoverable>
                      <Space align="start">
                        <div style={{ fontSize: 32 }}>{tip.icon}</div>
                        <div style={{ flex: 1 }}>
                          <Text strong style={{ display: 'block', marginBottom: 8 }}>
                            {tip.title}
                          </Text>
                          <Text>{tip.tip}</Text>
                        </div>
                      </Space>
                    </Card>
                  ))}

                  <Divider>Conversion Hacks</Divider>

                  <List
                    size="small"
                    dataSource={[
                      'Use power words: Free, New, Proven, Guaranteed, Easy, Amazing',
                      'Numbers in headlines increase clicks by 36%',
                      'Red/Orange CTAs convert better than blue/green',
                      'Video thumbnails with faces get 41% more clicks',
                      'Ask questions in headlines to increase engagement',
                      'Use "You" and "Your" to make copy personal',
                      'Show the cost of inaction, not just benefits of action',
                      'Use specific numbers ($1,247 vs $1,200)',
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <CheckCircleOutlined style={{ color: '#10b981', marginRight: 8 }} />
                        <Text>{item}</Text>
                      </List.Item>
                    )}
                  />
                </Space>
              ),
            },
            {
              key: 'benchmarks',
              label: (
                <span>
                  <LineChartOutlined /> Benchmarks
                </span>
              ),
              children: (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Alert
                    message="Compare Your Performance"
                    description="See how your funnel stacks up against industry standards"
                    type="info"
                    showIcon
                  />

                  {industryBenchmarks.map((benchmark, index) => (
                    <Card key={index} size="small">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text strong>{benchmark.metric}</Text>
                          <Tag color="blue">Your: {benchmark.yours}</Tag>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 12,
                          }}
                        >
                          <Text type="secondary">Average: {benchmark.average}</Text>
                          <Text type="secondary">Excellent: {benchmark.excellent}</Text>
                        </div>
                        <Progress
                          percent={75}
                          strokeColor="#10b981"
                          format={() => 'Above Average'}
                        />
                      </Space>
                    </Card>
                  ))}

                  <Card size="small" style={{ background: '#f8fafc' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text strong>💡 Improvement Priority</Text>
                      <Text>
                        Focus on increasing your sales page conversion rate first - it has the
                        biggest revenue impact.
                      </Text>
                      <Button type="primary" block>
                        Get Personalized Action Plan
                      </Button>
                    </Space>
                  </Card>
                </Space>
              ),
            },
          ]}
        />
      </div>
    </Drawer>
  );
};

export default AIFunnelCoach;
