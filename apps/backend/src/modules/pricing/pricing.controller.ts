import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../../admin/auth/guards/admin-jwt-auth.guard';

@ApiTags('Pricing')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('calculate')
  @ApiOperation({ summary: 'Calculate price for variant' })
  @ApiQuery({ name: 'variantId', required: true, type: String })
  @ApiQuery({ name: 'quantity', required: false, type: Number })
  async calculatePrice(@Query('variantId') variantId: string, @Query('quantity') quantity?: number) {
    return this.pricingService.calculatePrice(variantId, quantity || 1);
  }

  @Get('rules')
  @ApiOperation({ summary: 'Get all pricing rules' })
  async getPricingRules() {
    return this.pricingService.getPricingRules();
  }

  @Post('rules')
  @ApiOperation({ summary: 'Create pricing rule' })
  async createPricingRule(@Body() dto: any) {
    return this.pricingService.createPricingRule(dto);
  }

  @Patch('rules/:id')
  @ApiOperation({ summary: 'Update pricing rule' })
  async updatePricingRule(@Param('id') id: string, @Body() dto: any) {
    return this.pricingService.updatePricingRule(id, dto);
  }

  @Delete('rules/:id')
  @ApiOperation({ summary: 'Delete pricing rule' })
  async deletePricingRule(@Param('id') id: string) {
    await this.pricingService.deletePricingRule(id);
    return { message: 'Pricing rule deleted successfully' };
  }

  @Get('tax-rates')
  @ApiOperation({ summary: 'Get all tax rates' })
  async getTaxRates() {
    return this.pricingService.getTaxRates();
  }

  @Post('tax-rates')
  @ApiOperation({ summary: 'Create tax rate' })
  async createTaxRate(@Body() dto: any) {
    return this.pricingService.createTaxRate(dto);
  }

  @Patch('tax-rates/:id')
  @ApiOperation({ summary: 'Update tax rate' })
  async updateTaxRate(@Param('id') id: string, @Body() dto: any) {
    return this.pricingService.updateTaxRate(id, dto);
  }

  @Get('history/:variantId')
  @ApiOperation({ summary: 'Get price history for variant' })
  async getPriceHistory(@Param('variantId') variantId: string) {
    return this.pricingService.getPriceHistory(variantId);
  }
}
