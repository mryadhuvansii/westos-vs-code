import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';

import { AdminUser } from './entities/admin-user.entity';
import { Admin2fa } from './entities/admin-2fa.entity';
import { AdminSession } from './entities/admin-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminUser,
      Admin2fa,
      AdminSession,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('ADMIN_JWT_SECRET') || 'admin-secret',
        signOptions: {
          expiresIn: configService.get<string>('ADMIN_JWT_ACCESS_TOKEN_EXPIRES_IN') || '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminAuthController],
  providers: [AdminAuthService],
  exports: [AdminAuthService],
})
export class AdminAuthModule {}
