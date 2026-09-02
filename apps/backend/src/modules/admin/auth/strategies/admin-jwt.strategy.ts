import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AdminAuthService } from '../admin-auth.service';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    private configService: ConfigService,
    private adminAuthService: AdminAuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ADMIN_JWT_SECRET') || 'admin-secret',
    });
  }

  async validate(payload: { sub: string; isSuperAdmin: boolean }) {
    const admin = await this.adminAuthService.validateAdmin(payload.sub);
    if (!admin) {
      throw new UnauthorizedException();
    }
    return { id: payload.sub, isSuperAdmin: payload.isSuperAdmin };
  }
}