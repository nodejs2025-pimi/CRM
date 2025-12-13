import { Product } from '../domain/product.model';
import { GetProductsDto } from '../dtos/get-products.dto';
import { CreateProductDto } from '../dtos/create-product.dto';

export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY';

export interface IProductRepository {
  getAll(): Promise<Product[]>;
  findWithFilters(query: GetProductsDto): Promise<Product[]>;
  findById(id: number): Promise<Product | null>;
  create(dto: CreateProductDto): Promise<Product>;
  update(product: Product): Promise<Product>;
  delete(product: Product): Promise<void>;
}
