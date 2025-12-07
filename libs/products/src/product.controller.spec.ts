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

  describe('getList', () => {
    it('should return list of products', async () => {
      const query: GetProductsDto = {
        sort: 'price',
        order: 'asc',
        search: 'test',
      };
      const expectedResult = [{ product_id: 1, name: 'Test' }];
      mockProductService.getList.mockResolvedValue(expectedResult);

      const result = await controller.getList(query);

      expect(mockProductService.getList).toHaveBeenCalledWith(query);
      expect(result).toBe(expectedResult);
    });
  });

  describe('getById', () => {
    it('should return a product if found', async () => {
      const id = 1;
      const expectedResult = { product_id: 1, name: 'Test' };
      mockProductService.getById.mockResolvedValue(expectedResult);

      const result = await controller.getById(id);

      expect(mockProductService.getById).toHaveBeenCalledWith(id);
      expect(result).toBe(expectedResult);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductService.getById.mockRejectedValue(new NotFoundException());

      await expect(controller.getById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create new product', async () => {
      const dto: CreateProductDto = {
        name: 'New Product',
        price: 100,
        available_quantity: 10,
        wholesale_price: 90,
        wholesale_minimum_quantity: 5,
      };
      const expectedResult = { ...dto, product_id: 1 };
      mockProductService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(dto);

      expect(mockProductService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(expectedResult);
    });
  });

  describe('update', () => {
    it('should update product', async () => {
      const id = 1;
      const dto: UpdateProductDto = { name: 'Updated' };
      const expectedResult = { product_id: 1, name: 'Updated' };
      mockProductService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, dto);

      expect(mockProductService.update).toHaveBeenCalledWith(id, dto);
      expect(result).toBe(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove product', async () => {
      const id = 1;
      mockProductService.remove.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(mockProductService.remove).toHaveBeenCalledWith(id);
    });
  });
});
