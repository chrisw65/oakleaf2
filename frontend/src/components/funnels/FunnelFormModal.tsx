import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { Funnel, FunnelStatus, funnelService, CreateFunnelDto, UpdateFunnelDto } from '../../services/funnelService';

const { TextArea } = Input;

interface FunnelFormModalProps {
  visible: boolean;
  funnel: Funnel | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const FunnelFormModal: React.FC<FunnelFormModalProps> = ({
  visible,
  funnel,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const isEditing = !!funnel;

  useEffect(() => {
    if (visible && funnel) {
      form.setFieldsValue({
        name: funnel.name,
        slug: funnel.slug,
        description: funnel.description,
        status: funnel.status,
        customDomain: funnel.customDomain,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, funnel, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditing) {
        const updateData: UpdateFunnelDto = {
          name: values.name,
          slug: values.slug,
          description: values.description,
          status: values.status,
          customDomain: values.customDomain,
        };
        await funnelService.updateFunnel(funnel.id, updateData);
        message.success('Funnel updated successfully');
      } else {
        // Auto-generate slug from name if not provided
        const slug = values.slug || values.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        const createData: CreateFunnelDto = {
          name: values.name,
          slug: slug,
          description: values.description,
          customDomain: values.customDomain,
        };
        await funnelService.createFunnel(createData);
        message.success('Funnel created successfully');
      }

      form.resetFields();
      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation error
        return;
      }

      // Extract error message from various possible response formats
      let errorMessage = 'An unexpected error occurred';

      if (error.response?.data) {
        const data = error.response.data;
        // NestJS typically returns { message: string } or { message: string[], error: string, statusCode: number }
        if (typeof data.message === 'string') {
          errorMessage = data.message;
        } else if (Array.isArray(data.message)) {
          errorMessage = data.message.join(', ');
        } else if (data.error) {
          errorMessage = data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      message.error(
        `Failed to ${isEditing ? 'update' : 'create'} funnel: ${errorMessage}`
      );

      console.error('Funnel operation error:', error.response?.data || error);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Edit Funnel' : 'Create Funnel'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText={isEditing ? 'Update' : 'Create'}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: FunnelStatus.DRAFT,
        }}
      >
        <Form.Item
          label="Funnel Name"
          name="name"
          rules={[{ required: true, message: 'Please enter funnel name' }]}
        >
          <Input placeholder="e.g., Lead Magnet Funnel" />
        </Form.Item>

        <Form.Item
          label="URL Slug"
          name="slug"
          help="Auto-generated from name if left empty. Used in funnel URL."
        >
          <Input placeholder="e.g., lead-magnet-funnel" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea
            rows={3}
            placeholder="Describe the purpose of this funnel..."
          />
        </Form.Item>

        {isEditing && (
          <Form.Item label="Status" name="status">
            <Select>
              <Select.Option value={FunnelStatus.DRAFT}>Draft</Select.Option>
              <Select.Option value={FunnelStatus.ACTIVE}>Active</Select.Option>
              <Select.Option value={FunnelStatus.PAUSED}>Paused</Select.Option>
              <Select.Option value={FunnelStatus.ARCHIVED}>Archived</Select.Option>
            </Select>
          </Form.Item>
        )}

        <Form.Item
          label="Custom Domain"
          name="customDomain"
          help="Use a custom domain for this funnel (optional)"
        >
          <Input placeholder="e.g., myoffer.com" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FunnelFormModal;
