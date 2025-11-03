import React, { useState } from 'react';
import {
  Layout,
  Card,
  Button,
  Space,
  Typography,
  Tabs,
  Tooltip,
  Segmented,
  Slider,
  ColorPicker,
  Input,
  Select,
  Collapse,
  Switch,
  Tag,
  message,
} from 'antd';
import {
  FontColorsOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  FormOutlined,
  LinkOutlined,
  TableOutlined,
  BarChartOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  StarOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
  EyeOutlined,
  SaveOutlined,
  UndoOutlined,
  RedoOutlined,
  SettingOutlined,
  BgColorsOutlined,
  ColumnWidthOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
} from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Panel } = Collapse;

interface PageElement {
  id: string;
  type: string;
  content: any;
  styles: any;
}

interface VisualPageBuilderProps {
  pageId?: string;
  initialElements?: PageElement[];
  onSave: (elements: PageElement[]) => void;
}

const VisualPageBuilder: React.FC<VisualPageBuilderProps> = ({
  pageId,
  initialElements = [],
  onSave,
}) => {
  const [elements, setElements] = useState<PageElement[]>(initialElements);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(false);

  const elementLibrary = [
    {
      category: 'Content',
      items: [
        {
          type: 'headline',
          icon: <FontColorsOutlined />,
          label: 'Headline',
          description: 'Add attention-grabbing headlines',
        },
        {
          type: 'paragraph',
          icon: <FontColorsOutlined />,
          label: 'Paragraph',
          description: 'Add body text content',
        },
        {
          type: 'bullet-list',
          icon: <CheckCircleOutlined />,
          label: 'Bullet List',
          description: 'Feature lists with bullets',
        },
      ],
    },
    {
      category: 'Media',
      items: [
        {
          type: 'image',
          icon: <PictureOutlined />,
          label: 'Image',
          description: 'Add images and graphics',
        },
        {
          type: 'video',
          icon: <VideoCameraOutlined />,
          label: 'Video',
          description: 'Embed videos from YouTube, Vimeo, etc.',
        },
        {
          type: 'video-player',
          icon: <PlayCircleOutlined />,
          label: 'Video Player',
          description: 'Custom video player with controls',
        },
      ],
    },
    {
      category: 'Forms & Buttons',
      items: [
        {
          type: 'button',
          icon: <LinkOutlined />,
          label: 'Button',
          description: 'Call-to-action buttons',
        },
        {
          type: 'optin-form',
          icon: <FormOutlined />,
          label: 'Opt-in Form',
          description: 'Email capture forms',
        },
        {
          type: 'order-form',
          icon: <ShoppingCartOutlined />,
          label: 'Order Form',
          description: 'Payment and checkout forms',
        },
        {
          type: 'survey',
          icon: <CheckCircleOutlined />,
          label: 'Survey',
          description: 'Interactive surveys and quizzes',
        },
      ],
    },
    {
      category: 'Commerce',
      items: [
        {
          type: 'pricing-table',
          icon: <TableOutlined />,
          label: 'Pricing Table',
          description: 'Display pricing options',
        },
        {
          type: 'countdown',
          icon: <ClockCircleOutlined />,
          label: 'Countdown Timer',
          description: 'Create urgency with timers',
        },
        {
          type: 'cart',
          icon: <ShoppingCartOutlined />,
          label: 'Shopping Cart',
          description: 'Add to cart functionality',
        },
      ],
    },
    {
      category: 'Social Proof',
      items: [
        {
          type: 'testimonial',
          icon: <StarOutlined />,
          label: 'Testimonial',
          description: 'Customer testimonials',
        },
        {
          type: 'review-carousel',
          icon: <StarOutlined />,
          label: 'Review Carousel',
          description: 'Rotating reviews',
        },
        {
          type: 'stats-counter',
          icon: <BarChartOutlined />,
          label: 'Stats Counter',
          description: 'Animated statistics',
        },
      ],
    },
    {
      category: 'Advanced',
      items: [
        {
          type: 'popup',
          icon: <GlobalOutlined />,
          label: 'Popup/Modal',
          description: 'Exit-intent and timed popups',
        },
        {
          type: 'progress-bar',
          icon: <BarChartOutlined />,
          label: 'Progress Bar',
          description: 'Show completion progress',
        },
        {
          type: 'sticky-bar',
          icon: <AlignCenterOutlined />,
          label: 'Sticky Bar',
          description: 'Sticky header/footer bars',
        },
        {
          type: 'custom-html',
          icon: <SettingOutlined />,
          label: 'Custom HTML',
          description: 'Add custom code',
        },
      ],
    },
  ];

  const handleAddElement = (type: string) => {
    const newElement: PageElement = {
      id: `element-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
    };
    setElements([...elements, newElement]);
    message.success(`${type} added to page`);
  };

  const getDefaultContent = (type: string): any => {
    const defaults: Record<string, any> = {
      headline: { text: 'Your Headline Here', tag: 'h1' },
      paragraph: { text: 'Add your paragraph text here...' },
      'bullet-list': { items: ['Feature 1', 'Feature 2', 'Feature 3'] },
      image: { src: '', alt: 'Image', width: '100%' },
      video: { url: '', provider: 'youtube' },
      button: { text: 'Click Here', link: '#', style: 'primary' },
      'optin-form': { fields: ['email'], buttonText: 'Get Started', placeholder: 'Enter your email' },
      'pricing-table': {
        plans: [
          { name: 'Basic', price: '$29', features: ['Feature 1', 'Feature 2'] },
          { name: 'Pro', price: '$49', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
        ],
      },
      countdown: { endDate: new Date(Date.now() + 86400000).toISOString(), showDays: true },
      testimonial: { quote: 'This product changed my life!', author: 'John Doe', role: 'CEO' },
    };
    return defaults[type] || {};
  };

  const getDefaultStyles = (type: string): any => {
    return {
      padding: '20px',
      margin: '10px 0',
      textAlign: 'center',
      backgroundColor: 'transparent',
    };
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(elements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setElements(items);
  };

  const handleDeleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
    setSelectedElement(null);
  };

  const handleSave = () => {
    onSave(elements);
    message.success('Page saved successfully!');
  };

  const getViewModeWidth = () => {
    switch (viewMode) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      default:
        return '100%';
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Top Toolbar */}
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Space>
          <Title level={5} style={{ margin: 0 }}>
            Visual Page Builder
          </Title>
        </Space>

        <Space>
          <Tooltip title="Undo">
            <Button icon={<UndoOutlined />} />
          </Tooltip>
          <Tooltip title="Redo">
            <Button icon={<RedoOutlined />} />
          </Tooltip>

          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as any)}
            options={[
              { label: <DesktopOutlined />, value: 'desktop' },
              { label: <TabletOutlined />, value: 'tablet' },
              { label: <MobileOutlined />, value: 'mobile' },
            ]}
          />

          <Button
            icon={<EyeOutlined />}
            onClick={() => setShowPreview(!showPreview)}
          >
            Preview
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            Save Page
          </Button>
        </Space>
      </Header>

      <Layout>
        {/* Left Sidebar - Element Library */}
        <Sider
          width={280}
          theme="light"
          style={{
            overflow: 'auto',
            height: 'calc(100vh - 64px)',
            borderRight: '1px solid #e5e7eb',
          }}
        >
          <div style={{ padding: '16px' }}>
            <Title level={5}>Elements</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Drag elements onto the canvas
            </Text>
          </div>

          <Tabs
            defaultActiveKey="elements"
            items={[
              {
                key: 'elements',
                label: 'Elements',
                children: (
                  <div style={{ padding: '0 16px 16px' }}>
                    <Collapse
                      defaultActiveKey={['Content']}
                      ghost
                      expandIconPosition="end"
                    >
                      {elementLibrary.map((category) => (
                        <Panel header={category.category} key={category.category}>
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            {category.items.map((item) => (
                              <Card
                                key={item.type}
                                size="small"
                                hoverable
                                onClick={() => handleAddElement(item.type)}
                                style={{ cursor: 'pointer' }}
                              >
                                <Space>
                                  <div style={{ fontSize: 24 }}>{item.icon}</div>
                                  <div>
                                    <div style={{ fontWeight: 500 }}>{item.label}</div>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                      {item.description}
                                    </Text>
                                  </div>
                                </Space>
                              </Card>
                            ))}
                          </Space>
                        </Panel>
                      ))}
                    </Collapse>
                  </div>
                ),
              },
              {
                key: 'templates',
                label: 'Sections',
                children: (
                  <div style={{ padding: '16px' }}>
                    <Text type="secondary">Pre-built section templates coming soon...</Text>
                  </div>
                ),
              },
            ]}
          />
        </Sider>

        {/* Main Canvas */}
        <Content
          style={{
            background: '#f8fafc',
            padding: '24px',
            overflow: 'auto',
            height: 'calc(100vh - 64px)',
          }}
        >
          <div
            style={{
              maxWidth: getViewModeWidth(),
              margin: '0 auto',
              background: '#fff',
              minHeight: '100%',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderRadius: 8,
              padding: '24px',
            }}
          >
            {elements.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '80px 20px',
                  color: '#94a3b8',
                }}
              >
                <PictureOutlined style={{ fontSize: 64, marginBottom: 16 }} />
                <Title level={4} style={{ color: '#64748b' }}>
                  Start Building Your Page
                </Title>
                <Text type="secondary">
                  Choose elements from the left sidebar to build your page
                </Text>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="page-canvas">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {elements.map((element, index) => (
                        <Draggable
                          key={element.id}
                          draggableId={element.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                marginBottom: 16,
                                padding: 16,
                                border:
                                  selectedElement === element.id
                                    ? '2px solid #6366f1'
                                    : '2px dashed #e5e7eb',
                                borderRadius: 8,
                                backgroundColor: snapshot.isDragging
                                  ? '#f8fafc'
                                  : '#fff',
                                cursor: 'move',
                              }}
                              onClick={() => setSelectedElement(element.id)}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  marginBottom: 8,
                                }}
                              >
                                <Tag color="blue">{element.type}</Tag>
                                <Button
                                  danger
                                  size="small"
                                  onClick={() => handleDeleteElement(element.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                              <div style={element.styles}>
                                {renderElementPreview(element)}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </Content>

        {/* Right Sidebar - Properties */}
        <Sider
          width={300}
          theme="light"
          style={{
            overflow: 'auto',
            height: 'calc(100vh - 64px)',
            borderLeft: '1px solid #e5e7eb',
          }}
        >
          <div style={{ padding: '16px' }}>
            {selectedElement ? (
              <>
                <Title level={5}>Element Settings</Title>
                <ElementSettings
                  element={elements.find((el) => el.id === selectedElement)!}
                  onChange={(updated) => {
                    setElements(
                      elements.map((el) =>
                        el.id === selectedElement ? updated : el
                      )
                    );
                  }}
                />
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                <SettingOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <Text type="secondary">
                  Select an element to edit its settings
                </Text>
              </div>
            )}
          </div>
        </Sider>
      </Layout>
    </Layout>
  );
};

// Helper component for element settings
const ElementSettings: React.FC<{
  element: PageElement;
  onChange: (element: PageElement) => void;
}> = ({ element, onChange }) => {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Card size="small" title="Content">
        {element.type === 'headline' && (
          <>
            <Input
              value={element.content.text}
              onChange={(e) =>
                onChange({
                  ...element,
                  content: { ...element.content, text: e.target.value },
                })
              }
              placeholder="Headline text"
            />
            <Select
              value={element.content.tag}
              onChange={(value) =>
                onChange({
                  ...element,
                  content: { ...element.content, tag: value },
                })
              }
              style={{ width: '100%', marginTop: 8 }}
            >
              <Select.Option value="h1">H1</Select.Option>
              <Select.Option value="h2">H2</Select.Option>
              <Select.Option value="h3">H3</Select.Option>
            </Select>
          </>
        )}
        {element.type === 'button' && (
          <>
            <Input
              value={element.content.text}
              onChange={(e) =>
                onChange({
                  ...element,
                  content: { ...element.content, text: e.target.value },
                })
              }
              placeholder="Button text"
            />
            <Input
              value={element.content.link}
              onChange={(e) =>
                onChange({
                  ...element,
                  content: { ...element.content, link: e.target.value },
                })
              }
              placeholder="Button link"
              style={{ marginTop: 8 }}
            />
          </>
        )}
      </Card>

      <Card size="small" title="Styling">
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div>
            <Text>Text Align</Text>
            <Segmented
              options={[
                { value: 'left', icon: <AlignLeftOutlined /> },
                { value: 'center', icon: <AlignCenterOutlined /> },
                { value: 'right', icon: <AlignRightOutlined /> },
              ]}
              value={element.styles.textAlign}
              onChange={(value) =>
                onChange({
                  ...element,
                  styles: { ...element.styles, textAlign: value },
                })
              }
              block
            />
          </div>

          <div>
            <Text>Padding</Text>
            <Slider
              min={0}
              max={100}
              value={parseInt(element.styles.padding)}
              onChange={(value) =>
                onChange({
                  ...element,
                  styles: { ...element.styles, padding: `${value}px` },
                })
              }
            />
          </div>
        </Space>
      </Card>
    </Space>
  );
};

// Helper function to render element preview
const renderElementPreview = (element: PageElement) => {
  switch (element.type) {
    case 'headline':
      return React.createElement(
        element.content.tag,
        { style: { margin: 0 } },
        element.content.text
      );
    case 'paragraph':
      return <p>{element.content.text}</p>;
    case 'button':
      return <Button type="primary" size="large">{element.content.text}</Button>;
    case 'image':
      return <div style={{ background: '#e5e7eb', padding: '40px', textAlign: 'center' }}>📷 Image Placeholder</div>;
    default:
      return <div>Element: {element.type}</div>;
  }
};

export default VisualPageBuilder;
