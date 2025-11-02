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
        description: funnel.description,
        status: funnel.status,
        subdomain: funnel.subdomain,
        domain: funnel.domain,
        trackingCode: funnel.trackingCode,
        pixelCode: funnel.pixelCode,
        gaCode: funnel.gaCode,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, funnel, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditing) {
        const updateData: UpdateFunnelDto = values;
        await funnelService.updateFunnel(funnel.id, updateData);
        message.success('Funnel updated successfully');
      } else {
        const createData: CreateFunnelDto = {
          name: values.name,
          description: values.description,
          subdomain: values.subdomain,
          domain: values.domain,
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
      message.error(
        `Failed to ${isEditing ? 'update' : 'create'} funnel: ` +
          (error.response?.data?.message || error.message)
      );
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
          label="Subdomain"
          name="subdomain"
          help="Your funnel will be accessible at subdomain.yourdomain.com"
        >
          <Input placeholder="e.g., offer" />
        </Form.Item>

        <Form.Item
          label="Custom Domain"
          name="domain"
          help="Use a custom domain for this funnel (optional)"
        >
          <Input placeholder="e.g., myoffer.com" />
        </Form.Item>

        {isEditing && (
          <>
            <Form.Item
              label="Facebook Pixel Code"
              name="pixelCode"
              help="Add your Facebook Pixel ID for tracking"
            >
              <Input placeholder="e.g., 1234567890" />
            </Form.Item>

            <Form.Item
              label="Google Analytics Code"
              name="gaCode"
              help="Add your GA tracking ID (e.g., UA-XXXXX-Y or G-XXXXXXX)"
            >
              <Input placeholder="e.g., G-XXXXXXXXXX" />
            </Form.Item>

            <Form.Item
              label="Custom Tracking Code"
              name="trackingCode"
              help="Add custom HTML/JavaScript for tracking"
            >
              <TextArea
                rows={4}
                placeholder="Paste your tracking code here..."
              />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default FunnelFormModal;
