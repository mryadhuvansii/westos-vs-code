import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateAddressDto, UpdateAddressDto, UpdateProfileDto, UpdatePreferencesDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@Req() req: any) {
    return this.customersService.getProfile(req.user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.customersService.updateProfile(req.user.id, dto);
  }

  @Get('me/addresses')
  @ApiOperation({ summary: 'Get all addresses' })
  @ApiResponse({ status: 200, description: 'Addresses retrieved successfully' })
  async getAddresses(@Req() req: any) {
    return this.customersService.getAddresses(req.user.id);
  }

  @Post('me/addresses')
  @ApiOperation({ summary: 'Create new address' })
  @ApiResponse({ status: 201, description: 'Address created successfully' })
  async createAddress(@Req() req: any, @Body() dto: CreateAddressDto) {
    return this.customersService.createAddress(req.user.id, dto);
  }

  @Patch('me/addresses/:id')
  @ApiOperation({ summary: 'Update address' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async updateAddress(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.customersService.updateAddress(req.user.id, id, dto);
  }

  @Delete('me/addresses/:id')
  @ApiOperation({ summary: 'Delete address' })
  @ApiResponse({ status: 200, description: 'Address deleted successfully' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async deleteAddress(@Req() req: any, @Param('id') id: string) {
    return this.customersService.deleteAddress(req.user.id, id);
  }

  @Get('me/preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences retrieved successfully' })
  async getPreferences(@Req() req: any) {
    return this.customersService.getPreferences(req.user.id);
  }

  @Patch('me/preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  async updatePreferences(@Req() req: any, @Body() dto: UpdatePreferencesDto) {
    return this.customersService.updatePreferences(req.user.id, dto);
  }

  @Get('me/devices')
  @ApiOperation({ summary: 'Get registered devices' })
  @ApiResponse({ status: 200, description: 'Devices retrieved successfully' })
  async getDevices(@Req() req: any) {
    return this.customersService.getDevices(req.user.id);
  }

  @Delete('me/devices/:id')
  @ApiOperation({ summary: 'Remove device' })
  @ApiResponse({ status: 200, description: 'Device removed successfully' })
  async removeDevice(@Req() req: any, @Param('id') id: string) {
    return this.customersService.removeDevice(req.user.id, id);
  }

  @Get('me/orders')
  @ApiOperation({ summary: 'Get user orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async getOrders(@Req() req: any, @Query() params: { page?: number; limit?: number; status?: string }) {
    return this.customersService.getOrders(req.user.id, params);
  }

  @Get('me/orders/:id')
  @ApiOperation({ summary: 'Get order details' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrder(@Req() req: any, @Param('id') id: string) {
    return this.customersService.getOrder(req.user.id, id);
  }

  @Get('me/wishlist')
  @ApiOperation({ summary: 'Get wishlist' })
  @ApiResponse({ status: 200, description: 'Wishlist retrieved successfully' })
  async getWishlist(@Req() req: any) {
    return this.customersService.getWishlist(req.user.id);
  }

  @Post('me/wishlist')
  @ApiOperation({ summary: 'Add to wishlist' })
  @ApiResponse({ status: 201, description: 'Added to wishlist' })
  async addToWishlist(@Req() req: any, @Body('variantId') variantId: string) {
    return this.customersService.addToWishlist(req.user.id, variantId);
  }

  @Delete('me/wishlist/:variantId')
  @ApiOperation({ summary: 'Remove from wishlist' })
  @ApiResponse({ status: 200, description: 'Removed from wishlist' })
  async removeFromWishlist(@Req() req: any, @Param('variantId') variantId: string) {
    return this.customersService.removeFromWishlist(req.user.id, variantId);
  }

  @Get('me/reviews')
  @ApiOperation({ summary: 'Get user reviews' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  async getReviews(@Req() req: any) {
    return this.customersService.getReviews(req.user.id);
  }

  @Post('me/reviews')
  @ApiOperation({ summary: 'Create review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  async createReview(@Req() req: any, @Body() dto: any) {
    return this.customersService.createReview(req.user.id, dto);
  }

  @Get('buyback/eligibility')
  @ApiOperation({ summary: 'Check buyback eligibility' })
  @ApiResponse({ status: 200, description: 'Eligibility checked' })
  async getBuybackEligibility(@Req() req: any) {
    return this.customersService.getBuybackEligibility(req.user.id);
  }

  @Post('buyback/initiate')
  @ApiOperation({ summary: 'Initiate buyback' })
  @ApiResponse({ status: 200, description: 'Buyback initiated' })
  async initiateBuyback(@Req() req: any, @Body() dto: any) {
    return this.customersService.initiateBuyback(req.user.id, dto);
  }
}
