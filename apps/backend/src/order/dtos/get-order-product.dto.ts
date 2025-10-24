import { ApiProperty } from '@nestjs/swagger';
import { Min, IsNumber } from 'class-validator';
import { AddOrderProductDto } from './add-order-product.dto';

export class GetOrderProductDto extends AddOrderProductDto {
  @ApiProperty({ example: 1, minimum: 0, description: 'Two decimal places' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;
}
