import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Checkbox, message } from 'antd';
import { Product, CreateProductDto, ecommerceService } from '../../services/ecommerceService';

const { Option } = Select;
const { TextArea } = Input;

interface ProductFormModalProps {
  visible: boolean;
  product: Product | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  visible,
  product,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && product) {
      form.setFieldsValue({
        name: product.name,
        description: product.description,
        sku: product.sku,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        cost: product.cost,
        currency: product.currency,
        inventory: product.inventory,
        lowStockThreshold: product.lowStockThreshold,
        category: product.category,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      });
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({
        currency: 'USD',
        inventory: 0,
        isActive: true,
        isFeatured: false,
      });
    }
  }, [visible, product, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const data: CreateProductDto = {
        name: values.name,
        description: values.description,
        sku: values.sku,
        price: values.price,
        compareAtPrice: values.compareAtPrice,
        cost: values.cost,
        currency: values.currency || 'USD',
        inventory: values.inventory || 0,
        lowStockThreshold: values.lowStockThreshold,
        category: values.category,
        isActive: values.isActive !== undefined ? values.isActive : true,
        isFeatured: values.isFeatured || false,
      };

      if (product) {
        await ecommerceService.updateProduct(product.id, data);
        message.success('Product updated successfully');
      } else {
        await ecommerceService.createProduct(data);
        message.success('Product created successfully');
      }

      onSuccess();
    } catch (error: any) {
      if (error.errorFields) return;
      message.error(
        `Failed to ${product ? 'update' : 'create'} product: ` +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={product ? 'Edit Product' : 'Add Product'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
        <Form.Item
          label="Product Name"
          name="name"
          rules={[{ required: true, message: 'Please enter product name' }]}
        >
          <Input placeholder="Enter product name" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea rows={3} placeholder="Enter product description" />
        </Form.Item>

        <Form.Item label="SKU" name="sku">
          <Input placeholder="Enter SKU (optional)" />
        </Form.Item>

        <Form.Item
          label="Price"
          name="price"
          rules={[{ required: true, message: 'Please enter price' }]}
        >
          <InputNumber
            min={0}
            step={0.01}
            style={{ width: '100%' }}
            placeholder="0.00"
            formatter={(value) => `$ ${value}`}
            parser={(value) => value!.replace(/\$\s?/g, '') as any}
          />
        </Form.Item>

        <Form.Item label="Compare At Price" name="compareAtPrice">
          <InputNumber
            min={0}
            step={0.01}
            style={{ width: '100%' }}
            placeholder="Original price (optional)"
            formatter={(value) => `$ ${value}`}
            parser={(value) => value!.replace(/\$\s?/g, '') as any}
          />
        </Form.Item>

        <Form.Item label="Cost" name="cost">
          <InputNumber
            min={0}
            step={0.01}
            style={{ width: '100%' }}
            placeholder="Cost per unit (optional)"
            formatter={(value) => `$ ${value}`}
            parser={(value) => value!.replace(/\$\s?/g, '') as any}
          />
        </Form.Item>

        <Form.Item label="Currency" name="currency">
          <Select>
            <Option value="USD">USD</Option>
            <Option value="EUR">EUR</Option>
            <Option value="GBP">GBP</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Inventory"
          name="inventory"
          rules={[{ required: true, message: 'Please enter inventory' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} placeholder="Stock quantity" />
        </Form.Item>

        <Form.Item label="Low Stock Threshold" name="lowStockThreshold">
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            placeholder="Alert when stock is below this"
          />
        </Form.Item>

        <Form.Item label="Category" name="category">
          <Input placeholder="Product category (optional)" />
        </Form.Item>

        <Form.Item name="isActive" valuePropName="checked">
          <Checkbox>Active (visible in store)</Checkbox>
        </Form.Item>

        <Form.Item name="isFeatured" valuePropName="checked">
          <Checkbox>Featured product</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductFormModal;
