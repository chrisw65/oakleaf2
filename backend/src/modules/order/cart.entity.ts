import { Entity, Column, OneToMany, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart extends TenantBaseEntity {
  @Column({ name: 'session_id', type: 'varchar', length: 255 })
  @Index()
  sessionId: string; // For anonymous users

  @Column({ name: 'contact_id', type: 'uuid', nullable: true })
  @Index()
  contactId?: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  @Index()
  userId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  discountCode?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: {
    funnelId?: string;
    pageId?: string;
    affiliateCode?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    [key: string]: any;
  };

  @Column({ type: 'timestamp', nullable: true })
  lastActivityAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  convertedAt?: Date; // When cart was converted to order

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId?: string; // Reference to order if converted

  @Column({ type: 'boolean', default: false })
  abandoned: boolean;

  // Relations
  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];
}
