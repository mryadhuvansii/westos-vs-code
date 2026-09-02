import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserConsents } from './entities/user-consents.entity';
import { UserDevice } from './entities/user-device.entity';
import { UserSession } from './entities/user-session.entity';
import { User2fa } from './entities/user-2fa.entity';
import { OtpCode } from './entities/otp-code.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { TokenPair } from './interfaces/token-pair.interface';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(UserProfile), useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() } },
        { provide: getRepositoryToken(UserConsents), useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() } },
        { provide: getRepositoryToken(UserDevice), useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() } },
        { provide: getRepositoryToken(UserSession), useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn(), update: jest.fn() } },
        { provide: getRepositoryToken(User2fa), useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() } },
        { provide: getRepositoryToken(OtpCode), useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn(), update: jest.fn() } },
        { provide: getRepositoryToken(PasswordResetToken), useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn(), update: jest.fn() } },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'New',
        lastName: 'User',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      mockUserRepository.create.mockReturnValue({ id: 'user-id', ...registerDto, passwordHash: 'hashed_password' });
      mockUserRepository.save.mockResolvedValue({ id: 'user-id', ...registerDto });
      mockJwtService.sign.mockReturnValue('access_token');
      jest.spyOn(service as any, 'generateTokens').mockResolvedValue({ accessToken: 'access_token', refreshToken: 'refresh_token' });

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 'existing-id', email: 'existing@example.com' });

      await expect(service.register({
        email: 'existing@example.com',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User',
      })).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const mockUser = {
        id: 'user-id',
        email: loginDto.email,
        passwordHash: 'hashed_password',
        status: 'active',
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: null,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockUserRepository.save.mockResolvedValue({ ...mockUser, lastLoginAt: new Date() });
      jest.spyOn(service as any, 'generateTokens').mockResolvedValue({ accessToken: 'access_token', refreshToken: 'refresh_token' });

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login({ email: 'invalid@example.com', password: 'password' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        status: 'active',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'test@example.com', password: 'wrong_password' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if account is blocked', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        status: 'blocked',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login({ email: 'test@example.com', password: 'password' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});
