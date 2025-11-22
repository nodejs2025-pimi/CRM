import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    minimum: 1,
    maximum: 100,
    example: 'Apple',
  })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional({
    minimum: 0,
    default: 0,
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  available_quantity?: number;

  @ApiProperty({
    description: 'Два знаки після коми',
    minimum: 0,
    example: 200.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Два знаки після коми',
    minimum: 0,
    example: 200.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  wholesale_price: number;

  @ApiProperty({
    minimum: 0,
    example: 100,
  })
  @IsInt()
  @Min(0)
  wholesale_minimum_quantity: number;

  @ApiPropertyOptional({
    example: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
