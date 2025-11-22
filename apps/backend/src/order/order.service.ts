import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
import { Product } from '../product/entities/product.entity';

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
      relations: { orderProducts: { product: true }, establishment: true },
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
      relations: { orderProducts: { product: true }, establishment: true },
      order: { date: 'DESC' },
    });
  }

  async removeOrderProduct(orderId: number, productId: number) {
    const orderProduct = await this.getOrderProduct(orderId, productId);
    const product = await this.productService.getById(productId);

    await this.productService.update(productId, {
      available_quantity: product.available_quantity + orderProduct.quantity,
    });

    await this.orderProduct.remove(orderProduct);
  }

  async deleteOrder(id: number) {
    const order = await this.getOrderById(id);

    for (const orderProduct of order.orderProducts) {
      const product = await this.productService.getById(
        orderProduct.product_id,
      );

      await this.productService.update(orderProduct.product_id, {
        available_quantity: product.available_quantity + orderProduct.quantity,
      });
    }

    await this.order.remove(order);
  }

  async updateOrderProduct(
    orderId: number,
    productId: number,
    dto: UpdateOrderProductDto,
  ) {
    const orderProduct = await this.getOrderProduct(orderId, productId);
    const product = await this.productService.getById(productId);
    const oldQuantity = orderProduct.quantity;

    if (dto.quantity) {
      const quantityDifference = dto.quantity - oldQuantity;

      if (quantityDifference > product.available_quantity) {
        throw new BadRequestException(
          `Only ${product.available_quantity} items available in stock.`,
        );
      }

      await this.productService.update(productId, {
        available_quantity: product.available_quantity - quantityDifference,
      });
    }

    Object.assign(orderProduct, dto);

    if (dto.quantity) {
      orderProduct.price = this.calculateOrderProductPrice(
        product,
        orderProduct.quantity,
      );
    }

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
    const establishmentId = dto.establishment_id;

    await this.establishmentService.getById(establishmentId);

    const order = this.order.create(dto);

    return this.order.save(order);
  }

  async addOrderProduct(id: number, dto: AddOrderProductDto) {
    const productId = dto.product_id;

    try {
      await this.getOrderProduct(id, productId);

      return this.updateOrderProduct(id, productId, dto);
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
    }

    const product = await this.productService.getById(productId);

    if (dto.quantity > product.available_quantity) {
      throw new BadRequestException(
        `Only ${product.available_quantity} items available in stock.`,
      );
    }

    await this.productService.update(productId, {
      available_quantity: product.available_quantity - dto.quantity,
    });

    const orderProduct = this.orderProduct.create({
      order_id: id,
      product_id: productId,
      quantity: dto.quantity,
      price: this.calculateOrderProductPrice(product, dto.quantity),
    });

    return this.orderProduct.save(orderProduct);
  }

  private calculateOrderProductPrice(product: Product, quantity: number) {
    let price: number;

    if (quantity >= product.wholesale_minimum_quantity) {
      price = product.wholesale_price * quantity;
    } else {
      price = product.price * quantity;
    }

    return parseFloat(price.toFixed(2));
  }
}
