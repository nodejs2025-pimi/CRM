import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetProductsDto {
  @ApiPropertyOptional({ example: 'apple' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort only by name, price and available quantity',
    enum: ['name', 'price', 'available_quantity'],
    default: 'name',
  })
  @IsOptional()
  @IsIn(['name', 'price', 'available_quantity'])
  sort: 'name' | 'price' | 'available_quantity' = 'name';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'asc';
}
