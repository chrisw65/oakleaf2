import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity('order_items')
export class OrderItem extends TenantBaseEntity {
  @Column({ name: 'order_id', type: 'uuid' })
  @Index()
  orderId: string;

  @Column({ name: 'product_id', type: 'uuid', nullable: true })
  @Index()
  productId?: string;

  @Column({ type: 'varchar', length: 255 })
  productName: string; // Snapshot at time of purchase

  @Column({ type: 'varchar', length: 255, nullable: true })
  sku?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  variantId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  variantName?: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number; // quantity * unitPrice

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column({ type: 'boolean', default: false })
  isTaxable: boolean;

  @Column({ type: 'boolean', default: false })
  requiresShipping: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight?: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: {
    productType?: string;
    downloadUrl?: string;
    licenseKey?: string;
    [key: string]: any;
  };

  @Column({ type: 'boolean', default: false })
  fulfilled: boolean;

  @Column({ type: 'integer', default: 0 })
  fulfilledQuantity: number;

  @Column({ type: 'integer', default: 0 })
  refundedQuantity: number;

  // Relations
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderItems, { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product?: Product;
}
