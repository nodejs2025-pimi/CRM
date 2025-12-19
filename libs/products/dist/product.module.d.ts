import { DynamicModule, Type, ModuleMetadata } from '@nestjs/common';
import { IProductRepository } from './interfaces/product-repository.interface';
export declare class ProductModule {
    static forRoot(options: {
        imports?: ModuleMetadata['imports'];
        repository: Type<IProductRepository>;
    }): DynamicModule;
}
