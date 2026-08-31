import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  async getCart(@Req() req: any, @Query('sessionId') sessionId?: string) {
    const cart = await this.cartService.getCart(req.user?.id, sessionId);
    return cart;
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get cart summary with totals' })
  @ApiResponse({ status: 200, description: 'Cart summary retrieved successfully' })
  async getCartSummary(@Req() req: any, @Query('sessionId') sessionId?: string) {
    return this.cartService.getCartSummary(req.user?.id, sessionId);
  }

  @Post('add')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 200, description: 'Item added to cart' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  @ApiResponse({ status: 404, description: 'Product variant not found' })
  async addToCart(@Req() req: any, @Body() dto: { variantId: string; quantity?: number }, @Query('sessionId') sessionId?: string) {
    return this.cartService.addToCart(req.user?.id, sessionId, dto.variantId, dto.quantity || 1);
  }

  @Patch('update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update item quantity in cart' })
  @ApiResponse({ status: 200, description: 'Cart updated successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  @ApiResponse({ status: 404, description: 'Item not in cart' })
  async updateQuantity(@Req() req: any, @Body() dto: { variantId: string; quantity: number }, @Query('sessionId') sessionId?: string) {
    return this.cartService.updateQuantity(req.user?.id, sessionId, dto.variantId, dto.quantity);
  }

  @Delete('remove/:variantId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  @ApiResponse({ status: 404, description: 'Item not in cart' })
  async removeFromCart(@Req() req: any, @Param('variantId') variantId: string, @Query('sessionId') sessionId?: string) {
    return this.cartService.removeFromCart(req.user?.id, sessionId, variantId);
  }

  @Delete('clear')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  async clearCart(@Req() req: any, @Query('sessionId') sessionId?: string) {
    await this.cartService.clearCart(req.user?.id, sessionId);
    return { message: 'Cart cleared successfully' };
  }
}