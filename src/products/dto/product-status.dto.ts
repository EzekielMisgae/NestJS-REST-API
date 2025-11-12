import { ApiProperty } from '@nestjs/swagger';

export class ProductStatusDto {
  @ApiProperty({ description: 'Product UUID' })
  id!: string;

  @ApiProperty({ description: 'Product name' })
  name!: string;

  @ApiProperty({ description: 'Current quantity in stock' })
  quantity!: number;

  @ApiProperty({ description: 'Product price' })
  price!: number;

  @ApiProperty({ description: 'Product description', required: false })
  description!: string | null;

  @ApiProperty({ description: 'Product creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Product last update timestamp' })
  updatedAt!: Date;
}

