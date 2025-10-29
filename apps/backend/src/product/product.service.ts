import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private readonly product: Repository<Product>,
  ) {}

  async getById(id: number) {
    const product = await this.product.findOne({ where: { product_id: id } });
    if (!product) throw new NotFoundException('Product not found.');

    return product;
  }

  async create(dto: CreateProductDto) {
    return this.product.save(this.product.create(dto));
  }

  async update(id: number, attrs: UpdateProductDto) {
    const product = await this.product.findOne({ where: { product_id: id } });
    if (!product) throw new NotFoundException('Product not found.');

    Object.assign(product, attrs);

    return this.product.save(product);
  }
}
