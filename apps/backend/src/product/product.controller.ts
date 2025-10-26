import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { GetProductsDto } from './dtos/get-products.dto';

@Controller('products')
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @ApiOkResponse({
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          example:
            'product_id,name,price,available_quantity,price,wholesale_price,wholesale_minimum_quantity,is_active\n1,Apple,1000,100.5,300,30,yes',
        },
      },
    },
  })
  exportCsv() {
    return this.productService.exportCsv();
  }

  @Get()
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        allOf: [
          { $ref: getSchemaPath(CreateProductDto) },
          {
            type: 'object',
            properties: {
              product_id: { type: 'number', example: 1 },
            },
          },
        ],
      },
    },
  })
  getProductsList(@Query() query: GetProductsDto) {
    return this.productService.getList(query);
  }

  @Get(':id')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(CreateProductDto) },
        {
          type: 'object',
          properties: {
            product_id: { type: 'number', example: 1 },
          },
          required: ['product_id'],
        },
      ],
    },
  })
  getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getById(id);
  }

  @Post()
  @ApiCreatedResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(CreateProductDto) },
        {
          type: 'object',
          properties: {
            product_id: { type: 'number', example: 1 },
          },
          required: ['product_id'],
        },
      ],
    },
  })
  createProduct(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(UpdateProductDto) },
        {
          type: 'object',
          properties: {
            product_id: { type: 'number', example: 1 },
          },
          required: ['product_id'],
        },
      ],
    },
  })
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
