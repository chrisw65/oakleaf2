import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Table,
  Tag,
  Dropdown,
  Modal,
  message,
  Typography,
  Statistic,
  Row,
  Col,
} from 'antd';
import type { MenuProps, TableProps } from 'antd';
import {
  PlusOutlined,
  SendOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  MailOutlined,
  ClockCircleOutlined,
  PauseCircleOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  AppstoreOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { EmailCampaign, CampaignStatus, emailService } from '../../services/emailService';
import CampaignFormModal from '../../components/email/CampaignFormModal';
import AIEmailMarketingCoach from '../../components/email/AIEmailMarketingCoach';
import AdvancedEmailTemplateLibrary from '../../components/email/AdvancedEmailTemplateLibrary';
import EmailAutomationBuilder from '../../components/email/EmailAutomationBuilder';
import { format } from 'date-fns';

const { Title } = Typography;

const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [isAICoachVisible, setIsAICoachVisible] = useState(false);
  const [isTemplateLibraryVisible, setIsTemplateLibraryVisible] = useState(false);
  const [isAutomationBuilderVisible, setIsAutomationBuilderVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await emailService.getCampaigns(pagination.current, pagination.pageSize);
      setCampaigns(response.data);
      setPagination((prev) => ({ ...prev, total: response.total }));
    } catch (error: any) {
      message.error('Failed to load campaigns: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    setIsModalVisible(true);
  };

  const handleEditCampaign = (campaign: EmailCampaign) => {
    setEditingCampaign(campaign);
    setIsModalVisible(true);
  };

  const handleDeleteCampaign = (campaign: EmailCampaign) => {
    Modal.confirm({
      title: 'Delete Campaign',
      content: `Are you sure you want to delete "${campaign.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await emailService.deleteCampaign(campaign.id);
          message.success('Campaign deleted successfully');
          fetchCampaigns();
        } catch (error: any) {
          message.error('Failed to delete campaign: ' + (error.response?.data?.message || error.message));
        }
      },
    });
  };

  const handleSendCampaign = (campaign: EmailCampaign) => {
    Modal.confirm({
      title: 'Send Campaign',
      content: `Are you sure you want to send "${campaign.name}" now?`,
      okText: 'Send',
      onOk: async () => {
        try {
          await emailService.sendCampaign(campaign.id);
          message.success('Campaign sent successfully');
          fetchCampaigns();
        } catch (error: any) {
          message.error('Failed to send campaign: ' + (error.response?.data?.message || error.message));
        }
      },
    });
  };

  const handlePauseCampaign = async (campaign: EmailCampaign) => {
    try {
      await emailService.pauseCampaign(campaign.id);
      message.success('Campaign paused');
      fetchCampaigns();
    } catch (error: any) {
      message.error('Failed to pause campaign: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusTag = (status: CampaignStatus) => {
    const config: Record<CampaignStatus, { color: string; icon: React.ReactNode }> = {
      [CampaignStatus.DRAFT]: { color: 'default', icon: <EditOutlined /> },
      [CampaignStatus.SCHEDULED]: { color: 'blue', icon: <ClockCircleOutlined /> },
      [CampaignStatus.SENDING]: { color: 'processing', icon: <SendOutlined /> },
      [CampaignStatus.SENT]: { color: 'success', icon: <MailOutlined /> },
      [CampaignStatus.PAUSED]: { color: 'warning', icon: <PauseCircleOutlined /> },
    };
    return (
      <Tag color={config[status].color} icon={config[status].icon}>
        {status.toUpperCase()}
      </Tag>
    );
  };

  const getActionMenu = (campaign: EmailCampaign): MenuProps => {
    const items: MenuProps['items'] = [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit',
        onClick: () => handleEditCampaign(campaign),
        disabled: campaign.status === CampaignStatus.SENT,
      },
    ];

    if (campaign.status === CampaignStatus.DRAFT) {
      items.push({
        key: 'send',
        icon: <SendOutlined />,
        label: 'Send Now',
        onClick: () => handleSendCampaign(campaign),
      });
    }

    if (campaign.status === CampaignStatus.SENDING) {
      items.push({
        key: 'pause',
        icon: <PauseCircleOutlined />,
        label: 'Pause',
        onClick: () => handlePauseCampaign(campaign),
      });
    }

    items.push(
      { type: 'divider' },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete',
        danger: true,
        onClick: () => handleDeleteCampaign(campaign),
      }
    );

    return { items };
  };

  const columns: TableProps<EmailCampaign>['columns'] = [
    {
      title: 'Campaign Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>Subject: {record.subject}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Performance',
      key: 'performance',
      width: 300,
      render: (_, record) => {
        if (record.status === CampaignStatus.DRAFT || record.status === CampaignStatus.SCHEDULED) {
          return <span style={{ color: '#999' }}>Not sent yet</span>;
        }
        return (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Sent"
                  value={record.stats.sent}
                  valueStyle={{ fontSize: 14 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Opened"
                  value={record.stats.openRate}
                  suffix="%"
                  valueStyle={{ fontSize: 14 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Clicked"
                  value={record.stats.clickRate}
                  suffix="%"
                  valueStyle={{ fontSize: 14 }}
                />
              </Col>
            </Row>
          </Space>
        );
      },
    },
    {
      title: 'Date',
      key: 'date',
      width: 150,
      render: (_, record) => {
        if (record.sentAt) {
          return (
            <div>
              <div style={{ fontSize: 12 }}>Sent</div>
              <div style={{ fontSize: 12, color: '#999' }}>
                {format(new Date(record.sentAt), 'MMM dd, yyyy')}
              </div>
            </div>
          );
        }
        if (record.scheduledAt) {
          return (
            <div>
              <div style={{ fontSize: 12 }}>Scheduled</div>
              <div style={{ fontSize: 12, color: '#999' }}>
                {format(new Date(record.scheduledAt), 'MMM dd, yyyy')}
              </div>
            </div>
          );
        }
        return <span style={{ color: '#999' }}>Draft</span>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const handleTableChange: TableProps<EmailCampaign>['onChange'] = (pag) => {
    setPagination({
      current: pag.current || 1,
      pageSize: pag.pageSize || 10,
      total: pag.total || 0,
    });
  };

  return (
    <div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>
              Email Campaigns
            </Title>
            <Space>
              <Button
                icon={<RobotOutlined />}
                onClick={() => setIsAICoachVisible(true)}
                style={{ borderColor: '#6366f1', color: '#6366f1' }}
              >
                AI Coach
              </Button>
              <Button
                icon={<AppstoreOutlined />}
                onClick={() => setIsTemplateLibraryVisible(true)}
              >
                Templates
              </Button>
              <Button
                icon={<ThunderboltOutlined />}
                onClick={() => setIsAutomationBuilderVisible(true)}
              >
                Automations
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateCampaign}>
                Create Campaign
              </Button>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={campaigns}
            rowKey="id"
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
          />
        </Space>
      </Card>

      <CampaignFormModal
        visible={isModalVisible}
        campaign={editingCampaign}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingCampaign(null);
        }}
        onSuccess={() => {
          setIsModalVisible(false);
          setEditingCampaign(null);
          fetchCampaigns();
        }}
      />

      <AIEmailMarketingCoach
        visible={isAICoachVisible}
        onClose={() => setIsAICoachVisible(false)}
      />

      <AdvancedEmailTemplateLibrary
        visible={isTemplateLibraryVisible}
        onClose={() => setIsTemplateLibraryVisible(false)}
        onSelectTemplate={(templateId) => {
          message.success(`Template ${templateId} loaded!`);
          setIsTemplateLibraryVisible(false);
        }}
      />

      <EmailAutomationBuilder
        visible={isAutomationBuilderVisible}
        onClose={() => setIsAutomationBuilderVisible(false)}
      />
    </div>
  );
};

export default CampaignsPage;
