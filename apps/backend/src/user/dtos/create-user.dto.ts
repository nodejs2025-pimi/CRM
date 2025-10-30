import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CredentialsDto } from './credentials.dto';

export class CreateUserDto extends CredentialsDto {
  @ApiProperty({ example: 'test@gmail.com' })
  @IsEmail()
  address: string;
}
