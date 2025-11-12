import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Laptop',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Product price',
    example: 999.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  price!: number;

  @ApiProperty({
    description: 'Initial product quantity',
    example: 10,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  quantity!: number;

  @ApiProperty({
    description: 'Product description',
    example: 'High-performance laptop',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

