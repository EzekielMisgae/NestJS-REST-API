import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { AdjustProductDto } from './dto/adjust-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductStatusDto } from './dto/product-status.dto';
import { Product } from '../entities/product.entity';
import { Transaction } from '../entities/transaction.entity';
import { TransactionType } from '../entities/transaction.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productsRepository.create({
      name: createProductDto.name,
      price: createProductDto.price,
      quantity: createProductDto.quantity,
      description: createProductDto.description,
    });

    return this.mapToResponseDto(product);
  }

  async adjustQuantity(
    adjustProductDto: AdjustProductDto,
    userId: string,
  ): Promise<ProductResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verify user exists
      await this.usersService.findById(userId);

      // Use pessimistic lock to prevent concurrent updates
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: adjustProductDto.productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${adjustProductDto.productId} not found`,
        );
      }

      const newQuantity = product.quantity + adjustProductDto.quantityChange;

      if (newQuantity < 0) {
        throw new BadRequestException(
          `Insufficient quantity. Current: ${product.quantity}, Requested change: ${adjustProductDto.quantityChange}`,
        );
      }

      product.quantity = newQuantity;
      const updatedProduct = await queryRunner.manager.save(product);

      // Create transaction record
      const transaction = queryRunner.manager.create(Transaction, {
        type: TransactionType.ADJUSTMENT,
        quantityChange: adjustProductDto.quantityChange,
        amount: Math.abs(adjustProductDto.quantityChange * product.price),
        reason: adjustProductDto.reason || 'Inventory adjustment',
        userId,
        productId: adjustProductDto.productId,
      });

      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      return this.mapToResponseDto(updatedProduct);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getStatus(productId: string): Promise<ProductStatusDto> {
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return {
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      price: product.price,
      description: product.description,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private mapToResponseDto(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      description: product.description,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}

