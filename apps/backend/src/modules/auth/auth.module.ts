import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AppleStrategy } from './strategies/apple.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TwoFaController } from './controllers/2fa.controller';
import { SocialAuthController } from './controllers/social-auth.controller';
import { TwoFaService } from './services/2fa.service';
import { TotpService } from './services/totp.service';
import { SocialAuthService } from './services/social-auth.service';

import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserConsents } from './entities/user-consents.entity';
import { UserDevice } from './entities/user-device.entity';
import { OtpCode } from './entities/otp-code.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { UserSession } from './entities/user-session.entity';
import { User2fa } from './entities/user-2fa.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserProfile,
      UserConsents,
      UserDevice,
      OtpCode,
      PasswordResetToken,
      UserSession,
      User2fa,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret',
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') || '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, TwoFaController, SocialAuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, AppleStrategy, JwtAuthGuard, TwoFaService, TotpService, SocialAuthService],
  exports: [AuthService, JwtModule, JwtAuthGuard, JwtStrategy, TwoFaService, SocialAuthService],
})
export class AuthModule {}