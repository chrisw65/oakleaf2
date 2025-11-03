import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Dropdown,
  Modal,
  message,
  Typography,
  Input,
  Statistic,
  Row,
  Col,
  Tooltip,
} from 'antd';
import type { MenuProps, TableProps } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  MoreOutlined,
  SearchOutlined,
  RocketOutlined,
  PauseCircleOutlined,
  EyeOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  ApiOutlined,
  AppstoreAddOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Funnel, FunnelStatus, funnelService } from '../../services/funnelService';
import FunnelFormModal from '../../components/funnels/FunnelFormModal';
import FunnelTemplateLibrary from '../../components/funnels/FunnelTemplateLibrary';
import IntegrationHub from '../../components/funnels/IntegrationHub';
import AIFunnelCoach from '../../components/funnels/AIFunnelCoach';

const { Title, Text } = Typography;

const FunnelsPage: React.FC = () => {
  const navigate = useNavigate();
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFunnel, setEditingFunnel] = useState<Funnel | null>(null);
  const [isTemplateLibraryVisible, setIsTemplateLibraryVisible] = useState(false);
  const [isIntegrationHubVisible, setIsIntegrationHubVisible] = useState(false);
  const [isAICoachVisible, setIsAICoachVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchFunnels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  const fetchFunnels = async () => {
    setLoading(true);
    try {
      const response = await funnelService.getFunnels(pagination.current, pagination.pageSize);
      setFunnels(response.data);
      setPagination((prev) => ({ ...prev, total: response.total }));
    } catch (error: any) {
      message.error('Failed to load funnels: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFunnel = () => {
    setEditingFunnel(null);
    setIsModalVisible(true);
  };

  const handleEditFunnel = (funnel: Funnel) => {
    setEditingFunnel(funnel);
    setIsModalVisible(true);
  };

  const handleViewBuilder = (funnel: Funnel) => {
    navigate(`/funnels/${funnel.id}/builder`);
  };

  const handleViewAnalytics = (funnel: Funnel) => {
    navigate(`/funnels/${funnel.id}/analytics`);
  };

  const handleDuplicateFunnel = async (funnel: Funnel) => {
    try {
      await funnelService.duplicateFunnel(funnel.id);
      message.success('Funnel duplicated successfully');
      fetchFunnels();
    } catch (error: any) {
      message.error('Failed to duplicate funnel: ' + (error.response?.data?.message || error.message));
    }
  };

  const handlePublishFunnel = async (funnel: Funnel) => {
    try {
      await funnelService.publishFunnel(funnel.id);
      message.success('Funnel published successfully');
      fetchFunnels();
    } catch (error: any) {
      message.error('Failed to publish funnel: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUnpublishFunnel = async (funnel: Funnel) => {
    try {
      await funnelService.unpublishFunnel(funnel.id);
      message.success('Funnel unpublished successfully');
      fetchFunnels();
    } catch (error: any) {
      message.error('Failed to unpublish funnel: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteFunnel = (funnel: Funnel) => {
    Modal.confirm({
      title: 'Delete Funnel',
      content: `Are you sure you want to delete "${funnel.name}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await funnelService.deleteFunnel(funnel.id);
          message.success('Funnel deleted successfully');
          fetchFunnels();
        } catch (error: any) {
          message.error('Failed to delete funnel: ' + (error.response?.data?.message || error.message));
        }
      },
    });
  };

  const getActionMenu = (funnel: Funnel): MenuProps => ({
    items: [
      {
        key: 'builder',
        icon: <EditOutlined />,
        label: 'Open Builder',
        onClick: () => handleViewBuilder(funnel),
      },
      {
        key: 'analytics',
        icon: <LineChartOutlined />,
        label: 'View Analytics',
        onClick: () => handleViewAnalytics(funnel),
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit Settings',
        onClick: () => handleEditFunnel(funnel),
      },
      {
        key: 'duplicate',
        icon: <CopyOutlined />,
        label: 'Duplicate',
        onClick: () => handleDuplicateFunnel(funnel),
      },
      {
        type: 'divider',
      },
      funnel.status === FunnelStatus.ACTIVE
        ? {
            key: 'unpublish',
            icon: <PauseCircleOutlined />,
            label: 'Unpublish',
            onClick: () => handleUnpublishFunnel(funnel),
          }
        : {
            key: 'publish',
            icon: <RocketOutlined />,
            label: 'Publish',
            onClick: () => handlePublishFunnel(funnel),
          },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete',
        danger: true,
        onClick: () => handleDeleteFunnel(funnel),
      },
    ],
  });

  const getStatusTag = (status: FunnelStatus) => {
    const statusConfig = {
      [FunnelStatus.ACTIVE]: { color: 'green', text: 'Active' },
      [FunnelStatus.DRAFT]: { color: 'default', text: 'Draft' },
      [FunnelStatus.PAUSED]: { color: 'orange', text: 'Paused' },
      [FunnelStatus.ARCHIVED]: { color: 'red', text: 'Archived' },
    };
    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns: TableProps<Funnel>['columns'] = [
    {
      title: 'Funnel Name',
      dataIndex: 'name',
      key: 'name',
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.name.toLowerCase().includes((value as string).toLowerCase()) ||
        (record.description || '').toLowerCase().includes((value as string).toLowerCase()),
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.description && (
            <div style={{ fontSize: 12, color: '#999' }}>{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Active', value: FunnelStatus.ACTIVE },
        { text: 'Draft', value: FunnelStatus.DRAFT },
        { text: 'Paused', value: FunnelStatus.PAUSED },
        { text: 'Archived', value: FunnelStatus.ARCHIVED },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Pages',
      dataIndex: 'pages',
      key: 'pages',
      width: 100,
      render: (pages: any[]) => pages?.length || 0,
    },
    {
      title: 'Views',
      dataIndex: 'totalViews',
      key: 'totalViews',
      width: 120,
      render: (value) => value?.toLocaleString() || 0,
      sorter: (a, b) => (a.totalViews || 0) - (b.totalViews || 0),
    },
    {
      title: 'Conversions',
      dataIndex: 'totalConversions',
      key: 'totalConversions',
      width: 120,
      render: (value) => value?.toLocaleString() || 0,
      sorter: (a, b) => (a.totalConversions || 0) - (b.totalConversions || 0),
    },
    {
      title: 'Conv. Rate',
      dataIndex: 'conversionRate',
      key: 'conversionRate',
      width: 120,
      render: (value) => `${(value || 0).toFixed(2)}%`,
      sorter: (a, b) => (a.conversionRate || 0) - (b.conversionRate || 0),
    },
    {
      title: 'Revenue',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      width: 120,
      render: (value) => `$${(value || 0).toLocaleString()}`,
      sorter: (a, b) => (a.totalRevenue || 0) - (b.totalRevenue || 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewBuilder(record)}
          >
            Open
          </Button>
          <Dropdown menu={getActionMenu(record)} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const filteredFunnels = funnels || [];

  // Calculate overview stats
  const totalViews = (funnels || []).reduce((sum, f) => sum + (f.totalViews || 0), 0);
  const totalConversions = (funnels || []).reduce((sum, f) => sum + (f.totalConversions || 0), 0);
  const totalRevenue = (funnels || []).reduce((sum, f) => sum + (f.totalRevenue || 0), 0);
  const avgConversionRate = funnels && funnels.length > 0
    ? funnels.reduce((sum, f) => sum + (f.conversionRate || 0), 0) / funnels.length
    : 0;

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="Total Funnels" value={(funnels || []).length} />
          </Col>
          <Col span={6}>
            <Statistic title="Total Views" value={totalViews} />
          </Col>
          <Col span={6}>
            <Statistic title="Total Conversions" value={totalConversions} />
          </Col>
          <Col span={6}>
            <Statistic
              title="Avg Conversion Rate"
              value={avgConversionRate}
              precision={2}
              suffix="%"
            />
          </Col>
        </Row>
      </Card>

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Funnels
              </Title>
              <Text type="secondary">
                Build high-converting funnels with our visual builder
              </Text>
            </div>
            <Space wrap>
              <Tooltip title="Browse pre-built funnel templates">
                <Button
                  icon={<ThunderboltOutlined />}
                  onClick={() => setIsTemplateLibraryVisible(true)}
                  size="large"
                >
                  Templates
                </Button>
              </Tooltip>
              <Tooltip title="Connect your tools and integrations">
                <Button
                  icon={<ApiOutlined />}
                  onClick={() => setIsIntegrationHubVisible(true)}
                  size="large"
                >
                  Integrations
                </Button>
              </Tooltip>
              <Tooltip title="Get expert funnel advice from AI coach">
                <Button
                  icon={<RobotOutlined />}
                  onClick={() => setIsAICoachVisible(true)}
                  size="large"
                  style={{ borderColor: '#6366f1', color: '#6366f1' }}
                >
                  AI Coach
                </Button>
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateFunnel}
                size="large"
              >
                Create Funnel
              </Button>
            </Space>
          </div>

          <Input
            placeholder="Search funnels..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
          />

          <Table
            columns={columns}
            dataSource={filteredFunnels}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              onChange: (page, pageSize) => {
                setPagination((prev) => ({ ...prev, current: page, pageSize: pageSize || 10 }));
              },
            }}
            scroll={{ x: 1200 }}
          />
        </Space>
      </Card>

      <FunnelFormModal
        visible={isModalVisible}
        funnel={editingFunnel}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingFunnel(null);
        }}
        onSuccess={() => {
          setIsModalVisible(false);
          setEditingFunnel(null);
          fetchFunnels();
        }}
      />

      <FunnelTemplateLibrary
        visible={isTemplateLibraryVisible}
        onCancel={() => setIsTemplateLibraryVisible(false)}
        onSelectTemplate={(templateId) => {
          setIsTemplateLibraryVisible(false);
          message.success(`Creating funnel from ${templateId} template...`);
          // TODO: Implement template-based funnel creation
          handleCreateFunnel();
        }}
      />

      <IntegrationHub
        visible={isIntegrationHubVisible}
        onCancel={() => setIsIntegrationHubVisible(false)}
      />

      <AIFunnelCoach
        visible={isAICoachVisible}
        onClose={() => setIsAICoachVisible(false)}
        funnelType="general"
        funnelData={funnels}
      />
    </div>
  );
};

export default FunnelsPage;
