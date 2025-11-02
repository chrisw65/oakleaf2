import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, message } from 'antd';
import {
  EmailCampaign,
  CreateCampaignDto,
  emailService,
  EmailTemplate,
  Segment,
} from '../../services/emailService';
import dayjs from 'dayjs';

const { Option } = Select;

interface CampaignFormModalProps {
  visible: boolean;
  campaign: EmailCampaign | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const CampaignFormModal: React.FC<CampaignFormModalProps> = ({
  visible,
  campaign,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);

  useEffect(() => {
    if (visible) {
      fetchTemplates();
      fetchSegments();
      if (campaign) {
        form.setFieldsValue({
          name: campaign.name,
          subject: campaign.subject,
          fromName: campaign.fromName,
          fromEmail: campaign.fromEmail,
          replyTo: campaign.replyTo,
          templateId: campaign.templateId,
          segmentId: campaign.segmentId,
          scheduledAt: campaign.scheduledAt ? dayjs(campaign.scheduledAt) : undefined,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, campaign, form]);

  const fetchTemplates = async () => {
    try {
      const response = await emailService.getTemplates(1, 100);
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const fetchSegments = async () => {
    try {
      const data = await emailService.getSegments();
      setSegments(data);
    } catch (error) {
      console.error('Failed to fetch segments:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const data: CreateCampaignDto = {
        name: values.name,
        subject: values.subject,
        fromName: values.fromName,
        fromEmail: values.fromEmail,
        replyTo: values.replyTo,
        templateId: values.templateId,
        segmentId: values.segmentId,
        scheduledAt: values.scheduledAt ? values.scheduledAt.toISOString() : undefined,
      };

      if (campaign) {
        await emailService.updateCampaign(campaign.id, data);
        message.success('Campaign updated successfully');
      } else {
        await emailService.createCampaign(data);
        message.success('Campaign created successfully');
      }

      onSuccess();
    } catch (error: any) {
      if (error.errorFields) return;
      message.error(
        `Failed to ${campaign ? 'update' : 'create'} campaign: ` +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={campaign ? 'Edit Campaign' : 'Create Campaign'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        <Form.Item
          label="Campaign Name"
          name="name"
          rules={[{ required: true, message: 'Please enter campaign name' }]}
        >
          <Input placeholder="Enter campaign name" />
        </Form.Item>

        <Form.Item
          label="Email Subject"
          name="subject"
          rules={[{ required: true, message: 'Please enter subject' }]}
        >
          <Input placeholder="Enter email subject" />
        </Form.Item>

        <Form.Item
          label="From Name"
          name="fromName"
          rules={[{ required: true, message: 'Please enter from name' }]}
        >
          <Input placeholder="e.g., Your Company" />
        </Form.Item>

        <Form.Item
          label="From Email"
          name="fromEmail"
          rules={[
            { required: true, message: 'Please enter from email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input placeholder="e.g., hello@company.com" />
        </Form.Item>

        <Form.Item label="Reply-To Email" name="replyTo">
          <Input placeholder="Optional reply-to email" />
        </Form.Item>

        <Form.Item label="Email Template" name="templateId">
          <Select placeholder="Select template (optional)" allowClear>
            {templates.map((template) => (
              <Option key={template.id} value={template.id}>
                {template.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Recipient Segment" name="segmentId">
          <Select placeholder="Select segment (optional)" allowClear>
            {segments.map((segment) => (
              <Option key={segment.id} value={segment.id}>
                {segment.name} ({segment.contactCount} contacts)
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Schedule For" name="scheduledAt">
          <DatePicker
            showTime
            style={{ width: '100%' }}
            placeholder="Leave empty to save as draft"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CampaignFormModal;
