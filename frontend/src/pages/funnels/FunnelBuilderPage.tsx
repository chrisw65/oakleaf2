import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  message,
  Breadcrumb,
  Tag,
  Empty,
  Modal,
  Dropdown,
  Row,
  Col,
  Statistic,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined,
  ArrowRightOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LineChartOutlined,
  SettingOutlined,
  RocketOutlined,
  MoreOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  Funnel,
  FunnelPage,
  PageType,
  funnelService,
} from '../../services/funnelService';
import PageEditorModal from '../../components/funnels/PageEditorModal';
import FunnelFormModal from '../../components/funnels/FunnelFormModal';

const { Title, Text } = Typography;

const FunnelBuilderPage: React.FC = () => {
  const { funnelId } = useParams<{ funnelId: string }>();
  const navigate = useNavigate();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [pages, setPages] = useState<FunnelPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPageModalVisible, setIsPageModalVisible] = useState(false);
  const [isFunnelModalVisible, setIsFunnelModalVisible] = useState(false);
  const [editingPage, setEditingPage] = useState<FunnelPage | null>(null);

  useEffect(() => {
    if (funnelId) {
      fetchFunnel();
      fetchPages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funnelId]);

  const fetchFunnel = async () => {
    if (!funnelId) return;
    try {
      const data = await funnelService.getFunnel(funnelId);
      setFunnel(data);
    } catch (error: any) {
      message.error('Failed to load funnel: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchPages = async () => {
    if (!funnelId) return;
    setLoading(true);
    try {
      const data = await funnelService.getPages(funnelId);
      setPages(data.sort((a, b) => a.order - b.order));
    } catch (error: any) {
      message.error('Failed to load pages: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = () => {
    setEditingPage(null);
    setIsPageModalVisible(true);
  };

  const handleEditPage = (page: FunnelPage) => {
    setEditingPage(page);
    setIsPageModalVisible(true);
  };

  const handleEditFunnel = () => {
    setIsFunnelModalVisible(true);
  };

  const handleDeletePage = (page: FunnelPage) => {
    Modal.confirm({
      title: 'Delete Page',
      content: `Are you sure you want to delete "${page.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        if (!funnelId) return;
        try {
          await funnelService.deletePage(funnelId, page.id);
          message.success('Page deleted successfully');
          fetchPages();
        } catch (error: any) {
          message.error('Failed to delete page: ' + (error.response?.data?.message || error.message));
        }
      },
    });
  };

  const handlePublishPage = async (page: FunnelPage) => {
    if (!funnelId) return;
    try {
      await funnelService.publishPage(funnelId, page.id);
      message.success('Page published successfully');
      fetchPages();
    } catch (error: any) {
      message.error('Failed to publish page: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUnpublishPage = async (page: FunnelPage) => {
    if (!funnelId) return;
    try {
      await funnelService.unpublishPage(funnelId, page.id);
      message.success('Page unpublished successfully');
      fetchPages();
    } catch (error: any) {
      message.error('Failed to unpublish page: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !funnelId) return;

    const items = Array.from(pages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately
    setPages(items);

    // Update order on server
    try {
      const pageOrders = items.map((page, index) => ({
        id: page.id,
        order: index,
      }));
      await funnelService.reorderPages(funnelId, pageOrders);
      message.success('Page order updated');
    } catch (error: any) {
      message.error('Failed to update page order');
      // Revert on error
      fetchPages();
    }
  };

  const getPageTypeIcon = (type: PageType) => {
    const icons: Record<PageType, string> = {
      [PageType.LANDING]: '🎯',
      [PageType.OPTIN]: '📧',
      [PageType.SALES]: '💳',
      [PageType.UPSELL]: '⬆️',
      [PageType.DOWNSELL]: '⬇️',
      [PageType.THANK_YOU]: '✅',
      [PageType.WEBINAR]: '🎥',
    };
    return icons[type] || '📄';
  };

  const getPageTypeLabel = (type: PageType) => {
    return type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getActionMenu = (page: FunnelPage): MenuProps => ({
    items: [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit Page',
        onClick: () => handleEditPage(page),
      },
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Preview',
        onClick: () => window.open(`/preview/${funnelId}/${page.id}`, '_blank'),
      },
      {
        key: 'analytics',
        icon: <LineChartOutlined />,
        label: 'View Analytics',
        onClick: () => navigate(`/funnels/${funnelId}/pages/${page.id}/analytics`),
      },
      {
        type: 'divider',
      },
      page.isPublished
        ? {
            key: 'unpublish',
            icon: <RocketOutlined />,
            label: 'Unpublish',
            onClick: () => handleUnpublishPage(page),
          }
        : {
            key: 'publish',
            icon: <RocketOutlined />,
            label: 'Publish',
            onClick: () => handlePublishPage(page),
          },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete',
        danger: true,
        onClick: () => handleDeletePage(page),
      },
    ],
  });

  if (!funnel) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link to="/funnels">Funnels</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{funnel.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0 }}>
                {funnel.name}
              </Title>
              {funnel.description && (
                <Text type="secondary">{funnel.description}</Text>
              )}
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<SettingOutlined />} onClick={handleEditFunnel}>
                Settings
              </Button>
              <Button
                icon={<LineChartOutlined />}
                onClick={() => navigate(`/funnels/${funnelId}/analytics`)}
              >
                Analytics
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="Total Pages" value={pages.length} />
          </Col>
          <Col span={6}>
            <Statistic title="Total Views" value={funnel.totalViews || 0} />
          </Col>
          <Col span={6}>
            <Statistic title="Conversions" value={funnel.totalConversions || 0} />
          </Col>
          <Col span={6}>
            <Statistic
              title="Conversion Rate"
              value={funnel.conversionRate || 0}
              precision={2}
              suffix="%"
            />
          </Col>
        </Row>
      </Card>

      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>
              Funnel Flow
            </Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreatePage}>
              Add Page
            </Button>
          </div>

          {pages.length === 0 ? (
            <Empty
              description="No pages yet. Create your first page to get started!"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreatePage}>
                Create First Page
              </Button>
            </Empty>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="pages" direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '16px 0' }}
                  >
                    {pages.map((page, index) => (
                      <React.Fragment key={page.id}>
                        <Draggable draggableId={page.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <Card
                                hoverable
                                style={{
                                  width: 280,
                                  cursor: 'move',
                                  backgroundColor: snapshot.isDragging ? '#f0f0f0' : 'white',
                                  border: page.isPublished ? '2px solid #52c41a' : '1px solid #d9d9d9',
                                }}
                                bodyStyle={{ padding: 16 }}
                              >
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Space>
                                      <span style={{ fontSize: 24 }}>
                                        {getPageTypeIcon(page.type)}
                                      </span>
                                      <div>
                                        <div style={{ fontWeight: 500, fontSize: 16 }}>
                                          {page.name}
                                        </div>
                                        <Tag color="blue" style={{ marginTop: 4 }}>
                                          {getPageTypeLabel(page.type)}
                                        </Tag>
                                      </div>
                                    </Space>
                                    <Dropdown menu={getActionMenu(page)} trigger={['click']}>
                                      <Button type="text" size="small" icon={<MoreOutlined />} />
                                    </Dropdown>
                                  </div>

                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999', marginTop: 8 }}>
                                    <div>
                                      <div>Views: {page.views?.toLocaleString() || 0}</div>
                                      <div>Conv: {page.conversions?.toLocaleString() || 0}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                      <div>Rate: {(page.conversionRate || 0).toFixed(1)}%</div>
                                      {page.isPublished ? (
                                        <Tag color="success" style={{ marginTop: 4 }}>Published</Tag>
                                      ) : (
                                        <Tag color="default" style={{ marginTop: 4 }}>Draft</Tag>
                                      )}
                                    </div>
                                  </div>

                                  <Button
                                    type="primary"
                                    block
                                    icon={<EditOutlined />}
                                    onClick={() => handleEditPage(page)}
                                  >
                                    Edit Page
                                  </Button>
                                </Space>
                              </Card>
                            </div>
                          )}
                        </Draggable>

                        {index < pages.length - 1 && (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <ArrowRightOutlined style={{ fontSize: 24, color: '#999' }} />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </Space>
      </Card>

      <PageEditorModal
        visible={isPageModalVisible}
        funnelId={funnelId || ''}
        page={editingPage}
        onCancel={() => {
          setIsPageModalVisible(false);
          setEditingPage(null);
        }}
        onSuccess={() => {
          setIsPageModalVisible(false);
          setEditingPage(null);
          fetchPages();
        }}
      />

      <FunnelFormModal
        visible={isFunnelModalVisible}
        funnel={funnel}
        onCancel={() => setIsFunnelModalVisible(false)}
        onSuccess={() => {
          setIsFunnelModalVisible(false);
          fetchFunnel();
        }}
      />
    </div>
  );
};

export default FunnelBuilderPage;
