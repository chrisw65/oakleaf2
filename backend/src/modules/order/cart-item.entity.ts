import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Cart } from './cart.entity';
import { Product } from './product.entity';

@Entity('cart_items')
export class CartItem extends TenantBaseEntity {
  @Column({ name: 'cart_id', type: 'uuid' })
  @Index()
  cartId: string;

  @Column({ name: 'product_id', type: 'uuid' })
  @Index()
  productId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  variantId?: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number; // Price at time of adding to cart

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number; // quantity * unitPrice

  @Column({ type: 'jsonb', default: {} })
  customizations: {
    options?: Record<string, string>; // Selected variant options
    personalizations?: Record<string, string>; // Custom text, etc.
    [key: string]: any;
  };

  // Relations
  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
