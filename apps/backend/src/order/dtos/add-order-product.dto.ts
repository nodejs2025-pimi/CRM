import { ApiProperty } from '@nestjs/swagger';
import { Min, IsInt } from 'class-validator';

export class AddOrderProductDto {
  @ApiProperty({ minimum: 1, example: 1 })
  @IsInt()
  @Min(1)
  product_id: number;

  @ApiProperty({ minimum: 1, example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
