import { DynamicModule, Module, Type, ModuleMetadata } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import {
  IProductRepository,
  PRODUCT_REPOSITORY,
} from './interfaces/product-repository.interface';

@Module({})
export class ProductModule {
  static forRoot(options: {
    imports?: ModuleMetadata['imports'];
    repository: Type<IProductRepository>;
  }): DynamicModule {
    return {
      module: ProductModule,
      imports: options.imports || [],
      controllers: [ProductController],
      providers: [
        ProductService,
        {
          provide: PRODUCT_REPOSITORY,
          useClass: options.repository,
        },
      ],
      exports: [ProductService],
    };
  }
}
