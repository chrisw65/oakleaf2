import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Spin, Result } from 'antd';
import axios from 'axios';
import PageRenderer from '../../components/funnels/PageRenderer';

const PublicPage: React.FC = () => {
  const { funnelSlug, pageSlug } = useParams<{ funnelSlug: string; pageSlug: string }>();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (funnelSlug && pageSlug) {
      loadPage();
    }
  }, [funnelSlug, pageSlug]);

  const loadPage = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/v1/p/${funnelSlug}/${pageSlug}`
      );
      setPage(response.data);

      // Set pageId in global scope for form submissions
      (window as any).currentPageId = response.data.id;

      // Set page title and meta tags
      if (response.data.seoSettings?.title) {
        document.title = response.data.seoSettings.title;
      } else {
        document.title = response.data.name;
      }

      if (response.data.seoSettings?.description) {
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', response.data.seoSettings.description);
        }
      }
    } catch (err: any) {
      console.error('Failed to load page:', err);
      setError(err.response?.data?.message || 'Page not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Result
          status="404"
          title="404"
          subTitle={error || 'Sorry, the page you visited does not exist or is not published.'}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <PageRenderer elements={page.content?.components || []} />
    </div>
  );
};

export default PublicPage;
