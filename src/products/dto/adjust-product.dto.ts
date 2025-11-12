import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class AdjustProductDto {
  @ApiProperty({
    description: 'Product UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({
    description: 'Quantity change (positive for increase, negative for decrease)',
    example: -5,
  })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  quantityChange!: number;

  @ApiProperty({
    description: 'Reason for adjustment',
    example: 'Damaged items returned',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

