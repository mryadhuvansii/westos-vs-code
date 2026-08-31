import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['profile', 'consents'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status === 'blocked' || user.status === 'suspended') {
      throw new UnauthorizedException('Account is blocked or suspended');
    }

    return {
      id: user.id,
      email: user.email,
      isAdmin: payload.isAdmin,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
    };
  }
}