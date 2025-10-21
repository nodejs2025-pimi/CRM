import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import process from 'node:process';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { EstablishmentModule } from './establishment/establishment.module';

import { User } from './user/entities/user.entity';
import { Product } from './product/entities/product.entity';
import { Order } from './order/entities/order.entity';
import { OrderProduct } from './order/entities/order-product.entity';
import { Establishment } from './establishment/entities/establishment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST') || 'localhost',
        database: cfg.getOrThrow<string>('DB_NAME'),
        port: +cfg.getOrThrow<number>('DB_PORT'),
        username: cfg.getOrThrow<string>('DB_USER'),
        password: cfg.getOrThrow<string>('DB_PASSWORD'),
        entities: [User, Product, Order, OrderProduct, Establishment],
        synchronize: true,
      }),
    }),
    UserModule,
    ProductModule,
    OrderModule,
    EstablishmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
