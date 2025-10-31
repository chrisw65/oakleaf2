import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CartService } from '../services/cart.service';
import { Cart } from '../cart.entity';
import { AddToCartDto, UpdateCartItemDto } from '../dto/cart.dto';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current cart' })
  @ApiResponse({ status: 200, description: 'Current cart' })
  async getCart(
    @Request() req: any,
    @CurrentUser() user: any,
  ): Promise<Cart> {
    const sessionId = req.sessionID || user.id;
    return this.cartService.getOrCreate(
      sessionId,
      user.tenantId,
      user.id,
      undefined,
    );
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 200, description: 'Item added to cart successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async addItem(
    @Body() addToCartDto: AddToCartDto,
    @Request() req: any,
    @CurrentUser() user: any,
  ): Promise<Cart> {
    const sessionId = req.sessionID || user.id;
    const cart = await this.cartService.getOrCreate(
      sessionId,
      user.tenantId,
      user.id,
      undefined,
    );

    return this.cartService.addItem(cart.id, addToCartDto, user.tenantId);
  }

  @Put('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'itemId', description: 'Cart item ID' })
  @ApiResponse({ status: 200, description: 'Cart item updated successfully' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  async updateItem(
    @Param('itemId') itemId: string,
    @Body() updateDto: UpdateCartItemDto,
    @Request() req: any,
    @CurrentUser() user: any,
  ): Promise<Cart> {
    const sessionId = req.sessionID || user.id;
    const cart = await this.cartService.getOrCreate(
      sessionId,
      user.tenantId,
      user.id,
      undefined,
    );

    return this.cartService.updateItem(cart.id, itemId, updateDto, user.tenantId);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'itemId', description: 'Cart item ID' })
  @ApiResponse({ status: 200, description: 'Cart item removed successfully' })
  async removeItem(
    @Param('itemId') itemId: string,
    @Request() req: any,
    @CurrentUser() user: any,
  ): Promise<Cart> {
    const sessionId = req.sessionID || user.id;
    const cart = await this.cartService.getOrCreate(
      sessionId,
      user.tenantId,
      user.id,
      undefined,
    );

    return this.cartService.removeItem(cart.id, itemId, user.tenantId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  async clearCart(
    @Request() req: any,
    @CurrentUser() user: any,
  ): Promise<Cart> {
    const sessionId = req.sessionID || user.id;
    const cart = await this.cartService.getOrCreate(
      sessionId,
      user.tenantId,
      user.id,
      undefined,
    );

    return this.cartService.clear(cart.id, user.tenantId);
  }
}
