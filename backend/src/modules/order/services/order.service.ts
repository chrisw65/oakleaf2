import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from '../order.entity';
import { OrderItem } from '../order-item.entity';
import { Product } from '../product.entity';
import { Contact } from '../../crm/contact.entity';
import { ProductService } from './product.service';
import {
  CreateOrderDto,
  UpdateOrderDto,
  OrderQueryDto,
  RefundOrderDto,
} from '../dto/order.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly productService: ProductService,
  ) {}

  /**
   * Create a new order
   */
  async create(
    createOrderDto: CreateOrderDto,
    tenantId: string,
    userId?: string,
  ): Promise<Order> {
    // Generate order number
    const orderNumber = await this.generateOrderNumber(tenantId);

    // Calculate order totals
    const items = await this.prepareOrderItems(
      createOrderDto.items,
      tenantId,
    );

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

    // TODO: Calculate tax based on tax rules
    const taxRate = 0; // Default 0%, implement tax calculation logic
    const taxAmount = subtotal * (taxRate / 100);

    // TODO: Calculate shipping based on shipping rules
    const shippingAmount = 0;

    // TODO: Apply discount code if provided
    const discountAmount = 0;

    const total = subtotal + taxAmount + shippingAmount - discountAmount;

    // Create or find contact
    let contactId = createOrderDto.contactId;
    if (!contactId && createOrderDto.customerEmail) {
      const existingContact = await this.contactRepository.findOne({
        where: { email: createOrderDto.customerEmail, tenantId },
      });

      if (existingContact) {
        contactId = existingContact.id;
      }
    }

    // Create order
    const order = this.orderRepository.create({
      tenantId,
      orderNumber,
      contactId,
      userId,
      customerEmail: createOrderDto.customerEmail,
      customerName: createOrderDto.customerName,
      customerPhone: createOrderDto.customerPhone,
      subtotal,
      discountAmount,
      discountCode: createOrderDto.discountCode,
      taxAmount,
      taxRate,
      shippingAmount,
      total,
      paymentMethod: createOrderDto.paymentMethod,
      billingAddress: createOrderDto.billingAddress || {},
      shippingAddress: createOrderDto.shippingAddress || {},
      customerNotes: createOrderDto.customerNotes,
      metadata: createOrderDto.metadata || {},
      isTest: createOrderDto.isTest || false,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Save order items
    for (const itemData of items) {
      const orderItem = this.orderItemRepository.create({
        ...itemData,
        tenantId,
        orderId: savedOrder.id,
      });
      await this.orderItemRepository.save(orderItem);
    }

    // Update product inventory
    for (const item of items) {
      if (item.productId) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId, tenantId },
        });

        if (product && product.trackInventory) {
          await this.productService.updateInventory(
            item.productId,
            -item.quantity,
            tenantId,
          );
        }

        // Update product sales stats
        await this.productRepository.increment(
          { id: item.productId },
          'salesCount',
          item.quantity,
        );
        await this.productRepository.increment(
          { id: item.productId },
          'totalRevenue',
          item.totalPrice,
        );
      }
    }

    this.logger.log(`Created order ${savedOrder.orderNumber}`);

    return this.findOne(savedOrder.id, tenantId);
  }

  /**
   * Find all orders with filters and pagination
   */
  async findAll(
    queryDto: OrderQueryDto,
    tenantId: string,
  ): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.contact', 'contact')
      .where('order.tenantId = :tenantId', { tenantId });

    // Search
    if (queryDto.search) {
      queryBuilder.andWhere(
        '(order.orderNumber ILIKE :search OR order.customerEmail ILIKE :search OR order.customerName ILIKE :search)',
        { search: `%${queryDto.search}%` },
      );
    }

    // Filters
    if (queryDto.status) {
      queryBuilder.andWhere('order.status = :status', {
        status: queryDto.status,
      });
    }

    if (queryDto.paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', {
        paymentStatus: queryDto.paymentStatus,
      });
    }

    if (queryDto.fulfillmentStatus) {
      queryBuilder.andWhere('order.fulfillmentStatus = :fulfillmentStatus', {
        fulfillmentStatus: queryDto.fulfillmentStatus,
      });
    }

    if (queryDto.contactId) {
      queryBuilder.andWhere('order.contactId = :contactId', {
        contactId: queryDto.contactId,
      });
    }

    if (queryDto.createdAfter) {
      queryBuilder.andWhere('order.createdAt >= :createdAfter', {
        createdAfter: new Date(queryDto.createdAfter),
      });
    }

    if (queryDto.createdBefore) {
      queryBuilder.andWhere('order.createdAt <= :createdBefore', {
        createdBefore: new Date(queryDto.createdBefore),
      });
    }

    // Pagination and sorting
    queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .take(limit)
      .skip(skip);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * Find one order by ID
   */
  async findOne(id: string, tenantId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, tenantId },
      relations: ['items', 'items.product', 'contact'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  /**
   * Find order by order number
   */
  async findByOrderNumber(orderNumber: string, tenantId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderNumber, tenantId },
      relations: ['items', 'items.product', 'contact'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderNumber} not found`);
    }

    return order;
  }

  /**
   * Update order
   */
  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    tenantId: string,
  ): Promise<Order> {
    const order = await this.findOne(id, tenantId);

    Object.assign(order, updateOrderDto);

    // Update timestamps based on status changes
    if (updateOrderDto.paymentStatus === PaymentStatus.PAID && !order.paidAt) {
      order.paidAt = new Date();
    }

    if (
      updateOrderDto.fulfillmentStatus === FulfillmentStatus.FULFILLED &&
      !order.fulfilledAt
    ) {
      order.fulfilledAt = new Date();
    }

    if (updateOrderDto.status === OrderStatus.CANCELLED && !order.cancelledAt) {
      order.cancelledAt = new Date();
    }

    return this.orderRepository.save(order);
  }

  /**
   * Cancel order
   */
  async cancel(id: string, tenantId: string, reason?: string): Promise<Order> {
    const order = await this.findOne(id, tenantId);

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed order');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    order.status = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();

    if (reason) {
      order.internalNotes = (order.internalNotes || '') + `\nCancellation reason: ${reason}`;
    }

    // Restore inventory
    for (const item of order.items) {
      if (item.productId && !item.fulfilled) {
        await this.productService.updateInventory(
          item.productId,
          item.quantity,
          tenantId,
        );
      }
    }

    const saved = await this.orderRepository.save(order);

    this.logger.log(`Cancelled order ${order.orderNumber}`);

    return saved;
  }

  /**
   * Refund order
   */
  async refund(
    id: string,
    refundDto: RefundOrderDto,
    tenantId: string,
  ): Promise<Order> {
    const order = await this.findOne(id, tenantId);

    if (order.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestException('Can only refund paid orders');
    }

    const refundAmount = refundDto.amount || order.total;

    if (refundAmount > order.total - order.refundAmount) {
      throw new BadRequestException('Refund amount exceeds order total');
    }

    order.refundAmount += refundAmount;
    order.refundedAt = new Date();

    if (order.refundAmount >= order.total) {
      order.paymentStatus = PaymentStatus.REFUNDED;
      order.status = OrderStatus.REFUNDED;
    } else {
      order.paymentStatus = PaymentStatus.PARTIALLY_REFUNDED;
    }

    if (refundDto.reason) {
      order.internalNotes =
        (order.internalNotes || '') + `\nRefund reason: ${refundDto.reason}`;
    }

    const saved = await this.orderRepository.save(order);

    this.logger.log(
      `Refunded ${refundAmount} for order ${order.orderNumber}`,
    );

    return saved;
  }

  /**
   * Get order statistics
   */
  async getStats(
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .where('order.tenantId = :tenantId', { tenantId });

    if (startDate) {
      queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('order.createdAt <= :endDate', { endDate });
    }

    const total = await queryBuilder.getCount();

    const totalRevenue = await queryBuilder
      .select('SUM(order.total)', 'sum')
      .getRawOne()
      .then((result) => parseFloat(result.sum || '0'));

    const byStatus = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(order.total)', 'revenue')
      .where('order.tenantId = :tenantId', { tenantId })
      .groupBy('order.status')
      .getRawMany();

    const averageOrderValue = total > 0 ? totalRevenue / total : 0;

    return {
      total,
      totalRevenue,
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      byStatus,
    };
  }

  /**
   * Prepare order items from DTO
   */
  private async prepareOrderItems(
    itemDtos: any[],
    tenantId: string,
  ): Promise<Array<Partial<OrderItem> & { quantity: number; totalPrice: number }>> {
    const items: Array<Partial<OrderItem> & { quantity: number; totalPrice: number }> = [];

    for (const itemDto of itemDtos) {
      const product = await this.productRepository.findOne({
        where: { id: itemDto.productId, tenantId },
      });

      if (!product) {
        throw new NotFoundException(
          `Product ${itemDto.productId} not found`,
        );
      }

      // Check stock
      const inStock = await this.productService.isInStock(
        product.id,
        itemDto.quantity,
        tenantId,
      );

      if (!inStock) {
        throw new BadRequestException(
          `Product ${product.name} is out of stock`,
        );
      }

      // Get variant details if provided
      let unitPrice = product.price;
      let variantName: string | undefined;

      if (itemDto.variantId && product.variants) {
        const variant = product.variants.find((v) => v.id === itemDto.variantId);
        if (variant) {
          unitPrice = variant.price || product.price;
          variantName = variant.name;
        }
      }

      const totalPrice = unitPrice * itemDto.quantity;

      items.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        variantId: itemDto.variantId,
        variantName,
        quantity: itemDto.quantity,
        unitPrice,
        totalPrice,
        isTaxable: product.taxable,
        requiresShipping: product.requiresShipping,
        weight: product.weight,
        imageUrl: product.images[0]?.url,
        metadata: {
          productType: product.productType,
        },
      });
    }

    return items;
  }

  /**
   * Generate unique order number
   */
  private async generateOrderNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const count = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.tenantId = :tenantId', { tenantId })
      .andWhere('EXTRACT(YEAR FROM order.createdAt) = :year', { year })
      .getCount();

    const sequence = String(count + 1).padStart(5, '0');

    return `ORD-${year}${month}-${sequence}`;
  }
}
