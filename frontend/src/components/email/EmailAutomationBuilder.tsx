import React, { useState } from 'react';
import {
  Drawer,
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Select,
  Input,
  InputNumber,
  Switch,
  Tabs,
  List,
  Divider,
  Row,
  Col,
  Alert,
  Tooltip,
  Modal,
  Form,
  message,
  Timeline,
  Badge,
} from 'antd';
import {
  ThunderboltOutlined,
  PlusOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  SendOutlined,
  BranchesOutlined,
  MailOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  CopyOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SettingOutlined,
  TagOutlined,
  StarOutlined,
  RocketOutlined,
  LineChartOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface AutomationStep {
  id: string;
  type: 'trigger' | 'email' | 'wait' | 'condition' | 'action';
  title: string;
  description: string;
  config: any;
  nextSteps?: string[];
}

interface Automation {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'paused';
  triggerType: string;
  steps: AutomationStep[];
  stats: {
    enrolled: number;
    completed: number;
    active: number;
    conversionRate: string;
  };
}

interface EmailAutomationBuilderProps {
  visible: boolean;
  onClose: () => void;
  automationId?: string;
}

const EmailAutomationBuilder: React.FC<EmailAutomationBuilderProps> = ({
  visible,
  onClose,
  automationId,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('builder');
  const [isEditingStep, setIsEditingStep] = useState(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);

  const [automation, setAutomation] = useState<Automation>({
    id: automationId || 'new',
    name: 'New Automation',
    description: '',
    status: 'draft',
    triggerType: 'signup',
    steps: [],
    stats: {
      enrolled: 0,
      completed: 0,
      active: 0,
      conversionRate: '0%',
    },
  });

  const [steps, setSteps] = useState<AutomationStep[]>([
    {
      id: 'trigger-1',
      type: 'trigger',
      title: 'New Contact Subscribes',
      description: 'When someone subscribes to your list',
      config: {
        listId: 'all',
        tagFilter: [],
      },
    },
  ]);

  // Pre-built automation templates
  const automationTemplates = [
    {
      id: 'welcome-series',
      name: 'Welcome Email Series',
      description: '5-email welcome sequence to onboard new subscribers',
      icon: <RocketOutlined />,
      trigger: 'Contact subscribes',
      steps: 5,
      avgConversion: '28%',
      template: [
        { type: 'trigger', title: 'Contact subscribes to list' },
        { type: 'email', title: 'Welcome Email #1', wait: '0 hours' },
        { type: 'wait', title: 'Wait 1 day' },
        { type: 'email', title: 'Value Email #2', wait: '1 day' },
        { type: 'wait', title: 'Wait 2 days' },
        { type: 'email', title: 'Product Intro #3', wait: '3 days' },
        { type: 'wait', title: 'Wait 2 days' },
        { type: 'email', title: 'Case Study #4', wait: '5 days' },
        { type: 'wait', title: 'Wait 2 days' },
        { type: 'email', title: 'Special Offer #5', wait: '7 days' },
      ],
    },
    {
      id: 'cart-abandonment',
      name: 'Cart Abandonment Recovery',
      description: 'Recover abandoned carts with 3-email sequence',
      icon: <ShoppingCartOutlined />,
      trigger: 'Cart abandoned',
      steps: 4,
      avgConversion: '32%',
      template: [
        { type: 'trigger', title: 'Cart abandoned' },
        { type: 'wait', title: 'Wait 1 hour' },
        { type: 'email', title: 'Reminder: Items waiting' },
        { type: 'wait', title: 'Wait 24 hours' },
        { type: 'email', title: 'Still interested? 10% off' },
        { type: 'wait', title: 'Wait 24 hours' },
        { type: 'email', title: 'Last chance: Items going fast' },
      ],
    },
    {
      id: 'post-purchase',
      name: 'Post-Purchase Follow-up',
      description: 'Engage customers after purchase with reviews and upsells',
      icon: <StarOutlined />,
      trigger: 'Purchase made',
      steps: 4,
      avgConversion: '18%',
      template: [
        { type: 'trigger', title: 'Purchase completed' },
        { type: 'email', title: 'Order confirmation + Thank you' },
        { type: 'wait', title: 'Wait 3 days' },
        { type: 'email', title: 'How\'s it going? Tips & tricks' },
        { type: 'wait', title: 'Wait 7 days' },
        { type: 'email', title: 'Please leave a review' },
        { type: 'wait', title: 'Wait 14 days' },
        { type: 'email', title: 'You might also like...' },
      ],
    },
    {
      id: 're-engagement',
      name: 'Re-engagement Campaign',
      description: 'Win back inactive subscribers with targeted emails',
      icon: <ThunderboltOutlined />,
      trigger: 'No opens for 30 days',
      steps: 3,
      avgConversion: '14%',
      template: [
        { type: 'trigger', title: 'Inactive for 30+ days' },
        { type: 'email', title: 'We miss you! What\'s changed?' },
        { type: 'wait', title: 'Wait 7 days' },
        { type: 'condition', title: 'Did they open?', branches: ['Yes', 'No'] },
        { type: 'email', title: 'Welcome back! Here\'s 25% off', branch: 'Yes' },
        { type: 'email', title: 'Last chance: Stay or unsubscribe', branch: 'No' },
      ],
    },
    {
      id: 'lead-nurture',
      name: 'Lead Nurturing Sequence',
      description: 'Educational drip to convert leads to customers',
      icon: <UserOutlined />,
      trigger: 'Lead downloads content',
      steps: 6,
      avgConversion: '22%',
      template: [
        { type: 'trigger', title: 'Lead downloads resource' },
        { type: 'email', title: 'Deliver resource + Welcome' },
        { type: 'wait', title: 'Wait 2 days' },
        { type: 'email', title: 'Educational content #1' },
        { type: 'wait', title: 'Wait 3 days' },
        { type: 'email', title: 'Case study' },
        { type: 'wait', title: 'Wait 3 days' },
        { type: 'email', title: 'Educational content #2' },
        { type: 'wait', title: 'Wait 4 days' },
        { type: 'email', title: 'Product introduction' },
        { type: 'wait', title: 'Wait 3 days' },
        { type: 'email', title: 'Special offer' },
      ],
    },
    {
      id: 'webinar-sequence',
      name: 'Webinar Registration & Follow-up',
      description: 'Complete webinar funnel from registration to replay',
      icon: <PlayCircleOutlined />,
      trigger: 'Webinar registration',
      steps: 7,
      avgConversion: '35%',
      template: [
        { type: 'trigger', title: 'Contact registers for webinar' },
        { type: 'email', title: 'Registration confirmed' },
        { type: 'wait', title: 'Wait until 24h before' },
        { type: 'email', title: 'Reminder: Webinar tomorrow' },
        { type: 'wait', title: 'Wait until 1h before' },
        { type: 'email', title: 'Starting in 1 hour!' },
        { type: 'wait', title: 'Wait until after webinar' },
        { type: 'condition', title: 'Did they attend?', branches: ['Yes', 'No'] },
        { type: 'email', title: 'Thanks for attending + Offer', branch: 'Yes' },
        { type: 'email', title: 'Missed it? Watch replay', branch: 'No' },
      ],
    },
  ];

  const triggerTypes = [
    { value: 'signup', label: 'Contact Subscribes', icon: <UserOutlined /> },
    { value: 'tag-added', label: 'Tag Added to Contact', icon: <TagOutlined /> },
    { value: 'purchase', label: 'Purchase Made', icon: <ShoppingCartOutlined /> },
    { value: 'cart-abandoned', label: 'Cart Abandoned', icon: <CloseCircleOutlined /> },
    { value: 'link-clicked', label: 'Link Clicked', icon: <CheckCircleOutlined /> },
    { value: 'email-opened', label: 'Email Opened', icon: <MailOutlined /> },
    { value: 'inactive', label: 'Contact Inactive', icon: <PauseCircleOutlined /> },
    { value: 'form-submitted', label: 'Form Submitted', icon: <EditOutlined /> },
  ];

  const stepTypes = [
    {
      type: 'email',
      label: 'Send Email',
      icon: <MailOutlined />,
      color: '#6366f1',
      description: 'Send an email to the contact',
    },
    {
      type: 'wait',
      label: 'Wait / Delay',
      icon: <ClockCircleOutlined />,
      color: '#8b5cf6',
      description: 'Wait for a specified time before next step',
    },
    {
      type: 'condition',
      label: 'Conditional Split',
      icon: <BranchesOutlined />,
      color: '#f59e0b',
      description: 'Branch automation based on conditions',
    },
    {
      type: 'action',
      label: 'Perform Action',
      icon: <ThunderboltOutlined />,
      color: '#10b981',
      description: 'Add tag, update field, or trigger webhook',
    },
  ];

  const handleAddStep = (stepType: string) => {
    const newStep: AutomationStep = {
      id: `step-${Date.now()}`,
      type: stepType as any,
      title: `New ${stepType}`,
      description: 'Configure this step',
      config: {},
    };
    setSteps([...steps, newStep]);
    message.success('Step added successfully');
  };

  const handleDeleteStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
    message.success('Step deleted');
  };

  const handleEditStep = (step: AutomationStep) => {
    setEditingStepId(step.id);
    setIsEditingStep(true);
    form.setFieldsValue(step.config);
  };

  const handleSaveAutomation = () => {
    message.success('Automation saved successfully!');
  };

  const handleActivateAutomation = () => {
    setAutomation({ ...automation, status: 'active' });
    message.success('Automation activated! It will start running immediately.');
  };

  const handleLoadTemplate = (template: any) => {
    message.success(`Loading ${template.name} template...`);
    // In real implementation, this would load the template steps
  };

  const getStepIcon = (type: string) => {
    const stepType = stepTypes.find(st => st.type === type);
    return stepType ? stepType.icon : <CheckCircleOutlined />;
  };

  const getStepColor = (type: string) => {
    const stepType = stepTypes.find(st => st.type === type);
    return stepType ? stepType.color : '#6366f1';
  };

  return (
    <Drawer
      title={
        <Space>
          <ThunderboltOutlined style={{ fontSize: 24, color: '#6366f1' }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Email Automation Builder
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Create powerful automated email sequences
            </Text>
          </div>
        </Space>
      }
      open={visible}
      onClose={onClose}
      width={1000}
      extra={
        <Space>
          <Button onClick={handleSaveAutomation} icon={<CopyOutlined />}>
            Save Draft
          </Button>
          <Button
            type="primary"
            icon={automation.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={handleActivateAutomation}
          >
            {automation.status === 'active' ? 'Pause' : 'Activate'}
          </Button>
        </Space>
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'templates',
            label: (
              <span>
                <RocketOutlined />
                Templates
              </span>
            ),
            children: (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Alert
                  message="Start with a Proven Template"
                  description="Choose from our library of high-converting automation sequences. Each template can be customized to fit your needs."
                  type="info"
                  showIcon
                />

                <Row gutter={[16, 16]}>
                  {automationTemplates.map((template) => (
                    <Col span={24} key={template.id}>
                      <Card
                        hoverable
                        onClick={() => handleLoadTemplate(template)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Space>
                              <div
                                style={{
                                  fontSize: 32,
                                  color: '#6366f1',
                                }}
                              >
                                {template.icon}
                              </div>
                              <div>
                                <Title level={5} style={{ margin: 0 }}>
                                  {template.name}
                                </Title>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {template.description}
                                </Text>
                              </div>
                            </Space>
                            <Tag color="success">{template.avgConversion} avg CVR</Tag>
                          </div>

                          <Divider style={{ margin: '12px 0' }} />

                          <Space size="large">
                            <div>
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                TRIGGER
                              </Text>
                              <div>
                                <Text strong style={{ fontSize: 12 }}>
                                  {template.trigger}
                                </Text>
                              </div>
                            </div>
                            <div>
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                STEPS
                              </Text>
                              <div>
                                <Text strong style={{ fontSize: 12 }}>
                                  {template.steps} emails
                                </Text>
                              </div>
                            </div>
                          </Space>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Space>
            ),
          },
          {
            key: 'builder',
            label: (
              <span>
                <SettingOutlined />
                Builder
              </span>
            ),
            children: (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Automation Settings */}
                <Card title="Automation Settings" size="small">
                  <Form layout="vertical">
                    <Form.Item label="Automation Name" required>
                      <Input
                        value={automation.name}
                        onChange={(e) => setAutomation({ ...automation, name: e.target.value })}
                        placeholder="e.g., Welcome Series"
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item label="Description">
                      <TextArea
                        value={automation.description}
                        onChange={(e) => setAutomation({ ...automation, description: e.target.value })}
                        placeholder="Describe what this automation does"
                        rows={2}
                      />
                    </Form.Item>

                    <Form.Item label="Trigger Event" required>
                      <Select
                        size="large"
                        value={automation.triggerType}
                        onChange={(value) => setAutomation({ ...automation, triggerType: value })}
                        style={{ width: '100%' }}
                      >
                        {triggerTypes.map((trigger) => (
                          <Select.Option key={trigger.value} value={trigger.value}>
                            <Space>
                              {trigger.icon}
                              {trigger.label}
                            </Space>
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Form>
                </Card>

                {/* Add Step Buttons */}
                <Card title="Add Steps" size="small">
                  <Row gutter={[8, 8]}>
                    {stepTypes.map((stepType) => (
                      <Col span={12} key={stepType.type}>
                        <Button
                          block
                          size="large"
                          icon={stepType.icon}
                          onClick={() => handleAddStep(stepType.type)}
                          style={{
                            borderColor: stepType.color,
                            color: stepType.color,
                          }}
                        >
                          {stepType.label}
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </Card>

                {/* Automation Flow */}
                <Card title="Automation Flow" size="small">
                  {steps.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 0' }}>
                      <ThunderboltOutlined style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 16 }} />
                      <Title level={5} type="secondary">
                        No steps added yet
                      </Title>
                      <Text type="secondary">
                        Click the buttons above to add steps to your automation
                      </Text>
                    </div>
                  ) : (
                    <Timeline>
                      {steps.map((step, index) => (
                        <Timeline.Item
                          key={step.id}
                          dot={
                            <div
                              style={{
                                background: getStepColor(step.type),
                                color: 'white',
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 16,
                              }}
                            >
                              {getStepIcon(step.type)}
                            </div>
                          }
                        >
                          <Card
                            size="small"
                            style={{ marginBottom: 16 }}
                            extra={
                              <Space>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditStep(step)}
                                />
                                {step.type !== 'trigger' && (
                                  <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDeleteStep(step.id)}
                                  />
                                )}
                              </Space>
                            }
                          >
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <div>
                                <Text strong>{step.title}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  {step.description}
                                </Text>
                              </div>
                              <Tag color={getStepColor(step.type).replace('#', '')}>
                                {step.type.toUpperCase()}
                              </Tag>
                            </Space>
                          </Card>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  )}
                </Card>

                {steps.length > 0 && (
                  <Alert
                    message="Automation Ready"
                    description="Your automation is configured and ready to activate. Click 'Activate' in the top right to start running this automation."
                    type="success"
                    showIcon
                    icon={<CheckCircleOutlined />}
                  />
                )}
              </Space>
            ),
          },
          {
            key: 'analytics',
            label: (
              <span>
                <LineChartOutlined />
                Analytics
              </span>
            ),
            children: (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card>
                      <Text type="secondary">Contacts Enrolled</Text>
                      <Title level={2} style={{ margin: '8px 0 0 0' }}>
                        {automation.stats.enrolled.toLocaleString()}
                      </Title>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card>
                      <Text type="secondary">Active in Sequence</Text>
                      <Title level={2} style={{ margin: '8px 0 0 0', color: '#6366f1' }}>
                        {automation.stats.active.toLocaleString()}
                      </Title>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card>
                      <Text type="secondary">Completed</Text>
                      <Title level={2} style={{ margin: '8px 0 0 0', color: '#10b981' }}>
                        {automation.stats.completed.toLocaleString()}
                      </Title>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card>
                      <Text type="secondary">Conversion Rate</Text>
                      <Title level={2} style={{ margin: '8px 0 0 0', color: '#f59e0b' }}>
                        {automation.stats.conversionRate}
                      </Title>
                    </Card>
                  </Col>
                </Row>

                {automation.status === 'draft' && (
                  <Alert
                    message="No Analytics Yet"
                    description="Activate this automation to start collecting performance data and analytics."
                    type="info"
                    showIcon
                  />
                )}
              </Space>
            ),
          },
        ]}
      />

      {/* Step Editor Modal */}
      <Modal
        title="Edit Step"
        open={isEditingStep}
        onCancel={() => setIsEditingStep(false)}
        onOk={() => {
          form.submit();
          setIsEditingStep(false);
          message.success('Step updated');
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Step Title" name="title" rules={[{ required: true }]}>
            <Input placeholder="Enter step title" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={3} placeholder="Describe this step" />
          </Form.Item>

          {/* Add more step-specific configuration fields here */}
        </Form>
      </Modal>
    </Drawer>
  );
};

export default EmailAutomationBuilder;
