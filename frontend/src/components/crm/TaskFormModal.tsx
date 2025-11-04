import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, message } from 'antd';
import { Task, TaskType, TaskPriority, CreateTaskDto, UpdateTaskDto, crmService } from '../../services/crmService';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface TaskFormModalProps {
  visible: boolean;
  task?: Task | null;
  contactId?: string;
  opportunityId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  visible,
  task,
  contactId,
  opportunityId,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && task) {
      form.setFieldsValue({
        title: task.title,
        description: task.description,
        taskType: task.taskType,
        priority: task.priority,
        dueDate: task.dueDate ? dayjs(task.dueDate) : undefined,
        startDate: task.startDate ? dayjs(task.startDate) : undefined,
        estimatedDuration: task.estimatedDuration,
        hasReminder: task.hasReminder,
        reminderDate: task.reminderDate ? dayjs(task.reminderDate) : undefined,
      });
    } else if (visible) {
      form.resetFields();
      // Set defaults for new task
      if (contactId) {
        form.setFieldsValue({ contactId });
      }
      if (opportunityId) {
        form.setFieldsValue({ opportunityId });
      }
    }
  }, [visible, task, contactId, opportunityId, form]);

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateTaskDto | UpdateTaskDto = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
        startDate: values.startDate ? values.startDate.toISOString() : undefined,
        reminderDate: values.reminderDate ? values.reminderDate.toISOString() : undefined,
        contactId: contactId || values.contactId,
        opportunityId: opportunityId || values.opportunityId,
      };

      if (task) {
        await crmService.updateTask(task.id, data);
        message.success('Task updated successfully');
      } else {
        await crmService.createTask(data as CreateTaskDto);
        message.success('Task created successfully');
      }

      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error('Failed to save task:', error);
      message.error('Failed to save task');
    }
  };

  return (
    <Modal
      title={task ? 'Edit Task' : 'Create Task'}
      open={visible}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={() => form.submit()}
      width={600}
      okText={task ? 'Update' : 'Create'}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="title"
          label="Task Title"
          rules={[{ required: true, message: 'Please enter task title' }]}
        >
          <Input placeholder="Enter task title" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={3} placeholder="Enter task description" />
        </Form.Item>

        <Form.Item
          name="taskType"
          label="Task Type"
          initialValue={TaskType.TODO}
        >
          <Select placeholder="Select task type">
            <Option value={TaskType.CALL}>Call</Option>
            <Option value={TaskType.EMAIL}>Email</Option>
            <Option value={TaskType.MEETING}>Meeting</Option>
            <Option value={TaskType.FOLLOW_UP}>Follow Up</Option>
            <Option value={TaskType.TODO}>To Do</Option>
            <Option value={TaskType.DEMO}>Demo</Option>
            <Option value={TaskType.PROPOSAL}>Proposal</Option>
            <Option value={TaskType.OTHER}>Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="priority"
          label="Priority"
          initialValue={TaskPriority.MEDIUM}
        >
          <Select placeholder="Select priority">
            <Option value={TaskPriority.LOW}>Low</Option>
            <Option value={TaskPriority.MEDIUM}>Medium</Option>
            <Option value={TaskPriority.HIGH}>High</Option>
            <Option value={TaskPriority.URGENT}>Urgent</Option>
          </Select>
        </Form.Item>

        <Form.Item name="dueDate" label="Due Date">
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: '100%' }}
            placeholder="Select due date"
          />
        </Form.Item>

        <Form.Item name="startDate" label="Start Date">
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: '100%' }}
            placeholder="Select start date"
          />
        </Form.Item>

        <Form.Item name="estimatedDuration" label="Estimated Duration (minutes)">
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            placeholder="Enter estimated duration in minutes"
          />
        </Form.Item>

        <Form.Item name="hasReminder" label="Set Reminder" valuePropName="checked">
          <Select placeholder="Enable reminder">
            <Option value={false}>No Reminder</Option>
            <Option value={true}>Enable Reminder</Option>
          </Select>
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.hasReminder !== currentValues.hasReminder
          }
        >
          {({ getFieldValue }) =>
            getFieldValue('hasReminder') ? (
              <Form.Item name="reminderDate" label="Reminder Date & Time">
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                  placeholder="Select reminder date"
                />
              </Form.Item>
            ) : null
          }
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskFormModal;
