import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import type { FullPayload } from '../common/types/full-payload.type';
import type { Payload } from '../common/types/payload.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly user: Repository<User>,
    private readonly cfg: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.user.findOne({
      where: {
        username,
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      throw new UnauthorizedException('Invalid credentials.');

    const payload: Payload = {
      sub: user.user_id,
      username: user.username,
    };

    const accessToken = await this.createToken(payload);
    const refreshToken = await this.createToken(payload, false);

    return { accessToken, refreshToken };
  }

  private async createToken(payload: Payload, isAccess = true) {
    return isAccess
      ? this.jwt.signAsync(payload)
      : this.jwt.signAsync(payload, {
          secret: this.cfg.getOrThrow('JWT_REFRESH_SECRET'),
          expiresIn: this.cfg.getOrThrow('JWT_REFRESH_EXPIRES'),
        });
  }

  async refresh(token: string) {
    let fullPayload: FullPayload;
    try {
      fullPayload = await this.jwt.verifyAsync(token, {
        secret: this.cfg.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new BadRequestException('Invalid token.');
    }
    const payload: Payload = {
      sub: fullPayload.sub,
      username: fullPayload.username,
    };
    const user = await this.user.findOne({
      where: {
        user_id: payload.sub,
      },
    });
    if (!user) throw new UnauthorizedException();
    const accessToken = await this.createToken(payload);
    return { accessToken };
  }
}
