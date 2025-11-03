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
import aiService from '../../services/aiService';

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
  // Real AI-powered response generation using backend API
  const generateAIResponse = async (userMessage: string): Promise<Partial<Message>> => {
    try {
      // Build conversation history from existing messages
      const conversationHistory = messages
        .filter(m => m.type === 'user' || m.type === 'assistant')
        .map(m => ({
          role: m.type === 'user' ? 'user' as const : 'assistant' as const,
          content: m.content,
        }));

      // Call real AI backend
      const response = await aiService.chat({
        message: userMessage,
        conversationHistory,
        context: {
          // You can add user stats, recent campaigns, etc. here
          // userStats: { ... },
          // recentCampaigns: [ ... ],
        },
      });

      return {
        content: response.response,
        suggestions: [], // Backend could return suggestions in future
        actions: [], // Backend could return suggested actions in future
      };
    } catch (error: any) {
      console.error('AI chat error:', error);
      return {
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.\n\nIf the problem persists, the AI service may not be configured. Please contact support.",
        suggestions: [],
      };
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    const messageToSend = inputValue;
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const aiResponse = await generateAIResponse(messageToSend);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse.content || 'I apologize, but I could not generate a response.',
        timestamp: new Date(),
        suggestions: aiResponse.suggestions,
        actions: aiResponse.actions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
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
