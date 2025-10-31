import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../cart.entity';
import { CartItem } from '../cart-item.entity';
import { Product } from '../product.entity';
import { AddToCartDto, UpdateCartItemDto } from '../dto/cart.dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Get or create cart for session/user
   */
  async getOrCreate(
    sessionId: string,
    tenantId: string,
    userId?: string,
    contactId?: string,
  ): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { sessionId, tenantId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        tenantId,
        sessionId,
        userId,
        contactId,
      });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  /**
   * Add item to cart
   */
  async addItem(
    cartId: string,
    addToCartDto: AddToCartDto,
    tenantId: string,
  ): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId, tenantId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const product = await this.productRepository.findOne({
      where: { id: addToCartDto.productId, tenantId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Get price (handle variants if provided)
    let unitPrice = product.price;
    if (addToCartDto.variantId && product.variants) {
      const variant = product.variants.find(
        (v) => v.id === addToCartDto.variantId,
      );
      if (variant && variant.price) {
        unitPrice = variant.price;
      }
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find(
      (item) =>
        item.productId === addToCartDto.productId &&
        item.variantId === addToCartDto.variantId,
    );

    if (existingItem) {
      // Update quantity
      existingItem.quantity += addToCartDto.quantity;
      existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
      await this.cartItemRepository.save(existingItem);
    } else {
      // Add new item
      const cartItem = this.cartItemRepository.create({
        tenantId,
        cartId: cart.id,
        productId: product.id,
        variantId: addToCartDto.variantId,
        quantity: addToCartDto.quantity,
        unitPrice,
        totalPrice: unitPrice * addToCartDto.quantity,
        customizations: addToCartDto.customizations || {},
      });
      await this.cartItemRepository.save(cartItem);
    }

    // Update cart totals
    await this.recalculateCart(cart.id, tenantId);

    // Update last activity
    cart.lastActivityAt = new Date();
    await this.cartRepository.save(cart);

    return this.getOrCreate(cart.sessionId, tenantId, cart.userId, cart.contactId);
  }

  /**
   * Update cart item quantity
   */
  async updateItem(
    cartId: string,
    itemId: string,
    updateDto: UpdateCartItemDto,
    tenantId: string,
  ): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId, tenantId },
      relations: ['items'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId, tenantId },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    item.quantity = updateDto.quantity;
    item.totalPrice = item.quantity * item.unitPrice;
    await this.cartItemRepository.save(item);

    // Update cart totals
    await this.recalculateCart(cart.id, tenantId);

    // Update last activity
    cart.lastActivityAt = new Date();
    await this.cartRepository.save(cart);

    return this.getOrCreate(cart.sessionId, tenantId, cart.userId, cart.contactId);
  }

  /**
   * Remove item from cart
   */
  async removeItem(
    cartId: string,
    itemId: string,
    tenantId: string,
  ): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId, tenantId },
      relations: ['items'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId, tenantId },
    });

    if (item) {
      await this.cartItemRepository.remove(item);
    }

    // Update cart totals
    await this.recalculateCart(cart.id, tenantId);

    // Update last activity
    cart.lastActivityAt = new Date();
    await this.cartRepository.save(cart);

    return this.getOrCreate(cart.sessionId, tenantId, cart.userId, cart.contactId);
  }

  /**
   * Clear cart
   */
  async clear(cartId: string, tenantId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId, tenantId },
      relations: ['items'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Remove all items
    await this.cartItemRepository.remove(cart.items);

    // Reset cart totals
    cart.subtotal = 0;
    cart.discountAmount = 0;
    cart.taxAmount = 0;
    cart.shippingAmount = 0;
    cart.total = 0;
    cart.lastActivityAt = new Date();

    await this.cartRepository.save(cart);

    return this.getOrCreate(cart.sessionId, tenantId, cart.userId, cart.contactId);
  }

  /**
   * Convert cart to order
   */
  async markAsConverted(
    cartId: string,
    orderId: string,
    tenantId: string,
  ): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId, tenantId },
    });

    if (cart) {
      cart.convertedAt = new Date();
      cart.orderId = orderId;
      await this.cartRepository.save(cart);
    }
  }

  /**
   * Recalculate cart totals
   */
  private async recalculateCart(
    cartId: string,
    tenantId: string,
  ): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId, tenantId },
      relations: ['items'],
    });

    if (!cart) {
      return;
    }

    cart.subtotal = cart.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0,
    );

    // TODO: Calculate tax based on tax rules
    cart.taxAmount = 0;

    // TODO: Calculate shipping based on shipping rules
    cart.shippingAmount = 0;

    // TODO: Apply discount if discount code is set
    // cart.discountAmount = ...

    cart.total =
      cart.subtotal + cart.taxAmount + cart.shippingAmount - cart.discountAmount;

    await this.cartRepository.save(cart);
  }

  /**
   * Get abandoned carts
   */
  async getAbandonedCarts(
    tenantId: string,
    hoursAgo: number = 24,
  ): Promise<Cart[]> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hoursAgo);

    return this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.items', 'items')
      .where('cart.tenantId = :tenantId', { tenantId })
      .andWhere('cart.convertedAt IS NULL')
      .andWhere('cart.lastActivityAt < :cutoffDate', { cutoffDate })
      .andWhere('cart.abandoned = false')
      .getMany();
  }

  /**
   * Mark cart as abandoned
   */
  async markAsAbandoned(cartId: string, tenantId: string): Promise<void> {
    await this.cartRepository.update(
      { id: cartId, tenantId },
      { abandoned: true },
    );
  }
}
