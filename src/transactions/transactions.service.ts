import { Injectable } from '@nestjs/common';
import { TransactionsRepository } from './transactions.repository';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { Transaction } from '../entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  async findAll(
    query: TransactionQueryDto,
  ): Promise<TransactionResponseDto[]> {
    const transactions = await this.transactionsRepository.findAll(query);
    return transactions.map((transaction) => this.mapToResponseDto(transaction));
  }

  private mapToResponseDto(transaction: Transaction): TransactionResponseDto {
    return {
      id: transaction.id,
      type: transaction.type,
      quantityChange: transaction.quantityChange,
      amount: transaction.amount,
      reason: transaction.reason,
      userId: transaction.userId,
      productId: transaction.productId,
      timestamp: transaction.timestamp,
    };
  }
}

