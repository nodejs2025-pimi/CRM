import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dtos/login-user.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { Public } from '../common/decorators/public.decorator';
import { ApiCreatedResponse } from '@nestjs/swagger';

@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly userService: AuthService) {}

  @Post('login')
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      required: ['accessToken', 'refreshToken'],
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  loginUser(@Body() dto: LoginUserDto) {
    return this.userService.login(dto.username, dto.password);
  }

  @Post('refresh')
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      required: ['accessToken'],
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  refreshAccessToken(@Body() dto: RefreshTokenDto) {
    return this.userService.refresh(dto.token);
  }
}
