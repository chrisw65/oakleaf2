import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Input, List, Space, Typography, Tag, Empty } from 'antd';
import {
  SearchOutlined,
  DashboardOutlined,
  TeamOutlined,
  MailOutlined,
  FunnelPlotOutlined,
  ShopOutlined,
  BellOutlined,
  SettingOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  FileTextOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
  category: string;
  shortcut?: string;
}

interface CommandPaletteProps {
  visible: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ visible, onClose }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const commands: Command[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      description: 'View your main dashboard',
      icon: <DashboardOutlined style={{ color: '#6366f1' }} />,
      action: () => {
        navigate('/dashboard');
        onClose();
      },
      keywords: ['dashboard', 'home', 'overview'],
      category: 'Navigation',
      shortcut: 'G then D',
    },
    {
      id: 'nav-contacts',
      title: 'Go to Contacts',
      description: 'Manage your contacts and leads',
      icon: <TeamOutlined style={{ color: '#10b981' }} />,
      action: () => {
        navigate('/contacts');
        onClose();
      },
      keywords: ['contacts', 'crm', 'leads', 'customers'],
      category: 'Navigation',
      shortcut: 'G then C',
    },
    {
      id: 'nav-campaigns',
      title: 'Go to Email Campaigns',
      description: 'View and manage email campaigns',
      icon: <MailOutlined style={{ color: '#f59e0b' }} />,
      action: () => {
        navigate('/email/campaigns');
        onClose();
      },
      keywords: ['email', 'campaigns', 'marketing'],
      category: 'Navigation',
      shortcut: 'G then E',
    },
    {
      id: 'nav-funnels',
      title: 'Go to Funnels',
      description: 'Build and manage sales funnels',
      icon: <FunnelPlotOutlined style={{ color: '#8b5cf6' }} />,
      action: () => {
        navigate('/funnels');
        onClose();
      },
      keywords: ['funnels', 'sales', 'conversion'],
      category: 'Navigation',
      shortcut: 'G then F',
    },
    {
      id: 'nav-engagement',
      title: 'Go to Engagement',
      description: 'Social media DMs and monitoring',
      icon: <BellOutlined style={{ color: '#ec4899' }} />,
      action: () => {
        navigate('/engagement');
        onClose();
      },
      keywords: ['engagement', 'social', 'dms', 'messages'],
      category: 'Navigation',
      shortcut: 'G then S',
    },
    {
      id: 'nav-products',
      title: 'Go to Products',
      description: 'Manage your product catalog',
      icon: <ShopOutlined style={{ color: '#3b82f6' }} />,
      action: () => {
        navigate('/products');
        onClose();
      },
      keywords: ['products', 'catalog', 'inventory', 'ecommerce'],
      category: 'Navigation',
      shortcut: 'G then P',
    },

    // Create Actions
    {
      id: 'create-campaign',
      title: 'Create New Campaign',
      description: 'Start a new email campaign',
      icon: <PlusOutlined style={{ color: '#f59e0b' }} />,
      action: () => {
        navigate('/email/campaigns');
        onClose();
        // In real implementation, this would trigger the campaign modal
      },
      keywords: ['create', 'new', 'campaign', 'email'],
      category: 'Create',
      shortcut: 'C then E',
    },
    {
      id: 'create-funnel',
      title: 'Create New Funnel',
      description: 'Build a new sales funnel',
      icon: <PlusOutlined style={{ color: '#8b5cf6' }} />,
      action: () => {
        navigate('/funnels');
        onClose();
      },
      keywords: ['create', 'new', 'funnel', 'build'],
      category: 'Create',
      shortcut: 'C then F',
    },
    {
      id: 'create-contact',
      title: 'Add New Contact',
      description: 'Add a contact to your CRM',
      icon: <PlusOutlined style={{ color: '#10b981' }} />,
      action: () => {
        navigate('/contacts');
        onClose();
      },
      keywords: ['create', 'add', 'contact', 'lead'],
      category: 'Create',
      shortcut: 'C then C',
    },
    {
      id: 'create-product',
      title: 'Add New Product',
      description: 'Add a product to your catalog',
      icon: <PlusOutlined style={{ color: '#3b82f6' }} />,
      action: () => {
        navigate('/products');
        onClose();
      },
      keywords: ['create', 'add', 'product', 'item'],
      category: 'Create',
      shortcut: 'C then P',
    },

    // Tools
    {
      id: 'tool-ai-coach',
      title: 'Open AI Email Coach',
      description: 'Get AI-powered email recommendations',
      icon: <RobotOutlined style={{ color: '#6366f1' }} />,
      action: () => {
        navigate('/email/campaigns');
        onClose();
        // Would trigger AI coach modal
      },
      keywords: ['ai', 'coach', 'email', 'recommendations'],
      category: 'Tools',
    },
    {
      id: 'tool-automation',
      title: 'Email Automation Builder',
      description: 'Create automated email sequences',
      icon: <ThunderboltOutlined style={{ color: '#f59e0b' }} />,
      action: () => {
        navigate('/email/campaigns');
        onClose();
      },
      keywords: ['automation', 'sequence', 'workflow'],
      category: 'Tools',
    },
    {
      id: 'tool-templates',
      title: 'Email Template Library',
      description: 'Browse professional email templates',
      icon: <FileTextOutlined style={{ color: '#10b981' }} />,
      action: () => {
        navigate('/email/templates');
        onClose();
      },
      keywords: ['templates', 'email', 'library', 'designs'],
      category: 'Tools',
    },

    // Settings
    {
      id: 'settings-main',
      title: 'Open Settings',
      description: 'Configure your account settings',
      icon: <SettingOutlined style={{ color: '#6b7280' }} />,
      action: () => {
        navigate('/settings');
        onClose();
      },
      keywords: ['settings', 'preferences', 'configuration'],
      category: 'Settings',
      shortcut: 'G then ,',
    },
    {
      id: 'settings-api',
      title: 'API Keys',
      description: 'Manage your API keys',
      icon: <ApiOutlined style={{ color: '#6b7280' }} />,
      action: () => {
        navigate('/settings/api-keys');
        onClose();
      },
      keywords: ['api', 'keys', 'integration', 'developer'],
      category: 'Settings',
    },
  ];

  const filteredCommands = commands.filter((command) => {
    const searchLower = searchText.toLowerCase();
    return (
      command.title.toLowerCase().includes(searchLower) ||
      command.description.toLowerCase().includes(searchLower) ||
      command.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
    );
  });

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!visible) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [visible, selectedIndex, filteredCommands, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (visible) {
      setSearchText('');
      setSelectedIndex(0);
    }
  }, [visible]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchText]);

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={640}
      centered
      closeIcon={null}
      styles={{
        body: { padding: 0 },
        mask: { backdropFilter: 'blur(2px)' },
      }}
      style={{ top: 100 }}
    >
      <div>
        {/* Search Input */}
        <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
          <Input
            size="large"
            placeholder="Type a command or search..."
            prefix={<SearchOutlined style={{ color: '#6366f1' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            bordered={false}
            autoFocus
            style={{ fontSize: 16 }}
          />
        </div>

        {/* Commands List */}
        <div
          style={{
            maxHeight: 480,
            overflowY: 'auto',
            padding: 8,
          }}
        >
          {Object.keys(groupedCommands).length > 0 ? (
            Object.entries(groupedCommands).map(([category, categoryCommands]) => (
              <div key={category} style={{ marginBottom: 16 }}>
                <div style={{ padding: '8px 12px' }}>
                  <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                    {category}
                  </Text>
                </div>
                <List
                  dataSource={categoryCommands}
                  renderItem={(command, index) => {
                    const globalIndex = filteredCommands.findIndex(c => c.id === command.id);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <List.Item
                        onClick={() => command.action()}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#f8fafc' : 'transparent',
                          borderRadius: 8,
                          border: 'none',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <List.Item.Meta
                          avatar={
                            <div
                              style={{
                                fontSize: 20,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                backgroundColor: isSelected ? '#eef2ff' : '#f8fafc',
                              }}
                            >
                              {command.icon}
                            </div>
                          }
                          title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text strong style={{ fontSize: 14 }}>{command.title}</Text>
                              {command.shortcut && (
                                <Tag
                                  style={{
                                    fontSize: 10,
                                    padding: '2px 6px',
                                    backgroundColor: '#f1f5f9',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 4,
                                  }}
                                >
                                  {command.shortcut}
                                </Tag>
                              )}
                            </div>
                          }
                          description={
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {command.description}
                            </Text>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              </div>
            ))
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No commands found"
              style={{ padding: '48px 0' }}
            />
          )}
        </div>

        {/* Footer with hints */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: '#fafafa',
          }}
        >
          <Space size={16}>
            <Space size={4}>
              <Tag style={{ fontSize: 10, padding: '2px 6px' }}>↑↓</Tag>
              <Text type="secondary" style={{ fontSize: 11 }}>Navigate</Text>
            </Space>
            <Space size={4}>
              <Tag style={{ fontSize: 10, padding: '2px 6px' }}>Enter</Tag>
              <Text type="secondary" style={{ fontSize: 11 }}>Select</Text>
            </Space>
            <Space size={4}>
              <Tag style={{ fontSize: 10, padding: '2px 6px' }}>Esc</Tag>
              <Text type="secondary" style={{ fontSize: 11 }}>Close</Text>
            </Space>
          </Space>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Press <Text keyboard>⌘ K</Text> or <Text keyboard>Ctrl K</Text> to open
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default CommandPalette;
