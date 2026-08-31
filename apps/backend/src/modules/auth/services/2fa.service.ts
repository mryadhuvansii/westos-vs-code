import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User2fa } from '../entities/user-2fa.entity';
import { User } from '../entities/user.entity';
import { TotpService } from './totp.service';
import { BackupCodesDto } from '../dto/2fa.dto';

@Injectable()
export class TwoFaService {
  constructor(
    @InjectRepository(User2fa)
    private readonly user2faRepository: Repository<User2fa>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly totpService: TotpService,
  ) {}

  async getStatus(userId: string): Promise<{ enabled: boolean; enabledAt?: Date; lastUsedAt?: Date }> {
    const user2fa = await this.user2faRepository.findOne({ where: { userId } });
    
    if (!user2fa) {
      return { enabled: false };
    }

    return {
      enabled: user2fa.isEnabled,
      enabledAt: user2fa.enabledAt || undefined,
      lastUsedAt: user2fa.lastUsedAt || undefined,
    };
  }

  async initiateEnable(userId: string): Promise<{ secret: string; qrCodeUrl: string; backupCodes: string[] }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let user2fa = await this.user2faRepository.findOne({ where: { userId } });
    
    if (user2fa?.isEnabled) {
      throw new ConflictException('2FA is already enabled');
    }

    const secret = this.totpService.generateSecret();
    const qrCodeUrl = await this.totpService.generateQrCodeUrl(user.email, secret);
    const backupCodes = this.totpService.generateBackupCodes(10);

    if (!user2fa) {
      user2fa = this.user2faRepository.create({ userId });
    }

    user2fa.secret = secret;
    user2fa.backupCodes = this.totpService.hashBackupCodes(backupCodes);
    user2fa.isEnabled = false;
    await this.user2faRepository.save(user2fa);

    return { secret, qrCodeUrl, backupCodes };
  }

  async confirmEnable(userId: string, code: string): Promise<BackupCodesDto> {
    const user2fa = await this.user2faRepository.findOne({ where: { userId } });
    
    if (!user2fa || !user2fa.secret) {
      throw new BadRequestException('2FA setup not initiated');
    }

    if (user2fa.isEnabled) {
      throw new ConflictException('2FA is already enabled');
    }

    const isValid = this.totpService.verifyToken(code, user2fa.secret);
    if (!isValid) {
      throw new BadRequestException('Invalid TOTP code');
    }

    user2fa.isEnabled = true;
    user2fa.enabledAt = new Date();
    await this.user2faRepository.save(user2fa);

    return { codes: user2fa.backupCodes?.map(c => c) || [] };
  }

  async disable(userId: string, password: string, code?: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const user2fa = await this.user2faRepository.findOne({ where: { userId } });
    if (!user2fa || !user2fa.isEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    if (code) {
      const isValid = this.totpService.verifyToken(code, user2fa.secret!);
      if (!isValid) {
        throw new BadRequestException('Invalid TOTP code');
      }
    }

    user2fa.isEnabled = false;
    user2fa.secret = null;
    user2fa.backupCodes = null;
    user2fa.enabledAt = null;
    await this.user2faRepository.save(user2fa);

    return { message: '2FA disabled successfully' };
  }

  async verify(userId: string, code: string, backupCode?: string): Promise<{ verified: boolean; newBackupCodes?: string[] }> {
    const user2fa = await this.user2faRepository.findOne({ where: { userId } });
    
    if (!user2fa || !user2fa.isEnabled) {
      throw new UnauthorizedException('2FA not enabled for this user');
    }

    // Try TOTP first
    if (code && this.totpService.verifyToken(code, user2fa.secret!)) {
      user2fa.lastUsedAt = new Date();
      await this.user2faRepository.save(user2fa);
      return { verified: true };
    }

    // Try backup code
    if (backupCode && user2fa.backupCodes?.length) {
      const { valid, remainingCodes } = this.totpService.verifyBackupCode(backupCode, user2fa.backupCodes);
      
      if (valid) {
        user2fa.backupCodes = remainingCodes;
        user2fa.lastUsedAt = new Date();
        await this.user2faRepository.save(user2fa);
        return { verified: true, newBackupCodes: remainingCodes };
      }
    }

    throw new UnauthorizedException('Invalid code');
  }

  async regenerateBackupCodes(userId: string): Promise<BackupCodesDto> {
    const user2fa = await this.user2faRepository.findOne({ where: { userId } });
    
    if (!user2fa || !user2fa.isEnabled) {
      throw new BadRequestException('2FA not enabled for this user');
    }

    const backupCodes = this.totpService.generateBackupCodes(10);
    user2fa.backupCodes = this.totpService.hashBackupCodes(backupCodes);
    await this.user2faRepository.save(user2fa);

    return { codes: backupCodes };
  }
}