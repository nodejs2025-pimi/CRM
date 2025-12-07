import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
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
            'product_id,name,available_quantity,price,wholesale_price,wholesale_minimum_quantity,is_active\n1,Apple,100,1000.00,900.00,10,yes',
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
        type: 'object',
        properties: {
          product_id: { type: 'integer' },
          name: { type: 'string' },
          available_quantity: { type: 'integer' },
          price: { type: 'number' },
          wholesale_price: { type: 'number' },
          wholesale_minimum_quantity: { type: 'integer' },
          is_active: { type: 'boolean' },
        },
      },
    },
  })
  getList(@Query() query: GetProductsDto) {
    return this.productService.getList(query);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getById(id);
  }

  @Post()
  create(@Body() body: CreateProductDto) {
    return this.productService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    return this.productService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
