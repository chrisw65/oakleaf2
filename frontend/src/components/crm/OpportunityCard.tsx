import React from 'react';
import { Card, Tag, Dropdown, Button, Modal, message, Space } from 'antd';
import type { MenuProps } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, DollarOutlined, CalendarOutlined } from '@ant-design/icons';
import { Opportunity, OpportunityStatus, crmService } from '../../services/crmService';
import { format } from 'date-fns';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onEdit: (opportunity: Opportunity) => void;
  onRefresh: () => void;
  isDragging?: boolean;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onEdit,
  onRefresh,
  isDragging,
}) => {
  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Opportunity',
      content: `Are you sure you want to delete "${opportunity.title}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await crmService.deleteOpportunity(opportunity.id);
          message.success('Opportunity deleted successfully');
          onRefresh();
        } catch (error: any) {
          message.error('Failed to delete opportunity: ' + (error.response?.data?.message || error.message));
        }
      },
    });
  };

  const getStatusColor = (status: OpportunityStatus): string => {
    const colors: Record<OpportunityStatus, string> = {
      [OpportunityStatus.OPEN]: 'blue',
      [OpportunityStatus.WON]: 'green',
      [OpportunityStatus.LOST]: 'red',
    };
    return colors[status];
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: () => onEdit(opportunity),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: handleDelete,
    },
  ];

  return (
    <Card
      size="small"
      style={{
        cursor: 'grab',
        backgroundColor: isDragging ? '#e6f7ff' : 'white',
        border: isDragging ? '2px solid #1890ff' : '1px solid #d9d9d9',
      }}
      bodyStyle={{ padding: 12 }}
      extra={
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </Dropdown>
      }
    >
      <div>
        <div style={{ fontWeight: 500, marginBottom: 8 }}>{opportunity.title}</div>

        {opportunity.contact && (
          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
            {opportunity.contact.firstName} {opportunity.contact.lastName}
          </div>
        )}

        <div style={{ marginTop: 8, marginBottom: 8 }}>
          <Space size="small">
            <DollarOutlined style={{ color: '#52c41a' }} />
            <span style={{ fontWeight: 500, color: '#52c41a' }}>
              ${opportunity.value.toLocaleString()}
            </span>
          </Space>
        </div>

        {opportunity.expectedCloseDate && (
          <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
            <CalendarOutlined /> {format(new Date(opportunity.expectedCloseDate), 'MMM dd, yyyy')}
          </div>
        )}

        <div style={{ marginTop: 8 }}>
          <Tag color={getStatusColor(opportunity.status)} style={{ fontSize: 11 }}>
            {opportunity.status.toUpperCase()}
          </Tag>
          {opportunity.probability !== undefined && (
            <Tag color="purple" style={{ fontSize: 11 }}>
              {opportunity.probability}% probability
            </Tag>
          )}
        </div>
      </div>
    </Card>
  );
};

export default OpportunityCard;
