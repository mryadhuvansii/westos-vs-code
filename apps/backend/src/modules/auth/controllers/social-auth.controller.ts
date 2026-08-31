import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SocialLoginDto, SocialProvider, SocialLoginResponseDto } from '../dto/social-login.dto';
import { SocialAuthService } from '../services/social-auth.service';

@ApiTags('Social Auth')
@Controller('auth/social')
export class SocialAuthController {
  constructor(private readonly socialAuthService: SocialAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with social provider (Google, Apple)' })
  @ApiResponse({ status: 200, type: SocialLoginResponseDto, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async login(@Body() dto: SocialLoginDto): Promise<SocialLoginResponseDto> {
    return this.socialAuthService.loginWithSocial(dto);
  }

  @Get('google')
  @ApiOperation({ summary: 'Google OAuth redirect URL' })
  @ApiResponse({ status: 200, description: 'Redirect to Google OAuth' })
  async googleAuth(): Promise<{ url: string }> {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/google/callback';
    const scope = 'email profile';
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
    return { url };
  }

  @Get('apple')
  @ApiOperation({ summary: 'Apple OAuth redirect URL' })
  @ApiResponse({ status: 200, description: 'Redirect to Apple OAuth' })
  async appleAuth(): Promise<{ url: string }> {
    const clientId = process.env.APPLE_CLIENT_ID || '';
    const redirectUri = process.env.APPLE_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/apple/callback';
    const scope = 'name email';
    const url = `https://appleid.apple.com/auth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&response_mode=form_post`;
    return { url };
  }
}