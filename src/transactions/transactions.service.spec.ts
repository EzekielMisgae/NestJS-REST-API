import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { TransactionsRepository } from './transactions.repository';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { Transaction, TransactionType } from '../entities/transaction.entity';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let repository: TransactionsRepository;

  const mockTransaction: Transaction = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    type: TransactionType.ADJUSTMENT,
    quantityChange: -5,
    amount: 499.95,
    reason: 'Test adjustment',
    userId: '123e4567-e89b-12d3-a456-426614174001',
    productId: '123e4567-e89b-12d3-a456-426614174002',
    timestamp: new Date(),
    user: {} as any,
    product: {} as any,
  };

  const mockRepository = {
    findAll: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: TransactionsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    repository = module.get<TransactionsRepository>(TransactionsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all transactions when no filters provided', async () => {
      mockRepository.findAll.mockResolvedValue([mockTransaction]);

      const query: TransactionQueryDto = {};
      const result = await service.findAll(query);

      expect(repository.findAll).toHaveBeenCalledWith(query);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockTransaction.id,
        type: mockTransaction.type,
        quantityChange: mockTransaction.quantityChange,
        amount: mockTransaction.amount,
        reason: mockTransaction.reason,
        userId: mockTransaction.userId,
        productId: mockTransaction.productId,
        timestamp: mockTransaction.timestamp,
      });
    });

    it('should return filtered transactions when filters provided', async () => {
      mockRepository.findAll.mockResolvedValue([mockTransaction]);

      const query: TransactionQueryDto = {
        userId: '123e4567-e89b-12d3-a456-426614174001',
        type: TransactionType.ADJUSTMENT,
      };

      const result = await service.findAll(query);

      expect(repository.findAll).toHaveBeenCalledWith(query);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no transactions found', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const query: TransactionQueryDto = {};
      const result = await service.findAll(query);

      expect(repository.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual([]);
    });
  });
});

