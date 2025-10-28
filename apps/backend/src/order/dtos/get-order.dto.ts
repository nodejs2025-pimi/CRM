import { ApiProperty } from '@nestjs/swagger';
import { Min, IsInt } from 'class-validator';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OmitType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { GetOrderProductDto } from './get-order-product.dto';
import { GetEstablishmentDto } from '../../establishment/dtos/get-establishment.dto';

export class GetOrderDto extends OmitType(CreateOrderDto, [
  'establishment_id',
] as const) {
  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  order_id: number;

  @ApiProperty({ type: GetEstablishmentDto })
  @ValidateNested()
  @Type(() => GetEstablishmentDto)
  establishment: GetEstablishmentDto;

  @ApiProperty({ type: [GetOrderProductDto] })
  @ValidateNested({ each: true })
  @Type(() => GetOrderProductDto)
  orderProducts: GetOrderProductDto[];
}
