import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductModule as LibProductModule } from '@shared-libs/products';
import { ProductRepository } from './product.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    LibProductModule.forRoot({
      imports: [TypeOrmModule.forFeature([Product])],
      repository: ProductRepository,
    }),
  ],
  providers: [ProductRepository],
  exports: [LibProductModule],
})
export class ProductModule {}
