import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';
import { Request } from 'express';
import { AdminUser } from './entities/admin-user.entity';

@ApiTags('Admin Authentication')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 400, description: '2FA code required' })
  async login(
    @Body() body: { email: string; password: string; twoFactorCode?: string },
  ) {
    return this.adminAuthService.login(body.email, body.password, body.twoFactorCode);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin logout' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Req() req: Request & { user: AdminUser }, @Body('refreshToken') refreshToken: string) {
    await this.adminAuthService.logout(req.user.id, refreshToken);
    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh admin access token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refreshTokens(@Body('refreshToken') refreshToken: string) {
    return this.adminAuthService.refreshTokens(refreshToken);
  }

  @Post('2fa/enable')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable 2FA' })
  @ApiResponse({ status: 200, description: '2FA enabled' })
  @ApiResponse({ status: 400, description: '2FA not implemented' })
  async enable2fa(@Req() req: Request & { user: AdminUser }) {
    return this.adminAuthService.enable2fa(req.user.id);
  }

  @Post('2fa/disable')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable 2FA' })
  @ApiResponse({ status: 200, description: '2FA disabled' })
  @ApiResponse({ status: 400, description: 'Invalid code' })
  async disable2fa(@Req() req: Request & { user: AdminUser }, @Body('code') code: string) {
    await this.adminAuthService.disable2fa(req.user.id, code);
    return { message: '2FA disabled successfully' };
  }
}
