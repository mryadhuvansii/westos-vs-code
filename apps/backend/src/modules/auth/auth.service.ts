import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserConsents } from './entities/user-consents.entity';
import { UserDevice } from './entities/user-device.entity';
import { OtpCode } from './entities/otp-code.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { UserSession } from './entities/user-session.entity';
import { RegisterDto, LoginDto, OtpLoginDto, PhoneOtpLoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, SendOtpDto, VerifyOtpDto, Enable2faDto, Disable2faDto, SocialLoginDto } from './dto/auth.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { TokenPair } from './interfaces/token-pair.interface';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtAccessExpiry: string;
  private readonly jwtRefreshExpiry: string;
  private readonly adminJwtSecret: string;
  private readonly adminJwtAccessExpiry: string;
  private readonly adminJwtRefreshExpiry: string;
  private readonly bcryptRounds: number;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
    @InjectRepository(UserConsents)
    private consentsRepository: Repository<UserConsents>,
    @InjectRepository(UserDevice)
    private deviceRepository: Repository<UserDevice>,
    @InjectRepository(OtpCode)
    private otpRepository: Repository<OtpCode>,
    @InjectRepository(PasswordResetToken)
    private resetTokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET') || 'default-secret';
    this.jwtAccessExpiry = this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') || '15m';
    this.jwtRefreshExpiry = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN') || '7d';
    this.adminJwtSecret = this.configService.get<string>('ADMIN_JWT_SECRET') || 'admin-secret';
    this.adminJwtAccessExpiry = this.configService.get<string>('ADMIN_JWT_ACCESS_TOKEN_EXPIRES_IN') || '15m';
    this.adminJwtRefreshExpiry = this.configService.get<string>('ADMIN_JWT_REFRESH_TOKEN_EXPIRES_IN') || '7d';
    this.bcryptRounds = this.configService.get<number>('BCRYPT_ROUNDS') || 12;
  }

  async register(dto: RegisterDto): Promise<TokenPair> {
    const existingUser = await this.userRepository.findOne({
      where: [{ email: dto.email }, { phone: dto.phone }],
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds);

    const user = this.userRepository.create({
      email: dto.email,
      passwordHash,
      emailVerified: false,
      phoneVerified: false,
      status: 'pending_verification' as any,
    });

    await this.userRepository.save(user);

    const profile = this.profileRepository.create({
      userId: user.id,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });
    await this.profileRepository.save(profile);

    const consents = this.consentsRepository.create({
      userId: user.id,
    });
    await this.consentsRepository.save(consents);

    await this.sendVerificationEmail(user.id, user.email);

    return this.generateTokens(user.id, false);
  }

  async login(dto: LoginDto): Promise<TokenPair> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      relations: ['profile', 'consents'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'blocked' || user.status === 'suspended') {
      throw new UnauthorizedException('Account is blocked or suspended');
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    return this.generateTokens(user.id, false);
  }

  async otpLogin(dto: OtpLoginDto): Promise<TokenPair> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.verifyOtp({ email: dto.email, code: dto.code, channel: 'email' });

    user.emailVerified = true;
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    return this.generateTokens(user.id, false);
  }

  async phoneOtpLogin(dto: PhoneOtpLoginDto): Promise<TokenPair> {
    const user = await this.userRepository.findOne({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.verifyOtp({ phone: dto.phone, code: dto.code, channel: 'sms' });

    user.phoneVerified = true;
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    return this.generateTokens(user.id, false);
  }

  async socialLogin(dto: SocialLoginDto): Promise<TokenPair> {
    throw new Error('Social login not yet implemented');
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await this.sessionRepository.update(
      { userId, refreshTokenHash: tokenHash },
      { revokedAt: new Date() },
    );
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const session = await this.sessionRepository.findOne({
      where: { refreshTokenHash: tokenHash, revokedAt: null },
      relations: ['user'],
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.sessionRepository.update(session.id, { revokedAt: new Date() });

    return this.generateTokens(session.userId, false);
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });

    if (!user) {
      return;
    }

    const recentToken = await this.resetTokenRepository.findOne({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
    });

    if (recentToken && recentToken.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      throw new BadRequestException('Password reset already requested recently. Try again in 24 hours.');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const resetToken = this.resetTokenRepository.create({
      userId: user.id,
      token,
      expiresAt,
    });
    await this.resetTokenRepository.save(resetToken);

    // TODO: Send password reset email
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const resetToken = await this.resetTokenRepository.findOne({
      where: { token: dto.token, usedAt: null },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.userRepository.findOne({ where: { id: resetToken.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds);
    user.passwordHash = passwordHash;
    await this.userRepository.save(user);

    resetToken.usedAt = new Date();
    await this.resetTokenRepository.save(resetToken);

    await this.sessionRepository.update(
      { userId: user.id, revokedAt: null },
      { revokedAt: new Date() },
    );

    // TODO: Send password changed email
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<void> {
    throw new Error('Not yet implemented');
  }

  async sendOtp(dto: SendOtpDto): Promise<void> {
    const contact = dto.email || dto.phone;
    const channel = dto.channel;

    const recentOtpForContact = await this.otpRepository
      .createQueryBuilder('otp')
      .where('otp.channel = :channel', { channel })
      .andWhere('otp.createdAt > :since', { since: new Date(Date.now() - 60 * 1000) })
      .getCount();

    if (recentOtpForContact > 0) {
      throw new BadRequestException('OTP already sent recently. Please wait.');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const otp = this.otpRepository.create({
      userId: null,
      code,
      channel,
      purpose: 'login',
      expiresAt,
    });
    await this.otpRepository.save(otp);

    // TODO: Send OTP via email/SMS/WhatsApp
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: { code: dto.code, channel: dto.channel, usedAt: null },
      order: { createdAt: 'DESC' },
    });

    if (!otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    if (otp.expiresAt < new Date()) {
      throw new UnauthorizedException('OTP has expired');
    }

    otp.usedAt = new Date();
    await this.otpRepository.save(otp);

    return true;
  }

  async enable2fa(dto: Enable2faDto): Promise<{ secret: string; qrCodeUrl: string; backupCodes: string[] }> {
    throw new Error('2FA not yet implemented');
  }

  async disable2fa(dto: Disable2faDto): Promise<void> {
    throw new Error('2FA disable not yet implemented');
  }

  private async generateTokens(userId: string, isAdmin: boolean): Promise<TokenPair> {
    const payload: JwtPayload = { sub: userId, isAdmin };
    const secret = isAdmin ? this.adminJwtSecret : this.jwtSecret;
    const accessExpiry = isAdmin ? this.adminJwtAccessExpiry : this.jwtAccessExpiry;
    const refreshExpiry = isAdmin ? this.adminJwtRefreshExpiry : this.jwtRefreshExpiry;

    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: accessExpiry as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: refreshExpiry as any,
    });

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + this.parseExpiry(refreshExpiry));

    // Delete any existing sessions for this user to avoid duplicate key conflicts
    await this.sessionRepository.delete({ userId });

    await this.sessionRepository.save({
      userId: this.getUserIdFromPayload(payload),
      refreshTokenHash,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  private async handleFailedLogin(user: User): Promise<void> {
    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= 3) {
      user.lockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    await this.userRepository.save(user);
  }

  private async sendVerificationEmail(userId: string, email: string): Promise<void> {
    // TODO: Implement email verification
  }

  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([mhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }

  private getUserIdFromPayload(payload: JwtPayload): string {
    return payload.sub;
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile', 'consents'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
