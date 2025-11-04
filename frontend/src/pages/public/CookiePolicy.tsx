import React from 'react';
import { Typography, Card, Divider, Table, Button } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const CookiePolicy: React.FC = () => {
  const necessaryCookies = [
    {
      name: 'session_token',
      purpose: 'Maintains your login session',
      duration: '30 days',
      type: 'First-party',
    },
    {
      name: 'csrf_token',
      purpose: 'Security - prevents cross-site request forgery attacks',
      duration: 'Session',
      type: 'First-party',
    },
    {
      name: 'cookieConsent',
      purpose: 'Remembers your cookie preferences',
      duration: '1 year',
      type: 'First-party',
    },
  ];

  const analyticsCookies = [
    {
      name: '_ga',
      purpose: 'Google Analytics - distinguishes users',
      duration: '2 years',
      type: 'Third-party',
    },
    {
      name: '_gid',
      purpose: 'Google Analytics - distinguishes users',
      duration: '24 hours',
      type: 'Third-party',
    },
    {
      name: '_gat',
      purpose: 'Google Analytics - throttles request rate',
      duration: '1 minute',
      type: 'Third-party',
    },
  ];

  const marketingCookies = [
    {
      name: 'fbp',
      purpose: 'Facebook Pixel - tracks conversions and remarketing',
      duration: '3 months',
      type: 'Third-party',
    },
    {
      name: 'utm_*',
      purpose: 'Tracks marketing campaign source',
      duration: '30 days',
      type: 'First-party',
    },
  ];

  const columns = [
    { title: 'Cookie Name', dataIndex: 'name', key: 'name', render: (text: string) => <Text code>{text}</Text> },
    { title: 'Purpose', dataIndex: 'purpose', key: 'purpose' },
    { title: 'Duration', dataIndex: 'duration', key: 'duration' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '40px 20px' }}>
      <Card style={{ maxWidth: 900, margin: '0 auto' }}>
        <Title level={1}>Cookie Policy</Title>
        <Text type="secondary">Last Updated: {new Date().toLocaleDateString()}</Text>

        <Divider />

        <Title level={2}>1. What Are Cookies?</Title>
        <Paragraph>
          Cookies are small text files that are placed on your device when you visit our website. They help us provide you
          with a better experience by remembering your preferences, analyzing how you use our site, and enabling certain
          functionality.
        </Paragraph>

        <Title level={2}>2. Why We Use Cookies</Title>
        <Paragraph>
          We use cookies for several purposes:
          <ul>
            <li><strong>Essential:</strong> To enable core functionality like login and security</li>
            <li><strong>Analytics:</strong> To understand how visitors use our website and improve our services</li>
            <li><strong>Marketing:</strong> To deliver relevant advertisements and measure campaign effectiveness</li>
            <li><strong>Preferences:</strong> To remember your settings and choices</li>
          </ul>
        </Paragraph>

        <Title level={2}>3. Types of Cookies We Use</Title>

        <Title level={3}>3.1 Strictly Necessary Cookies</Title>
        <Paragraph>
          These cookies are essential for the website to function properly. They enable core functionality such as security,
          network management, and accessibility. You cannot opt out of these cookies as they are required for the service.
        </Paragraph>
        <Table
          dataSource={necessaryCookies}
          columns={columns}
          pagination={false}
          size="small"
          style={{ marginBottom: 30 }}
          rowKey="name"
        />

        <Title level={3}>3.2 Analytics and Performance Cookies</Title>
        <Paragraph>
          These cookies help us understand how visitors interact with our website by collecting and reporting information
          anonymously. This helps us improve the website's performance and user experience. <strong>You can opt out of these cookies.</strong>
        </Paragraph>
        <Table
          dataSource={analyticsCookies}
          columns={columns}
          pagination={false}
          size="small"
          style={{ marginBottom: 30 }}
          rowKey="name"
        />

        <Title level={3}>3.3 Marketing and Targeting Cookies</Title>
        <Paragraph>
          These cookies are used to deliver advertisements that are relevant to you and your interests. They also help us
          measure the effectiveness of our marketing campaigns. <strong>You can opt out of these cookies.</strong>
        </Paragraph>
        <Table
          dataSource={marketingCookies}
          columns={columns}
          pagination={false}
          size="small"
          style={{ marginBottom: 30 }}
          rowKey="name"
        />

        <Title level={2}>4. Third-Party Cookies</Title>
        <Paragraph>
          Some cookies are placed by third-party services that appear on our pages. We do not control these cookies.
          Please refer to the third parties' websites for more information:
          <ul>
            <li>
              <strong>Google Analytics:</strong>{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Google Privacy Policy
              </a>
            </li>
            <li>
              <strong>Facebook Pixel:</strong>{' '}
              <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer">
                Facebook Privacy Policy
              </a>
            </li>
          </ul>
        </Paragraph>

        <Title level={2}>5. How to Manage Cookies</Title>

        <Card style={{ backgroundColor: '#f0f9ff', marginBottom: 20, border: '1px solid #bae6fd' }}>
          <Title level={4}>Option 1: Cookie Consent Banner</Title>
          <Paragraph>
            When you first visit our website, you'll see a cookie consent banner at the bottom of the page. You can:
            <ul>
              <li>Click "Accept All" to consent to all cookies</li>
              <li>Click "Reject Non-Essential" to only allow necessary cookies</li>
            </ul>
          </Paragraph>
        </Card>

        <Card style={{ backgroundColor: '#f0f9ff', marginBottom: 20, border: '1px solid #bae6fd' }}>
          <Title level={4}>Option 2: Browser Settings</Title>
          <Paragraph>
            Most web browsers allow you to control cookies through their settings:
            <ul>
              <li><strong>Chrome:</strong> Settings &gt; Privacy and security &gt; Cookies</li>
              <li><strong>Firefox:</strong> Settings &gt; Privacy & Security &gt; Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Cookies and website data</li>
              <li><strong>Edge:</strong> Settings &gt; Privacy, search, and services &gt; Cookies</li>
            </ul>
          </Paragraph>
          <Paragraph>
            Learn more at:{' '}
            <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer">
              aboutcookies.org
            </a>
          </Paragraph>
        </Card>

        <Card style={{ backgroundColor: '#f0f9ff', marginBottom: 20, border: '1px solid #bae6fd' }}>
          <Title level={4}>Option 3: Opt-Out Tools</Title>
          <Paragraph>
            You can opt out of specific tracking technologies:
            <ul>
              <li>
                <strong>Google Analytics:</strong>{' '}
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                  Browser Add-on
                </a>
              </li>
              <li>
                <strong>Facebook:</strong>{' '}
                <a href="https://www.facebook.com/settings?tab=ads" target="_blank" rel="noopener noreferrer">
                  Ad Settings
                </a>
              </li>
              <li>
                <strong>Industry Opt-Out:</strong>{' '}
                <a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer">
                  Your Online Choices
                </a>
              </li>
            </ul>
          </Paragraph>
        </Card>

        <Title level={2}>6. Impact of Disabling Cookies</Title>
        <Paragraph>
          If you disable cookies, some features of our website may not function properly:
          <ul>
            <li>You may not be able to log in or stay logged in</li>
            <li>Your preferences and settings will not be saved</li>
            <li>Some interactive features may be unavailable</li>
            <li>Page loading times may be slower</li>
          </ul>
        </Paragraph>

        <Title level={2}>7. Updates to This Policy</Title>
        <Paragraph>
          We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our practices.
          We will notify you of any material changes by posting the new policy on this page with an updated date.
        </Paragraph>

        <Title level={2}>8. More Information</Title>
        <Paragraph>
          For more information about how we handle your personal data, please see our{' '}
          <Link to="/privacy-policy">Privacy Policy</Link>.
        </Paragraph>
        <Paragraph>
          If you have questions about our use of cookies, please contact us at:{' '}
          <a href="mailto:privacy@oakleaf.io">privacy@oakleaf.io</a>
        </Paragraph>

        <Divider />

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link to="/">
            <Button size="large">Back to Home</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default CookiePolicy;
