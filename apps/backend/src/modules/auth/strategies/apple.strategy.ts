import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-apple';
import { ConfigService } from '@nestjs/config';
import { SocialAuthService } from '../services/social-auth.service';
import { SocialProvider } from '../dto/social-login.dto';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(
    private configService: ConfigService,
    private socialAuthService: SocialAuthService,
  ) {
    super({
      clientID: configService.get<string>('APPLE_CLIENT_ID') || '',
      teamID: configService.get<string>('APPLE_TEAM_ID') || '',
      keyID: configService.get<string>('APPLE_KEY_ID') || '',
      privateKeyString: configService.get<string>('APPLE_PRIVATE_KEY') || '',
      callbackURL: configService.get<string>('APPLE_CALLBACK_URL') || 'http://localhost:3001/api/v1/auth/apple/callback',
      scope: ['name', 'email'],
      passReqToCallback: true,
    });
  }

  async validate(req: any, accessToken: string, refreshToken: string, idToken: string, profile: any, done: VerifyCallback): Promise<void> {
    try {
      // Apple returns user info in the idToken (JWT) and profile
      const user = await this.socialAuthService.validateOrCreateUser({
        provider: SocialProvider.APPLE,
        providerId: profile.id || this.extractSubFromIdToken(idToken),
        email: profile.emails?.[0]?.value || this.extractEmailFromIdToken(idToken),
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        accessToken,
        idToken,
      });
      done(null, user);
    } catch (error) {
      done(error as Error, null);
    }
  }

  private extractSubFromIdToken(idToken: string): string {
    try {
      const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
      return payload.sub;
    } catch {
      return '';
    }
  }

  private extractEmailFromIdToken(idToken: string): string {
    try {
      const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
      return payload.email;
    } catch {
      return '';
    }
  }
}