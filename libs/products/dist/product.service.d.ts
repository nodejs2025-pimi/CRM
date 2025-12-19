import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { GetProductsDto } from './dtos/get-products.dto';
import type { IProductRepository } from './interfaces/product-repository.interface';
export declare class ProductService {
    private readonly productRepository;
    constructor(productRepository: IProductRepository);
    exportCsv(): Promise<string>;
    getList(q: GetProductsDto): Promise<import(".").Product[]>;
    getById(id: number): Promise<import(".").Product>;
    create(dto: CreateProductDto): Promise<import(".").Product>;
    update(id: number, attrs: UpdateProductDto): Promise<import(".").Product>;
    remove(id: number): Promise<void>;
}
