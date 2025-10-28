import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Min,
  IsInt,
  ValidateNested,
  IsEnum,
  IsOptional,
  IsDate,
} from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class CreateOrderDto {
  @ApiProperty({ minimum: 1, example: 1 })
  @IsInt()
  @Min(1)
  establishment_id: number;

  @ApiProperty({ example: '2024-01-01T12:00:00Z', required: false })
  @IsOptional()
  @IsDate()
  date?: Date;

  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.NEW,
    default: OrderStatus.NEW,
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
