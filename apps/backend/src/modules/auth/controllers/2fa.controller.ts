import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Enable2faDto, Disable2faDto, Verify2faDto, Enable2faResponseDto, Verify2faResponseDto, BackupCodesDto } from '../dto/2fa.dto';
import { TwoFaService } from '../services/2fa.service';

@ApiTags('2FA')
@Controller('auth/2fa')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TwoFaController {
  constructor(private readonly twoFaService: TwoFaService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get 2FA status for current user' })
  @ApiResponse({ status: 200, description: '2FA status retrieved' })
  async getStatus(@Request() req: any) {
    return this.twoFaService.getStatus(req.user.sub);
  }

  @Post('enable')
  @ApiOperation({ summary: 'Initiate 2FA setup - returns secret and QR code' })
  @ApiResponse({ status: 200, type: Enable2faResponseDto, description: '2FA setup initiated' })
  @ApiResponse({ status: 400, description: '2FA already enabled' })
  async enable(@Request() req: any): Promise<Enable2faResponseDto> {
    return this.twoFaService.initiateEnable(req.user.sub);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm 2FA setup with TOTP code' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully', type: BackupCodesDto })
  @ApiResponse({ status: 400, description: 'Invalid TOTP code' })
  async confirm(@Request() req: any, @Body() dto: Enable2faDto): Promise<BackupCodesDto> {
    return this.twoFaService.confirmEnable(req.user.sub, dto.code);
  }

  @Post('disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable 2FA' })
  @ApiResponse({ status: 200, description: '2FA disabled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid password or code' })
  async disable(@Request() req: any, @Body() dto: Disable2faDto): Promise<{ message: string }> {
    return this.twoFaService.disable(req.user.sub, dto.password, dto.code);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify TOTP or backup code' })
  @ApiResponse({ status: 200, type: Verify2faResponseDto, description: 'Verification result' })
  @ApiResponse({ status: 401, description: 'Invalid code' })
  async verify(@Request() req: any, @Body() dto: Verify2faDto): Promise<Verify2faResponseDto> {
    return this.twoFaService.verify(req.user.sub, dto.code, dto.backupCode);
  }

  @Post('backup-codes/regenerate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Regenerate backup codes' })
  @ApiResponse({ status: 200, type: BackupCodesDto, description: 'New backup codes generated' })
  async regenerateBackupCodes(@Request() req: any): Promise<BackupCodesDto> {
    return this.twoFaService.regenerateBackupCodes(req.user.sub);
  }
}