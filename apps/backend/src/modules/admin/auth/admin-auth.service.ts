import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { AdminUser } from './entities/admin-user.entity';
import { Admin2fa } from './entities/admin-2fa.entity';
import { AdminSession } from './entities/admin-session.entity';

@Injectable()
export class AdminAuthService {
  private readonly jwtSecret: string;
  private readonly jwtAccessExpiry: string;
  private readonly jwtRefreshExpiry: string;

  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @InjectRepository(Admin2fa)
    private admin2faRepository: Repository<Admin2fa>,
    @InjectRepository(AdminSession)
    private adminSessionRepository: Repository<AdminSession>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>('ADMIN_JWT_SECRET') || 'admin-secret';
    this.jwtAccessExpiry = this.configService.get<string>('ADMIN_JWT_ACCESS_TOKEN_EXPIRES_IN') || '15m';
    this.jwtRefreshExpiry = this.configService.get<string>('ADMIN_JWT_REFRESH_TOKEN_EXPIRES_IN') || '7d';
  }
async login(email: string, password: string, twoFactorCode?: string): Promise<{ accessToken: string; refreshToken: string }> {
    const admin = await this.adminUserRepository.findOne({
      where: { email },
      relations: ['twofa'],
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (admin.status !== 'active') {
      throw new UnauthorizedException('Account is inactive');
    }

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account temporarily locked due to failed attempts');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      await this.handleFailedLogin(admin);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (admin.twofa?.enabled) {
      if (!twoFactorCode) {
        throw new BadRequestException('Two-factor authentication code required');
      }
      const isValid2fa = await this.verify2fa(admin.id, twoFactorCode);
      if (!isValid2fa) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }

    admin.failedLoginAttempts = 0;
    admin.lockedUntil = null;
    admin.lastLoginAt = new Date();
    await this.adminUserRepository.save(admin);

    return this.generateTokens(admin.id, admin.isSuperAdmin);
  }

  async logout(adminId: string, refreshToken: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await this.adminSessionRepository.update(
      { adminUserId: adminId, refreshTokenHash: tokenHash },
      { revokedAt: new Date() }
    );
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const session = await this.adminSessionRepository.findOne({
      where: { refreshTokenHash: tokenHash, revokedAt: null },
      relations: ['adminUser'],
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.adminSessionRepository.update(session.id, { revokedAt: new Date() });

    return this.generateTokens(session.adminUserId, session.adminUser.isSuperAdmin);
  }

  async enable2fa(adminId: string): Promise<{ secret: string; qrCodeUrl: string; backupCodes: string[] }> {
    const secret = crypto.randomBytes(20).toString('base32');
    const backupCodes = Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    let twofa = await this.admin2faRepository.findOne({ where: { adminUserId: adminId } });
    if (!twofa) {
      twofa = this.admin2faRepository.create({ adminUserId: adminId });
    }
    twofa.secret = secret;
    twofa.backupCodes = backupCodes;
    twofa.enabled = true;
    await this.admin2faRepository.save(twofa);

    const qrCodeUrl = `otpauth://totp/Westos Admin:${adminId}?secret=${secret}&issuer=Westos`;

    return { secret, qrCodeUrl, backupCodes };
  }

  async disable2fa(adminId: string, code: string): Promise<void> {
    const twofa = await this.admin2faRepository.findOne({ where: { adminUserId: adminId } });
    if (!twofa || !twofa.enabled) {
      throw new BadRequestException('2FA not enabled');
    }

    const isValid = await this.verify2fa(adminId, code);
    if (!isValid) {
      throw new BadRequestException('Invalid 2FA code');
    }

    twofa.enabled = false;
    twofa.secret = null;
    twofa.backupCodes = [];
    await this.admin2faRepository.save(twofa);
  }

  private async generateTokens(adminId: string, isSuperAdmin: boolean): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: adminId, isSuperAdmin };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: this.jwtAccessExpiry,
    });

    const refreshToken = this.jwtService.sign(
      { sub: adminId, type: 'refresh' },
      { secret: this.jwtSecret, expiresIn: this.jwtRefreshExpiry }
    );

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.adminSessionRepository.save({
      adminUserId: adminId,
      refreshTokenHash: crypto.createHash('sha256').update(refreshToken).digest('hex'),
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  private async handleFailedLogin(admin: AdminUser): Promise<void> {
    admin.failedLoginAttempts += 1;
    if (admin.failedLoginAttempts >= 5) {
      admin.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
    await this.adminUserRepository.save(admin);
  }

  private async verify2fa(adminId: string, code: string): Promise<boolean> {
    const twofa = await this.admin2faRepository.findOne({ where: { adminUserId: adminId } });
    if (!twofa || !twofa.enabled) return false;

    const backupCodeIndex = twofa.backupCodes?.indexOf(code.toUpperCase());
    if (backupCodeIndex !== undefined && backupCodeIndex >= 0) {
      twofa.backupCodes.splice(backupCodeIndex, 1);
      await this.admin2faRepository.save(twofa);
      return true;
    }

    return false;
  }
}
