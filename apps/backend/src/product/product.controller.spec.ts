import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { GetProductsDto } from './dtos/get-products.dto';

describe('ProductController', () => {
  let controller: ProductController;

  const mockProductService = {
    exportCsv: jest.fn(),
    getList: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('exportCsv', () => {
    it('should return csv content', async () => {
      const expectedResult = 'id,name\n1,Test';
      mockProductService.exportCsv.mockResolvedValue(expectedResult);

      const result = await controller.exportCsv();

      expect(mockProductService.exportCsv).toHaveBeenCalled();
      expect(result).toBe(expectedResult);
    });
  });

  describe('getProductsList', () => {
    it('should return list of products', async () => {
      const query: GetProductsDto = {
        sort: 'price',
        order: 'asc',
        search: 'test',
      };
      const expectedResult = [{ product_id: 1, name: 'Test' }];
      mockProductService.getList.mockResolvedValue(expectedResult);

      const result = await controller.getProductsList(query);

      expect(mockProductService.getList).toHaveBeenCalledWith(query);
      expect(result).toBe(expectedResult);
    });
  });

  describe('getProduct', () => {
    it('should return a product if found', async () => {
      const id = 1;
      const expectedResult = { product_id: 1, name: 'Test' };
      mockProductService.getById.mockResolvedValue(expectedResult);

      const result = await controller.getProduct(id);

      expect(mockProductService.getById).toHaveBeenCalledWith(id);
      expect(result).toBe(expectedResult);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductService.getById.mockRejectedValue(new NotFoundException());

      await expect(controller.getProduct(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createProduct', () => {
    it('should create new product', async () => {
      const dto: CreateProductDto = {
        name: 'New Product',
        price: 100,
        available_quantity: 10,
        wholesale_price: 90,
        wholesale_minimum_quantity: 5,
        is_active: true,
      };
      const expectedResult = { product_id: 1, ...dto };
      mockProductService.create.mockResolvedValue(expectedResult);

      const result = await controller.createProduct(dto);

      expect(mockProductService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(expectedResult);
    });
  });

  describe('updateProduct', () => {
    it('should update product', async () => {
      const id = 1;
      const dto: UpdateProductDto = { name: 'Updated' };
      const expectedResult = { product_id: 1, name: 'Updated' };
      mockProductService.update.mockResolvedValue(expectedResult);

      const result = await controller.updateProduct(id, dto);

      expect(mockProductService.update).toHaveBeenCalledWith(id, dto);
      expect(result).toBe(expectedResult);
    });

    it('should throw NotFoundException if service throws', async () => {
      mockProductService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.updateProduct(1, {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteProduct', () => {
    it('should delete product', async () => {
      const id = 1;
      mockProductService.remove.mockResolvedValue(undefined);

      await controller.deleteProduct(id);

      expect(mockProductService.remove).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if product to delete not found', async () => {
      mockProductService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.deleteProduct(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
