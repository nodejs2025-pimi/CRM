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
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

@Controller('products')
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  exportCsv() {}

  @Get()
  getProductsList(@Query() query: any) {}

  @Get(':id')
  @ApiOkResponse({
    type: CreateProductDto,
  })
  getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getById(id);
  }

  @Post()
  @ApiCreatedResponse({
    type: CreateProductDto,
  })
  createProduct(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({
    type: UpdateProductDto,
  })
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  deleteProduct(@Param('id', ParseIntPipe) id: number) {}
}
