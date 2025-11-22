import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { GetProductsDto } from './dtos/get-products.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private readonly product: Repository<Product>,
  ) {}

  async exportCsv() {
    const products = await this.product.find();
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
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          s = String(v);
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
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
    const sortMap = {
      name: 'p.name',
      price: 'p.price',
      available_quantity: 'p.available_quantity',
    } as const;

    const sortCol = sortMap[q.sort];
    const order = q.order.toUpperCase() as 'ASC' | 'DESC';

    const query = this.product.createQueryBuilder('p');

    const search = q.search?.trim();
    if (search) query.where(`p.name ILIKE :search`, { search: `%${search}%` });

    query.orderBy(sortCol, order);
    return query.getMany();
  }

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

  async remove(id: number) {
    const product = await this.product.findOne({ where: { product_id: id } });
    if (!product) throw new NotFoundException('Product not found.');
    await this.product.remove(product);
  }
}
