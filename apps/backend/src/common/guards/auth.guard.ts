import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { FullPayload } from '../types/full-payload.type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req: Request = context.switchToHttp().getRequest();

    const token = this.extractBearer(req);
    if (!token) throw new UnauthorizedException('Missing access token.');

    try {
      const fullPayload: FullPayload = await this.jwt.verifyAsync(token);
      req['user'] = { userId: fullPayload.sub, username: fullPayload.username };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private extractBearer(req: Request) {
    const full = req.headers.authorization;
    if (!full) return null;
    const [type, token] = full.split(' ');
    return type.toLowerCase() === 'bearer' && token ? token : null;
  }
}
