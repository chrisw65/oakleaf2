import apiService from './api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  currency: string;
  inventory: number;
  lowStockThreshold?: number;
  images?: string[];
  category?: string;
  tags?: string[];
  isActive: boolean;
  isFeatured: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  currency?: string;
  inventory: number;
  lowStockThreshold?: number;
  images?: string[];
  category?: string;
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  tenantId: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  subtotal: number;
  tax?: number;
  shipping?: number;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartDto {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface Order {
  id: string;
  tenantId: string;
  userId?: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  customerEmail?: string;
  customerName?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
  trackingNumber?: string;
  paidAt?: string;
  fulfilledAt?: string;
  canceledAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_REFUNDED = 'partially_refunded',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export enum FulfillmentStatus {
  UNFULFILLED = 'unfulfilled',
  PARTIAL = 'partial',
  FULFILLED = 'fulfilled',
  RETURNED = 'returned',
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
}

export interface CreateOrderDto {
  userId?: string;
  customerEmail: string;
  customerName: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: Address;
  billingAddress?: Address;
  notes?: string;
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  trackingNumber?: string;
  notes?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// ECOMMERCE SERVICE
// ============================================================================

class EcommerceService {
  // PRODUCTS
  async getProducts(page = 1, limit = 20, search?: string): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);

    return apiService.get(`/products?${params.toString()}`);
  }

  async getProduct(id: string): Promise<Product> {
    return apiService.get(`/products/${id}`);
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    return apiService.post('/products', data);
  }

  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    return apiService.put(`/products/${id}`, data);
  }

  async deleteProduct(id: string): Promise<void> {
    return apiService.delete(`/products/${id}`);
  }

  async updateInventory(id: string, quantity: number): Promise<Product> {
    return apiService.put(`/products/${id}/inventory`, { quantity });
  }

  // CART
  async getCart(): Promise<Cart> {
    return apiService.get('/cart');
  }

  async addToCart(data: AddToCartDto): Promise<Cart> {
    return apiService.post('/cart/items', data);
  }

  async updateCartItem(itemId: string, data: UpdateCartItemDto): Promise<Cart> {
    return apiService.put(`/cart/items/${itemId}`, data);
  }

  async removeFromCart(itemId: string): Promise<Cart> {
    return apiService.delete(`/cart/items/${itemId}`);
  }

  async clearCart(): Promise<void> {
    return apiService.delete('/cart');
  }

  // ORDERS
  async getOrders(page = 1, limit = 20): Promise<PaginatedResponse<Order>> {
    return apiService.get(`/orders?page=${page}&limit=${limit}`);
  }

  async getOrder(id: string): Promise<Order> {
    return apiService.get(`/orders/${id}`);
  }

  async createOrder(data: CreateOrderDto): Promise<Order> {
    return apiService.post('/orders', data);
  }

  async updateOrder(id: string, data: UpdateOrderDto): Promise<Order> {
    return apiService.put(`/orders/${id}`, data);
  }

  async cancelOrder(id: string): Promise<Order> {
    return apiService.post(`/orders/${id}/cancel`);
  }

  async fulfillOrder(id: string, trackingNumber?: string): Promise<Order> {
    return apiService.post(`/orders/${id}/fulfill`, { trackingNumber });
  }

  async refundOrder(id: string, amount?: number): Promise<Order> {
    return apiService.post(`/orders/${id}/refund`, { amount });
  }
}

export const ecommerceService = new EcommerceService();
export default ecommerceService;
