import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

@Injectable()
export class TotpService {
  private readonly issuer: string;

  constructor(private configService: ConfigService) {
    this.issuer = this.configService.get<string>('APP_NAME') || 'Westos';
    authenticator.options = { step: 30, window: 1 };
  }

  generateSecret(): string {
    return authenticator.generateSecret();
  }

  async generateQrCodeUrl(email: string, secret: string): Promise<string> {
    const otpauth = authenticator.keyuri(email, this.issuer, secret);
    return QRCode.toDataURL(otpauth);
  }

  verifyToken(token: string, secret: string): boolean {
    return authenticator.check(token, secret);
  }

  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex'));
    }
    return codes;
  }

  hashBackupCodes(codes: string[]): string[] {
    return codes.map(code => crypto.createHash('sha256').update(code).digest('hex'));
  }

  verifyBackupCode(providedCode: string, hashedCodes: string[]): { valid: boolean; remainingCodes: string[] } {
    const hashedProvided = crypto.createHash('sha256').update(providedCode).digest('hex');
    const index = hashedCodes.indexOf(hashedProvided);
    
    if (index === -1) {
      return { valid: false, remainingCodes: hashedCodes };
    }

    const remaining = [...hashedCodes];
    remaining.splice(index, 1);
    return { valid: true, remainingCodes: remaining };
  }
}