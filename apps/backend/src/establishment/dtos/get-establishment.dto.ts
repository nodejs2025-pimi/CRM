import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreateEstablishmentDto } from './create-establishment.dto';

export class GetEstablishmentDto extends CreateEstablishmentDto {
  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  establishment_id: number;
}
