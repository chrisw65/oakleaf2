import React from 'react';
import { Typography, Card, Divider, Button } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const TermsAndConditions: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', padding: '40px 20px' }}>
      <Card style={{ maxWidth: 900, margin: '0 auto' }}>
        <Title level={1}>Terms and Conditions</Title>
        <Text type="secondary">Last Updated: {new Date().toLocaleDateString()}</Text>

        <Divider />

        <Title level={2}>1. Acceptance of Terms</Title>
        <Paragraph>
          By accessing and using OakLeaf ("the Service"), you accept and agree to be bound by these Terms and Conditions.
          If you do not agree to these terms, please do not use the Service.
        </Paragraph>

        <Title level={2}>2. Description of Service</Title>
        <Paragraph>
          OakLeaf provides a comprehensive digital marketing platform that includes:
          <ul>
            <li>Funnel builder with drag-and-drop page editor</li>
            <li>Form submissions and lead capture</li>
            <li>CRM (Customer Relationship Management) system</li>
            <li>Email marketing and automation</li>
            <li>Analytics and reporting</li>
            <li>Template library</li>
          </ul>
        </Paragraph>

        <Title level={2}>3. User Accounts</Title>

        <Title level={4}>3.1 Account Creation</Title>
        <Paragraph>
          To use certain features of the Service, you must create an account. You agree to:
          <ul>
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and update your information to keep it accurate</li>
            <li>Keep your password secure and confidential</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Be responsible for all activities under your account</li>
          </ul>
        </Paragraph>

        <Title level={4}>3.2 Account Eligibility</Title>
        <Paragraph>
          You must be at least 18 years old and legally capable of entering into binding contracts to use this Service.
          By creating an account, you represent that you meet these requirements.
        </Paragraph>

        <Title level={2}>4. Acceptable Use Policy</Title>
        <Paragraph>
          You agree NOT to use the Service to:
          <ul>
            <li>Violate any laws or regulations</li>
            <li>Send spam or unsolicited marketing messages</li>
            <li>Collect personal data without consent</li>
            <li>Distribute malware, viruses, or harmful code</li>
            <li>Infringe on intellectual property rights</li>
            <li>Harass, abuse, or harm others</li>
            <li>Impersonate others or provide false information</li>
            <li>Engage in fraudulent activities</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use the Service for any illegal or unethical purpose</li>
          </ul>
        </Paragraph>

        <Title level={2}>5. Content and Intellectual Property</Title>

        <Title level={4}>5.1 Your Content</Title>
        <Paragraph>
          You retain ownership of all content you create using the Service. By using the Service, you grant us a
          worldwide, non-exclusive, royalty-free license to host, store, and display your content solely for the
          purpose of providing the Service.
        </Paragraph>

        <Title level={4}>5.2 Our Intellectual Property</Title>
        <Paragraph>
          The Service, including its design, features, functionality, and underlying code, is owned by OakLeaf and
          protected by copyright, trademark, and other intellectual property laws. You may not:
          <ul>
            <li>Copy, modify, or reverse engineer any part of the Service</li>
            <li>Remove or alter any copyright or proprietary notices</li>
            <li>Use our trademarks without written permission</li>
          </ul>
        </Paragraph>

        <Title level={4}>5.3 Templates and Assets</Title>
        <Paragraph>
          Templates and design assets provided by OakLeaf are licensed for use within the Service. You may use them
          in your funnels, but you may not redistribute, resell, or sublicense them separately.
        </Paragraph>

        <Title level={2}>6. Subscription and Payment</Title>

        <Title level={4}>6.1 Pricing</Title>
        <Paragraph>
          Subscription fees are displayed on our pricing page. We reserve the right to change pricing with 30 days'
          notice to existing customers.
        </Paragraph>

        <Title level={4}>6.2 Billing</Title>
        <Paragraph>
          <ul>
            <li>Subscriptions are billed in advance on a monthly or annual basis</li>
            <li>You authorize us to charge your payment method on each billing cycle</li>
            <li>Failed payments may result in service suspension</li>
            <li>All fees are non-refundable except as required by law</li>
          </ul>
        </Paragraph>

        <Title level={4}>6.3 Cancellation</Title>
        <Paragraph>
          You may cancel your subscription at any time. Cancellation will take effect at the end of your current
          billing period. You will retain access to the Service until that date.
        </Paragraph>

        <Title level={2}>7. GDPR Compliance and Data Protection</Title>
        <Paragraph>
          We are committed to protecting your data in accordance with GDPR. Please see our{' '}
          <Link to="/privacy-policy">Privacy Policy</Link> for detailed information about:
          <ul>
            <li>How we collect and process your data</li>
            <li>Your rights under GDPR (access, erasure, portability, etc.)</li>
            <li>How to exercise your rights</li>
            <li>Our data retention policies</li>
          </ul>
        </Paragraph>

        <Title level={4}>7.1 Your Responsibilities as a Data Controller</Title>
        <Paragraph>
          When you collect personal data through our Service (e.g., via forms), you act as a data controller and
          must comply with GDPR requirements:
          <ul>
            <li>Obtain proper consent before collecting personal data</li>
            <li>Provide privacy notices to your users</li>
            <li>Honor data subject rights requests (access, deletion, etc.)</li>
            <li>Use the data only for lawful purposes</li>
            <li>Implement appropriate security measures</li>
          </ul>
        </Paragraph>

        <Title level={2}>8. Service Availability</Title>

        <Title level={4}>8.1 Uptime</Title>
        <Paragraph>
          We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. The Service may be unavailable
          due to maintenance, updates, or circumstances beyond our control.
        </Paragraph>

        <Title level={4}>8.2 Maintenance</Title>
        <Paragraph>
          We may perform scheduled maintenance with advance notice. Emergency maintenance may occur without notice.
        </Paragraph>

        <Title level={2}>9. Termination</Title>

        <Title level={4}>9.1 By You</Title>
        <Paragraph>
          You may terminate your account at any time through your account settings or by contacting support.
        </Paragraph>

        <Title level={4}>9.2 By Us</Title>
        <Paragraph>
          We may suspend or terminate your access immediately if you:
          <ul>
            <li>Violate these Terms and Conditions</li>
            <li>Engage in fraudulent activity</li>
            <li>Fail to pay subscription fees</li>
            <li>Use the Service in a way that harms us or other users</li>
          </ul>
        </Paragraph>

        <Title level={4}>9.3 Effect of Termination</Title>
        <Paragraph>
          Upon termination:
          <ul>
            <li>Your access to the Service will be revoked</li>
            <li>We will delete your data within 30 days (except where required by law)</li>
            <li>You may request a data export before termination</li>
            <li>No refunds will be issued for partial billing periods</li>
          </ul>
        </Paragraph>

        <Title level={2}>10. Limitation of Liability</Title>
        <Paragraph>
          To the maximum extent permitted by law:
          <ul>
            <li>The Service is provided "AS IS" without warranties of any kind</li>
            <li>We are not liable for indirect, incidental, or consequential damages</li>
            <li>Our total liability is limited to the amount you paid in the last 12 months</li>
            <li>We are not responsible for third-party content or services</li>
            <li>You are responsible for backing up your data</li>
          </ul>
        </Paragraph>

        <Title level={2}>11. Indemnification</Title>
        <Paragraph>
          You agree to indemnify and hold harmless OakLeaf from any claims, damages, or expenses arising from:
          <ul>
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any third-party rights</li>
            <li>Content you create or distribute using the Service</li>
          </ul>
        </Paragraph>

        <Title level={2}>12. Dispute Resolution</Title>

        <Title level={4}>12.1 Governing Law</Title>
        <Paragraph>
          These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.
        </Paragraph>

        <Title level={4}>12.2 Arbitration</Title>
        <Paragraph>
          Any disputes will be resolved through binding arbitration rather than in court, except where prohibited by law.
        </Paragraph>

        <Title level={2}>13. Changes to Terms</Title>
        <Paragraph>
          We may update these Terms from time to time. We will notify you of material changes by:
          <ul>
            <li>Posting the updated Terms on this page with a new "Last Updated" date</li>
            <li>Sending an email to your registered email address</li>
            <li>Displaying a notice when you log in</li>
          </ul>
          Continued use of the Service after changes constitutes acceptance of the new Terms.
        </Paragraph>

        <Title level={2}>14. Miscellaneous</Title>

        <Title level={4}>14.1 Entire Agreement</Title>
        <Paragraph>
          These Terms, together with our Privacy Policy and Cookie Policy, constitute the entire agreement between you and OakLeaf.
        </Paragraph>

        <Title level={4}>14.2 Severability</Title>
        <Paragraph>
          If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in effect.
        </Paragraph>

        <Title level={4}>14.3 No Waiver</Title>
        <Paragraph>
          Our failure to enforce any right or provision does not constitute a waiver of that right or provision.
        </Paragraph>

        <Title level={4}>14.4 Assignment</Title>
        <Paragraph>
          You may not assign these Terms without our written consent. We may assign our rights and obligations without restriction.
        </Paragraph>

        <Title level={2}>15. Contact Information</Title>
        <Paragraph>
          If you have questions about these Terms, please contact us:
        </Paragraph>
        <Card style={{ backgroundColor: '#f9fafb' }}>
          <Paragraph>
            <strong>OakLeaf Support</strong><br />
            Email: <a href="mailto:support@oakleaf.io">support@oakleaf.io</a><br />
            Legal: <a href="mailto:legal@oakleaf.io">legal@oakleaf.io</a><br />
            Address: [Your Company Address]
          </Paragraph>
        </Card>

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

export default TermsAndConditions;
