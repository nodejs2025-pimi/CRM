import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository, ObjectLiteral } from 'typeorm';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { GetProductsDto } from './dtos/get-products.dto';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('ProductService', () => {
  let service: ProductService;
  let repository: MockRepository<Product>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockProductRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
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
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exportCsv', () => {
    it('should return correct CSV string', async () => {
      repository.find!.mockResolvedValue(products);
      const expectedCsv =
        `product_id,name,available_quantity,price,wholesale_price,wholesale_minimum_quantity,is_active\n` +
        `1,Product 1,10,100,90,5,yes\n` +
        `2,"Product 2 with special "", chars",20,200,180,10,no`;

      const result = await service.exportCsv();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(expectedCsv);
    });
  });

  describe('getList', () => {
    it('should return list of products with correct query params', async () => {
      const dto: GetProductsDto = {
        sort: 'price',
        order: 'desc',
        search: 'product',
      };
      const expectedProducts = products
        .filter((p) => p.name.toLowerCase().includes('product'))
        .sort((a, b) => b.price - a.price);
      mockQueryBuilder.getMany.mockResolvedValue(expectedProducts);

      const result = await service.getList(dto);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('p');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'p.name ILIKE :search',
        { search: '%product%' },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('p.price', 'DESC');
      expect(result).toEqual(expectedProducts);
    });

    it('should handle query without search', async () => {
      const dto: GetProductsDto = { sort: 'name', order: 'desc' };
      const expectedProducts = products.sort((a, b) =>
        b.name.localeCompare(a.name),
      );
      mockQueryBuilder.getMany.mockResolvedValue(expectedProducts);

      await service.getList(dto);

      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('p.name', 'DESC');
    });
  });

  describe('getById', () => {
    it('should return a product if found', async () => {
      const id = 1;
      const product = products.find((p) => p.product_id === id);
      repository.findOne!.mockResolvedValue(product);

      const result = await service.getById(id);

      expect(result).toEqual(product);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { product_id: id },
      });
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should successfully insert a product', async () => {
      const dto: CreateProductDto = {
        name: 'New Prod',
        price: 50,
        available_quantity: 20,
        wholesale_price: 45,
        wholesale_minimum_quantity: 10,
        is_active: true,
      };
      const expectedSaveResult = { ...dto, product_id: products.length + 1 };

      repository.create!.mockReturnValue(dto);
      repository.save!.mockResolvedValue(expectedSaveResult);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedSaveResult);
    });
  });

  describe('update', () => {
    const id = 1;

    it('should update existing product', async () => {
      const product = products.find((p) => p.product_id === id)!;
      const newName = 'Updated Name';
      const updateDto: UpdateProductDto = { name: newName };
      repository.findOne!.mockResolvedValue({ ...product });
      repository.save!.mockResolvedValue({ ...product, ...updateDto });

      const result = await service.update(id, updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { product_id: id },
      });
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...product,
          name: newName,
          price: product.price,
        }),
      );
      expect(result.name).toEqual(newName);
    });

    it('should throw NotFoundException if product to update not found', async () => {
      repository.findOne!.mockResolvedValue(null);
      await expect(service.update(id, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const id = 1;

    it('should remove existing product', async () => {
      const product = products.find((p) => p.product_id === id)!;

      repository.findOne!.mockResolvedValue(product);
      repository.remove!.mockResolvedValue(product);

      await service.remove(id);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { product_id: id },
      });
      expect(repository.remove).toHaveBeenCalledWith(product);
    });

    it('should throw NotFoundException if product to remove not found', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});
