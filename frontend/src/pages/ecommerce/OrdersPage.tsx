import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Table,
  Tag,
  Dropdown,
  Modal,
  message,
  Typography,
  Badge,
  Descriptions,
} from 'antd';
import type { MenuProps, TableProps } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  EyeOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { Order, OrderStatus, PaymentStatus, FulfillmentStatus, ecommerceService } from '../../services/ecommerceService';
import { format } from 'date-fns';

const { Title } = Typography;

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.current, pagination.pageSize]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await ecommerceService.getOrders(pagination.current, pagination.pageSize);
      setOrders(response.data);
      setPagination((prev) => ({ ...prev, total: response.total }));
    } catch (error: any) {
      message.error('Failed to load orders: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (order: Order) => {
    try {
      const fullOrder = await ecommerceService.getOrder(order.id);
      setSelectedOrder(fullOrder);
      setDetailsVisible(true);
    } catch (error: any) {
      message.error('Failed to load order details: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleFulfillOrder = async (order: Order) => {
    try {
      await ecommerceService.fulfillOrder(order.id);
      message.success('Order fulfilled successfully');
      fetchOrders();
    } catch (error: any) {
      message.error('Failed to fulfill order: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCancelOrder = (order: Order) => {
    Modal.confirm({
      title: 'Cancel Order',
      content: `Are you sure you want to cancel order ${order.orderNumber}?`,
      okText: 'Cancel Order',
      okType: 'danger',
      onOk: async () => {
        try {
          await ecommerceService.cancelOrder(order.id);
          message.success('Order canceled successfully');
          fetchOrders();
        } catch (error: any) {
          message.error('Failed to cancel order: ' + (error.response?.data?.message || error.message));
        }
      },
    });
  };

  const handleRefundOrder = (order: Order) => {
    Modal.confirm({
      title: 'Refund Order',
      content: `Are you sure you want to refund order ${order.orderNumber} for $${order.total.toFixed(2)}?`,
      okText: 'Refund',
      onOk: async () => {
        try {
          await ecommerceService.refundOrder(order.id);
          message.success('Order refunded successfully');
          fetchOrders();
        } catch (error: any) {
          message.error('Failed to refund order: ' + (error.response?.data?.message || error.message));
        }
      },
    });
  };

  const getStatusTag = (status: OrderStatus) => {
    const config: Record<OrderStatus, { color: string }> = {
      [OrderStatus.PENDING]: { color: 'default' },
      [OrderStatus.PROCESSING]: { color: 'processing' },
      [OrderStatus.COMPLETED]: { color: 'success' },
      [OrderStatus.CANCELED]: { color: 'error' },
    };
    return <Tag color={config[status].color}>{status.toUpperCase()}</Tag>;
  };

  const getPaymentStatusTag = (status: PaymentStatus) => {
    const config: Record<PaymentStatus, { color: string }> = {
      [PaymentStatus.PENDING]: { color: 'default' },
      [PaymentStatus.PAID]: { color: 'success' },
      [PaymentStatus.FAILED]: { color: 'error' },
      [PaymentStatus.REFUNDED]: { color: 'warning' },
      [PaymentStatus.PARTIALLY_REFUNDED]: { color: 'orange' },
    };
    return <Tag color={config[status].color}>{status.replace('_', ' ').toUpperCase()}</Tag>;
  };

  const getActionMenu = (order: Order): MenuProps => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'View Details',
        onClick: () => handleViewOrder(order),
      },
    ];

    if (order.fulfillmentStatus === FulfillmentStatus.UNFULFILLED && order.status !== OrderStatus.CANCELED) {
      items.push({
        key: 'fulfill',
        icon: <CheckCircleOutlined />,
        label: 'Fulfill Order',
        onClick: () => handleFulfillOrder(order),
      });
    }

    if (order.paymentStatus === PaymentStatus.PAID && order.status !== OrderStatus.CANCELED) {
      items.push({
        key: 'refund',
        icon: <DollarOutlined />,
        label: 'Refund',
        onClick: () => handleRefundOrder(order),
      });
    }

    if (order.status !== OrderStatus.CANCELED && order.status !== OrderStatus.COMPLETED) {
      items.push(
        { type: 'divider' },
        {
          key: 'cancel',
          icon: <CloseCircleOutlined />,
          label: 'Cancel Order',
          danger: true,
          onClick: () => handleCancelOrder(order),
        }
      );
    }

    return { items };
  };

  const columns: TableProps<Order>['columns'] = [
    {
      title: 'Order #',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 120,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div>{record.customerName || 'N/A'}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.customerEmail}</div>
        </div>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (total, record) => `$${total.toFixed(2)} ${record.currency}`,
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, record) => getStatusTag(record.status),
    },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 150,
      render: (status) => getPaymentStatusTag(status),
    },
    {
      title: 'Fulfillment',
      dataIndex: 'fulfillmentStatus',
      key: 'fulfillmentStatus',
      width: 130,
      render: (status: FulfillmentStatus) => (
        <Badge
          status={status === FulfillmentStatus.FULFILLED ? 'success' : 'default'}
          text={status.replace('_', ' ').toUpperCase()}
        />
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => format(new Date(date), 'MMM dd, yyyy'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const handleTableChange: TableProps<Order>['onChange'] = (pag) => {
    setPagination({
      current: pag.current || 1,
      pageSize: pag.pageSize || 10,
      total: pag.total || 0,
    });
  };

  return (
    <div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} style={{ margin: 0 }}>
            Orders
          </Title>

          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
          />
        </Space>
      </Card>

      <Modal
        title={`Order ${selectedOrder?.orderNumber}`}
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedOrder && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Customer">{selectedOrder.customerName}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedOrder.customerEmail}</Descriptions.Item>
            <Descriptions.Item label="Status">{getStatusTag(selectedOrder.status)}</Descriptions.Item>
            <Descriptions.Item label="Payment">{getPaymentStatusTag(selectedOrder.paymentStatus)}</Descriptions.Item>
            <Descriptions.Item label="Items" span={2}>
              {selectedOrder.items.map((item) => (
                <div key={item.id}>
                  {item.product?.name} × {item.quantity} = ${item.subtotal.toFixed(2)}
                </div>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="Subtotal">${selectedOrder.subtotal.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="Tax">${selectedOrder.tax.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="Shipping">${selectedOrder.shipping.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="Total" span={2}>
              <strong>${selectedOrder.total.toFixed(2)} {selectedOrder.currency}</strong>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;
