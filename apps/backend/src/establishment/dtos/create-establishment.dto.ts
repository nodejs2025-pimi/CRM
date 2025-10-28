import {
  IsEnum,
  IsString,
  IsEmail,
  IsPhoneNumber,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstablishmentType } from '../enums/establishment-type.enum';

export class CreateEstablishmentDto {
  @ApiProperty({ enum: EstablishmentType, example: EstablishmentType.CAFE })
  @IsEnum(EstablishmentType)
  type: EstablishmentType;

  @ApiProperty({ example: 'Best Cafe', minimum: 1, maximum: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'bestcafe@example.com', maximum: 100 })
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty({ example: '+380683957989', maximum: 13 })
  @IsPhoneNumber('UA')
  @MaxLength(13)
  phone: string;

  @ApiProperty({
    example: '123 Main St, Anytown, USA',
    minimum: 1,
    maximum: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  address: string;
}
