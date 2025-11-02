import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  message,
  Select,
  Card,
  Dropdown,
  Typography,
} from 'antd';
import type { MenuProps, TableProps } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { Contact, ContactStatus, crmService } from '../../services/crmService';
import ContactFormModal from '../../components/crm/ContactFormModal';

const { Title } = Typography;
const { Option } = Select;

const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContactStatus | undefined>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, statusFilter, pagination.current, pagination.pageSize]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await crmService.getContacts({
        search: searchText || undefined,
        status: statusFilter,
        page: pagination.current,
        limit: pagination.pageSize,
      });

      setContacts(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
    } catch (error: any) {
      message.error('Failed to load contacts: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = () => {
    setEditingContact(null);
    setIsModalVisible(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalVisible(true);
  };

  const handleDeleteContact = (contact: Contact) => {
    Modal.confirm({
      title: 'Delete Contact',
      content: `Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await crmService.deleteContact(contact.id);
          message.success('Contact deleted successfully');
          fetchContacts();
        } catch (error: any) {
          message.error('Failed to delete contact: ' + (error.response?.data?.message || error.message));
        }
      },
    });
  };

  const handleModalSuccess = () => {
    setIsModalVisible(false);
    setEditingContact(null);
    fetchContacts();
  };

  const getStatusColor = (status: ContactStatus): string => {
    const colors: Record<ContactStatus, string> = {
      [ContactStatus.LEAD]: 'blue',
      [ContactStatus.PROSPECT]: 'orange',
      [ContactStatus.CUSTOMER]: 'green',
      [ContactStatus.INACTIVE]: 'gray',
    };
    return colors[status];
  };

  const getActionMenu = (contact: Contact): MenuProps => ({
    items: [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit',
        onClick: () => handleEditContact(contact),
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete',
        danger: true,
        onClick: () => handleDeleteContact(contact),
      },
    ],
  });

  const columns: TableProps<Contact>['columns'] = [
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <span>
            {record.firstName} {record.lastName}
          </span>
        </Space>
      ),
      sorter: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <Space>
          <MailOutlined />
          {email}
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) =>
        phone ? (
          <Space>
            <PhoneOutlined />
            {phone}
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      render: (company) => company || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: ContactStatus) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) =>
        tags?.map((tag: any) => (
          <Tag key={tag.id} color={tag.color}>
            {tag.name}
          </Tag>
        )),
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (score) => score || '-',
      sorter: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const handleTableChange: TableProps<Contact>['onChange'] = (pagination) => {
    setPagination({
      current: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
      total: pagination.total || 0,
    });
  };

  return (
    <div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>
              Contacts
            </Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateContact}>
              Add Contact
            </Button>
          </div>

          <Space style={{ width: '100%' }} size="middle">
            <Input
              placeholder="Search contacts..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Select
              placeholder="Filter by status"
              style={{ width: 200 }}
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
            >
              <Option value={ContactStatus.LEAD}>Lead</Option>
              <Option value={ContactStatus.PROSPECT}>Prospect</Option>
              <Option value={ContactStatus.CUSTOMER}>Customer</Option>
              <Option value={ContactStatus.INACTIVE}>Inactive</Option>
            </Select>
          </Space>

          <Table
            columns={columns}
            dataSource={contacts}
            rowKey="id"
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
          />
        </Space>
      </Card>

      <ContactFormModal
        visible={isModalVisible}
        contact={editingContact}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingContact(null);
        }}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default ContactsPage;
