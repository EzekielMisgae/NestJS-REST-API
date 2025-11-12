import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';
import { UsersService } from '../users/users.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AdjustProductDto } from './dto/adjust-product.dto';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: ProductsRepository;
  let usersService: UsersService;
  let dataSource: DataSource;

  const mockProduct: Product = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    price: 99.99,
    quantity: 10,
    description: 'Test Description',
    createdAt: new Date(),
    updatedAt: new Date(),
    transactions: [],
  };

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    email: 'test@example.com',
    name: 'Test User',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    transactions: [],
  };

  const mockRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByIdWithLock: jest.fn(),
    save: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: mockRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<ProductsRepository>(ProductsRepository);
    usersService = module.get<UsersService>(UsersService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createProductDto: CreateProductDto = {
      name: 'Test Product',
      price: 99.99,
      quantity: 10,
      description: 'Test Description',
    };

    it('should create a new product successfully', async () => {
      mockRepository.create.mockResolvedValue(mockProduct);

      const result = await service.create(createProductDto);

      expect(repository.create).toHaveBeenCalledWith({
        name: createProductDto.name,
        price: createProductDto.price,
        quantity: createProductDto.quantity,
        description: createProductDto.description,
      });
      expect(result).toEqual({
        id: mockProduct.id,
        name: mockProduct.name,
        price: mockProduct.price,
        quantity: mockProduct.quantity,
        description: mockProduct.description,
        createdAt: mockProduct.createdAt,
        updatedAt: mockProduct.updatedAt,
      });
    });
  });

  describe('adjustQuantity', () => {
    const adjustProductDto: AdjustProductDto = {
      productId: mockProduct.id,
      quantityChange: -5,
      reason: 'Test adjustment',
    };

    it('should adjust product quantity successfully', async () => {
      const updatedProduct = { ...mockProduct, quantity: 5 };
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockQueryRunner.manager.findOne.mockResolvedValue(mockProduct);
      mockQueryRunner.manager.save.mockResolvedValue(updatedProduct);
      mockQueryRunner.manager.create.mockReturnValue({});

      const result = await service.adjustQuantity(
        adjustProductDto,
        mockUser.id,
      );

      expect(usersService.findById).toHaveBeenCalledWith(mockUser.id);
      expect(mockQueryRunner.manager.findOne).toHaveBeenCalled();
      expect(mockQueryRunner.manager.save).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(result.quantity).toBe(5);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockQueryRunner.manager.findOne.mockResolvedValue(null);

      await expect(
        service.adjustQuantity(adjustProductDto, mockUser.id),
      ).rejects.toThrow(NotFoundException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if insufficient quantity', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockQueryRunner.manager.findOne.mockResolvedValue(mockProduct);

      const invalidAdjustment: AdjustProductDto = {
        ...adjustProductDto,
        quantityChange: -20,
      };

      await expect(
        service.adjustQuantity(invalidAdjustment, mockUser.id),
      ).rejects.toThrow(BadRequestException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('getStatus', () => {
    it('should return product status successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockProduct);

      const result = await service.getStatus(mockProduct.id);

      expect(repository.findById).toHaveBeenCalledWith(mockProduct.id);
      expect(result).toEqual({
        id: mockProduct.id,
        name: mockProduct.name,
        quantity: mockProduct.quantity,
        price: mockProduct.price,
        description: mockProduct.description,
        createdAt: mockProduct.createdAt,
        updatedAt: mockProduct.updatedAt,
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getStatus(mockProduct.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

