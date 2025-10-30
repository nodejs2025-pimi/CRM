import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CredentialsDto {
  @ApiProperty({
    minimum: 1,
    maximum: 50,
    example: 'makaka228',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  username: string;

  @ApiProperty({
    minimum: 8,
    example: 'v3rY_Str0ng_p4$$w0rD',
  })
  @IsString()
  @MinLength(8)
  password: string;
}
