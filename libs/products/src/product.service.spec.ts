import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductService } from './product.service';
import { PRODUCT_REPOSITORY } from './interfaces/product-repository.interface';
import { GetProductsDto } from './dtos/get-products.dto';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

describe('ProductService', () => {
  let service: ProductService;

  const mockProductRepository = {
    create: jest.fn(),
    update: jest.fn(),
    getAll: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
    findWithFilters: jest.fn(),
  };

  const products = [
    {
      product_id: 1,
      name: 'Product 1',
      available_quantity: 10,
      price: 100,
      wholesale_price: 90,
      wholesale_minimum_quantity: 5,
      is_active: true,
    },
    {
      product_id: 2,
      name: 'Product 2 with special ", chars',
      available_quantity: 20,
      price: 200,
      wholesale_price: 180,
      wholesale_minimum_quantity: 10,
      is_active: false,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exportCsv', () => {
    it('should return correct CSV string', async () => {
      const circularObj = { name: 'Circular' };
      circularObj['self'] = circularObj;
      const dangerousProducts = [
        {
          ...products[0],
          price: { currency: 'USD', amount: 100 },
          name: 'Safe=Value',
        },
        {
          ...products[1],
          available_quantity: undefined,
          wholesale_price: null,
          wholesale_minimum_quantity: circularObj,
          price: `@200`,
        },
      ];
      const expectedCsv =
        `product_id,name,available_quantity,price,wholesale_price,wholesale_minimum_quantity,is_active\n` +
        `1,Safe=Value,10,"{""currency"":""USD"",""amount"":100}",90,5,yes\n` +
        `2,"Product 2 with special "", chars",,'@200,,[object Object],no`;
      mockProductRepository.getAll.mockResolvedValue(dangerousProducts);

      const result = await service.exportCsv();

      expect(mockProductRepository.getAll).toHaveBeenCalled();
      expect(result).toEqual(expectedCsv);
    });
  });

  describe('getList', () => {
    it('should return list of products with correct query params', async () => {
      const dto: GetProductsDto = {
        sort: 'price',
        order: 'desc',
        search: ' product',
      };
      const expectedProducts = products
        .filter((p) => p.name.toLowerCase().includes('product'))
        .sort((a, b) => b.price - a.price);
      mockProductRepository.findWithFilters.mockResolvedValue(expectedProducts);

      const result = await service.getList(dto);

      expect(mockProductRepository.findWithFilters).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedProducts);
    });
  });

  describe('getById', () => {
    it('should return product by id', async () => {
      const id = 1;
      const product = products.find((p) => p.product_id === id);
      mockProductRepository.findById.mockResolvedValue(product);

      const result = await service.getById(id);

      expect(result).toEqual(product);
      expect(mockProductRepository.findById).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      let thrownError: NotFoundException | undefined;
      try {
        await service.getById(999);
      } catch (error) {
        thrownError = error as NotFoundException;
      }

      expect(thrownError).toBeInstanceOf(NotFoundException);
      expect(thrownError?.message).toEqual(`Product not found.`);
    });
  });

  describe('create', () => {
    it('should create new product', async () => {
      const dto: CreateProductDto = {
        name: 'New Prod',
        price: 50,
        available_quantity: 20,
        wholesale_price: 45,
        wholesale_minimum_quantity: 10,
        is_active: true,
      };
      const expectedSaveResult = { ...dto, product_id: products.length + 1 };
      mockProductRepository.create.mockResolvedValue(expectedSaveResult);

      const result = await service.create(dto);

      expect(mockProductRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedSaveResult);
    });
  });

  describe('update', () => {
    const id = 1;

    it('should update existing product', async () => {
      const product = products.find((p) => p.product_id === id)!;
      const newName = 'Updated Name';
      const updateDto: UpdateProductDto = { name: newName };
      mockProductRepository.findById.mockResolvedValue({ ...product });
      mockProductRepository.update.mockResolvedValue({
        ...product,
        ...updateDto,
      });

      const result = await service.update(id, updateDto);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(id);
      expect(mockProductRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          ...product,
          name: newName,
          price: product.price,
        }),
      );
      expect(result.name).toEqual(newName);
    });

    it('should throw NotFoundException if product to update not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      let thrownError: NotFoundException | undefined;
      try {
        await service.update(id, {});
      } catch (error) {
        thrownError = error as NotFoundException;
      }

      expect(thrownError).toBeInstanceOf(NotFoundException);
      expect(thrownError?.message).toEqual(`Product not found.`);
    });
  });

  describe('remove', () => {
    const id = 1;

    it('should remove existing product', async () => {
      const product = products.find((p) => p.product_id === id)!;
      mockProductRepository.findById.mockResolvedValue(product);
      mockProductRepository.delete.mockResolvedValue(undefined);

      await service.remove(id);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(id);
      expect(mockProductRepository.delete).toHaveBeenCalledWith(product);
    });

    it('should throw NotFoundException if product to remove not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      let thrownError: NotFoundException | undefined;
      try {
        await service.remove(id);
      } catch (error) {
        thrownError = error as NotFoundException;
      }

      expect(thrownError).toBeInstanceOf(NotFoundException);
      expect(thrownError?.message).toEqual(`Product not found.`);
    });
  });
});
