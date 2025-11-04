import React, { useState, useEffect } from 'react';
import { Timeline, Card, Button, Select, Empty, Spin, Tag, Typography, Space, Popconfirm, message } from 'antd';
import {
  MailOutlined,
  FormOutlined,
  EyeOutlined,
  FileTextOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  UserOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { crmService, ContactActivity } from '../../services/crmService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text, Title } = Typography;
const { Option } = Select;

interface ActivityTimelineProps {
  contactId: string;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ contactId }) => {
  const [activities, setActivities] = useState<ContactActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const limit = 20;

  useEffect(() => {
    loadActivities();
  }, [contactId, page, selectedType]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const response = await crmService.getContactActivities(contactId, {
        activityType: selectedType,
        page,
        limit,
      });
      setActivities(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load activities:', error);
      message.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (activityId: string) => {
    try {
      await crmService.deleteActivity(activityId);
      message.success('Activity deleted successfully');
      loadActivities();
    } catch (error) {
      console.error('Failed to delete activity:', error);
      message.error('Failed to delete activity');
    }
  };

  const getActivityIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      email_sent: <MailOutlined style={{ color: '#1890ff' }} />,
      email_opened: <MailOutlined style={{ color: '#52c41a' }} />,
      email_clicked: <MailOutlined style={{ color: '#faad14' }} />,
      email_bounced: <MailOutlined style={{ color: '#ff4d4f' }} />,
      form_submitted: <FormOutlined style={{ color: '#722ed1' }} />,
      page_viewed: <EyeOutlined style={{ color: '#13c2c2' }} />,
      note_added: <FileTextOutlined style={{ color: '#fa8c16' }} />,
      call_made: <PhoneOutlined style={{ color: '#eb2f96' }} />,
      meeting_scheduled: <CalendarOutlined style={{ color: '#52c41a' }} />,
      task_completed: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    };
    return iconMap[type] || <UserOutlined />;
  };

  const getActivityColor = (type: string) => {
    const colorMap: Record<string, string> = {
      email_sent: 'blue',
      email_opened: 'green',
      email_clicked: 'orange',
      email_bounced: 'red',
      form_submitted: 'purple',
      page_viewed: 'cyan',
      note_added: 'orange',
      call_made: 'magenta',
      meeting_scheduled: 'green',
      task_completed: 'green',
    };
    return colorMap[type] || 'default';
  };

  const activityTypes = [
    { value: 'email_sent', label: 'Email Sent' },
    { value: 'email_opened', label: 'Email Opened' },
    { value: 'email_clicked', label: 'Email Clicked' },
    { value: 'form_submitted', label: 'Form Submitted' },
    { value: 'page_viewed', label: 'Page Viewed' },
    { value: 'note_added', label: 'Note Added' },
    { value: 'call_made', label: 'Call Made' },
    { value: 'meeting_scheduled', label: 'Meeting Scheduled' },
    { value: 'task_completed', label: 'Task Completed' },
  ];

  return (
    <Card
      title={
        <Space>
          <Title level={5} style={{ margin: 0 }}>Activity Timeline</Title>
          <Tag color="blue">{total} Activities</Tag>
        </Space>
      }
      extra={
        <Space>
          <Select
            placeholder="Filter by type"
            style={{ width: 180 }}
            allowClear
            value={selectedType}
            onChange={(value) => {
              setSelectedType(value);
              setPage(1);
            }}
          >
            {activityTypes.map((type) => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
          <Button icon={<ReloadOutlined />} onClick={loadActivities} loading={loading}>
            Refresh
          </Button>
        </Space>
      }
    >
      {loading && activities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : activities.length === 0 ? (
        <Empty
          description="No activities yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <>
          <Timeline>
            {activities.map((activity) => (
              <Timeline.Item
                key={activity.id}
                dot={getActivityIcon(activity.activityType)}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      <Tag color={getActivityColor(activity.activityType)}>
                        {activity.activityType.replace(/_/g, ' ').toUpperCase()}
                      </Tag>
                      <Text strong>{activity.title}</Text>
                    </Space>
                    <Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(activity.occurredAt).fromNow()}
                      </Text>
                      <Popconfirm
                        title="Delete this activity?"
                        onConfirm={() => handleDelete(activity.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Popconfirm>
                    </Space>
                  </Space>
                  {activity.description && (
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {activity.description}
                    </Text>
                  )}
                  {activity.user && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      by {activity.user.firstName} {activity.user.lastName}
                    </Text>
                  )}
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div style={{ marginTop: 4 }}>
                      {Object.entries(activity.metadata)
                        .filter(([key]) => !['consent', 'consentHistory'].includes(key))
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <Tag key={key} style={{ fontSize: 11 }}>
                            {key}: {typeof value === 'object' ? JSON.stringify(value).substring(0, 30) : String(value).substring(0, 30)}
                          </Tag>
                        ))}
                    </div>
                  )}
                </Space>
              </Timeline.Item>
            ))}
          </Timeline>

          {total > limit && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Space>
                <Button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Text>
                  Page {page} of {Math.ceil(total / limit)}
                </Text>
                <Button
                  disabled={page >= Math.ceil(total / limit)}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </Space>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default ActivityTimeline;
