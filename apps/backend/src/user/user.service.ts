import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import bcrypt from 'bcrypt';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private readonly user: Repository<User>,
    private readonly cfg: ConfigService,
  ) {}

  async onModuleInit() {
    await this.createAdminIfNotExists();
  }

  private async createAdminIfNotExists() {
    const adminExists = await this.userExistsByUsername(
      this.cfg.getOrThrow<string>('ADMIN_USERNAME'),
    );

    if (!adminExists) {
      const createUserDto: CreateUserDto = {
        username: this.cfg.getOrThrow<string>('ADMIN_USERNAME'),
        password: this.cfg.getOrThrow<string>('ADMIN_PASSWORD'),
        address: this.cfg.getOrThrow<string>('ADMIN_ADDRESS'),
      };

      return this.createUser(createUserDto);
    }

    return null;
  }

  async createUser(createUserDto: CreateUserDto) {
    const saltRoundsStr = this.cfg.get<string>('BCRYPT_SALT_ROUNDS');
    const saltRounds = Number.parseInt(saltRoundsStr ?? '10');
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    const user = {
      username: createUserDto.username,
      password_hash: passwordHash,
      address: createUserDto.address,
    };

    return this.user.save(user);
  }

  async userExistsByUsername(username: string) {
    const user = await this.user.findOne({
      where: { username },
    });

    return !!user;
  }
}
