import { IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SocialProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
}

export class SocialLoginDto {
  @ApiProperty({ description: 'Social provider', enum: SocialProvider, example: SocialProvider.GOOGLE })
  @IsEnum(SocialProvider)
  provider: SocialProvider;

  @ApiProperty({ description: 'Access token from social provider', example: 'ya29.a0AfH6SMC...' })
  @IsString()
  accessToken: string;

  @ApiPropertyOptional({ description: 'ID token (for Apple)', example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsOptional()
  @IsString()
  idToken?: string;

  @ApiPropertyOptional({ description: 'Authorization code (for Apple)', example: 'c.xxx.xxx' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'User\'s full name (if available from provider)', example: 'John Doe' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'User\'s email (if available from provider)', example: 'john@gmail.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class SocialLoginResponseDto {
  @ApiProperty({ description: 'Whether user is new or existing', example: true })
  isNewUser: boolean;

  @ApiProperty({ description: 'Access token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;

  @ApiProperty({ description: 'User profile' })
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}