import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ description: 'Product UUID' })
  id!: string;

  @ApiProperty({ description: 'Product name' })
  name!: string;

  @ApiProperty({ description: 'Product price' })
  price!: number;

  @ApiProperty({ description: 'Product quantity' })
  quantity!: number;

  @ApiProperty({ description: 'Product description', required: false })
  description!: string | null;

  @ApiProperty({ description: 'Product creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Product last update timestamp' })
  updatedAt!: Date;
}

