import React, { useState } from 'react';
import { Card, Tabs, Typography, Space, Button } from 'antd';
import { MessageOutlined, BellOutlined, RobotOutlined } from '@ant-design/icons';
import SocialMediaDMHub from '../../components/engagement/SocialMediaDMHub';
import SocialMediaMonitor from '../../components/engagement/SocialMediaMonitor';
import AutoReplyRulesManager from '../../components/engagement/AutoReplyRulesManager';

const { Title } = Typography;

const EngagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dms');
  const [isAutoReplyVisible, setIsAutoReplyVisible] = useState(false);

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>
            Social Media Engagement
          </Title>
          <Button
            type="primary"
            icon={<RobotOutlined />}
            onClick={() => setIsAutoReplyVisible(true)}
          >
            Auto-Reply Rules
          </Button>
        </div>

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

      <AutoReplyRulesManager
        visible={isAutoReplyVisible}
        onClose={() => setIsAutoReplyVisible(false)}
      />
    </div>
  );
};

export default EngagementPage;
