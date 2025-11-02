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
  Input,
  Row,
  Col,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  MoreOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { EmailTemplate, emailService } from '../../services/emailService';
import TemplateFormModal from '../../components/email/TemplateFormModal';

const { Title, Text } = Typography;

const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await emailService.getTemplates(1, 100);
      setTemplates(response.data);
    } catch (error: any) {
      message.error('Failed to load templates: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setIsModalVisible(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsModalVisible(true);
  };

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    try {
      await emailService.duplicateTemplate(template.id);
      message.success('Template duplicated successfully');
      fetchTemplates();
    } catch (error: any) {
      message.error('Failed to duplicate template: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteTemplate = (template: EmailTemplate) => {
    Modal.confirm({
      title: 'Delete Template',
      content: `Are you sure you want to delete "${template.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await emailService.deleteTemplate(template.id);
          message.success('Template deleted successfully');
          fetchTemplates();
        } catch (error: any) {
          message.error('Failed to delete template: ' + (error.response?.data?.message || error.message));
        }
      },
    });
  };

  const getActionMenu = (template: EmailTemplate): MenuProps => ({
    items: [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit',
        onClick: () => handleEditTemplate(template),
      },
      {
        key: 'duplicate',
        icon: <CopyOutlined />,
        label: 'Duplicate',
        onClick: () => handleDuplicateTemplate(template),
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete',
        danger: true,
        onClick: () => handleDeleteTemplate(template),
      },
    ],
  });

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>
              Email Templates
            </Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTemplate}>
              Create Template
            </Button>
          </div>

          <Input
            placeholder="Search templates..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
          />

          <Row gutter={[16, 16]}>
            {filteredTemplates.map((template) => (
              <Col key={template.id} xs={24} sm={12} lg={8} xl={6}>
                <Card
                  hoverable
                  cover={
                    <div
                      style={{
                        height: 150,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 24,
                      }}
                    >
                      📧
                    </div>
                  }
                  actions={[
                    <Button type="text" icon={<EditOutlined />} onClick={() => handleEditTemplate(template)}>
                      Edit
                    </Button>,
                    <Dropdown menu={getActionMenu(template)} trigger={['click']}>
                      <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>,
                  ]}
                >
                  <Card.Meta
                    title={template.name}
                    description={
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Text ellipsis style={{ fontSize: 12 }}>
                          {template.description || 'No description'}
                        </Text>
                        <div>
                          {template.isPublic && <Tag color="blue">Public</Tag>}
                          {template.variables && template.variables.length > 0 && (
                            <Tag color="purple">{template.variables.length} variables</Tag>
                          )}
                        </div>
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {filteredTemplates.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: 50, color: '#999' }}>
              {searchText ? 'No templates found' : 'No templates yet. Create your first template!'}
            </div>
          )}
        </Space>
      </Card>

      <TemplateFormModal
        visible={isModalVisible}
        template={editingTemplate}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingTemplate(null);
        }}
        onSuccess={() => {
          setIsModalVisible(false);
          setEditingTemplate(null);
          fetchTemplates();
        }}
      />
    </div>
  );
};

export default TemplatesPage;
