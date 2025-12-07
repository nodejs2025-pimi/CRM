import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { GetProductsDto } from './dtos/get-products.dto';
import type { IProductRepository } from './interfaces/product-repository.interface';
import { PRODUCT_REPOSITORY } from './interfaces/product-repository.interface';

@Injectable()
export class ProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async exportCsv() {
    const products = await this.productRepository.getAll();
    const headers = [
      'product_id',
      'name',
      'available_quantity',
      'price',
      'wholesale_price',
      'wholesale_minimum_quantity',
      'is_active',
    ];

    const normCsv = (v: unknown) => {
      if (v === null || v === undefined) return '';
      let s: string;
      if (typeof v === 'object') {
        try {
          s = JSON.stringify(v);
        } catch {
          s = String(v);
        }
      } else {
        s = String(v);
      }

      if (/^[=+\-@;]/.test(s)) s = `'${s}`;

      if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const lines: string[] = [];
    lines.push(headers.join(','));

    for (const p of products) {
      lines.push(
        [
          normCsv(p.product_id),
          normCsv(p.name),
          normCsv(p.available_quantity),
          normCsv(p.price),
          normCsv(p.wholesale_price),
          normCsv(p.wholesale_minimum_quantity),
          normCsv(p.is_active ? 'yes' : 'no'),
        ].join(','),
      );
    }

    return lines.join('\n');
  }

  async getList(q: GetProductsDto) {
    return this.productRepository.findWithFilters(q);
  }

  async getById(id: number) {
    const product = await this.productRepository.findById(id);

    if (!product) throw new NotFoundException('Product not found.');

    return product;
  }

  async create(dto: CreateProductDto) {
    return this.productRepository.create(dto);
  }

  async update(id: number, attrs: UpdateProductDto) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundException('Product not found.');

    Object.assign(product, attrs);

    return this.productRepository.update(product);
  }

  async remove(id: number) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new NotFoundException('Product not found.');
    await this.productRepository.delete(product);
  }
}
