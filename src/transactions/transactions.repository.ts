import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { TransactionQueryDto } from './dto/transaction-query.dto';

@Injectable()
export class TransactionsRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly repository: Repository<Transaction>,
  ) {}

  async findAll(query: TransactionQueryDto): Promise<Transaction[]> {
    const where: FindOptionsWhere<Transaction> = {};

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.productId) {
      where.productId = query.productId;
    }

    if (query.type) {
      where.type = query.type;
    }

    return this.repository.find({
      where,
      relations: ['user', 'product'],
      order: { timestamp: 'DESC' },
    });
  }

  async create(transactionData: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.repository.create(transactionData);
    return this.repository.save(transaction);
  }
}

