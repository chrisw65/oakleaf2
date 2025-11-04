import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Tabs,
  Descriptions,
  Tag,
  Button,
  Space,
  Spin,
  message,
  Typography,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { crmService, Contact } from '../../services/crmService';
import ActivityTimeline from '../../components/crm/ActivityTimeline';
import ContactNotes from '../../components/crm/ContactNotes';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ContactDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      loadContact();
    }
  }, [id]);

  const loadContact = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await crmService.getContact(id);
      setContact(data);
    } catch (error) {
      console.error('Failed to load contact:', error);
      message.error('Failed to load contact');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !contact) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  const tabItems = [
    {
      key: 'overview',
      label: 'Overview',
      children: (
        <div>
          <Card title="Contact Information" style={{ marginBottom: 16 }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Name">
                {contact.firstName} {contact.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <Space>
                  <MailOutlined />
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </Space>
              </Descriptions.Item>
              {contact.phone && (
                <Descriptions.Item label="Phone">
                  <Space>
                    <PhoneOutlined />
                    <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                  </Space>
                </Descriptions.Item>
              )}
              {contact.company && (
                <Descriptions.Item label="Company">{contact.company}</Descriptions.Item>
              )}
              {contact.jobTitle && (
                <Descriptions.Item label="Job Title">{contact.jobTitle}</Descriptions.Item>
              )}
              <Descriptions.Item label="Source">
                <Tag color="blue">{contact.source}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={contact.status === 'active' ? 'green' : 'default'}>
                  {contact.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Lead Score">
                <Tag color="purple">{contact.score || 0}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {dayjs(contact.createdAt).format('MMM D, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {dayjs(contact.updatedAt).format('MMM D, YYYY')}
              </Descriptions.Item>
              {contact.lastContactedAt && (
                <Descriptions.Item label="Last Contacted">
                  {dayjs(contact.lastContactedAt).format('MMM D, YYYY')}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {contact.tags && contact.tags.length > 0 && (
            <Card title="Tags" style={{ marginBottom: 16 }}>
              <Space wrap>
                {contact.tags.map((tag) => (
                  <Tag key={tag.id} color={tag.color || 'blue'}>
                    {tag.name}
                  </Tag>
                ))}
              </Space>
            </Card>
          )}

          {contact.customFields && Object.keys(contact.customFields).length > 0 && (
            <Card title="Custom Fields">
              <Descriptions column={2} bordered>
                {Object.entries(contact.customFields).map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Card>
          )}
        </div>
      ),
    },
    {
      key: 'activities',
      label: 'Activities',
      children: <ActivityTimeline contactId={contact.id} />,
    },
    {
      key: 'notes',
      label: 'Notes',
      children: <ContactNotes contactId={contact.id} />,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/contacts')}
              >
                Back to Contacts
              </Button>
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  {contact.firstName} {contact.lastName}
                </Title>
                <Text type="secondary">{contact.email}</Text>
              </div>
            </Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/contacts/${contact.id}/edit`)}
            >
              Edit Contact
            </Button>
          </Space>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
          />
        </Space>
      </Card>
    </div>
  );
};

export default ContactDetailPage;
