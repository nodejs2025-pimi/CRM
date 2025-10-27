import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoidGVzdCIsImlhdCI6MTc2MTU5MzI1NywiZXhwIjoxNzYxNjAwNDU3fQ.tveaIu8wWklaikY8iu66TbpWg8wH-R4LwuHw9WphMZI',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
