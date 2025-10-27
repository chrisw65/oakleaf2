import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsObject,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToCartDto {
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

  @ApiPropertyOptional({ description: 'Customizations' })
  @IsOptional()
  @IsObject()
  customizations?: {
    options?: Record<string, string>;
    personalizations?: Record<string, string>;
    [key: string]: any;
  };
}

export class UpdateCartItemDto {
  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class ApplyDiscountDto {
  @ApiProperty({ description: 'Discount code' })
  @IsString()
  code: string;
}
