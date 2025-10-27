import { Entity, Column, OneToMany, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { OrderItem } from './order-item.entity';

export enum ProductType {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
  SERVICE = 'service',
  SUBSCRIPTION = 'subscription',
}

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

@Entity('products')
export class Product extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  shortDescription?: string;

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.PHYSICAL,
  })
  @Index()
  productType: ProductType;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  @Index()
  status: ProductStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  compareAtPrice?: number; // Original price for showing discounts

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost?: number; // Cost of goods

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sku?: string; // Stock keeping unit

  @Column({ type: 'varchar', length: 255, nullable: true })
  barcode?: string;

  @Column({ type: 'boolean', default: true })
  trackInventory: boolean;

  @Column({ type: 'integer', default: 0 })
  inventoryQuantity: number;

  @Column({ type: 'integer', nullable: true })
  lowStockThreshold?: number;

  @Column({ type: 'boolean', default: true })
  allowBackorder: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight?: number; // in kg

  @Column({ type: 'varchar', length: 50, nullable: true })
  weightUnit?: string;

  @Column({ type: 'jsonb', default: {} })
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string; // cm, in, etc.
  };

  @Column({ type: 'boolean', default: false })
  requiresShipping: boolean;

  @Column({ type: 'boolean', default: true })
  taxable: boolean;

  @Column({ type: 'jsonb', default: '[]' })
  images: Array<{
    url: string;
    alt?: string;
    position?: number;
  }>;

  @Column({ type: 'jsonb', default: '[]' })
  categories: string[]; // Array of category names or IDs

  @Column({ type: 'jsonb', default: '[]' })
  tags: string[];

  @Column({ type: 'jsonb', default: '[]' })
  variants: Array<{
    id: string;
    name: string;
    sku?: string;
    price?: number;
    compareAtPrice?: number;
    inventoryQuantity?: number;
    options: Record<string, string>; // e.g., { size: 'Large', color: 'Red' }
  }>;

  @Column({ type: 'jsonb', default: {} })
  metadata: {
    digitalDownloadUrl?: string;
    fileSize?: number;
    subscriptionInterval?: string; // monthly, yearly
    subscriptionIntervalCount?: number;
    trialPeriodDays?: number;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', default: {} })
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };

  @Column({ type: 'integer', default: 0 })
  salesCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ type: 'integer', default: 0 })
  viewCount: number;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @Column({ type: 'boolean', default: false })
  featured: boolean;

  // Relations
  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
}
