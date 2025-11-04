import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  List,
  Input,
  Select,
  Space,
  Typography,
  Tag,
  Popconfirm,
  message,
  Modal,
  Form,
  Empty,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  PushpinOutlined,
  PushpinFilled,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { crmService, Note, CreateNoteDto } from '../../services/crmService';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

interface ContactNotesProps {
  contactId: string;
}

const ContactNotes: React.FC<ContactNotesProps> = ({ contactId }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [form] = Form.useForm();
  const limit = 10;

  useEffect(() => {
    loadNotes();
  }, [contactId, page]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const response = await crmService.getContactNotes(contactId, {
        page,
        limit,
      });
      setNotes(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load notes:', error);
      message.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingNote(null);
    form.resetFields();
    setShowModal(true);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    form.setFieldsValue({
      content: note.content,
      noteType: note.noteType,
    });
    setShowModal(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingNote) {
        await crmService.updateNote(editingNote.id, values);
        message.success('Note updated successfully');
      } else {
        await crmService.createNote(contactId, values);
        message.success('Note added successfully');
      }
      setShowModal(false);
      form.resetFields();
      loadNotes();
    } catch (error) {
      console.error('Failed to save note:', error);
      message.error('Failed to save note');
    }
  };

  const handleTogglePin = async (noteId: string) => {
    try {
      await crmService.toggleNotePin(noteId);
      message.success('Note pin status updated');
      loadNotes();
    } catch (error) {
      console.error('Failed to toggle pin:', error);
      message.error('Failed to toggle pin');
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await crmService.deleteNote(noteId);
      message.success('Note deleted successfully');
      loadNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
      message.error('Failed to delete note');
    }
  };

  const noteTypes = [
    { value: 'call', label: 'Call', color: 'blue' },
    { value: 'meeting', label: 'Meeting', color: 'green' },
    { value: 'email', label: 'Email', color: 'orange' },
    { value: 'general', label: 'General', color: 'default' },
    { value: 'follow_up', label: 'Follow Up', color: 'red' },
  ];

  const getNoteTypeColor = (type?: string) => {
    return noteTypes.find((t) => t.value === type)?.color || 'default';
  };

  return (
    <>
      <Card
        title={
          <Space>
            <Title level={5} style={{ margin: 0 }}>Notes</Title>
            <Tag color="blue">{total} Notes</Tag>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadNotes} loading={loading}>
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Add Note
            </Button>
          </Space>
        }
      >
        {loading && notes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : notes.length === 0 ? (
          <Empty
            description="No notes yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Add First Note
            </Button>
          </Empty>
        ) : (
          <>
            <List
              dataSource={notes}
              renderItem={(note) => (
                <List.Item
                  key={note.id}
                  style={{
                    backgroundColor: note.isPinned ? '#f6ffed' : undefined,
                    padding: 16,
                    marginBottom: 8,
                    border: note.isPinned ? '1px solid #b7eb8f' : '1px solid #f0f0f0',
                    borderRadius: 4,
                  }}
                  actions={[
                    <Button
                      type="text"
                      size="small"
                      icon={note.isPinned ? <PushpinFilled /> : <PushpinOutlined />}
                      onClick={() => handleTogglePin(note.id)}
                    />,
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(note)}
                    />,
                    <Popconfirm
                      title="Delete this note?"
                      onConfirm={() => handleDelete(note.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        {note.isPinned && <PushpinFilled style={{ color: '#52c41a' }} />}
                        {note.noteType && (
                          <Tag color={getNoteTypeColor(note.noteType)}>
                            {note.noteType}
                          </Tag>
                        )}
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(note.createdAt).format('MMM D, YYYY h:mm A')}
                        </Text>
                        {note.editedAt && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            (edited)
                          </Text>
                        )}
                      </Space>
                    }
                    description={
                      <div>
                        <div style={{ marginTop: 8, marginBottom: 8, whiteSpace: 'pre-wrap' }}>
                          {note.content}
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          by {note.createdBy.firstName} {note.createdBy.lastName}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />

            {total > limit && (
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <Space>
                  <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
                    Previous
                  </Button>
                  <Text>
                    Page {page} of {Math.ceil(total / limit)}
                  </Text>
                  <Button
                    disabled={page >= Math.ceil(total / limit)}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </Space>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal
        title={editingNote ? 'Edit Note' : 'Add Note'}
        open={showModal}
        onCancel={() => {
          setShowModal(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
        okText={editingNote ? 'Update' : 'Add'}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="content"
            label="Note Content"
            rules={[{ required: true, message: 'Please enter note content' }]}
          >
            <TextArea rows={6} placeholder="Enter your note here..." />
          </Form.Item>

          <Form.Item name="noteType" label="Note Type">
            <Select placeholder="Select note type" allowClear>
              {noteTypes.map((type) => (
                <Option key={type.value} value={type.value}>
                  <Tag color={type.color}>{type.label}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ContactNotes;
