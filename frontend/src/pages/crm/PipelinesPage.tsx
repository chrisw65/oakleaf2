import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  message,
  Typography,
  List,
  Tag,
  Modal,
  Dropdown,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { Pipeline, crmService } from '../../services/crmService';
import PipelineFormModal from '../../components/crm/PipelineFormModal';

const { Title } = Typography;

const PipelinesPage: React.FC = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);

  useEffect(() => {
    fetchPipelines();
  }, []);

  const fetchPipelines = async () => {
    setLoading(true);
    try {
      const data = await crmService.getPipelines();
      setPipelines(data);
    } catch (error: any) {
      message.error('Failed to load pipelines: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePipeline = () => {
    setEditingPipeline(null);
    setIsModalVisible(true);
  };

  const handleEditPipeline = (pipeline: Pipeline) => {
    setEditingPipeline(pipeline);
    setIsModalVisible(true);
  };

  const handleDeletePipeline = (pipeline: Pipeline) => {
    Modal.confirm({
      title: 'Delete Pipeline',
      content: `Are you sure you want to delete "${pipeline.name}"? This will also delete all opportunities in this pipeline.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await crmService.deletePipeline(pipeline.id);
          message.success('Pipeline deleted successfully');
          fetchPipelines();
        } catch (error: any) {
          message.error('Failed to delete pipeline: ' + (error.response?.data?.message || error.message));
        }
      },
    });
  };

  const handleToggleActive = async (pipeline: Pipeline) => {
    try {
      await crmService.updatePipeline(pipeline.id, { isActive: !pipeline.isActive });
      message.success(`Pipeline ${!pipeline.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchPipelines();
    } catch (error: any) {
      message.error('Failed to update pipeline: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleModalSuccess = () => {
    setIsModalVisible(false);
    setEditingPipeline(null);
    fetchPipelines();
  };

  const getActionMenu = (pipeline: Pipeline): MenuProps => ({
    items: [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit',
        onClick: () => handleEditPipeline(pipeline),
      },
      {
        key: 'toggle',
        icon: pipeline.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />,
        label: pipeline.isActive ? 'Deactivate' : 'Activate',
        onClick: () => handleToggleActive(pipeline),
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete',
        danger: true,
        onClick: () => handleDeletePipeline(pipeline),
      },
    ],
  });

  return (
    <div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>
              Sales Pipelines
            </Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreatePipeline}>
              Create Pipeline
            </Button>
          </div>

          <List
            loading={loading}
            dataSource={pipelines}
            renderItem={(pipeline) => (
              <List.Item
                actions={[
                  <Dropdown menu={getActionMenu(pipeline)} trigger={['click']} key="actions">
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <span>{pipeline.name}</span>
                      {pipeline.isActive ? (
                        <Tag color="green">Active</Tag>
                      ) : (
                        <Tag color="gray">Inactive</Tag>
                      )}
                    </Space>
                  }
                  description={
                    <div>
                      <div>{pipeline.description}</div>
                      <Space style={{ marginTop: 8 }}>
                        <span style={{ fontSize: 12, color: '#999' }}>
                          {pipeline.stages?.length || 0} stages
                        </span>
                        <span style={{ fontSize: 12, color: '#999' }}>•</span>
                        <Space size="small">
                          {pipeline.stages
                            ?.sort((a, b) => a.order - b.order)
                            .map((stage) => (
                              <Tag
                                key={stage.id}
                                color={stage.color || 'blue'}
                                style={{ fontSize: 11 }}
                              >
                                {stage.name}
                              </Tag>
                            ))}
                        </Space>
                      </Space>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Space>
      </Card>

      <PipelineFormModal
        visible={isModalVisible}
        pipeline={editingPipeline}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingPipeline(null);
        }}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default PipelinesPage;
