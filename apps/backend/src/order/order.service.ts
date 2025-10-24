import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { OrderProduct } from './entities/order-product.entity';
import { CreateOrderDto } from './dtos/create-order.dto';
import { EstablishmentService } from '../establishment/establishment.service';
import { AddOrderProductDto } from './dtos/add-order-product.dto';
import { ProductService } from '../product/product.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly order: Repository<Order>,
    @InjectRepository(OrderProduct)
    private readonly orderProduct: Repository<OrderProduct>,
    private readonly establishmentService: EstablishmentService,
    private readonly productService: ProductService,
  ) {}

  async getOrderById(id: number) {
    const order = await this.order.findOne({
      where: { order_id: id },
      relations: { orderProducts: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    return order;
  }

  async getAllOrders() {
    return this.order.find({ relations: { orderProducts: true } });
  }

  async deleteOrderProductByOrderAndProductId(
    orderId: number,
    productId: number,
  ) {
    const orderProduct = await this.orderProduct.findOne({
      where: {
        order: { order_id: orderId },
        product: { product_id: productId },
      },
    });

    if (!orderProduct) {
      throw new NotFoundException('Order product not found.');
    }

    await this.orderProduct.remove(orderProduct);
  }

  async createOrder(dto: CreateOrderDto) {
    const establishmentId = dto.establishment_id;
    const establishment =
      await this.establishmentService.getById(establishmentId);

    if (!establishment) {
      throw new Error('Establishment not found');
    }

    const order = this.order.create(dto);

    return this.order.save(order);
  }

  async addOrderProduct(dto: AddOrderProductDto) {
    const order = await this.getOrderById(dto.order_id);
    const product = await this.productService.getById(dto.product_id);

    if (!order) {
      throw new Error('Order not found');
    }

    if (!product) {
      throw new Error('Product not found');
    }

    let price: number;

    if (dto.quantity >= product.wholesale_minimum_quantity) {
      price = product.wholesale_price * dto.quantity;
    } else {
      price = product.price * dto.quantity;
    }

    price = parseFloat(price.toFixed(2));

    const orderProduct = this.orderProduct.create({
      ...dto,
      price,
    });

    return this.orderProduct.save(orderProduct);
  }

  async removeOrderProduct(orderId: number, productId: number) {
    const order = await this.getOrderById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    await this.deleteOrderProductByOrderAndProductId(orderId, productId);
  }
}
