import { Controller, Get, Post, Patch, Param, Body, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved' })
  async getOrders(@Req() req: any, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.ordersService.getOrders(req.user.id, page, limit);
  }

  @Get(':orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order details' })
  @ApiResponse({ status: 200, description: 'Order retrieved' })
  async getOrder(@Param('orderId') orderId: string) {
    return this.ordersService.getOrder(orderId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create order' })
  @ApiResponse({ status: 201, description: 'Order created' })
  async createOrder(@Req() req: any, @Body() dto: { items: any[]; totalAmount: number }) {
    return this.ordersService.createOrder(req.user.id, dto.items, dto.totalAmount);
  }

  @Patch(':orderId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateOrderStatus(@Param('orderId') orderId: string, @Body() dto: { status: string }) {
    return this.ordersService.updateOrderStatus(orderId, dto.status);
  }

  @Get(':orderId/invoice')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get invoice' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved' })
  async getInvoice(@Param('orderId') orderId: string) {
    return this.ordersService.getInvoice(orderId);
  }

  @Get(':orderId/credit-notes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get credit notes' })
  @ApiResponse({ status: 200, description: 'Credit notes retrieved' })
  async getCreditNotes(@Param('orderId') orderId: string) {
    return this.ordersService.getCreditNotes(orderId);
  }
}
