import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, List, Typography, Space, Button, Empty, Tag, Avatar, Divider } from 'antd';
import {
  BellOutlined,
  MailOutlined,
  ShoppingCartOutlined,
  UserAddOutlined,
  TrophyOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

interface Notification {
  id: string;
  type: 'email' | 'order' | 'contact' | 'achievement' | 'message' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  icon?: React.ReactNode;
  color?: string;
}

const NotificationBell: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'email',
      title: 'Campaign "Summer Sale" completed',
      description: '2,340 emails sent • 42% open rate • 156 clicks',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
      actionUrl: '/email/campaigns',
      color: '#f59e0b',
    },
    {
      id: '2',
      type: 'order',
      title: 'New order received',
      description: 'John Smith purchased "Pro Plan" for $99',
      timestamp: new Date(Date.now() - 1000 * 60 * 12),
      read: false,
      actionUrl: '/orders',
      color: '#10b981',
    },
    {
      id: '3',
      type: 'contact',
      title: '5 new contacts added',
      description: 'Via webinar registration form',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      actionUrl: '/contacts',
      color: '#6366f1',
    },
    {
      id: '4',
      type: 'achievement',
      title: '🎉 Milestone reached!',
      description: 'You\'ve sent 10,000 emails this month',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      read: true,
      color: '#8b5cf6',
    },
    {
      id: '5',
      type: 'message',
      title: 'New DM on Instagram',
      description: '@sarah_marketing: "How does your pricing work?"',
      timestamp: new Date(Date.now() - 1000 * 60 * 90),
      read: true,
      actionUrl: '/engagement',
      color: '#ec4899',
    },
  ]);

  const navigate = useNavigate();

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add a new notification (10% chance every 30 seconds)
      if (Math.random() < 0.1) {
        const newNotificationTypes = [
          {
            type: 'email' as const,
            title: 'Email opened',
            description: 'Contact opened your "Welcome Series" email',
            color: '#f59e0b',
          },
          {
            type: 'message' as const,
            title: 'New message on Facebook',
            description: 'Someone asked about your pricing',
            actionUrl: '/engagement',
            color: '#1877f2',
          },
          {
            type: 'order' as const,
            title: 'New sale!',
            description: 'Someone just purchased your product',
            actionUrl: '/orders',
            color: '#10b981',
          },
        ];

        const randomNotif = newNotificationTypes[Math.floor(Math.random() * newNotificationTypes.length)];
        const newNotification: Notification = {
          id: `notif-${Date.now()}`,
          ...randomNotif,
          timestamp: new Date(),
          read: false,
        };

        setNotifications((prev) => [newNotification, ...prev].slice(0, 20));
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <MailOutlined />;
      case 'order':
        return <ShoppingCartOutlined />;
      case 'contact':
        return <UserAddOutlined />;
      case 'achievement':
        return <TrophyOutlined />;
      case 'message':
        return <MessageOutlined />;
      default:
        return <BellOutlined />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 1000 / 60);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(notifications.map(n =>
      n.id === notification.id ? { ...n, read: true } : n
    ));

    // Navigate if there's an action URL
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setVisible(false);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const dropdownContent = (
    <div
      style={{
        width: 420,
        maxHeight: 600,
        backgroundColor: 'white',
        borderRadius: 12,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 16,
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Space>
          <Title level={5} style={{ margin: 0 }}>
            Notifications
          </Title>
          {unreadCount > 0 && (
            <Badge count={unreadCount} style={{ backgroundColor: '#6366f1' }} />
          )}
        </Space>
        <Space>
          {unreadCount > 0 && (
            <Button type="link" size="small" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={handleClearAll}
            >
              Clear all
            </Button>
          )}
        </Space>
      </div>

      {/* Notifications List */}
      <div style={{ maxHeight: 480, overflowY: 'auto' }}>
        {notifications.length > 0 ? (
          <List
            dataSource={notifications}
            renderItem={(notification) => (
              <List.Item
                onClick={() => handleNotificationClick(notification)}
                style={{
                  padding: '12px 16px',
                  cursor: notification.actionUrl ? 'pointer' : 'default',
                  backgroundColor: notification.read ? 'transparent' : '#f8fafc',
                  borderLeft: notification.read ? 'none' : '3px solid #6366f1',
                  transition: 'all 0.2s',
                  borderBottom: '1px solid #f0f0f0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = notification.read ? 'transparent' : '#f8fafc';
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={getIcon(notification.type)}
                      style={{
                        backgroundColor: notification.color || '#6366f1',
                      }}
                    />
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Text strong style={{ fontSize: 13 }}>
                        {notification.title}
                      </Text>
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={(e) => handleDelete(notification.id, e)}
                        style={{ marginLeft: 8 }}
                      />
                    </div>
                  }
                  description={
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Text style={{ fontSize: 12, color: '#666' }}>
                        {notification.description}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {formatTimestamp(notification.timestamp)}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No notifications"
            style={{ padding: '48px 0' }}
          />
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div
          style={{
            padding: 12,
            borderTop: '1px solid #f0f0f0',
            textAlign: 'center',
          }}
        >
          <Button type="link" size="small">
            View all notifications
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      trigger={['click']}
      open={visible}
      onOpenChange={setVisible}
      placement="bottomRight"
    >
      <Badge
        count={unreadCount}
        offset={[-5, 5]}
        style={{
          backgroundColor: '#ef4444',
          boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
        }}
      >
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 20 }} />}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
          }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;
