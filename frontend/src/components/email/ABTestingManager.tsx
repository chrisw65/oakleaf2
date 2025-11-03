import React, { useState } from 'react';
import {
  Modal,
  Card,
  Button,
  Space,
  Typography,
  Input,
  InputNumber,
  Select,
  Radio,
  Form,
  Divider,
  Progress,
  Statistic,
  Row,
  Col,
  Alert,
  Tag,
  List,
  Tooltip,
  message,
  Switch,
} from 'antd';
import {
  ExperimentOutlined,
  PlusOutlined,
  DeleteOutlined,
  TrophyOutlined,
  LineChartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ABTestVariant {
  id: string;
  name: string;
  subjectLine: string;
  previewText?: string;
  percentage: number;
  stats?: {
    sent: number;
    opens: number;
    clicks: number;
    openRate: number;
    clickRate: number;
  };
}

interface ABTest {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'completed';
  testType: 'subject' | 'content' | 'send-time';
  variants: ABTestVariant[];
  testDuration: number; // hours
  winnerMetric: 'open-rate' | 'click-rate' | 'conversion-rate';
  autoSelectWinner: boolean;
  testSize: number; // percentage of list
  remainderAction: 'send-winner' | 'hold';
  startedAt?: Date;
  completedAt?: Date;
  winner?: string; // variant id
}

interface ABTestingManagerProps {
  visible: boolean;
  onClose: () => void;
  campaignId?: string;
  onCreateTest?: (test: ABTest) => void;
}

const ABTestingManager: React.FC<ABTestingManagerProps> = ({
  visible,
  onClose,
  campaignId,
  onCreateTest,
}) => {
  const [form] = Form.useForm();
  const [testType, setTestType] = useState<'subject' | 'content' | 'send-time'>('subject');
  const [variants, setVariants] = useState<ABTestVariant[]>([
    { id: 'variant-a', name: 'Variant A', subjectLine: '', percentage: 50 },
    { id: 'variant-b', name: 'Variant B', subjectLine: '', percentage: 50 },
  ]);
  const [autoSelectWinner, setAutoSelectWinner] = useState(true);
  const [testSize, setTestSize] = useState(50);

  // Mock running test data for demonstration
  const [runningTest] = useState<ABTest>({
    id: 'test-123',
    name: 'Subject Line Test - Holiday Promotion',
    status: 'running',
    testType: 'subject',
    testDuration: 4,
    winnerMetric: 'open-rate',
    autoSelectWinner: true,
    testSize: 50,
    remainderAction: 'send-winner',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    variants: [
      {
        id: 'variant-a',
        name: 'Variant A',
        subjectLine: '🎁 Holiday Sale: 50% Off Everything!',
        percentage: 50,
        stats: {
          sent: 2500,
          opens: 875,
          clicks: 245,
          openRate: 35,
          clickRate: 9.8,
        },
      },
      {
        id: 'variant-b',
        name: 'Variant B',
        subjectLine: 'Your Exclusive Holiday Discount is Ready',
        percentage: 50,
        stats: {
          sent: 2500,
          opens: 1125,
          clicks: 315,
          openRate: 45,
          clickRate: 12.6,
        },
      },
    ],
  });

  const handleAddVariant = () => {
    if (variants.length >= 5) {
      message.warning('Maximum 5 variants allowed');
      return;
    }

    const newVariant: ABTestVariant = {
      id: `variant-${String.fromCharCode(65 + variants.length)}`,
      name: `Variant ${String.fromCharCode(65 + variants.length)}`,
      subjectLine: '',
      percentage: 0,
    };

    const updatedVariants = [...variants, newVariant];
    redistributePercentages(updatedVariants);
  };

  const handleRemoveVariant = (variantId: string) => {
    if (variants.length <= 2) {
      message.warning('Minimum 2 variants required');
      return;
    }

    const updatedVariants = variants.filter(v => v.id !== variantId);
    redistributePercentages(updatedVariants);
  };

  const redistributePercentages = (variantList: ABTestVariant[]) => {
    const evenPercentage = Math.floor(100 / variantList.length);
    const remainder = 100 - (evenPercentage * variantList.length);

    const redistributed = variantList.map((v, index) => ({
      ...v,
      percentage: evenPercentage + (index === 0 ? remainder : 0),
    }));

    setVariants(redistributed);
  };

  const handleUpdateVariant = (variantId: string, field: string, value: any) => {
    setVariants(variants.map(v =>
      v.id === variantId ? { ...v, [field]: value } : v
    ));
  };

  const handleCreateTest = () => {
    form.validateFields().then((values) => {
      const test: ABTest = {
        id: `test-${Date.now()}`,
        name: values.testName,
        status: 'draft',
        testType,
        variants: variants.filter(v => v.subjectLine.trim()),
        testDuration: values.testDuration,
        winnerMetric: values.winnerMetric,
        autoSelectWinner,
        testSize,
        remainderAction: values.remainderAction,
      };

      if (onCreateTest) {
        onCreateTest(test);
      }

      message.success('A/B Test created successfully! Ready to launch.');
      onClose();
    });
  };

  const getWinner = (test: ABTest) => {
    if (!test.variants[0].stats) return null;

    const metric = test.winnerMetric === 'open-rate' ? 'openRate' : 'clickRate';
    const winner = test.variants.reduce((prev, current) =>
      (current.stats?.[metric] || 0) > (prev.stats?.[metric] || 0) ? current : prev
    );

    return winner;
  };

  const getTimeRemaining = (test: ABTest) => {
    if (!test.startedAt) return '0h 0m';
    const elapsed = Date.now() - test.startedAt.getTime();
    const remaining = (test.testDuration * 60 * 60 * 1000) - elapsed;

    if (remaining <= 0) return 'Completed';

    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  };

  const renderRunningTest = () => {
    const winner = getWinner(runningTest);
    const progress = runningTest.startedAt
      ? Math.min(100, ((Date.now() - runningTest.startedAt.getTime()) / (runningTest.testDuration * 60 * 60 * 1000)) * 100)
      : 0;

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          message={
            <Space>
              <ThunderboltOutlined />
              <Text strong>Active A/B Test in Progress</Text>
            </Space>
          }
          description={
            <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
              <Text>{runningTest.name}</Text>
              <Progress percent={Math.floor(progress)} status="active" />
              <Space>
                <ClockCircleOutlined />
                <Text type="secondary">Time remaining: {getTimeRemaining(runningTest)}</Text>
              </Space>
            </Space>
          }
          type="info"
          showIcon={false}
        />

        <Card title="Test Performance" size="small">
          <Row gutter={[16, 16]}>
            {runningTest.variants.map((variant) => {
              const isWinning = winner?.id === variant.id;
              return (
                <Col span={12} key={variant.id}>
                  <Card
                    size="small"
                    style={{
                      borderColor: isWinning ? '#10b981' : undefined,
                      borderWidth: isWinning ? 2 : 1,
                    }}
                    extra={
                      isWinning && (
                        <Tag color="success" icon={<TrophyOutlined />}>
                          Leading
                        </Tag>
                      )
                    }
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text strong>{variant.name}</Text>
                      <Text style={{ fontSize: 12 }} type="secondary">
                        {variant.subjectLine}
                      </Text>

                      <Divider style={{ margin: '8px 0' }} />

                      <Row gutter={[8, 8]}>
                        <Col span={12}>
                          <Statistic
                            title="Sent"
                            value={variant.stats?.sent}
                            valueStyle={{ fontSize: 16 }}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Opens"
                            value={variant.stats?.opens}
                            valueStyle={{ fontSize: 16 }}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Open Rate"
                            value={variant.stats?.openRate}
                            suffix="%"
                            valueStyle={{
                              fontSize: 18,
                              color: isWinning ? '#10b981' : undefined,
                              fontWeight: isWinning ? 'bold' : undefined,
                            }}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Click Rate"
                            value={variant.stats?.clickRate}
                            suffix="%"
                            valueStyle={{ fontSize: 18 }}
                          />
                        </Col>
                      </Row>
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {progress >= 100 && (
            <Alert
              message="Test Completed!"
              description={
                <Space direction="vertical">
                  <Text>
                    Winner: <Text strong>{winner?.name}</Text> with{' '}
                    <Text strong style={{ color: '#10b981' }}>
                      {winner?.stats?.openRate}% open rate
                    </Text>
                  </Text>
                  {runningTest.autoSelectWinner && (
                    <Text type="secondary">
                      Winner will be automatically sent to remaining {100 - runningTest.testSize}% of your list
                    </Text>
                  )}
                </Space>
              }
              type="success"
              showIcon
              icon={<TrophyOutlined />}
              style={{ marginTop: 16 }}
            />
          )}
        </Card>
      </Space>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <ExperimentOutlined style={{ fontSize: 24, color: '#6366f1' }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>
              A/B Testing Manager
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Test variations and automatically send the winner
            </Text>
          </div>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={900}
      footer={null}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Show running test if exists */}
        {runningTest && renderRunningTest()}

        <Divider />

        {/* Create New Test */}
        <Card title="Create New A/B Test" size="small">
          <Form form={form} layout="vertical">
            <Form.Item
              label="Test Name"
              name="testName"
              rules={[{ required: true, message: 'Please enter test name' }]}
            >
              <Input placeholder="e.g., Subject Line Test - Holiday Campaign" size="large" />
            </Form.Item>

            <Form.Item label="Test Type" required>
              <Radio.Group value={testType} onChange={(e) => setTestType(e.target.value)} size="large">
                <Radio.Button value="subject">Subject Line</Radio.Button>
                <Radio.Button value="content">Email Content</Radio.Button>
                <Radio.Button value="send-time">Send Time</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Divider />

            {/* Variants */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text strong>Test Variants ({variants.length})</Text>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={handleAddVariant}
                  disabled={variants.length >= 5}
                >
                  Add Variant
                </Button>
              </div>

              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {variants.map((variant, index) => (
                  <Card size="small" key={variant.id}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space>
                          <Text strong>{variant.name}</Text>
                          <Tag>{variant.percentage}% of test group</Tag>
                        </Space>
                        {variants.length > 2 && (
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveVariant(variant.id)}
                          />
                        )}
                      </div>

                      {testType === 'subject' && (
                        <Input
                          placeholder="Enter subject line..."
                          value={variant.subjectLine}
                          onChange={(e) => handleUpdateVariant(variant.id, 'subjectLine', e.target.value)}
                          size="large"
                        />
                      )}

                      {testType === 'content' && (
                        <TextArea
                          placeholder="Enter email content..."
                          rows={3}
                          value={variant.subjectLine}
                          onChange={(e) => handleUpdateVariant(variant.id, 'subjectLine', e.target.value)}
                        />
                      )}

                      {testType === 'send-time' && (
                        <Input
                          type="time"
                          value={variant.subjectLine}
                          onChange={(e) => handleUpdateVariant(variant.id, 'subjectLine', e.target.value)}
                          size="large"
                        />
                      )}
                    </Space>
                  </Card>
                ))}
              </Space>
            </div>

            <Divider />

            {/* Test Configuration */}
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  label={
                    <Space>
                      <Text>Test Size</Text>
                      <Tooltip title="Percentage of your list to include in the A/B test">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                  required
                >
                  <InputNumber
                    min={10}
                    max={100}
                    value={testSize}
                    onChange={(value) => setTestSize(value || 50)}
                    addonAfter="%"
                    style={{ width: '100%' }}
                    size="large"
                  />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    Remaining {100 - testSize}% will receive the winner
                  </Text>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Test Duration"
                  name="testDuration"
                  initialValue={4}
                  rules={[{ required: true }]}
                >
                  <Select size="large">
                    <Select.Option value={1}>1 hour</Select.Option>
                    <Select.Option value={2}>2 hours</Select.Option>
                    <Select.Option value={4}>4 hours</Select.Option>
                    <Select.Option value={8}>8 hours</Select.Option>
                    <Select.Option value={24}>24 hours</Select.Option>
                    <Select.Option value={48}>48 hours</Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Winner Metric"
                  name="winnerMetric"
                  initialValue="open-rate"
                  rules={[{ required: true }]}
                >
                  <Select size="large">
                    <Select.Option value="open-rate">
                      <Space>
                        <LineChartOutlined />
                        Open Rate
                      </Space>
                    </Select.Option>
                    <Select.Option value="click-rate">
                      <Space>
                        <ThunderboltOutlined />
                        Click Rate
                      </Space>
                    </Select.Option>
                    <Select.Option value="conversion-rate">
                      <Space>
                        <TrophyOutlined />
                        Conversion Rate
                      </Space>
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="After Test Completes"
                  name="remainderAction"
                  initialValue="send-winner"
                  rules={[{ required: true }]}
                >
                  <Select size="large">
                    <Select.Option value="send-winner">Send winner to remainder</Select.Option>
                    <Select.Option value="hold">Hold for manual review</Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item>
                  <Space>
                    <Switch
                      checked={autoSelectWinner}
                      onChange={setAutoSelectWinner}
                    />
                    <Text>
                      Auto-select winner and send to remaining list
                    </Text>
                    <Tooltip title="Automatically send the winning variant to the rest of your list when test completes">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                </Form.Item>
              </Col>
            </Row>

            <Alert
              message="How A/B Testing Works"
              description={
                <List size="small">
                  <List.Item>
                    1. <strong>{testSize}%</strong> of your list will be split evenly between variants
                  </List.Item>
                  <List.Item>
                    2. After <strong>{form.getFieldValue('testDuration') || 4} hours</strong>, the winner is determined by highest{' '}
                    <strong>{form.getFieldValue('winnerMetric')?.replace('-', ' ') || 'open rate'}</strong>
                  </List.Item>
                  <List.Item>
                    3. The winner is {autoSelectWinner ? 'automatically' : 'manually'} sent to the remaining{' '}
                    <strong>{100 - testSize}%</strong>
                  </List.Item>
                </List>
              }
              type="info"
              showIcon
            />

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Space>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="primary" icon={<SendOutlined />} onClick={handleCreateTest}>
                  Create A/B Test
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      </Space>
    </Modal>
  );
};

export default ABTestingManager;
