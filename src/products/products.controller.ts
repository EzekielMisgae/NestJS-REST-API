import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AdjustProductDto } from './dto/adjust-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductStatusDto } from './dto/product-status.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product successfully created',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.create(createProductDto);
  }

  @Put('adjust')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Adjust product quantity' })
  @ApiHeader({
    name: 'x-user-id',
    description: 'User UUID making the adjustment',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Product quantity successfully adjusted',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error or insufficient quantity' })
  @ApiResponse({ status: 404, description: 'Product or user not found' })
  async adjust(
    @Body() adjustProductDto: AdjustProductDto,
    @Headers('x-user-id') userId: string,
  ): Promise<ProductResponseDto> {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new BadRequestException('x-user-id must be a valid UUID');
    }

    return this.productsService.adjustQuantity(adjustProductDto, userId);
  }

  @Get('status/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get product status' })
  @ApiParam({
    name: 'productId',
    description: 'Product UUID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Product status retrieved successfully',
    type: ProductStatusDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getStatus(@Param('productId') productId: string): Promise<ProductStatusDto> {
    return this.productsService.getStatus(productId);
  }
}

