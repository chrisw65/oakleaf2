import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Switch,
  Button,
  Space,
  message,
  Divider,
  Typography,
  Alert,
  Radio,
  Spin,
  Tabs,
} from 'antd';
import {
  SaveOutlined,
  LockOutlined,
  ApiOutlined,
  RobotOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import settingsService from '../../services/settingsService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const AdminSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiProvider, setAiProvider] = useState<'openai' | 'ollama'>('openai');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      // Load current AI provider preference
      const providerSetting = await settingsService.getSetting('ai_provider');
      if (providerSetting?.value) {
        setAiProvider(providerSetting.value as 'openai' | 'ollama');
      }

      // Load OpenAI settings
      const openaiEnabled = await settingsService.getSetting('openai_enabled');
      const openaiKey = await settingsService.getSetting('openai_api_key');

      // Load Ollama settings
      const ollamaEnabled = await settingsService.getSetting('ollama_enabled');
      const ollamaUrl = await settingsService.getSetting('ollama_url');
      const ollamaModel = await settingsService.getSetting('ollama_model');

      form.setFieldsValue({
        ai_provider: providerSetting?.value || 'openai',
        openai_enabled: openaiEnabled?.isEnabled || false,
        openai_api_key: '', // Don't show encrypted keys
        ollama_enabled: ollamaEnabled?.isEnabled || false,
        ollama_url: ollamaUrl?.value || 'http://192.168.8.219:11434',
        ollama_model: ollamaModel?.value || 'llama2',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      message.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    try {
      setSaving(true);

      // Save AI provider preference
      await settingsService.setSetting({
        key: 'ai_provider',
        value: values.ai_provider,
        description: 'AI provider (openai or ollama)',
        isEnabled: true,
      });

      // Save OpenAI settings
      await settingsService.setSetting({
        key: 'openai_enabled',
        value: values.openai_enabled ? 'true' : 'false',
        description: 'Enable OpenAI features',
        isEnabled: values.openai_enabled,
      });

      if (values.openai_api_key) {
        await settingsService.setSetting({
          key: 'openai_api_key',
          value: values.openai_api_key,
          description: 'OpenAI API Key',
          isEncrypted: true,
          isEnabled: true,
        });
      }

      // Save Ollama settings
      await settingsService.setSetting({
        key: 'ollama_enabled',
        value: values.ollama_enabled ? 'true' : 'false',
        description: 'Enable Ollama (local AI)',
        isEnabled: values.ollama_enabled,
      });

      await settingsService.setSetting({
        key: 'ollama_url',
        value: values.ollama_url,
        description: 'Ollama server URL',
        isEnabled: true,
      });

      await settingsService.setSetting({
        key: 'ollama_model',
        value: values.ollama_model,
        description: 'Ollama model to use',
        isEnabled: true,
      });

      message.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>
        <SettingOutlined /> Platform Settings
      </Title>
      <Paragraph type="secondary">
        Configure AI providers and platform settings. Changes take effect immediately.
      </Paragraph>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          ai_provider: 'openai',
          openai_enabled: false,
          ollama_enabled: false,
          ollama_url: 'http://192.168.8.219:11434',
          ollama_model: 'llama2',
        }}
      >
        <Card style={{ marginBottom: 24 }}>
          <Title level={4}>AI Provider Selection</Title>
          <Form.Item
            name="ai_provider"
            label="Choose AI Provider"
            rules={[{ required: true, message: 'Please select an AI provider' }]}
          >
            <Radio.Group
              onChange={(e) => setAiProvider(e.target.value)}
              size="large"
            >
              <Radio.Button value="openai">
                <ApiOutlined /> OpenAI (Cloud)
              </Radio.Button>
              <Radio.Button value="ollama">
                <RobotOutlined /> Ollama (Local - Jetson)
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Card>

        <Tabs defaultActiveKey="openai" type="card">
          <TabPane
            tab={
              <span>
                <ApiOutlined />
                OpenAI Configuration
              </span>
            }
            key="openai"
          >
            <Card>
              <Alert
                message="OpenAI Configuration"
                description="Configure OpenAI API for cloud-based AI features. Requires an API key from platform.openai.com"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Form.Item
                name="openai_enabled"
                label="Enable OpenAI Features"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="openai_api_key"
                label="OpenAI API Key"
                rules={[
                  {
                    pattern: /^sk-/,
                    message: 'API key should start with "sk-"',
                  },
                ]}
                extra="Your API key is encrypted and stored securely. Leave blank to keep existing key."
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="sk-..."
                  size="large"
                />
              </Form.Item>

              <Alert
                message="How to get an API key"
                description={
                  <ol>
                    <li>Go to platform.openai.com</li>
                    <li>Sign in or create an account</li>
                    <li>Navigate to API Keys section</li>
                    <li>Create a new secret key</li>
                    <li>Copy and paste it here</li>
                  </ol>
                }
                type="warning"
                showIcon
              />
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <RobotOutlined />
                Ollama Configuration (Local)
              </span>
            }
            key="ollama"
          >
            <Card>
              <Alert
                message="Ollama Local AI Configuration"
                description="Configure Ollama for local AI processing on your Jetson device. No API key required!"
                type="success"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Form.Item
                name="ollama_enabled"
                label="Enable Ollama (Local AI)"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="ollama_url"
                label="Ollama Server URL"
                rules={[
                  { required: true, message: 'Please enter Ollama URL' },
                  { type: 'url', message: 'Please enter a valid URL' },
                ]}
                extra="URL of your Ollama server (e.g., http://192.168.8.219:11434)"
              >
                <Input
                  prefix={<ApiOutlined />}
                  placeholder="http://192.168.8.219:11434"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="ollama_model"
                label="Ollama Model"
                rules={[{ required: true, message: 'Please enter model name' }]}
                extra="Model to use for AI generation (e.g., llama2, mistral, codellama)"
              >
                <Input
                  prefix={<RobotOutlined />}
                  placeholder="llama2"
                  size="large"
                />
              </Form.Item>

              <Alert
                message="Jetson Ollama Setup"
                description={
                  <div>
                    <Paragraph>
                      <strong>Your Jetson (192.168.8.219) is configured as default.</strong>
                    </Paragraph>
                    <Paragraph>
                      Available models:
                      <ul>
                        <li><strong>llama2</strong> - General purpose model</li>
                        <li><strong>mistral</strong> - Fast and efficient</li>
                        <li><strong>codellama</strong> - Code generation</li>
                        <li><strong>neural-chat</strong> - Conversational AI</li>
                      </ul>
                    </Paragraph>
                    <Paragraph type="secondary">
                      Make sure Ollama is running on your Jetson with: <code>ollama serve</code>
                    </Paragraph>
                  </div>
                }
                type="info"
                showIcon
              />
            </Card>
          </TabPane>
        </Tabs>

        <Divider />

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              loading={saving}
            >
              Save Settings
            </Button>
            <Button size="large" onClick={loadSettings}>
              Reset
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AdminSettings;
