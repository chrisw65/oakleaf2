import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { Contact } from '../crm/contact.entity';
import { ProductService } from './services/product.service';
import { OrderService } from './services/order.service';
import { CartService } from './services/cart.service';
import { ProductController } from './controllers/product.controller';
import { OrderController } from './controllers/order.controller';
import { CartController } from './controllers/cart.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Order,
      OrderItem,
      Cart,
      CartItem,
      Contact,
    ]),
  ],
  controllers: [
    ProductController,
    OrderController,
    CartController,
  ],
  providers: [
    ProductService,
    OrderService,
    CartService,
  ],
  exports: [
    ProductService,
    OrderService,
    CartService,
  ],
})
export class OrderModule {}
