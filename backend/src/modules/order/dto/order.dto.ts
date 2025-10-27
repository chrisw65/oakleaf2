import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  IsObject,
  IsEmail,
  IsUUID,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus, FulfillmentStatus } from '../order.entity';

export class AddressDto {
  @ApiPropertyOptional({ description: 'First name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Company name' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: 'Address line 1' })
  @IsOptional()
  @IsString()
  address1?: string;

  @ApiPropertyOptional({ description: 'Address line 2' })
  @IsOptional()
  @IsString()
  address2?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'ZIP/Postal code' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class OrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({ description: 'Variant ID' })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Customer email' })
  @IsEmail()
  customerEmail: string;

  @ApiPropertyOptional({ description: 'Customer name' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Customer phone' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({ description: 'Contact ID' })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiProperty({ description: 'Order items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({ description: 'Discount code' })
  @IsOptional()
  @IsString()
  discountCode?: string;

  @ApiPropertyOptional({ description: 'Billing address' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress?: AddressDto;

  @ApiPropertyOptional({ description: 'Shipping address' })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress?: AddressDto;

  @ApiPropertyOptional({ description: 'Customer notes' })
  @IsOptional()
  @IsString()
  customerNotes?: string;

  @ApiPropertyOptional({ description: 'Payment method' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: {
    funnelId?: string;
    pageId?: string;
    affiliateId?: string;
    ipAddress?: string;
    userAgent?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    [key: string]: any;
  };

  @ApiPropertyOptional({ description: 'Is test order', default: false })
  @IsOptional()
  @IsBoolean()
  isTest?: boolean;
}

export class UpdateOrderDto {
  @ApiPropertyOptional({ description: 'Order status' })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Payment status' })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Fulfillment status' })
  @IsOptional()
  @IsEnum(FulfillmentStatus)
  fulfillmentStatus?: FulfillmentStatus;

  @ApiPropertyOptional({ description: 'Tracking number' })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({ description: 'Tracking carrier' })
  @IsOptional()
  @IsString()
  trackingCarrier?: string;

  @ApiPropertyOptional({ description: 'Internal notes' })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiPropertyOptional({ description: 'Payment transaction ID' })
  @IsOptional()
  @IsString()
  paymentTransactionId?: string;
}

export class OrderQueryDto {
  @ApiPropertyOptional({ description: 'Search query (order number, email, name)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Filter by payment status' })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Filter by fulfillment status' })
  @IsOptional()
  @IsEnum(FulfillmentStatus)
  fulfillmentStatus?: FulfillmentStatus;

  @ApiPropertyOptional({ description: 'Filter by contact ID' })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiPropertyOptional({ description: 'Created after (ISO 8601)' })
  @IsOptional()
  @IsString()
  createdAfter?: string;

  @ApiPropertyOptional({ description: 'Created before (ISO 8601)' })
  @IsOptional()
  @IsString()
  createdBefore?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class RefundOrderDto {
  @ApiPropertyOptional({ description: 'Refund amount (leave empty for full refund)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ description: 'Refund reason' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Notify customer', default: true })
  @IsOptional()
  @IsBoolean()
  notifyCustomer?: boolean;
}
