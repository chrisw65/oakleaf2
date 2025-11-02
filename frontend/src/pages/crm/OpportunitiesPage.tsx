import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Space, message, Typography, Spin, Empty } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Opportunity, Pipeline, PipelineStage, crmService } from '../../services/crmService';
import OpportunityCard from '../../components/crm/OpportunityCard';
import OpportunityFormModal from '../../components/crm/OpportunityFormModal';

const { Title } = Typography;
const { Option } = Select;

const OpportunitiesPage: React.FC = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);

  useEffect(() => {
    fetchPipelines();
  }, []);

  useEffect(() => {
    if (selectedPipeline) {
      fetchOpportunities();
    }
  }, [selectedPipeline]);

  const fetchPipelines = async () => {
    try {
      const data = await crmService.getPipelines();
      setPipelines(data.filter((p) => p.isActive));
      if (data.length > 0 && data[0].isActive) {
        setSelectedPipeline(data[0]);
      }
    } catch (error: any) {
      message.error('Failed to load pipelines: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchOpportunities = async () => {
    if (!selectedPipeline) return;

    setLoading(true);
    try {
      const data = await crmService.getOpportunities(selectedPipeline.id);
      setOpportunities(data);
    } catch (error: any) {
      message.error('Failed to load opportunities: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const opportunityId = draggableId;
    const newStageId = destination.droppableId;

    try {
      await crmService.moveOpportunity(opportunityId, newStageId);
      fetchOpportunities();
      message.success('Opportunity moved successfully');
    } catch (error: any) {
      message.error('Failed to move opportunity: ' + (error.response?.data?.message || error.message));
    }
  };

  const getOpportunitiesByStage = (stageId: string): Opportunity[] => {
    return opportunities.filter((opp) => opp.stageId === stageId);
  };

  const getTotalValueByStage = (stageId: string): number => {
    return getOpportunitiesByStage(stageId).reduce((sum, opp) => sum + opp.value, 0);
  };

  const handleCreateOpportunity = () => {
    setEditingOpportunity(null);
    setIsModalVisible(true);
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setIsModalVisible(true);
  };

  const handleModalSuccess = () => {
    setIsModalVisible(false);
    setEditingOpportunity(null);
    fetchOpportunities();
  };

  if (!selectedPipeline && pipelines.length === 0) {
    return (
      <Card>
        <Empty
          description="No pipelines found. Please create a pipeline first."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>
              Opportunities
            </Title>
            <Space>
              <Select
                style={{ width: 200 }}
                value={selectedPipeline?.id}
                onChange={(value) => {
                  const pipeline = pipelines.find((p) => p.id === value);
                  setSelectedPipeline(pipeline || null);
                }}
              >
                {pipelines.map((pipeline) => (
                  <Option key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </Option>
                ))}
              </Select>
              <Button icon={<ReloadOutlined />} onClick={fetchOpportunities}>
                Refresh
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateOpportunity}>
                Add Opportunity
              </Button>
            </Space>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 50 }}>
              <Spin size="large" />
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
                {selectedPipeline?.stages
                  ?.sort((a, b) => a.order - b.order)
                  .map((stage) => (
                    <Droppable key={stage.id} droppableId={stage.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          style={{
                            minWidth: 300,
                            backgroundColor: snapshot.isDraggingOver ? '#f0f2f5' : '#fafafa',
                            borderRadius: 8,
                            padding: 16,
                          }}
                        >
                          <div style={{ marginBottom: 16 }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <Title level={5} style={{ margin: 0 }}>
                                {stage.name}
                              </Title>
                              <span style={{ color: '#999', fontSize: 12 }}>
                                {getOpportunitiesByStage(stage.id).length}
                              </span>
                            </div>
                            <div style={{ color: '#52c41a', fontSize: 14, marginTop: 4 }}>
                              ${getTotalValueByStage(stage.id).toLocaleString()}
                            </div>
                          </div>

                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            {getOpportunitiesByStage(stage.id).map((opportunity, index) => (
                              <Draggable
                                key={opportunity.id}
                                draggableId={opportunity.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <OpportunityCard
                                      opportunity={opportunity}
                                      onEdit={handleEditOpportunity}
                                      onRefresh={fetchOpportunities}
                                      isDragging={snapshot.isDragging}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </Space>
                        </div>
                      )}
                    </Droppable>
                  ))}
              </div>
            </DragDropContext>
          )}
        </Space>
      </Card>

      <OpportunityFormModal
        visible={isModalVisible}
        opportunity={editingOpportunity}
        pipeline={selectedPipeline}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingOpportunity(null);
        }}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default OpportunitiesPage;
