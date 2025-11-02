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
  Input,
  InputNumber,
  Image,
} from 'antd';
import type { MenuProps, TableProps } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  SearchOutlined,
  StarOutlined,
  StarFilled,
  DollarOutlined,
} from '@ant-design/icons';
import { Product, ecommerceService } from '../../services/ecommerceService';
import ProductFormModal from '../../components/ecommerce/ProductFormModal';

const { Title } = Typography;

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, [pagination.current, pagination.pageSize, searchText]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await ecommerceService.getProducts(
        pagination.current,
        pagination.pageSize,
        searchText || undefined
      );
      setProducts(response.data);
      setPagination((prev) => ({ ...prev, total: response.total }));
    } catch (error: any) {
      message.error('Failed to load products: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsModalVisible(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalVisible(true);
  };

  const handleDeleteProduct = (product: Product) => {
    Modal.confirm({
      title: 'Delete Product',
      content: `Are you sure you want to delete "${product.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await ecommerceService.deleteProduct(product.id);
          message.success('Product deleted successfully');
          fetchProducts();
        } catch (error: any) {
          message.error('Failed to delete product: ' + (error.response?.data?.message || error.message));
        }
      },
    });
  };

  const handleUpdateInventory = (product: Product) => {
    let newQuantity = product.inventory;
    Modal.confirm({
      title: 'Update Inventory',
      content: (
        <div>
          <p>Current stock: {product.inventory}</p>
          <InputNumber
            min={0}
            defaultValue={product.inventory}
            onChange={(value) => (newQuantity = value || 0)}
            style={{ width: '100%' }}
          />
        </div>
      ),
      onOk: async () => {
        try {
          await ecommerceService.updateInventory(product.id, newQuantity);
          message.success('Inventory updated successfully');
          fetchProducts();
        } catch (error: any) {
          message.error('Failed to update inventory: ' + (error.response?.data?.message || error.message));
        }
      },
    });
  };

  const getActionMenu = (product: Product): MenuProps => ({
    items: [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit',
        onClick: () => handleEditProduct(product),
      },
      {
        key: 'inventory',
        icon: <DollarOutlined />,
        label: 'Update Inventory',
        onClick: () => handleUpdateInventory(product),
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete',
        danger: true,
        onClick: () => handleDeleteProduct(product),
      },
    ],
  });

  const columns: TableProps<Product>['columns'] = [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <Space>
          {record.images && record.images.length > 0 ? (
            <Image
              src={record.images[0]}
              alt={record.name}
              width={50}
              height={50}
              style={{ objectFit: 'cover', borderRadius: 4 }}
            />
          ) : (
            <div
              style={{
                width: 50,
                height: 50,
                background: '#f0f0f0',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              📦
            </div>
          )}
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            {record.sku && <div style={{ fontSize: 12, color: '#999' }}>SKU: {record.sku}</div>}
          </div>
        </Space>
      ),
    },
    {
      title: 'Price',
      key: 'price',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            ${record.price.toFixed(2)} {record.currency}
          </div>
          {record.compareAtPrice && record.compareAtPrice > record.price && (
            <div style={{ fontSize: 12, color: '#999', textDecoration: 'line-through' }}>
              ${record.compareAtPrice.toFixed(2)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Inventory',
      dataIndex: 'inventory',
      key: 'inventory',
      width: 120,
      render: (inventory, record) => {
        const isLowStock = record.lowStockThreshold && inventory <= record.lowStockThreshold;
        return (
          <Tag color={isLowStock ? 'red' : inventory > 0 ? 'green' : 'default'}>
            {inventory} in stock
          </Tag>
        );
      },
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => category || '-',
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Space>
          {record.isActive ? (
            <Tag color="success">Active</Tag>
          ) : (
            <Tag color="default">Inactive</Tag>
          )}
          {record.isFeatured && <StarFilled style={{ color: '#faad14' }} />}
        </Space>
      ),
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

  const handleTableChange: TableProps<Product>['onChange'] = (pag) => {
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>
              Products
            </Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateProduct}>
              Add Product
            </Button>
          </div>

          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
            allowClear
          />

          <Table
            columns={columns}
            dataSource={products}
            rowKey="id"
            loading={loading}
            pagination={pagination}
            onChange={handleTableChange}
          />
        </Space>
      </Card>

      <ProductFormModal
        visible={isModalVisible}
        product={editingProduct}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingProduct(null);
        }}
        onSuccess={() => {
          setIsModalVisible(false);
          setEditingProduct(null);
          fetchProducts();
        }}
      />
    </div>
  );
};

export default ProductsPage;
