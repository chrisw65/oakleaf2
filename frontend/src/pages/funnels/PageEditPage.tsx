import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, message, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { funnelService, FunnelPage } from '../../services/funnelService';
import VisualPageBuilder from '../../components/funnels/VisualPageBuilder';

const PageEditPage: React.FC = () => {
  const { funnelId, pageId } = useParams<{ funnelId: string; pageId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<FunnelPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (funnelId && pageId) {
      loadPage();
    }
  }, [funnelId, pageId]);

  const loadPage = async () => {
    if (!funnelId || !pageId) return;

    try {
      const data = await funnelService.getPage(funnelId, pageId);
      setPage(data);
    } catch (error: any) {
      message.error('Failed to load page: ' + (error.response?.data?.message || error.message));
      navigate(`/funnels/${funnelId}/builder`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (elements: any[]) => {
    if (!funnelId || !pageId) return;

    try {
      await funnelService.updatePage(funnelId, pageId, {
        content: {
          components: elements,
          version: '1.0',
          lastModified: new Date().toISOString(),
        },
      });
      message.success('Page saved successfully');
    } catch (error: any) {
      message.error('Failed to save page: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleBack = () => {
    navigate(`/funnels/${funnelId}/builder`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!page) {
    return null;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 24px', background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Back to Funnel
        </Button>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>{page.name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>/{page.slug}</div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <VisualPageBuilder
          pageId={pageId}
          initialElements={page.content?.components || []}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default PageEditPage;
