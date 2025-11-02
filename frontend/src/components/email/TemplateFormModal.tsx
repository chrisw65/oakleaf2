import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Checkbox, message } from 'antd';
import { EmailTemplate, CreateTemplateDto, emailService } from '../../services/emailService';

const { TextArea } = Input;

interface TemplateFormModalProps {
  visible: boolean;
  template: EmailTemplate | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const TemplateFormModal: React.FC<TemplateFormModalProps> = ({
  visible,
  template,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && template) {
      form.setFieldsValue({
        name: template.name,
        description: template.description,
        subject: template.subject,
        content: template.content,
        isPublic: template.isPublic,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, template, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const data: CreateTemplateDto = {
        name: values.name,
        description: values.description,
        subject: values.subject,
        content: values.content,
        isPublic: values.isPublic || false,
      };

      if (template) {
        await emailService.updateTemplate(template.id, data);
        message.success('Template updated successfully');
      } else {
        await emailService.createTemplate(data);
        message.success('Template created successfully');
      }

      onSuccess();
    } catch (error: any) {
      if (error.errorFields) return;
      message.error(
        `Failed to ${template ? 'update' : 'create'} template: ` +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={template ? 'Edit Template' : 'Create Template'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        <Form.Item
          label="Template Name"
          name="name"
          rules={[{ required: true, message: 'Please enter template name' }]}
        >
          <Input placeholder="Enter template name" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input placeholder="Enter description" />
        </Form.Item>

        <Form.Item label="Default Subject" name="subject">
          <Input placeholder="Enter default subject line" />
        </Form.Item>

        <Form.Item
          label="Email Content (HTML)"
          name="content"
          rules={[{ required: true, message: 'Please enter content' }]}
        >
          <TextArea
            rows={12}
            placeholder="Enter HTML content. Use {{variable}} for dynamic values."
          />
        </Form.Item>

        <Form.Item name="isPublic" valuePropName="checked">
          <Checkbox>Make this template public (accessible to all users)</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TemplateFormModal;
