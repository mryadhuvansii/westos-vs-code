import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'brand', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'order', required: false, type: String })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getProducts(@Query() params: any) {
    return this.productsService.getProducts(params);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get product by slug' })
  async getProduct(@Param('slug') slug: string) {
    return this.productsService.getProduct(slug);
  }

  @Get(':id/variants')
  @ApiOperation({ summary: 'Get product variants' })
  async getVariants(@Param('id') id: string) {
    return this.productsService.getVariants(id);
  }

  @Get(':id/media')
  @ApiOperation({ summary: 'Get product media' })
  async getMedia(@Param('id') id: string) {
    return this.productsService.getMedia(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create product' })
  async create(@Body() dto: any) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  async delete(@Param('id') id: string) {
    await this.productsService.delete(id);
    return { message: 'Product deleted successfully' };
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish product' })
  async publish(@Param('id') id: string) {
    return this.productsService.publish(id);
  }

  @Post(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish product' })
  async unpublish(@Param('id') id: string) {
    return this.productsService.unpublish(id);
  }
}
