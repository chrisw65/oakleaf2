import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
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
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 440,
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
            Welcome Back
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Sign in to continue to Funnel Pro
          </Text>
        </div>

        <Form name="login" onFinish={onFinish} autoComplete="off" layout="vertical">
          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
              placeholder="you@example.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Enter your password"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
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
              Sign In
            </Button>
          </Form.Item>

          <Divider style={{ margin: '24px 0' }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              New to Funnel Pro?
            </Text>
          </Divider>

          <div style={{ textAlign: 'center' }}>
            <Link to="/register">
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
                Create an Account
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

export default LoginPage;
