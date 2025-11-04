import React from 'react';
import { Button, Form, Input, Card, Row, Col, Statistic, Typography } from 'antd';

const { Title, Paragraph, Text } = Typography;

interface PageElement {
  id: string;
  type: string;
  content: any;
  styles: any;
}

interface PageRendererProps {
  elements: PageElement[];
  preview?: boolean;
}

const PageRenderer: React.FC<PageRendererProps> = ({ elements, preview = false }) => {
  const renderElement = (element: PageElement) => {
    const style = {
      padding: element.styles?.padding || '20px',
      margin: element.styles?.margin || '10px 0',
      textAlign: (element.styles?.textAlign || 'center') as any,
      backgroundColor: element.styles?.backgroundColor || 'transparent',
      ...element.styles,
    };

    switch (element.type) {
      case 'headline':
        const HeadingTag = element.content?.tag || 'h1';
        return (
          <div key={element.id} style={style}>
            <Title level={HeadingTag === 'h1' ? 1 : HeadingTag === 'h2' ? 2 : HeadingTag === 'h3' ? 3 : 4}>
              {element.content?.text || 'Headline'}
            </Title>
          </div>
        );

      case 'paragraph':
        return (
          <div key={element.id} style={style}>
            <Paragraph style={{ fontSize: 16, lineHeight: 1.6 }}>
              {element.content?.text || 'Paragraph text goes here...'}
            </Paragraph>
          </div>
        );

      case 'bullet-list':
        return (
          <div key={element.id} style={style}>
            <ul style={{ textAlign: 'left', maxWidth: 600, margin: '0 auto', fontSize: 16 }}>
              {(element.content?.items || []).map((item: string, idx: number) => (
                <li key={idx} style={{ marginBottom: 8 }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        );

      case 'image':
        return (
          <div key={element.id} style={style}>
            {element.content?.src ? (
              <img
                src={element.content.src}
                alt={element.content?.alt || 'Image'}
                style={{ maxWidth: element.content?.width || '100%', height: 'auto' }}
              />
            ) : (
              <div style={{ padding: 60, backgroundColor: '#f0f0f0', color: '#999' }}>
                Image Placeholder
              </div>
            )}
          </div>
        );

      case 'video':
        const embedUrl = getVideoEmbedUrl(element.content?.url, element.content?.provider);
        return (
          <div key={element.id} style={style}>
            {embedUrl ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={embedUrl}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div style={{ padding: 60, backgroundColor: '#f0f0f0', color: '#999' }}>
                Video Placeholder
              </div>
            )}
          </div>
        );

      case 'button':
        return (
          <div key={element.id} style={style}>
            <Button
              type={element.content?.style === 'primary' ? 'primary' : 'default'}
              size="large"
              href={element.content?.link || '#'}
              style={{ minWidth: 200, height: 50, fontSize: 18 }}
            >
              {element.content?.text || 'Click Here'}
            </Button>
          </div>
        );

      case 'optin-form':
        return (
          <div key={element.id} style={style}>
            <Card style={{ maxWidth: 500, margin: '0 auto' }}>
              <Form layout="vertical">
                <Form.Item>
                  <Input
                    size="large"
                    placeholder={element.content?.placeholder || 'Enter your email'}
                    type="email"
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" size="large" block>
                    {element.content?.buttonText || 'Get Started'}
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        );

      case 'pricing-table':
        return (
          <div key={element.id} style={style}>
            <Row gutter={16} justify="center">
              {(element.content?.plans || []).map((plan: any, idx: number) => (
                <Col key={idx} xs={24} sm={12} md={8}>
                  <Card
                    title={plan.name}
                    bordered
                    style={{ textAlign: 'center' }}
                    actions={[
                      <Button type="primary" size="large">
                        Choose Plan
                      </Button>,
                    ]}
                  >
                    <Title level={2} style={{ color: '#6366f1' }}>
                      {plan.price}
                    </Title>
                    <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
                      {(plan.features || []).map((feature: string, fidx: number) => (
                        <li key={fidx} style={{ padding: '8px 0' }}>
                          ✓ {feature}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        );

      case 'countdown':
        return (
          <div key={element.id} style={style}>
            <Card style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
              <Title level={3}>Limited Time Offer</Title>
              <Row gutter={16} justify="center">
                <Col>
                  <Statistic title="Days" value={0} />
                </Col>
                <Col>
                  <Statistic title="Hours" value={0} />
                </Col>
                <Col>
                  <Statistic title="Minutes" value={0} />
                </Col>
                <Col>
                  <Statistic title="Seconds" value={0} />
                </Col>
              </Row>
            </Card>
          </div>
        );

      case 'testimonial':
        return (
          <div key={element.id} style={style}>
            <Card style={{ maxWidth: 600, margin: '0 auto' }}>
              <Paragraph style={{ fontSize: 18, fontStyle: 'italic' }}>
                "{element.content?.quote || 'Customer testimonial goes here...'}"
              </Paragraph>
              <Text strong>{element.content?.author || 'Customer Name'}</Text>
              <br />
              <Text type="secondary">{element.content?.role || 'Customer Role'}</Text>
            </Card>
          </div>
        );

      case 'custom-html':
        return (
          <div
            key={element.id}
            style={style}
            dangerouslySetInnerHTML={{ __html: element.content?.html || '' }}
          />
        );

      default:
        return (
          <div key={element.id} style={style}>
            <Card>
              <Text type="secondary">
                {element.type} element - not yet implemented in renderer
              </Text>
            </Card>
          </div>
        );
    }
  };

  const getVideoEmbedUrl = (url: string, provider: string = 'youtube') => {
    if (!url) return null;

    if (provider === 'youtube') {
      const videoId = extractYouTubeId(url);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } else if (provider === 'vimeo') {
      const videoId = extractVimeoId(url);
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }

    return null;
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const extractVimeoId = (url: string) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  if (!elements || elements.length === 0) {
    return (
      <div style={{ padding: 60, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
        <Title level={3}>Empty Page</Title>
        <Paragraph>No elements added yet. {!preview && 'Start building your page!'}</Paragraph>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#fff' }}>
      {elements.map(renderElement)}
    </div>
  );
};

export default PageRenderer;
