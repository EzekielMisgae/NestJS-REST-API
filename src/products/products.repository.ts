import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  async create(productData: Partial<Product>): Promise<Product> {
    const product = this.repository.create(productData);
    return this.repository.save(product);
  }

  async findById(id: string): Promise<Product | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByIdWithLock(id: string): Promise<Product | null> {
    return this.repository.findOne({
      where: { id },
      lock: { mode: 'pessimistic_write' },
    });
  }

  async save(product: Product): Promise<Product> {
    return this.repository.save(product);
  }
}

