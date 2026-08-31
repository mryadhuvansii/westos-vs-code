import { IsString, IsOptional, Length, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Enable2faDto {
  @ApiProperty({ description: 'TOTP code from authenticator app', example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;
}

export class Disable2faDto {
  @ApiProperty({ description: 'Current password for verification', example: 'Password123!' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ description: 'TOTP code from authenticator app (optional if using password)', example: '123456' })
  @IsOptional()
  @IsString()
  @Length(6, 6)
  code?: string;
}

export class Verify2faDto {
  @ApiProperty({ description: 'TOTP code from authenticator app', example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiPropertyOptional({ description: 'Backup code (if TOTP not available)', example: 'abcd1234' })
  @IsOptional()
  @IsString()
  @Length(8, 8)
  backupCode?: string;
}

export class Enable2faResponseDto {
  @ApiProperty({ description: 'TOTP secret for QR code generation', example: 'JBSWY3DPEHPK3PXP' })
  secret: string;

  @ApiProperty({ description: 'QR code URL for authenticator app', example: 'otpauth://totp/Westos:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Westos' })
  qrCodeUrl: string;

  @ApiProperty({ description: 'Backup codes for recovery', type: [String], example: ['abcd1234', 'efgh5678', 'ijkl9012'] })
  backupCodes: string[];
}

export class Verify2faResponseDto {
  @ApiProperty({ description: 'Whether verification was successful' })
  verified: boolean;

  @ApiPropertyOptional({ description: 'New backup codes if backup code was used', type: [String] })
  newBackupCodes?: string[];
}

export class BackupCodesDto {
  @ApiProperty({ description: 'Array of backup codes', type: [String], example: ['abcd1234', 'efgh5678', 'ijkl9012'] })
  @IsArray()
  @IsString({ each: true })
  codes: string[];
}