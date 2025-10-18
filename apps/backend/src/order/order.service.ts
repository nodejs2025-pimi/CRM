import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { OrderProduct } from './entities/order-product.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly order: Repository<Order>,
    @InjectRepository(OrderProduct)
    private readonly orderProduct: Repository<OrderProduct>,
  ) {}
}
