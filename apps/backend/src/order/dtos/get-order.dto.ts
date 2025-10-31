import { ApiProperty } from '@nestjs/swagger';
import { Min, IsInt } from 'class-validator';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderDto } from './create-order.dto';
import { GetOrderProductDto } from './get-order-product.dto';

export class GetOrderDto extends CreateOrderDto {
  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  order_id: number;

  @ApiProperty({ type: [GetOrderProductDto] })
  @ValidateNested({ each: true })
  @Type(() => GetOrderProductDto)
  orderProducts: GetOrderProductDto[];
}
