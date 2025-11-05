import { ApiProperty } from '@nestjs/swagger';
import {
  Min,
  IsInt,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class CreateOrderDto {
  @ApiProperty({ minimum: 1, example: 1 })
  @IsInt()
  @Min(1)
  establishment_id: number;

  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.NEW,
    default: OrderStatus.NEW,
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
