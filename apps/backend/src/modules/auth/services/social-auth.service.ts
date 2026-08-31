import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { UserProfile } from '../entities/user-profile.entity';
import { UserConsents } from '../entities/user-consents.entity';
import { UserSession } from '../entities/user-session.entity';
import { SocialLoginDto, SocialProvider, SocialLoginResponseDto } from '../dto/social-login.dto';
import { TokenPair } from '../interfaces/token-pair.interface';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import * as crypto from 'crypto';

export interface SocialUserData {
  provider: SocialProvider;
  providerId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
}

@Injectable()
export class SocialAuthService {
  private readonly logger = new Logger(SocialAuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
    @InjectRepository(UserConsents)
    private consentsRepository: Repository<UserConsents>,
    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateOrCreateUser(socialData: SocialUserData): Promise<User> {
    let user: User | null = null;

    if (socialData.email) {
      user = await this.userRepository.findOne({ where: { email: socialData.email } });
    }

    if (user) {
      this.logger.log('Existing user found for ' + socialData.provider + ': ' + user.email);
      return user;
    }

    if (!socialData.email) {
      throw new UnauthorizedException('Email is required from social provider');
    }

    const randomPassword = crypto.randomBytes(16).toString('hex');
    const passwordHash = await bcrypt.hash(randomPassword, 12);

    user = this.userRepository.create({
      email: socialData.email,
      passwordHash,
      emailVerified: true,
      phoneVerified: false,
      status: 'active',
    });

    await this.userRepository.save(user);

    const profile = this.profileRepository.create({
      userId: user.id,
      firstName: socialData.firstName || '',
      lastName: socialData.lastName || '',
      avatar: socialData.avatar,
    });
    await this.profileRepository.save(profile);

    const consents = this.consentsRepository.create({
      userId: user.id,
      marketingEmail: false,
      marketingSms: false,
      marketingPush: false,
      analytics: true,
      version: 1,
    });
    await this.consentsRepository.save(consents);

    this.logger.log('Created new user via ' + socialData.provider + ': ' + user.email);
    return user;
  }
async loginWithSocial(dto: SocialLoginDto): Promise<SocialLoginResponseDto> {
    const socialData: SocialUserData = {
      provider: dto.provider,
      providerId: '',
      email: dto.email,
      firstName: dto.fullName?.split(' ')[0],
      lastName: dto.fullName?.split(' ').slice(1).join(' '),
      accessToken: dto.accessToken,
      idToken: dto.idToken,
    };

    if (dto.provider === 'google') {
      const userInfo = await this.fetchGoogleUserInfo(dto.accessToken);
      socialData.providerId = userInfo.sub;
      socialData.email = userInfo.email;
      socialData.firstName = userInfo.given_name;
      socialData.lastName = userInfo.family_name;
      socialData.avatar = userInfo.picture;
    } else if (dto.provider === 'apple') {
      if (dto.idToken) {
        socialData.providerId = this.extractAppleSub(dto.idToken);
        socialData.email = this.extractAppleEmail(dto.idToken);
        socialData.firstName = dto.fullName?.split(' ')[0];
        socialData.lastName = dto.fullName?.split(' ').slice(1).join(' ');
      }
    }

    const user = await this.validateOrCreateUser(socialData);
    const tokens = await this.generateTokens(user.id, false);
    const profile = await this.profileRepository.findOne({ where: { userId: user.id } });

    return {
      isNewUser: false,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: profile?.firstName,
        lastName: profile?.lastName,
        avatar: profile?.avatar,
      },
    };
  }

  private async fetchGoogleUserInfo(accessToken: string): Promise<any> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: 'Bearer ' + accessToken },
    });
    
    if (!response.ok) {
      throw new UnauthorizedException('Failed to fetch Google user info');
    }
    
    return response.json();
  }

  private extractAppleSub(idToken: string): string {
    try {
      const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
      return payload.sub;
    } catch {
      return '';
    }
  }

  private extractAppleEmail(idToken: string): string {
    try {
      const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
      return payload.email;
    } catch {
      return '';
    }
  }

  private async generateTokens(userId: string, isAdmin: boolean): Promise<TokenPair> {
    const payload: JwtPayload = { sub: userId, isAdmin };
    const secret = isAdmin 
      ? this.configService.get<string>('ADMIN_JWT_SECRET') || 'admin-secret'
      : this.configService.get<string>('JWT_SECRET') || 'default-secret';
    const accessExpiry = isAdmin 
      ? this.configService.get<string>('ADMIN_JWT_ACCESS_TOKEN_EXPIRES_IN') || '15m'
      : this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') || '15m';
    const refreshExpiry = isAdmin 
      ? this.configService.get<string>('ADMIN_JWT_REFRESH_TOKEN_EXPIRES_IN') || '7d'
      : this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN') || '7d';

    const accessToken = this.jwtService.sign(payload, { secret, expiresIn: accessExpiry });
    const refreshToken = this.jwtService.sign(payload, { secret, expiresIn: refreshExpiry });

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + this.parseExpiry(refreshExpiry));

    await this.sessionRepository.save({
      userId,
      refreshTokenHash,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([mhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 7 * 24 * 60 * 60 * 1000;
    }
  }
}