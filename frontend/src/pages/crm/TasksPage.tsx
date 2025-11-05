import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Space,
  Tag,
  Select,
  Input,
  Popconfirm,
  message,
  Badge,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { Task, TaskStatus, TaskPriority, crmService } from '../../services/crmService';
import TaskFormModal from '../../components/crm/TaskFormModal';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Option } = Select;

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<{
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
    overdue?: boolean;
    dueToday?: boolean;
  }>({});
  const limit = 20;

  useEffect(() => {
    loadTasks();
    loadStats();
  }, [page, filters]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await crmService.getMyTasks({
        status: filters.status,
        page,
        limit,
      });
      setTasks(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      message.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await crmService.getMyTaskStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleCreate = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleDelete = async (taskId: string) => {
    try {
      await crmService.deleteTask(taskId);
      message.success('Task deleted successfully');
      loadTasks();
      loadStats();
    } catch (error) {
      console.error('Failed to delete task:', error);
      message.error('Failed to delete task');
    }
  };

  const handleComplete = async (taskId: string) => {
    try {
      await crmService.markTaskComplete(taskId);
      message.success('Task marked as complete');
      loadTasks();
      loadStats();
    } catch (error) {
      console.error('Failed to complete task:', error);
      message.error('Failed to complete task');
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    const colors: Record<TaskPriority, string> = {
      [TaskPriority.LOW]: 'blue',
      [TaskPriority.MEDIUM]: 'orange',
      [TaskPriority.HIGH]: 'red',
      [TaskPriority.URGENT]: 'magenta',
    };
    return colors[priority];
  };

  const getStatusColor = (status: TaskStatus): 'default' | 'processing' | 'success' | 'error' => {
    const colors: Record<TaskStatus, 'default' | 'processing' | 'success' | 'error'> = {
      [TaskStatus.TODO]: 'default',
      [TaskStatus.IN_PROGRESS]: 'processing',
      [TaskStatus.COMPLETED]: 'success',
      [TaskStatus.CANCELLED]: 'error',
    };
    return colors[status];
  };

  const isOverdue = (task: Task) => {
    return task.dueDate && dayjs(task.dueDate).isBefore(dayjs()) && task.status !== TaskStatus.COMPLETED;
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Task) => (
        <Space direction="vertical" size="small">
          <Space>
            {isOverdue(record) && <Badge status="error" />}
            <a onClick={() => handleEdit(record)}>{text}</a>
          </Space>
          {record.description && (
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {record.description.length > 100
                ? record.description.substring(0, 100) + '...'
                : record.description}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'taskType',
      key: 'taskType',
      width: 120,
      render: (type: string) => (
        <Tag>{type.replace(/_/g, ' ').toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: TaskPriority) => (
        <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: TaskStatus) => (
        <Badge status={getStatusColor(status)} text={status.replace(/_/g, ' ').toUpperCase()} />
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 150,
      render: (date?: string) => {
        if (!date) return '-';
        const isPast = dayjs(date).isBefore(dayjs());
        return (
          <Tooltip title={dayjs(date).format('MMM D, YYYY h:mm A')}>
            <span style={{ color: isPast ? '#ff4d4f' : undefined }}>
              {dayjs(date).fromNow()}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Contact',
      dataIndex: 'contact',
      key: 'contact',
      width: 150,
      render: (contact: any) => contact ? `${contact.firstName} ${contact.lastName}` : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: Task) => (
        <Space size="small">
          {record.status !== TaskStatus.COMPLETED && (
            <Tooltip title="Mark Complete">
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleComplete(record.id)}
              />
            </Tooltip>
          )}
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete this task?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, marginBottom: 8 }}>Tasks</h1>
        <p style={{ color: '#8c8c8c', margin: 0 }}>Manage your tasks and follow-ups</p>
      </div>

      {stats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Tasks"
                value={stats.total}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Pending"
                value={stats.pending}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Overdue"
                value={stats.overdue}
                valueStyle={{ color: '#ff4d4f' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Completed"
                value={stats.completed}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Select
              placeholder="Filter by status"
              style={{ width: 150 }}
              allowClear
              value={filters.status}
              onChange={(value) => {
                setFilters({ ...filters, status: value });
                setPage(1);
              }}
            >
              <Option value={TaskStatus.TODO}>To Do</Option>
              <Option value={TaskStatus.IN_PROGRESS}>In Progress</Option>
              <Option value={TaskStatus.COMPLETED}>Completed</Option>
              <Option value={TaskStatus.CANCELLED}>Cancelled</Option>
            </Select>

            <Select
              placeholder="Filter by priority"
              style={{ width: 150 }}
              allowClear
              value={filters.priority}
              onChange={(value) => {
                setFilters({ ...filters, priority: value });
                setPage(1);
              }}
            >
              <Option value={TaskPriority.LOW}>Low</Option>
              <Option value={TaskPriority.MEDIUM}>Medium</Option>
              <Option value={TaskPriority.HIGH}>High</Option>
              <Option value={TaskPriority.URGENT}>Urgent</Option>
            </Select>

            <Button icon={<ReloadOutlined />} onClick={loadTasks} loading={loading}>
              Refresh
            </Button>
          </Space>

          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Create Task
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            onChange: (newPage) => setPage(newPage),
            showTotal: (total) => `Total ${total} tasks`,
          }}
        />
      </Card>

      <TaskFormModal
        visible={showModal}
        task={editingTask}
        onClose={() => {
          setShowModal(false);
          setEditingTask(null);
        }}
        onSuccess={() => {
          setShowModal(false);
          setEditingTask(null);
          loadTasks();
          loadStats();
        }}
      />
    </div>
  );
};

export default TasksPage;
