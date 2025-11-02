import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  List,
  Tag,
  Dropdown,
  Modal,
  message,
  Typography,
  Badge,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  MoreOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Segment, SegmentType, emailService } from '../../services/emailService';
import SegmentFormModal from '../../components/email/SegmentFormModal';

const { Title, Text } = Typography;

const SegmentsPage: React.FC = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    setLoading(true);
    try {
      const data = await emailService.getSegments();
      setSegments(data);
    } catch (error: any) {
      message.error('Failed to load segments: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSegment = () => {
    setEditingSegment(null);
    setIsModalVisible(true);
  };

  const handleEditSegment = (segment: Segment) => {
    setEditingSegment(segment);
    setIsModalVisible(true);
  };

  const handleRefreshSegment = async (segment: Segment) => {
    try {
      await emailService.refreshSegment(segment.id);
      message.success('Segment refreshed successfully');
      fetchSegments();
    } catch (error: any) {
      message.error('Failed to refresh segment: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteSegment = (segment: Segment) => {
    Modal.confirm({
      title: 'Delete Segment',
      content: `Are you sure you want to delete "${segment.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await emailService.deleteSegment(segment.id);
          message.success('Segment deleted successfully');
          fetchSegments();
        } catch (error: any) {
          message.error('Failed to delete segment: ' + (error.response?.data?.message || error.message));
        }
      },
    });
  };

  const getActionMenu = (segment: Segment): MenuProps => ({
    items: [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit',
        onClick: () => handleEditSegment(segment),
      },
      {
        key: 'refresh',
        icon: <ReloadOutlined />,
        label: 'Refresh Count',
        onClick: () => handleRefreshSegment(segment),
        disabled: segment.type === SegmentType.STATIC,
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete',
        danger: true,
        onClick: () => handleDeleteSegment(segment),
      },
    ],
  });

  return (
    <div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>
              Subscriber Segments
            </Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateSegment}>
              Create Segment
            </Button>
          </div>

          <List
            loading={loading}
            dataSource={segments}
            renderItem={(segment) => (
              <List.Item
                actions={[
                  <Dropdown menu={getActionMenu(segment)} trigger={['click']} key="actions">
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Badge count={segment.contactCount} showZero color="#667eea">
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        <TeamOutlined style={{ fontSize: 24 }} />
                      </div>
                    </Badge>
                  }
                  title={
                    <Space>
                      <span>{segment.name}</span>
                      <Tag color={segment.type === SegmentType.DYNAMIC ? 'processing' : 'default'}>
                        {segment.type.toUpperCase()}
                      </Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary">{segment.description || 'No description'}</Text>
                      <div style={{ marginTop: 8 }}>
                        <Text strong>{segment.contactCount}</Text>
                        <Text type="secondary"> contacts</Text>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Space>
      </Card>

      <SegmentFormModal
        visible={isModalVisible}
        segment={editingSegment}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingSegment(null);
        }}
        onSuccess={() => {
          setIsModalVisible(false);
          setEditingSegment(null);
          fetchSegments();
        }}
      />
    </div>
  );
};

export default SegmentsPage;
