import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../entities/transaction.entity';

export class TransactionResponseDto {
  @ApiProperty({ description: 'Transaction UUID' })
  id!: string;

  @ApiProperty({
    description: 'Transaction type',
    enum: TransactionType,
  })
  type!: TransactionType;

  @ApiProperty({ description: 'Quantity change' })
  quantityChange!: number;

  @ApiProperty({ description: 'Transaction amount' })
  amount!: number;

  @ApiProperty({ description: 'Reason for transaction', required: false })
  reason!: string | null;

  @ApiProperty({ description: 'User UUID' })
  userId!: string;

  @ApiProperty({ description: 'Product UUID' })
  productId!: string;

  @ApiProperty({ description: 'Transaction timestamp' })
  timestamp!: Date;
}

