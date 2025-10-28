import { ApiProperty } from '@nestjs/swagger';
import { Min, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AddOrderProductDto } from './add-order-product.dto';
import { CreateProductDto } from '../../product/dtos/create-product.dto';

export class GetOrderProductDto extends AddOrderProductDto {
  @ApiProperty({ example: 1, minimum: 0, description: 'Two decimal places' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({ type: () => CreateProductDto })
  @ValidateNested()
  @Type(() => CreateProductDto)
  product: CreateProductDto;
}
