import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 'makaka228' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: 'v3rY_Str0ng_p4$$w0rD' })
  @IsString()
  @MinLength(8)
  password: string;
}
