import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
  issuer: process.env.JWT_ISSUER || 'westos',
  audience: process.env.JWT_AUDIENCE || 'westos-api',
  adminSecret: process.env.ADMIN_JWT_SECRET || 'your-admin-jwt-secret-change-in-production',
  adminAccessTokenExpiresIn: process.env.ADMIN_JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
  adminRefreshTokenExpiresIn: process.env.ADMIN_JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
}));