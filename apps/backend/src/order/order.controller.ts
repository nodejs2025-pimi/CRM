import { Controller, HttpCode, Param, ParseIntPipe } from '@nestjs/common';
import { Get, Post, Body, Delete, Patch } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UseInterceptors } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { GetOrderDto } from './dtos/get-order.dto';
import { AddOrderProductDto } from './dtos/add-order-product.dto';
import { GetOrderProductDto } from './dtos/get-order-product.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { UpdateOrderProductDto } from './dtos/update-order-product.dto';

@Controller('orders')
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
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

  @Get(':id/products')
  @ApiOkResponse({
    type: [GetOrderProductDto],
    description: 'Order products retrieved successfully.',
  })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  getOrderProducts(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.getOrderProducts(id);
  }

  @Post()
  @ApiCreatedResponse({
    type: GetOrderDto,
    description: 'Order created successfully.',
  })
  @ApiNotFoundResponse({ description: 'Establishment not found.' })
  createOrder(@Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(dto);
  }

  @Post(':id/products')
  @ApiCreatedResponse({
    type: GetOrderProductDto,
    description: 'Product added to order successfully.',
  })
  @ApiNotFoundResponse({ description: 'Order or product not found.' })
  addOrderProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddOrderProductDto,
  ) {
    return this.orderService.addOrderProduct(id, dto);
  }

  @Patch(':id/products/:productId')
  @ApiOkResponse({
    type: GetOrderProductDto,
    description: 'Order product updated successfully.',
  })
  @ApiNotFoundResponse({ description: 'Order or product not found.' })
  updateOrderProduct(
    @Param('id', ParseIntPipe) orderId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateOrderProductDto,
  ) {
    return this.orderService.updateOrderProduct(orderId, productId, dto);
  }

  @Patch(':id')
  @ApiOkResponse({
    type: GetOrderDto,
    description: 'Order updated successfully.',
  })
  @ApiNotFoundResponse({ description: 'Order or establishment not found.' })
  updateOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.orderService.updateOrder(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Order deleted successfully.' })
  deleteOrder(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.deleteOrder(id);
  }

  @Delete(':orderId/products/:productId')
  @HttpCode(204)
  @ApiOperation({ description: 'Remove a product from an order.' })
  @ApiNoContentResponse({ description: 'Order product removed successfully.' })
  @ApiNotFoundResponse({ description: 'Order or product not found.' })
  removeOrderProduct(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.orderService.removeOrderProduct(orderId, productId);
  }
}
