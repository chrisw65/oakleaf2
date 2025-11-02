import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, DatePicker, message } from 'antd';
import {
  Opportunity,
  Pipeline,
  CreateOpportunityDto,
  OpportunityStatus,
  crmService,
  Contact,
} from '../../services/crmService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface OpportunityFormModalProps {
  visible: boolean;
  opportunity: Opportunity | null;
  pipeline: Pipeline | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const OpportunityFormModal: React.FC<OpportunityFormModalProps> = ({
  visible,
  opportunity,
  pipeline,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    if (visible) {
      fetchContacts();
      if (opportunity) {
        form.setFieldsValue({
          title: opportunity.title,
          contactId: opportunity.contactId,
          pipelineId: opportunity.pipelineId,
          stageId: opportunity.stageId,
          value: opportunity.value,
          currency: opportunity.currency,
          probability: opportunity.probability,
          expectedCloseDate: opportunity.expectedCloseDate ? dayjs(opportunity.expectedCloseDate) : undefined,
          status: opportunity.status,
          description: opportunity.description,
        });
      } else {
        form.resetFields();
        if (pipeline) {
          form.setFieldsValue({
            pipelineId: pipeline.id,
            stageId: pipeline.stages?.[0]?.id,
            currency: 'USD',
            status: OpportunityStatus.OPEN,
          });
        }
      }
    }
  }, [visible, opportunity, pipeline, form]);

  const fetchContacts = async () => {
    try {
      const response = await crmService.getContacts({ limit: 100 });
      setContacts(response.data);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const data: CreateOpportunityDto = {
        title: values.title,
        contactId: values.contactId,
        pipelineId: values.pipelineId,
        stageId: values.stageId,
        value: values.value,
        currency: values.currency || 'USD',
        probability: values.probability,
        expectedCloseDate: values.expectedCloseDate ? values.expectedCloseDate.toISOString() : undefined,
        description: values.description,
      };

      if (opportunity) {
        await crmService.updateOpportunity(opportunity.id, {
          ...data,
          status: values.status,
        });
        message.success('Opportunity updated successfully');
      } else {
        await crmService.createOpportunity(data);
        message.success('Opportunity created successfully');
      }

      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation error
        return;
      }
      message.error(
        `Failed to ${opportunity ? 'update' : 'create'} opportunity: ` +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={opportunity ? 'Edit Opportunity' : 'Add Opportunity'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Please enter title' }]}
        >
          <Input placeholder="Enter opportunity title" />
        </Form.Item>

        <Form.Item label="Contact" name="contactId">
          <Select
            placeholder="Select contact"
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {contacts.map((contact) => (
              <Option key={contact.id} value={contact.id}>
                {contact.firstName} {contact.lastName} - {contact.email}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Stage"
          name="stageId"
          rules={[{ required: true, message: 'Please select stage' }]}
        >
          <Select placeholder="Select stage">
            {pipeline?.stages
              ?.sort((a, b) => a.order - b.order)
              .map((stage) => (
                <Option key={stage.id} value={stage.id}>
                  {stage.name}
                </Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Value"
          name="value"
          rules={[{ required: true, message: 'Please enter value' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            placeholder="Enter opportunity value"
            formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
          />
        </Form.Item>

        <Form.Item label="Currency" name="currency">
          <Select placeholder="Select currency">
            <Option value="USD">USD</Option>
            <Option value="EUR">EUR</Option>
            <Option value="GBP">GBP</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Probability (%)" name="probability">
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            max={100}
            placeholder="Enter win probability"
          />
        </Form.Item>

        <Form.Item label="Expected Close Date" name="expectedCloseDate">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        {opportunity && (
          <Form.Item label="Status" name="status">
            <Select placeholder="Select status">
              <Option value={OpportunityStatus.OPEN}>Open</Option>
              <Option value={OpportunityStatus.WON}>Won</Option>
              <Option value={OpportunityStatus.LOST}>Lost</Option>
            </Select>
          </Form.Item>
        )}

        <Form.Item label="Description" name="description">
          <TextArea rows={4} placeholder="Add description" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OpportunityFormModal;
