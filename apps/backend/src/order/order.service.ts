import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { OrderProduct } from './entities/order-product.entity';
import { CreateOrderDto } from './dtos/create-order.dto';
import { EstablishmentService } from '../establishment/establishment.service';
import { AddOrderProductDto } from './dtos/add-order-product.dto';
import { ProductService } from '../product/product.service';
import { UpdateOrderProductDto } from './dtos/update-order-product.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';

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
      relations: { orderProducts: true, establishment: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    return order;
  }

  async getOrderProduct(orderId: number, productId: number) {
    const orderProduct = await this.orderProduct.findOne({
      where: {
        order_id: orderId,
        product_id: productId,
      },
    });

    if (!orderProduct) {
      throw new NotFoundException('Order product not found.');
    }

    return orderProduct;
  }

  async getOrderProducts(orderId: number) {
    const order = await this.getOrderById(orderId);

    return order.orderProducts;
  }

  async getAllOrders() {
    return this.order.find({
      relations: { orderProducts: true, establishment: true },
    });
  }

  async removeOrderProduct(orderId: number, productId: number) {
    const orderProduct = await this.getOrderProduct(orderId, productId);

    await this.orderProduct.remove(orderProduct);
  }

  async deleteOrder(id: number) {
    const order = await this.getOrderById(id);

    await this.order.remove(order);
  }

  async updateOrderProduct(
    orderId: number,
    productId: number,
    dto: UpdateOrderProductDto,
  ) {
    const orderProduct = await this.getOrderProduct(orderId, productId);

    Object.assign(orderProduct, dto);

    return this.orderProduct.save(orderProduct);
  }

  async updateOrder(id: number, dto: UpdateOrderDto) {
    const establishmentId = dto.establishment_id;

    if (establishmentId) {
      await this.establishmentService.getById(establishmentId);
    }

    await this.order.update(id, dto);

    return this.getOrderById(id);
  }

  async createOrder(dto: CreateOrderDto) {
    await this.establishmentService.getById(dto.establishment_id);

    const order = this.order.create(dto);

    return this.order.save(order);
  }

  async addOrderProduct(id: number, dto: AddOrderProductDto) {
    const order = await this.getOrderById(id);
    const product = await this.productService.getById(dto.product_id);

    let price: number;

    if (dto.quantity >= product.wholesale_minimum_quantity) {
      price = product.wholesale_price * dto.quantity;
    } else {
      price = product.price * dto.quantity;
    }

    price = parseFloat(price.toFixed(2));

    const orderProduct = this.orderProduct.create({
      ...dto,
      order_id: order.order_id,
      product_id: product.product_id,
      price,
    });

    return this.orderProduct.save(orderProduct);
  }
}
