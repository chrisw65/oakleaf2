import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Switch, Tabs, message, Space, Button } from 'antd';
import {
  FunnelPage,
  PageType,
  funnelService,
  CreatePageDto,
  UpdatePageDto,
} from '../../services/funnelService';

const { TextArea } = Input;

interface PageEditorModalProps {
  visible: boolean;
  funnelId: string;
  page: FunnelPage | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const PageEditorModal: React.FC<PageEditorModalProps> = ({
  visible,
  funnelId,
  page,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEditing = !!page;

  useEffect(() => {
    if (visible && page) {
      form.setFieldsValue({
        name: page.name,
        slug: page.slug,
        type: page.type,
        template: page.template,
        content: page.content ? JSON.stringify(page.content, null, 2) : '',
        customCss: page.customCss,
        customJs: page.customJs,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        seoKeywords: page.seoKeywords?.join(', '),
        isPublished: page.isPublished,
        abTestEnabled: page.abTestEnabled,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, page, form]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();

      // Parse content JSON
      let contentData = null;
      if (values.content) {
        try {
          contentData = JSON.parse(values.content);
        } catch (e) {
          message.error('Invalid JSON in content field');
          setLoading(false);
          return;
        }
      }

      if (isEditing) {
        const updateData: UpdatePageDto = {
          name: values.name,
          slug: values.slug,
          type: values.type,
          content: contentData,
          customCss: values.customCss,
          customJs: values.customJs,
          seoTitle: values.seoTitle,
          seoDescription: values.seoDescription,
          seoKeywords: values.seoKeywords?.split(',').map((k: string) => k.trim()).filter(Boolean),
          isPublished: values.isPublished,
        };
        await funnelService.updatePage(funnelId, page.id, updateData);
        message.success('Page updated successfully');
      } else {
        const createData: CreatePageDto = {
          name: values.name,
          slug: values.slug,
          type: values.type,
          order: 0, // Will be set by backend
          template: values.template,
          content: contentData,
          seoTitle: values.seoTitle,
          seoDescription: values.seoDescription,
        };
        await funnelService.createPage(funnelId, createData);
        message.success('Page created successfully');
      }

      form.resetFields();
      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation error
        setLoading(false);
        return;
      }
      message.error(
        `Failed to ${isEditing ? 'update' : 'create'} page: ` +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const pageTemplates = [
    { value: 'blank', label: 'Blank Page' },
    { value: 'lead-capture', label: 'Lead Capture' },
    { value: 'sales-letter', label: 'Sales Letter' },
    { value: 'video-sales', label: 'Video Sales Page' },
    { value: 'webinar-registration', label: 'Webinar Registration' },
    { value: 'thank-you', label: 'Thank You Page' },
    { value: 'order-form', label: 'Order Form' },
  ];

  return (
    <Modal
      title={isEditing ? 'Edit Page' : 'Create Page'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText={isEditing ? 'Update' : 'Create'}
      confirmLoading={loading}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: PageType.LANDING,
          template: 'blank',
          isPublished: false,
          abTestEnabled: false,
        }}
      >
        <Tabs defaultActiveKey="general">
          <Tabs.TabPane tab="General" key="general">
            <Form.Item
              label="Page Name"
              name="name"
              rules={[{ required: true, message: 'Please enter page name' }]}
            >
              <Input placeholder="e.g., Homepage" />
            </Form.Item>

            <Form.Item
              label="URL Slug"
              name="slug"
              rules={[
                { required: true, message: 'Please enter URL slug' },
                {
                  pattern: /^[a-z0-9-]+$/,
                  message: 'Slug can only contain lowercase letters, numbers, and hyphens',
                },
              ]}
              help="Will be used in the URL: yourdomain.com/slug"
            >
              <Input placeholder="e.g., homepage" />
            </Form.Item>

            <Form.Item
              label="Page Type"
              name="type"
              rules={[{ required: true, message: 'Please select page type' }]}
            >
              <Select>
                <Select.Option value={PageType.LANDING}>Landing Page</Select.Option>
                <Select.Option value={PageType.OPTIN}>Opt-in Page</Select.Option>
                <Select.Option value={PageType.SALES}>Sales Page</Select.Option>
                <Select.Option value={PageType.UPSELL}>Upsell Page</Select.Option>
                <Select.Option value={PageType.DOWNSELL}>Downsell Page</Select.Option>
                <Select.Option value={PageType.THANK_YOU}>Thank You Page</Select.Option>
                <Select.Option value={PageType.WEBINAR}>Webinar Page</Select.Option>
              </Select>
            </Form.Item>

            {!isEditing && (
              <Form.Item label="Template" name="template">
                <Select>
                  {pageTemplates.map((template) => (
                    <Select.Option key={template.value} value={template.value}>
                      {template.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {isEditing && (
              <Form.Item label="Published" name="isPublished" valuePropName="checked">
                <Switch />
              </Form.Item>
            )}

            {isEditing && (
              <Form.Item
                label="A/B Testing"
                name="abTestEnabled"
                valuePropName="checked"
                help="Enable A/B testing to create variants of this page"
              >
                <Switch />
              </Form.Item>
            )}
          </Tabs.TabPane>

          <Tabs.TabPane tab="Content" key="content">
            <Form.Item
              label="Page Content (JSON)"
              name="content"
              help="JSON structure for the page builder. Leave empty to use template default."
            >
              <TextArea
                rows={12}
                placeholder='{"blocks": [], "styles": {}}'
                style={{ fontFamily: 'monospace' }}
              />
            </Form.Item>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Custom Code" key="code">
            <Form.Item
              label="Custom CSS"
              name="customCss"
              help="Add custom CSS styles for this page"
            >
              <TextArea
                rows={6}
                placeholder=".my-class { color: red; }"
                style={{ fontFamily: 'monospace' }}
              />
            </Form.Item>

            <Form.Item
              label="Custom JavaScript"
              name="customJs"
              help="Add custom JavaScript for this page (without <script> tags)"
            >
              <TextArea
                rows={6}
                placeholder="console.log('Hello');"
                style={{ fontFamily: 'monospace' }}
              />
            </Form.Item>
          </Tabs.TabPane>

          <Tabs.TabPane tab="SEO" key="seo">
            <Form.Item
              label="SEO Title"
              name="seoTitle"
              help="Title tag for search engines (50-60 characters recommended)"
            >
              <Input placeholder="e.g., Amazing Product - Get 50% Off Today" maxLength={100} />
            </Form.Item>

            <Form.Item
              label="SEO Description"
              name="seoDescription"
              help="Meta description for search engines (150-160 characters recommended)"
            >
              <TextArea
                rows={3}
                placeholder="Describe your page for search engines..."
                maxLength={200}
              />
            </Form.Item>

            <Form.Item
              label="SEO Keywords"
              name="seoKeywords"
              help="Comma-separated keywords for search engines"
            >
              <Input placeholder="e.g., product, discount, offer" />
            </Form.Item>
          </Tabs.TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

export default PageEditorModal;
