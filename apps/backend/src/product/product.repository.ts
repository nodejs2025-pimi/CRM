import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import {
  IProductRepository,
  Product as DomainProduct,
  CreateProductDto,
  GetProductsDto,
} from '@shared-libs/products';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  async getAll(): Promise<DomainProduct[]> {
    return this.repo.find();
  }

  async findWithFilters(q: GetProductsDto): Promise<DomainProduct[]> {
    const sortMap: Record<string, string> = {
      name: 'p.name',
      price: 'p.price',
      available_quantity: 'p.available_quantity',
    };

    const sortCol = (q.sort && sortMap[q.sort]) || 'p.name';
    const order = (q.order?.toUpperCase() as 'ASC' | 'DESC') || 'ASC';

    const query = this.repo.createQueryBuilder('p');

    const search = q.search ? q.search.trim() : undefined;
    if (search) query.where(`p.name ILIKE :search`, { search: `%${search}%` });

    query.orderBy(sortCol, order);
    return query.getMany();
  }

  async findById(id: number): Promise<DomainProduct | null> {
    return this.repo.findOne({ where: { product_id: id } });
  }

  async create(dto: CreateProductDto): Promise<DomainProduct> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(product: DomainProduct): Promise<DomainProduct> {
    return this.repo.save(product as Product);
  }

  async delete(product: DomainProduct): Promise<void> {
    await this.repo.remove(product as Product);
  }
}
