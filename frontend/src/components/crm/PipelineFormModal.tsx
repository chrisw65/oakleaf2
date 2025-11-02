import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Space, InputNumber, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Pipeline, CreatePipelineDto, crmService } from '../../services/crmService';

const { TextArea } = Input;

interface PipelineFormModalProps {
  visible: boolean;
  pipeline: Pipeline | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const PipelineFormModal: React.FC<PipelineFormModalProps> = ({
  visible,
  pipeline,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (pipeline) {
        form.setFieldsValue({
          name: pipeline.name,
          description: pipeline.description,
        });
      } else {
        form.resetFields();
        // Set default stages for new pipeline
        form.setFieldsValue({
          stages: [
            { name: 'Qualification', probability: 10, color: 'blue' },
            { name: 'Proposal', probability: 30, color: 'cyan' },
            { name: 'Negotiation', probability: 60, color: 'orange' },
            { name: 'Closed Won', probability: 100, color: 'green' },
          ],
        });
      }
    }
  }, [visible, pipeline, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (pipeline) {
        // For edit, we only update name and description
        await crmService.updatePipeline(pipeline.id, {
          name: values.name,
          description: values.description,
        });
        message.success('Pipeline updated successfully');
      } else {
        const data: CreatePipelineDto = {
          name: values.name,
          description: values.description,
          stages: values.stages || [],
        };
        await crmService.createPipeline(data);
        message.success('Pipeline created successfully');
      }

      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation error
        return;
      }
      message.error(
        `Failed to ${pipeline ? 'update' : 'create'} pipeline: ` +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    { label: 'Blue', value: 'blue' },
    { label: 'Cyan', value: 'cyan' },
    { label: 'Green', value: 'green' },
    { label: 'Orange', value: 'orange' },
    { label: 'Purple', value: 'purple' },
    { label: 'Red', value: 'red' },
  ];

  return (
    <Modal
      title={pipeline ? 'Edit Pipeline' : 'Create Pipeline'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        <Form.Item
          label="Pipeline Name"
          name="name"
          rules={[{ required: true, message: 'Please enter pipeline name' }]}
        >
          <Input placeholder="Enter pipeline name" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea rows={3} placeholder="Enter description" />
        </Form.Item>

        {!pipeline && (
          <Form.Item label="Pipeline Stages">
            <Form.List name="stages">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{ display: 'flex', marginBottom: 8 }}
                      align="baseline"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[{ required: true, message: 'Enter stage name' }]}
                        style={{ marginBottom: 0, width: 200 }}
                      >
                        <Input placeholder="Stage name" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'probability']}
                        style={{ marginBottom: 0, width: 120 }}
                      >
                        <InputNumber
                          min={0}
                          max={100}
                          placeholder="Probability"
                          addonAfter="%"
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'color']}
                        style={{ marginBottom: 0, width: 120 }}
                      >
                        <select
                          style={{
                            width: '100%',
                            height: 32,
                            padding: '4px 11px',
                            border: '1px solid #d9d9d9',
                            borderRadius: 6,
                          }}
                        >
                          {colors.map((color) => (
                            <option key={color.value} value={color.value}>
                              {color.label}
                            </option>
                          ))}
                        </select>
                      </Form.Item>

                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Stage
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
        )}

        {pipeline && (
          <div style={{ padding: 12, backgroundColor: '#f0f2f5', borderRadius: 6 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
              Note: To modify stages, please use the pipeline detail page.
            </div>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default PipelineFormModal;
