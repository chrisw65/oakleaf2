import React from 'react';
import { Typography, Card, Divider, Button } from 'antd';
import { Link } from 'react-router-dom';
import { MailOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const PrivacyPolicy: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '40px 20px' }}>
      <Card style={{ maxWidth: 900, margin: '0 auto' }}>
        <Title level={1}>Privacy Policy</Title>
        <Text type="secondary">Last Updated: {new Date().toLocaleDateString()}</Text>

        <Divider />

        <Title level={2}>1. Introduction</Title>
        <Paragraph>
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website
          and use our funnel builder services. We are committed to protecting your privacy and complying with the General Data
          Protection Regulation (GDPR) and other applicable data protection laws.
        </Paragraph>

        <Title level={2}>2. Data Controller</Title>
        <Paragraph>
          The data controller responsible for your personal data is:
          <br />
          <strong>OakLeaf Digital Marketing Platform</strong>
          <br />
          Email: <a href="mailto:privacy@oakleaf.io">privacy@oakleaf.io</a>
        </Paragraph>

        <Title level={2}>3. Information We Collect</Title>
        <Title level={4}>3.1 Information You Provide</Title>
        <Paragraph>
          We collect information that you voluntarily provide when you:
          <ul>
            <li>Register for an account (email, name, password)</li>
            <li>Submit forms through our funnels (email, name, phone, any custom fields)</li>
            <li>Contact our support team</li>
            <li>Subscribe to our newsletter or marketing communications</li>
          </ul>
        </Paragraph>

        <Title level={4}>3.2 Automatically Collected Information</Title>
        <Paragraph>
          When you visit our website, we automatically collect:
          <ul>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>Pages visited and time spent on pages</li>
            <li>Referral source</li>
            <li>Cookies and similar tracking technologies (see our <Link to="/cookie-policy">Cookie Policy</Link>)</li>
          </ul>
        </Paragraph>

        <Title level={2}>4. How We Use Your Information</Title>
        <Paragraph>
          We use your personal data for the following purposes:
          <ul>
            <li><strong>Service Delivery:</strong> To provide and maintain our funnel builder services</li>
            <li><strong>Communication:</strong> To send you important updates, respond to inquiries, and provide customer support</li>
            <li><strong>Marketing:</strong> To send promotional emails and newsletters (only with your explicit consent)</li>
            <li><strong>Analytics:</strong> To understand how users interact with our platform and improve our services</li>
            <li><strong>Legal Compliance:</strong> To comply with legal obligations and protect our rights</li>
          </ul>
        </Paragraph>

        <Title level={2}>5. Legal Basis for Processing (GDPR)</Title>
        <Paragraph>
          We process your personal data based on:
          <ul>
            <li><strong>Consent:</strong> For marketing communications and non-essential cookies</li>
            <li><strong>Contract:</strong> To provide the services you've requested</li>
            <li><strong>Legitimate Interest:</strong> To improve our services and ensure security</li>
            <li><strong>Legal Obligation:</strong> To comply with laws and regulations</li>
          </ul>
        </Paragraph>

        <Title level={2}>6. Your GDPR Rights</Title>
        <Paragraph>
          Under GDPR, you have the following rights:
        </Paragraph>

        <Card style={{ backgroundColor: '#f0f9ff', marginBottom: 20, border: '1px solid #bae6fd' }}>
          <Title level={4}>How to Exercise Your Rights:</Title>
          <Paragraph>
            <ul>
              <li><strong>Right to Access:</strong> Request a copy of your personal data at <Text code>/gdpr/export/your@email.com</Text></li>
              <li><strong>Right to Erasure:</strong> Request deletion of your data at <Text code>/gdpr/delete/your@email.com</Text></li>
              <li><strong>Right to Object:</strong> Unsubscribe from marketing at <Text code>/gdpr/unsubscribe/your@email.com</Text></li>
              <li><strong>Right to Rectification:</strong> Contact us at <a href="mailto:privacy@oakleaf.io">privacy@oakleaf.io</a> to update your information</li>
              <li><strong>Right to Restrict Processing:</strong> Contact us to restrict how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Request your data in a machine-readable format</li>
            </ul>
          </Paragraph>
          <Button type="primary" href="/gdpr-requests" icon={<MailOutlined />}>
            Manage My Data
          </Button>
        </Card>

        <Title level={2}>7. Data Retention</Title>
        <Paragraph>
          We retain your personal data for as long as necessary to provide our services and comply with legal obligations:
          <ul>
            <li><strong>Account Data:</strong> Until you delete your account, plus 30 days for backup purposes</li>
            <li><strong>Form Submissions:</strong> For the duration of the marketing campaign or until you request erasure</li>
            <li><strong>Marketing Consent:</strong> Until you withdraw consent or 3 years of inactivity</li>
            <li><strong>Legal Records:</strong> As required by law (typically 7 years for financial records)</li>
          </ul>
        </Paragraph>

        <Title level={2}>8. Data Sharing and Third Parties</Title>
        <Paragraph>
          We do not sell your personal data. We may share your data with:
          <ul>
            <li><strong>Service Providers:</strong> Cloud hosting, email delivery, analytics (under strict data processing agreements)</li>
            <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
            <li><strong>Business Transfers:</strong> In the event of a merger or acquisition (with advance notice)</li>
          </ul>
        </Paragraph>

        <Title level={2}>9. International Data Transfers</Title>
        <Paragraph>
          Your data may be transferred to and processed in countries outside the European Economic Area (EEA).
          We ensure appropriate safeguards are in place, such as Standard Contractual Clauses approved by the European Commission.
        </Paragraph>

        <Title level={2}>10. Data Security</Title>
        <Paragraph>
          We implement appropriate technical and organizational measures to protect your personal data:
          <ul>
            <li>Encryption of data in transit (TLS/SSL) and at rest</li>
            <li>Regular security audits and penetration testing</li>
            <li>Access controls and authentication</li>
            <li>Regular backups and disaster recovery procedures</li>
            <li>Employee training on data protection</li>
          </ul>
        </Paragraph>

        <Title level={2}>11. Children's Privacy</Title>
        <Paragraph>
          Our services are not intended for individuals under 16 years of age. We do not knowingly collect personal data
          from children. If you become aware that a child has provided us with personal data, please contact us immediately.
        </Paragraph>

        <Title level={2}>12. Cookies and Tracking</Title>
        <Paragraph>
          We use cookies and similar tracking technologies. For detailed information, please see our{' '}
          <Link to="/cookie-policy">Cookie Policy</Link>.
        </Paragraph>

        <Title level={2}>13. Changes to This Policy</Title>
        <Paragraph>
          We may update this Privacy Policy from time to time. We will notify you of any material changes by:
          <ul>
            <li>Posting the new policy on this page with an updated "Last Updated" date</li>
            <li>Sending an email notification to registered users</li>
            <li>Displaying a prominent notice on our website</li>
          </ul>
        </Paragraph>

        <Title level={2}>14. Contact Us</Title>
        <Paragraph>
          If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
        </Paragraph>
        <Card style={{ backgroundColor: '#f9fafb' }}>
          <Paragraph>
            <strong>Data Protection Officer</strong><br />
            Email: <a href="mailto:privacy@oakleaf.io">privacy@oakleaf.io</a><br />
            Address: OakLeaf Data Protection, [Your Address]<br />
            Response Time: We will respond to your request within 30 days as required by GDPR
          </Paragraph>
        </Card>

        <Title level={2}>15. Supervisory Authority</Title>
        <Paragraph>
          If you believe we have not handled your personal data in accordance with GDPR, you have the right to lodge a
          complaint with your local supervisory authority:
          <ul>
            <li>UK: Information Commissioner's Office (ICO) - <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a></li>
            <li>EU: Find your local authority at <a href="https://edpb.europa.eu" target="_blank" rel="noopener noreferrer">edpb.europa.eu</a></li>
          </ul>
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

export default PrivacyPolicy;
