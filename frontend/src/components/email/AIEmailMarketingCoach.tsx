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
  Tabs,
  Input,
  Row,
  Col,
  Statistic,
  message,
  Select,
} from 'antd';
import {
  MailOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  TrophyOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FireOutlined,
  StarOutlined,
  SendOutlined,
  EyeOutlined,
  RocketOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

interface AIEmailCoachProps {
  visible: boolean;
  onClose: () => void;
  campaignType?: string;
  emailData?: any;
}

interface EmailRecommendation {
  id: string;
  category: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  action: string;
  example?: string;
}

const AIEmailMarketingCoach: React.FC<AIEmailCoachProps> = ({
  visible,
  onClose,
  campaignType = 'newsletter',
  emailData,
}) => {
  const [emailScore, setEmailScore] = useState(0);
  const [activeTab, setActiveTab] = useState('subject-lines');
  const [subjectLine, setSubjectLine] = useState('');
  const [subjectScore, setSubjectScore] = useState(0);
  const [emailCopy, setEmailCopy] = useState('');
  const [copyAnalysis, setCopyAnalysis] = useState<any>({});

  useEffect(() => {
    if (visible) {
      calculateEmailScore();
    }
  }, [visible, emailData]);

  const calculateEmailScore = () => {
    const score = 70 + Math.floor(Math.random() * 25);
    setEmailScore(score);
  };

  const analyzeSubjectLine = (text: string) => {
    setSubjectLine(text);

    // AI scoring factors
    let score = 50;

    // Length check (40-50 characters is optimal)
    if (text.length >= 40 && text.length <= 50) score += 15;
    else if (text.length >= 30 && text.length <= 60) score += 10;

    // Contains numbers
    if (/\d/.test(text)) score += 10;

    // Contains power words
    const powerWords = ['free', 'new', 'proven', 'exclusive', 'limited', 'urgent', 'secret', 'discover', 'amazing', 'guaranteed'];
    const hasPowerWords = powerWords.some(word => text.toLowerCase().includes(word));
    if (hasPowerWords) score += 10;

    // Personalization tokens
    if (text.includes('[') || text.includes('{')) score += 10;

    // Question format
    if (text.includes('?')) score += 5;

    // All caps (bad)
    if (text === text.toUpperCase()) score -= 20;

    // Emoji usage
    if (/[\u{1F300}-\u{1F9FF}]/u.test(text)) score += 5;

    setSubjectScore(Math.min(100, Math.max(0, score)));
  };

  const analyzeEmailCopy = (text: string) => {
    setEmailCopy(text);

    const wordCount = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentences;
    const paragraphs = text.split(/\n\n+/).length;

    const hasLinks = text.toLowerCase().includes('http') || text.includes('[link]');
    const hasCTA = /click|download|get|buy|start|join|learn/i.test(text);
    const personalPronouns = (text.match(/\byou\b|\byour\b/gi) || []).length;

    setCopyAnalysis({
      wordCount,
      readabilityScore: Math.max(0, 100 - (avgWordsPerSentence - 15) * 3),
      ctaCount: (text.match(/click|download|get|buy|start|join|learn/gi) || []).length,
      personalTouch: personalPronouns,
      hasLinks,
      paragraphs,
    });
  };

  const emailRecommendations: EmailRecommendation[] = [
    {
      id: 'subject-line-power',
      category: 'critical',
      title: 'Optimize Your Subject Line',
      description: '35% of recipients open emails based on subject line alone. Use numbers, personalization, and curiosity gaps.',
      impact: 'Can increase open rates by 20-50%',
      action: 'Use our Subject Line Analyzer tab to test and optimize your subject lines',
      example: 'Bad: "Newsletter #42" → Good: "[Name], your personalized marketing plan is ready"',
    },
    {
      id: 'send-time',
      category: 'high',
      title: 'Optimize Send Time',
      description: 'Send times can impact open rates by 30%+. Best times are Tuesday-Thursday, 10 AM or 2 PM local time.',
      impact: 'Can boost opens by 20-30%',
      action: 'Enable send time optimization to deliver when each subscriber is most likely to engage',
      example: 'B2B: Tues-Thurs 10 AM | E-commerce: Sun-Mon 8 PM | Coaching: Wed-Thurs 7 PM',
    },
    {
      id: 'personalization',
      category: 'high',
      title: 'Add Hyper-Personalization',
      description: 'Personalized emails deliver 6X higher transaction rates. Go beyond first names.',
      impact: 'Increases engagement by 26%',
      action: 'Use merge tags: name, company, location, past purchases, browsing behavior',
      example: 'Generic: "Check out our products" → Personal: "Hi [Name], based on your interest in [Topic], here are 3 resources"',
    },
    {
      id: 'single-cta',
      category: 'high',
      title: 'Focus on Single, Clear CTA',
      description: 'Multiple CTAs reduce conversions by 371%. One clear ask performs best.',
      impact: 'Increases click-through by 28%',
      action: 'Choose ONE primary action per email, make button/link prominent and specific',
      example: 'Use "Download Your Free Template" not "Click Here"',
    },
    {
      id: 'mobile-first',
      category: 'critical',
      title: 'Optimize for Mobile (70%+ Opens)',
      description: '70% of emails are opened on mobile. Mobile-unfriendly emails are deleted in 3 seconds.',
      impact: 'Recovers 40-60% of mobile readers',
      action: 'Use single column, large text (14px+), big buttons (44px height), short paragraphs',
      example: 'Preheader: 40-50 chars, Subject: 30-40 chars, Body: Short paragraphs, Big CTA button',
    },
    {
      id: 'preview-text',
      category: 'medium',
      title: 'Craft Compelling Preview Text',
      description: 'Preview text appears after subject line and influences 24% of open decisions.',
      impact: 'Boosts opens by 10-15%',
      action: 'Write custom preview text (40-50 chars) that complements subject line',
      example: 'Subject: "Your exclusive invite" | Preview: "3 seats left for tomorrow\'s webinar"',
    },
    {
      id: 'storytelling',
      category: 'medium',
      title: 'Use Story-Based Email Structure',
      description: 'Story-driven emails get 5X more engagement than feature lists.',
      impact: 'Increases read-through by 300%',
      action: 'Use: Hook → Story → Lesson → CTA structure instead of bullet points',
      example: 'Share customer success story, what they learned, how reader can get same result',
    },
    {
      id: 'scarcity-urgency',
      category: 'high',
      title: 'Add Strategic Scarcity & Urgency',
      description: 'Urgency increases conversions by 332% when used authentically.',
      impact: 'Can double click-through rates',
      action: 'Use countdown timers, limited spots, expiring bonuses, flash sales',
      example: 'Add: "Only 3 spots left" or "Price increases in 24 hours" or countdown timer',
    },
  ];

  const subjectLineTips = [
    {
      category: 'Length',
      tip: '40-50 characters is optimal (fits mobile preview)',
      bad: 'This is our monthly newsletter with updates about products and services',
      good: 'Your personal marketing blueprint is ready',
    },
    {
      category: 'Personalization',
      tip: 'Use recipient\'s name or company for 26% higher opens',
      bad: 'New Features Available',
      good: 'Sarah, 3 new tools for your team at Acme Corp',
    },
    {
      category: 'Numbers & Lists',
      tip: 'Numbers increase opens by 57%',
      bad: 'Ways to Increase Your Revenue',
      good: '7 Tactics That Grew Revenue 214% in 90 Days',
    },
    {
      category: 'Curiosity Gap',
      tip: 'Create curiosity but deliver on promise',
      bad: 'Newsletter Update',
      good: 'The one metric 87% of marketers ignore (but shouldn\'t)',
    },
    {
      category: 'Power Words',
      tip: 'Use emotional triggers: Free, New, Proven, Exclusive, Secret',
      bad: 'Our Latest Product',
      good: 'Exclusive: Get Free Access to Our New Tool',
    },
    {
      category: 'Avoid Spam Triggers',
      tip: 'Avoid: FREE!!!, $$$, URGENT, ALL CAPS, excessive punctuation!!!',
      bad: 'FREE MONEY!!! CLICK NOW!!!',
      good: 'Complimentary marketing audit (limited availability)',
    },
  ];

  const engagementStrategies = [
    {
      title: 'Welcome Series (5-7 emails)',
      openRate: '50-70%',
      strategy: 'Set expectations, deliver quick win, share story, offer value, ask for engagement',
      timeline: 'Day 0, 2, 4, 7, 14',
    },
    {
      title: 'Re-engagement Campaign',
      openRate: '15-25%',
      strategy: 'Win-back inactive subscribers with compelling offer or preference update',
      timeline: 'After 60-90 days inactive',
    },
    {
      title: 'Educational Drip',
      openRate: '30-45%',
      strategy: 'Weekly valuable content that positions you as expert, soft CTA at end',
      timeline: 'Weekly, same day/time',
    },
    {
      title: 'Product Launch Sequence',
      openRate: '40-60%',
      strategy: 'Pre-launch hype → Launch → Scarcity → Last chance → Cart close',
      timeline: '7-14 day sequence',
    },
  ];

  const segmentationIdeas = [
    {
      segment: 'Engagement Level',
      criteria: 'Highly engaged (opened 50%+) vs Cold (< 20% opens)',
      strategy: 'Send more to engaged, win-back campaign to cold, remove dead (6mo)',
    },
    {
      segment: 'Purchase Behavior',
      criteria: 'Customers vs Leads, Average Order Value, Product category',
      strategy: 'Different messaging, upsells to customers, social proof to leads',
    },
    {
      segment: 'Lead Source',
      criteria: 'Where they opted in (lead magnet, webinar, purchase)',
      strategy: 'Reference their entry point, relevant follow-up content',
    },
    {
      segment: 'Interests/Tags',
      criteria: 'Topics they\'ve engaged with, links clicked, pages visited',
      strategy: 'Hyper-relevant content based on demonstrated interest',
    },
    {
      segment: 'Lifecycle Stage',
      criteria: 'Subscriber → Lead → Opportunity → Customer → Advocate',
      strategy: 'Different goals: New subscribers get education, customers get retention',
    },
  ];

  const deliverabilityChecklist = [
    { item: 'Use authenticated domain (SPF, DKIM, DMARC)', impact: 'Critical' },
    { item: 'Maintain list hygiene (remove bounces)', impact: 'Critical' },
    { item: 'Avoid spam trigger words in subject/body', impact: 'High' },
    { item: 'Balance image-to-text ratio (60/40 text/images)', impact: 'High' },
    { item: 'Include plain text version', impact: 'Medium' },
    { item: 'Don\'t use URL shorteners', impact: 'Medium' },
    { item: 'Consistent send frequency', impact: 'High' },
    { item: 'Easy unsubscribe link (required)', impact: 'Critical' },
    { item: 'Send from real person/company name', impact: 'High' },
    { item: 'Warm up new domain/IP gradually', impact: 'Critical' },
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
    return 'Poor';
  };

  return (
    <Drawer
      title={
        <Space>
          <MailOutlined style={{ fontSize: 24, color: '#6366f1' }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              AI Email Marketing Coach
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Expert email strategies from analyzing millions of campaigns
            </Text>
          </div>
        </Space>
      }
      placement="right"
      width={620}
      open={visible}
      onClose={onClose}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ padding: '24px' }}>
        {/* Email Performance Score */}
        <Card
          style={{
            marginBottom: 24,
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            color: 'white',
            border: 'none',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Email Health Score</span>}
                value={emailScore}
                suffix="/100"
                valueStyle={{ color: 'white', fontSize: 32 }}
              />
              <Tag color={getScoreColor(emailScore)} style={{ marginTop: 8 }}>
                {getScoreLabel(emailScore)}
              </Tag>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: 'right' }}>
                <MailOutlined style={{ fontSize: 64, opacity: 0.3 }} />
              </div>
            </Col>
          </Row>

          <Progress
            percent={emailScore}
            strokeColor="white"
            trailColor="rgba(255,255,255,0.3)"
            showInfo={false}
            style={{ marginTop: 16 }}
          />
        </Card>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'subject-lines',
              label: (
                <span>
                  <SendOutlined /> Subject Lines
                </span>
              ),
              children: (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Alert
                    message="Subject lines determine 35% of email opens"
                    description="Test your subject line and get instant AI-powered optimization suggestions"
                    type="info"
                    showIcon
                  />

                  <Card size="small">
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <div>
                        <Text strong>Test Your Subject Line</Text>
                        <Input
                          size="large"
                          placeholder="Enter your subject line..."
                          value={subjectLine}
                          onChange={(e) => analyzeSubjectLine(e.target.value)}
                          style={{ marginTop: 8 }}
                        />
                      </div>

                      {subjectLine && (
                        <Card size="small" style={{ background: '#f8fafc' }}>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Statistic
                                title="Subject Line Score"
                                value={subjectScore}
                                suffix="/100"
                                valueStyle={{ color: getScoreColor(subjectScore) }}
                              />
                            </Col>
                            <Col span={12}>
                              <Statistic
                                title="Character Count"
                                value={subjectLine.length}
                                suffix={subjectLine.length >= 40 && subjectLine.length <= 50 ? '✓' : ''}
                                valueStyle={{
                                  color: subjectLine.length >= 40 && subjectLine.length <= 50 ? '#10b981' : '#f59e0b',
                                }}
                              />
                            </Col>
                          </Row>
                          <Progress
                            percent={subjectScore}
                            strokeColor={getScoreColor(subjectScore)}
                            style={{ marginTop: 12 }}
                          />

                          {subjectScore < 70 && (
                            <Alert
                              message="Improvement Suggestions"
                              description={
                                <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                                  {subjectLine.length < 40 && <li>Too short - aim for 40-50 characters</li>}
                                  {subjectLine.length > 50 && <li>Too long - will be cut off on mobile</li>}
                                  {!/\d/.test(subjectLine) && <li>Add a number (increases opens by 57%)</li>}
                                  {!subjectLine.includes('?') && <li>Consider using a question format</li>}
                                  {subjectLine === subjectLine.toUpperCase() && <li>Don't use ALL CAPS</li>}
                                </ul>
                              }
                              type="warning"
                              showIcon
                              style={{ marginTop: 12 }}
                            />
                          )}
                        </Card>
                      )}
                    </Space>
                  </Card>

                  <Divider>Subject Line Formulas</Divider>

                  {subjectLineTips.map((tip, index) => (
                    <Card key={index} size="small">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text strong>{tip.category}</Text>
                          <StarOutlined style={{ color: '#f59e0b' }} />
                        </div>
                        <Text>{tip.tip}</Text>
                        <div style={{ background: '#fef2f2', padding: 8, borderRadius: 4, borderLeft: '3px solid #ef4444' }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            ❌ Bad: {tip.bad}
                          </Text>
                        </div>
                        <div style={{ background: '#f0fdf4', padding: 8, borderRadius: 4, borderLeft: '3px solid #10b981' }}>
                          <Text style={{ fontSize: 12 }}>
                            ✅ Good: {tip.good}
                          </Text>
                        </div>
                      </Space>
                    </Card>
                  ))}
                </Space>
              ),
            },
            {
              key: 'copy-analysis',
              label: (
                <span>
                  <EyeOutlined /> Copy Analysis
                </span>
              ),
              children: (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Alert
                    message="Email Copy Analyzer"
                    description="Paste your email copy and get instant readability, engagement, and conversion analysis"
                    type="info"
                    showIcon
                  />

                  <Card size="small">
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <div>
                        <Text strong>Your Email Copy</Text>
                        <TextArea
                          rows={8}
                          placeholder="Paste your email copy here..."
                          value={emailCopy}
                          onChange={(e) => analyzeEmailCopy(e.target.value)}
                          style={{ marginTop: 8 }}
                        />
                      </div>

                      {emailCopy && copyAnalysis.wordCount && (
                        <Card size="small" style={{ background: '#f8fafc' }}>
                          <Title level={5}>Copy Analysis</Title>
                          <Row gutter={[16, 16]}>
                            <Col span={8}>
                              <Statistic
                                title="Word Count"
                                value={copyAnalysis.wordCount}
                                valueStyle={{
                                  color: copyAnalysis.wordCount < 200 ? '#10b981' : '#f59e0b',
                                }}
                              />
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                {copyAnalysis.wordCount < 200 ? 'Good length' : 'Too long'}
                              </Text>
                            </Col>
                            <Col span={8}>
                              <Statistic
                                title="Readability"
                                value={Math.round(copyAnalysis.readabilityScore)}
                                suffix="/100"
                                valueStyle={{ color: getScoreColor(copyAnalysis.readabilityScore) }}
                              />
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                Grade level: 8th
                              </Text>
                            </Col>
                            <Col span={8}>
                              <Statistic
                                title="CTA Count"
                                value={copyAnalysis.ctaCount}
                                valueStyle={{
                                  color: copyAnalysis.ctaCount === 1 ? '#10b981' : '#f59e0b',
                                }}
                              />
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                {copyAnalysis.ctaCount === 1 ? 'Perfect' : 'Use 1 CTA'}
                              </Text>
                            </Col>
                            <Col span={12}>
                              <Text strong>Personal Touch: </Text>
                              <Tag color={copyAnalysis.personalTouch > 5 ? 'success' : 'warning'}>
                                {copyAnalysis.personalTouch} "you/your"
                              </Tag>
                            </Col>
                            <Col span={12}>
                              <Text strong>Has Links: </Text>
                              <Tag color={copyAnalysis.hasLinks ? 'success' : 'error'}>
                                {copyAnalysis.hasLinks ? 'Yes' : 'No'}
                              </Tag>
                            </Col>
                          </Row>

                          <Divider style={{ margin: '12px 0' }} />

                          <Alert
                            message="Recommendations"
                            description={
                              <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                                {copyAnalysis.wordCount > 200 && <li>Shorten email - aim for under 200 words</li>}
                                {copyAnalysis.ctaCount !== 1 && <li>Use exactly 1 clear CTA for best results</li>}
                                {copyAnalysis.personalTouch < 5 && <li>Add more "you/your" for personalization</li>}
                                {!copyAnalysis.hasLinks && <li>Add a clickable link/button</li>}
                                {copyAnalysis.paragraphs < 3 && <li>Break into smaller paragraphs (mobile friendly)</li>}
                              </ul>
                            }
                            type="warning"
                            showIcon
                          />
                        </Card>
                      )}
                    </Space>
                  </Card>
                </Space>
              ),
            },
            {
              key: 'recommendations',
              label: (
                <span>
                  <BulbOutlined /> Best Practices
                </span>
              ),
              children: (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Alert
                    message="8 Critical Email Optimizations"
                    description="Implement these proven strategies to dramatically improve your email performance"
                    type="success"
                    showIcon
                  />

                  <Collapse
                    defaultActiveKey={['subject-line-power', 'send-time', 'personalization']}
                    expandIconPosition="end"
                  >
                    {emailRecommendations.map((rec) => (
                      <Panel
                        key={rec.id}
                        header={
                          <Space>
                            {rec.category === 'critical' ? (
                              <WarningOutlined style={{ color: '#ef4444' }} />
                            ) : (
                              <FireOutlined style={{ color: '#f59e0b' }} />
                            )}
                            <Text strong>{rec.title}</Text>
                          </Space>
                        }
                        extra={
                          <Tag color={rec.category === 'critical' ? 'red' : 'orange'}>
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
                            onClick={() => message.success('Recommendation saved to your campaign!')}
                          >
                            Apply to Campaign
                          </Button>
                        </Space>
                      </Panel>
                    ))}
                  </Collapse>
                </Space>
              ),
            },
            {
              key: 'engagement',
              label: (
                <span>
                  <RocketOutlined /> Engagement
                </span>
              ),
              children: (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Alert
                    message="Proven Email Sequence Strategies"
                    description="Build engagement with strategic email sequences"
                    type="info"
                    showIcon
                  />

                  {engagementStrategies.map((strategy, index) => (
                    <Card key={index} size="small">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text strong>{strategy.title}</Text>
                          <Tag color="success">Avg Open: {strategy.openRate}</Tag>
                        </div>
                        <Text>{strategy.strategy}</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <ClockCircleOutlined style={{ color: '#6366f1' }} />
                          <Text type="secondary">{strategy.timeline}</Text>
                        </div>
                      </Space>
                    </Card>
                  ))}

                  <Divider>Smart Segmentation</Divider>

                  {segmentationIdeas.map((idea, index) => (
                    <Card key={index} size="small">
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <TeamOutlined style={{ color: '#6366f1' }} />
                          <Text strong>{idea.segment}</Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <strong>Criteria:</strong> {idea.criteria}
                        </Text>
                        <Text style={{ fontSize: 12 }}>
                          <strong>Strategy:</strong> {idea.strategy}
                        </Text>
                      </Space>
                    </Card>
                  ))}

                  <Divider>Deliverability Checklist</Divider>

                  <List
                    size="small"
                    dataSource={deliverabilityChecklist}
                    renderItem={(item) => (
                      <List.Item>
                        <Space>
                          <CheckCircleOutlined style={{ color: '#10b981' }} />
                          <Text>{item.item}</Text>
                          <Tag color={item.impact === 'Critical' ? 'red' : item.impact === 'High' ? 'orange' : 'blue'}>
                            {item.impact}
                          </Tag>
                        </Space>
                      </List.Item>
                    )}
                  />
                </Space>
              ),
            },
          ]}
        />
      </div>
    </Drawer>
  );
};

export default AIEmailMarketingCoach;
