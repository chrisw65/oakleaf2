import React, { useState, useEffect, useRef } from 'react';
import {
  Drawer,
  Input,
  Space,
  Typography,
  Avatar,
  Button,
  Card,
  Tag,
  List,
  Divider,
  Tooltip,
  Badge,
  message as antdMessage,
} from 'antd';
import {
  RobotOutlined,
  SendOutlined,
  CloseOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
  MailOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface AIAssistantChatProps {
  visible: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: ChatAction[];
}

interface ChatAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  type?: 'primary' | 'default';
}

const AIAssistantChat: React.FC<AIAssistantChatProps> = ({ visible, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "👋 Hey! I'm your AI marketing assistant. I can help you with:\n\n• Creating high-converting email campaigns\n• Analyzing funnel performance\n• Optimizing send times\n• Segmenting your audience\n• Writing engaging copy\n• Strategy recommendations\n\nWhat would you like to work on today?",
      timestamp: new Date(),
      suggestions: [
        'Improve my email open rates',
        'Analyze my best-performing funnel',
        'Create a welcome email sequence',
        'Find at-risk customers',
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // NLP-powered response generation (simulated)
  const generateAIResponse = async (userMessage: string): Promise<Partial<Message>> => {
    const lowerMessage = userMessage.toLowerCase();

    // Email open rates
    if (lowerMessage.includes('open rate') || lowerMessage.includes('email open')) {
      return {
        content: "📧 **Improving Email Open Rates**\n\nBased on your current campaigns (avg 32% open rate), here are my top recommendations:\n\n1. **Subject Line Optimization**\n   • Use personalization (Name, Company)\n   • Keep it under 50 characters\n   • A/B test 3-5 variants\n   • Current best performer: \"{{Name}}, you're missing out on...\"\n\n2. **Send Time Optimization**\n   • Your audience responds best on Tuesday & Thursday at 10 AM\n   • Avoid Mondays and Fridays\n   • Test weekend sends for B2C\n\n3. **Sender Name**\n   • Use a person's name instead of company name\n   • 'Sarah from [Company]' performs 18% better\n\n4. **List Hygiene**\n   • Remove inactive subscribers (90+ days)\n   • Re-engagement campaign for at-risk contacts\n   • Expected improvement: +12-15% open rate\n\nWould you like me to create an A/B test for your next campaign?",
        suggestions: [
          'Yes, create an A/B test',
          'Show me re-engagement templates',
          'Analyze my best subject lines',
        ],
        actions: [
          {
            label: 'Create A/B Test',
            icon: <ThunderboltOutlined />,
            type: 'primary',
            onClick: () => antdMessage.success('Opening A/B Test Manager...'),
          },
        ],
      };
    }

    // Funnel analysis
    if (lowerMessage.includes('funnel') || lowerMessage.includes('conversion')) {
      return {
        content: "📊 **Funnel Performance Analysis**\n\nI analyzed your top 3 funnels. Here's what I found:\n\n**Summer Sale Funnel** (Best Performer)\n• Conversion Rate: 18.5%\n• Revenue: $47,320\n• Biggest Drop-off: Checkout page (-42%)\n\n**Key Insights:**\n1. Landing page is crushing it (82% engagement)\n2. Checkout friction is costing you ~$18k/month\n3. Email sequence has 3x higher conversion than ads\n\n**Quick Wins:**\n1. Add trust badges to checkout\n2. Offer guest checkout option  \n3. Add exit-intent popup with 10% off\n4. Simplify form (remove 3 unnecessary fields)\n\n**Projected Impact:** +8-12% conversion rate, ~$6k extra revenue/month\n\nWant me to create a detailed optimization plan?",
        suggestions: [
          'Create optimization plan',
          'Show checkout best practices',
          'Compare with other funnels',
        ],
        actions: [
          {
            label: 'View Funnel Analytics',
            icon: <BarChartOutlined />,
            onClick: () => antdMessage.success('Opening Funnel Analytics...'),
          },
        ],
      };
    }

    // Welcome sequence
    if (lowerMessage.includes('welcome') || lowerMessage.includes('sequence') || lowerMessage.includes('automat')) {
      return {
        content: "🎉 **High-Converting Welcome Email Sequence**\n\nHere's a proven 5-email sequence that converts 23% of new subscribers:\n\n**Email 1: Immediate Welcome** (Send: Immediately)\n• Subject: \"Welcome! Here's your first win 🎁\"\n• Include: Brand story + Quick win/freebie\n• CTA: Download resource or take action\n\n**Email 2: Value Bomb** (Send: Day 2)\n• Subject: \"The #1 mistake [audience] makes...\"\n• Include: Educational content + Case study\n• CTA: Read blog post or watch video\n\n**Email 3: Social Proof** (Send: Day 4)\n• Subject: \"How [Customer] achieved [Result]...\"\n• Include: Customer success story + Results\n• CTA: See more testimonials\n\n**Email 4: The Offer** (Send: Day 7)\n• Subject: \"Special offer just for you\"\n• Include: Product/service intro + Discount\n• CTA: Shop now (20% off)\n\n**Email 5: Last Chance** (Send: Day 10)\n• Subject: \"Your 20% discount expires tonight\"\n• Include: Urgency + Scarcity + Benefits\n• CTA: Claim discount now\n\nShall I generate the full email copy for you?",
        suggestions: [
          'Generate email copy for sequence',
          'Customize for my industry',
          'Show me the stats',
        ],
        actions: [
          {
            label: 'Generate Full Sequence',
            icon: <RocketOutlined />,
            type: 'primary',
            onClick: () => antdMessage.success('Generating welcome sequence...'),
          },
        ],
      };
    }

    // At-risk customers
    if (lowerMessage.includes('at-risk') || lowerMessage.includes('churn') || lowerMessage.includes('losing customer')) {
      return {
        content: "⚠️ **At-Risk Customer Analysis**\n\nI identified 23 high-value customers at risk of churning:\n\n**High Priority (12 contacts)**\n• Total LTV: $34,280\n• Avg days since last activity: 38 days\n• Previous engagement: 60%+ open rates\n• Current engagement: 0-5%\n\n**Top Risk Indicators:**\n1. No email opens in 30+ days\n2. Login frequency dropped 80%\n3. Support tickets increased\n4. Visited competitor sites\n\n**Recommended Win-Back Strategy:**\n\n**Phase 1: Personal Outreach** (Days 1-3)\n• Personal email from founder/CEO\n• Phone call from account manager\n• Special \"we miss you\" offer\n\n**Phase 2: Value Reminder** (Days 4-7)\n• ROI report showing their results\n• Case studies from similar customers\n• New features they haven't tried\n\n**Phase 3: Last-Ditch Offer** (Days 8-14)\n• Exclusive VIP discount (30-40% off)\n• Free month or upgrade\n• Exit survey if no response\n\n**Success Rate:** 68% win-back rate with this approach\n**Potential Revenue Saved:** $23,350\n\nShall I create these campaigns for you?",
        suggestions: [
          'Create win-back campaigns',
          'Show me the contact list',
          'Analyze churn reasons',
        ],
        actions: [
          {
            label: 'View Churn Dashboard',
            icon: <TeamOutlined />,
            onClick: () => antdMessage.success('Opening Churn Prediction...'),
          },
          {
            label: 'Create Win-Back Campaign',
            icon: <MailOutlined />,
            type: 'primary',
            onClick: () => antdMessage.success('Creating win-back campaign...'),
          },
        ],
      };
    }

    // Default response for other queries
    return {
      content: "I understand you're asking about: \"" + userMessage + "\"\n\n🤔 Let me help you with that. Based on your question, here are some relevant insights:\n\n• Your overall campaign performance is strong (avg 32% open rate, 8.5% CTR)\n• You have 2,340 active contacts with high engagement\n• Your best-performing channel is email (3x ROI vs social)\n• Your funnels convert at 14.2% on average\n\nCould you be more specific about what you'd like to accomplish? I can help with:\n\n✅ Campaign strategy and optimization\n✅ Content creation and copywriting\n✅ Audience segmentation\n✅ Performance analysis\n✅ A/B testing recommendations\n✅ Automation workflows",
      suggestions: [
        'How do I increase sales?',
        'What\'s my best-performing campaign?',
        'Create a new email campaign',
        'Segment my audience',
      ],
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const aiResponse = await generateAIResponse(inputValue);
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: aiResponse.content || '',
      timestamp: new Date(),
      suggestions: aiResponse.suggestions,
      actions: aiResponse.actions,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    handleSendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Drawer
      title={
        <Space>
          <Avatar
            size={40}
            icon={<RobotOutlined />}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>AI Marketing Assistant</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <Badge status="success" />
              Online • Powered by GPT-4
            </Text>
          </div>
        </Space>
      }
      placement="right"
      width={480}
      open={visible}
      onClose={onClose}
      closeIcon={<CloseOutlined />}
      styles={{
        body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' },
      }}
    >
      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#f8fafc',
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {messages.map((message) => (
            <div key={message.id}>
              {message.type === 'assistant' ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Avatar
                    size={32}
                    icon={<RobotOutlined />}
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <Card
                      size="small"
                      style={{
                        backgroundColor: 'white',
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <Paragraph
                        style={{
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          fontSize: 14,
                          lineHeight: 1.6,
                        }}
                      >
                        {message.content}
                      </Paragraph>

                      {message.actions && message.actions.length > 0 && (
                        <>
                          <Divider style={{ margin: '12px 0' }} />
                          <Space wrap>
                            {message.actions.map((action, idx) => (
                              <Button
                                key={idx}
                                type={action.type || 'default'}
                                size="small"
                                icon={action.icon}
                                onClick={action.onClick}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </Space>
                        </>
                      )}
                    </Card>

                    {message.suggestions && message.suggestions.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Space wrap size={[8, 8]}>
                          {message.suggestions.map((suggestion, idx) => (
                            <Tag
                              key={idx}
                              style={{
                                cursor: 'pointer',
                                padding: '4px 12px',
                                borderRadius: 16,
                                border: '1px solid #e2e8f0',
                                backgroundColor: 'white',
                              }}
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    )}

                    <Text
                      type="secondary"
                      style={{
                        fontSize: 11,
                        display: 'block',
                        marginTop: 4,
                      }}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Card
                    size="small"
                    style={{
                      maxWidth: '75%',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: 'white',
                      borderRadius: 12,
                      border: 'none',
                    }}
                  >
                    <Paragraph
                      style={{
                        margin: 0,
                        color: 'white',
                        whiteSpace: 'pre-wrap',
                        fontSize: 14,
                      }}
                    >
                      {message.content}
                    </Paragraph>
                    <Text
                      style={{
                        fontSize: 11,
                        display: 'block',
                        marginTop: 4,
                        color: 'rgba(255, 255, 255, 0.8)',
                      }}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </Card>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Avatar
                size={32}
                icon={<RobotOutlined />}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                }}
              />
              <Card
                size="small"
                style={{
                  backgroundColor: 'white',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                }}
              >
                <Space>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    AI is thinking...
                  </Text>
                </Space>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </Space>
      </div>

      {/* Quick Actions */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: 'white',
        }}
      >
        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>
          Quick Actions:
        </Text>
        <Space wrap size={[8, 8]}>
          <Tooltip title="Optimize campaigns">
            <Button
              size="small"
              icon={<ThunderboltOutlined />}
              onClick={() => handleSuggestionClick('How can I improve my campaigns?')}
            >
              Optimize
            </Button>
          </Tooltip>
          <Tooltip title="Get insights">
            <Button
              size="small"
              icon={<BulbOutlined />}
              onClick={() => handleSuggestionClick('Give me insights on my performance')}
            >
              Insights
            </Button>
          </Tooltip>
          <Tooltip title="Create content">
            <Button
              size="small"
              icon={<MailOutlined />}
              onClick={() => handleSuggestionClick('Help me write an email')}
            >
              Write
            </Button>
          </Tooltip>
          <Tooltip title="Analyze audience">
            <Button
              size="small"
              icon={<TeamOutlined />}
              onClick={() => handleSuggestionClick('Analyze my audience')}
            >
              Analyze
            </Button>
          </Tooltip>
        </Space>
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: 'white',
        }}
      >
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your marketing..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ resize: 'none' }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              border: 'none',
            }}
          />
        </Space.Compact>
        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
          Press Enter to send • Shift+Enter for new line
        </Text>
      </div>

      {/* Typing indicator animation */}
      <style>
        {`
          .typing-indicator {
            display: flex;
            gap: 4px;
          }
          .typing-indicator span {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #6366f1;
            animation: typing 1.4s infinite;
          }
          .typing-indicator span:nth-child(2) {
            animation-delay: 0.2s;
          }
          .typing-indicator span:nth-child(3) {
            animation-delay: 0.4s;
          }
          @keyframes typing {
            0%, 60%, 100% {
              transform: translateY(0);
              opacity: 0.7;
            }
            30% {
              transform: translateY(-10px);
              opacity: 1;
            }
          }
        `}
      </style>
    </Drawer>
  );
};

export default AIAssistantChat;
