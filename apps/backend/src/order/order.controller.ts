import { Controller, HttpCode, Param, ParseIntPipe } from '@nestjs/common';
import { Get, Post, Body, Delete } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiNoContentResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { GetOrderDto } from './dtos/get-order.dto';
import { AddOrderProductDto } from './dtos/add-order-product.dto';
import { GetOrderProductDto } from './dtos/get-order-product.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get(':id')
  @ApiOkResponse({
    type: GetOrderDto,
    description: 'Order retrieved successfully.',
  })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  getOrder(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.getOrderById(id);
  }

  @Get()
  @ApiOkResponse({
    type: [GetOrderDto],
    description: 'Orders retrieved successfully.',
  })
  getOrdersList() {
    return this.orderService.getAllOrders();
  }

  @Post()
  @ApiCreatedResponse({
    type: GetOrderDto,
    description: 'Order created successfully.',
  })
  createOrder(@Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(dto);
  }

  @Post(':id/products')
  @ApiCreatedResponse({
    type: GetOrderProductDto,
    description: 'Product added to order successfully.',
  })
  @ApiNotFoundResponse({ description: 'Order or product not found.' })
  addOrderProduct(@Body() dto: AddOrderProductDto) {
    return this.orderService.addOrderProduct(dto);
  }

  @Delete(':orderId/products/:productId')
  @HttpCode(204)
  @ApiOperation({
    description:
      "Remove a product from an order specifiying order and product ids. No need for seperate orderProduct instance id because order can't have different orderProduct instances for the same product.",
  })
  @ApiNoContentResponse({ description: 'Order product removed successfully.' })
  @ApiNotFoundResponse({ description: 'Order or product not found.' })
  removeOrderProduct(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.orderService.removeOrderProduct(orderId, productId);
  }
}
