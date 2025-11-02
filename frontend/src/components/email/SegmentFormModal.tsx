import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { Segment, SegmentType, CreateSegmentDto, emailService } from '../../services/emailService';

const { Option } = Select;
const { TextArea } = Input;

interface SegmentFormModalProps {
  visible: boolean;
  segment: Segment | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const SegmentFormModal: React.FC<SegmentFormModalProps> = ({
  visible,
  segment,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && segment) {
      form.setFieldsValue({
        name: segment.name,
        description: segment.description,
        type: segment.type,
      });
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({ type: SegmentType.DYNAMIC });
    }
  }, [visible, segment, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const data: CreateSegmentDto = {
        name: values.name,
        description: values.description,
        type: values.type,
        conditions: [],
      };

      if (segment) {
        await emailService.updateSegment(segment.id, data);
        message.success('Segment updated successfully');
      } else {
        await emailService.createSegment(data);
        message.success('Segment created successfully');
      }

      onSuccess();
    } catch (error: any) {
      if (error.errorFields) return;
      message.error(
        `Failed to ${segment ? 'update' : 'create'} segment: ` +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={segment ? 'Edit Segment' : 'Create Segment'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        <Form.Item
          label="Segment Name"
          name="name"
          rules={[{ required: true, message: 'Please enter segment name' }]}
        >
          <Input placeholder="Enter segment name" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea rows={3} placeholder="Enter description" />
        </Form.Item>

        <Form.Item
          label="Segment Type"
          name="type"
          rules={[{ required: true, message: 'Please select type' }]}
        >
          <Select placeholder="Select type">
            <Option value={SegmentType.STATIC}>Static - Manually add/remove contacts</Option>
            <Option value={SegmentType.DYNAMIC}>Dynamic - Auto-update based on rules</Option>
          </Select>
        </Form.Item>

        <div style={{ padding: 12, backgroundColor: '#f0f2f5', borderRadius: 6 }}>
          <div style={{ fontSize: 12, color: '#666' }}>
            Note: Advanced condition builder will be available in the segment detail page.
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default SegmentFormModal;
