import React, { useState } from 'react';
import { Card, Tabs, Typography } from 'antd';
import { MessageOutlined, BellOutlined } from '@ant-design/icons';
import SocialMediaDMHub from '../../components/engagement/SocialMediaDMHub';
import SocialMediaMonitor from '../../components/engagement/SocialMediaMonitor';

const { Title } = Typography;

const EngagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dms');

  return (
    <div>
      <Card>
        <Title level={2} style={{ marginBottom: 24 }}>
          Social Media Engagement
        </Title>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          items={[
            {
              key: 'dms',
              label: (
                <span>
                  <MessageOutlined />
                  Direct Messages
                </span>
              ),
              children: <SocialMediaDMHub />,
            },
            {
              key: 'monitor',
              label: (
                <span>
                  <BellOutlined />
                  Social Monitor
                </span>
              ),
              children: <SocialMediaMonitor />,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default EngagementPage;
