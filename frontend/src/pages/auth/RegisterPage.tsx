import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Divider, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, ShopOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await register(values);
      message.success('Welcome to Funnel Pro!');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        padding: '40px 20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 520,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          borderRadius: 16,
          border: 'none',
        }}
      >
        {/* Logo Section */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: '0 auto 20px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 'bold',
              color: 'white',
              boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)',
            }}
          >
            F
          </div>
          <Title level={2} style={{ marginBottom: 8, color: '#1e293b', fontSize: 28 }}>
            Create Your Account
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Start your journey with Funnel Pro today
          </Text>
        </div>

        <Form name="register" onFinish={onFinish} autoComplete="off" layout="vertical">
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ required: true, message: 'Required!' }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="John"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[{ required: true, message: 'Required!' }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="Doe"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
              placeholder="you@example.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Company Name (Optional)"
            name="tenantName"
            tooltip="Your company or organization name. If not provided, we'll use your name."
          >
            <Input
              prefix={<ShopOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Acme Corp"
              size="large"
            />
          </Form.Item>

          <Form.Item label="Phone Number (Optional)" name="phone">
            <Input
              prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />}
              placeholder="+1 (555) 000-0000"
              size="large"
            />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: 'Required!' },
                  { min: 8, message: 'Min 8 characters!' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="••••••••"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Required!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                  placeholder="••••••••"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{
                height: 48,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Create Account
            </Button>
          </Form.Item>

          <Divider style={{ margin: '24px 0' }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Already have an account?
            </Text>
          </Divider>

          <div style={{ textAlign: 'center' }}>
            <Link to="/login">
              <Button
                block
                size="large"
                style={{
                  height: 48,
                  fontSize: 16,
                  fontWeight: 600,
                  borderColor: '#6366f1',
                  color: '#6366f1',
                }}
              >
                Sign In Instead
              </Button>
            </Link>
          </div>
        </Form>
      </Card>

      {/* Footer */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: 13,
        }}
      >
        © {new Date().getFullYear()} Funnel Pro Platform. Built with precision.
      </div>
    </div>
  );
};

export default RegisterPage;
