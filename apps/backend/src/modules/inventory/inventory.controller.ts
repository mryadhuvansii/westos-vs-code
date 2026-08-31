import { Controller, Get, Post, Patch, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('variant/:variantId')
  @ApiOperation({ summary: 'Get inventory for a variant' })
  @ApiResponse({ status: 200, description: 'Inventory retrieved' })
  async getInventory(@Param('variantId') variantId: string, @Query('warehouseId') warehouseId?: string) {
    return this.inventoryService.getInventory(variantId, warehouseId);
  }

  @Post('stock/update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update stock for a variant' })
  @ApiResponse({ status: 200, description: 'Stock updated' })
  async updateStock(@Body() dto: { variantId: string; quantity: number; warehouseId: string }) {
    return this.inventoryService.updateStock(dto.variantId, dto.quantity, dto.warehouseId);
  }

  @Post('reserve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reserve stock' })
  @ApiResponse({ status: 200, description: 'Stock reserved' })
  async reserveStock(@Body() dto: { variantId: string; quantity: number; cartId?: string; orderId?: string }) {
    return this.inventoryService.reserveStock(dto.variantId, dto.quantity, dto.cartId, dto.orderId);
  }

  @Post('reserve/:reservationId/release')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Release stock reservation' })
  @ApiResponse({ status: 200, description: 'Reservation released' })
  async releaseReservation(@Param('reservationId') reservationId: string) {
    await this.inventoryService.releaseReservation(reservationId);
    return { message: 'Reservation released' };
  }

  @Get('purchase-orders')
  @ApiOperation({ summary: 'Get purchase orders' })
  @ApiResponse({ status: 200, description: 'Purchase orders retrieved' })
  async getPurchaseOrders(@Query('status') status?: string) {
    return this.inventoryService.getPurchaseOrders(status);
  }

  @Post('purchase-orders')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create purchase order' })
  @ApiResponse({ status: 201, description: 'Purchase order created' })
  async createPurchaseOrder(@Body() dto: { poNumber: string; vendorId: string; items: any[]; totalAmount: number }) {
    return this.inventoryService.createPurchaseOrder(dto.poNumber, dto.vendorId, dto.items, dto.totalAmount);
  }

  @Patch('purchase-orders/:poId/status')
  @ApiOperation({ summary: 'Update purchase order status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updatePurchaseOrderStatus(@Param('poId') poId: string, @Body() dto: { status: string }) {
    return this.inventoryService.updatePurchaseOrderStatus(poId, dto.status);
  }
}
