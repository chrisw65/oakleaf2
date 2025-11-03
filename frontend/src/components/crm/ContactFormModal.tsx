import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { Contact, ContactStatus, CreateContactDto, crmService, Tag } from '../../services/crmService';

const { Option } = Select;
const { TextArea } = Input;

interface ContactFormModalProps {
  visible: boolean;
  contact: Contact | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({
  visible,
  contact,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    if (visible) {
      fetchTags();
      if (contact) {
        form.setFieldsValue({
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          jobTitle: contact.jobTitle,
          source: contact.source,
          status: contact.status,
          tagIds: contact.tags?.map((t) => t.id),
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, contact, form]);

  const fetchTags = async () => {
    try {
      const fetchedTags = await crmService.getTags();
      setTags(fetchedTags);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const data: CreateContactDto = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        company: values.company,
        jobTitle: values.jobTitle,
        source: values.source,
        status: values.status || ContactStatus.LEAD,
        tagIds: values.tagIds,
      };

      if (contact) {
        await crmService.updateContact(contact.id, data);
        message.success('Contact updated successfully');
      } else {
        await crmService.createContact(data);
        message.success('Contact created successfully');
      }

      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation error
        return;
      }
      message.error(
        `Failed to ${contact ? 'update' : 'create'} contact: ` +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={contact ? 'Edit Contact' : 'Add Contact'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        <Form.Item
          label="First Name"
          name="firstName"
          rules={[{ required: true, message: 'Please enter first name' }]}
        >
          <Input placeholder="Enter first name" />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[{ required: true, message: 'Please enter last name' }]}
        >
          <Input placeholder="Enter last name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>

        <Form.Item label="Phone" name="phone">
          <Input placeholder="Enter phone number" />
        </Form.Item>

        <Form.Item label="Company" name="company">
          <Input placeholder="Enter company name" />
        </Form.Item>

        <Form.Item label="Job Title" name="jobTitle">
          <Input placeholder="Enter job title" />
        </Form.Item>

        <Form.Item label="Source" name="source">
          <Select placeholder="Select lead source" allowClear>
            <Option value="website">Website</Option>
            <Option value="referral">Referral</Option>
            <Option value="social_media">Social Media</Option>
            <Option value="email_campaign">Email Campaign</Option>
            <Option value="event">Event</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Status" name="status">
          <Select placeholder="Select status">
            <Option value={ContactStatus.LEAD}>Lead</Option>
            <Option value={ContactStatus.PROSPECT}>Prospect</Option>
            <Option value={ContactStatus.CUSTOMER}>Customer</Option>
            <Option value={ContactStatus.INACTIVE}>Inactive</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Tags" name="tagIds">
          <Select mode="multiple" placeholder="Select tags" allowClear>
            {tags.map((tag) => (
              <Option key={tag.id} value={tag.id}>
                {tag.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ContactFormModal;
