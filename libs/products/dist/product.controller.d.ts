import { ProductService } from './product.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { GetProductsDto } from './dtos/get-products.dto';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    exportCsv(): Promise<string>;
    getList(query: GetProductsDto): Promise<import(".").Product[]>;
    getById(id: number): Promise<import(".").Product>;
    create(body: CreateProductDto): Promise<import(".").Product>;
    update(id: number, body: UpdateProductDto): Promise<import(".").Product>;
    remove(id: number): Promise<void>;
}
