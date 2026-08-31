import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'staging', 'production').default('development'),
  PORT: Joi.number().port().default(3001),
  API_PREFIX: Joi.string().default('api'),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),

  // Database
  DATABASE_HOST: Joi.string().hostname().default('localhost'),
  DATABASE_PORT: Joi.number().port().default(5432),
  DATABASE_USERNAME: Joi.string().default('westos'),
  DATABASE_PASSWORD: Joi.string().default('westos_dev_password'),
  DATABASE_NAME: Joi.string().default('westos_dev'),
  DATABASE_SYNCHRONIZE: Joi.boolean().default(false),
  DATABASE_LOGGING: Joi.boolean().default(true),
  DATABASE_SSL: Joi.boolean().default(false),

  // Redis
  REDIS_HOST: Joi.string().hostname().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_DB: Joi.number().default(0),

  // JWT
  JWT_SECRET: Joi.string().min(20).default('your-jwt-secret-key-change-this'),
  JWT_ACCESS_TOKEN_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRES_IN: Joi.string().default('7d'),
  JWT_ISSUER: Joi.string().default('westos'),
  JWT_AUDIENCE: Joi.string().default('westos-api'),
  ADMIN_JWT_SECRET: Joi.string().min(20).default('your-admin-jwt-secret'),
  ADMIN_JWT_ACCESS_TOKEN_EXPIRES_IN: Joi.string().default('15m'),
  ADMIN_JWT_REFRESH_TOKEN_EXPIRES_IN: Joi.string().default('7d'),

  // Razorpay
  RAZORPAY_KEY: Joi.string().optional(),
  RAZORPAY_SECRET: Joi.string().optional(),

  // Email
  MAIL_FROM: Joi.string().email().default('noreply@westos.com'),
  MAIL_HOST: Joi.string().optional(),
  MAIL_PORT: Joi.number().optional(),
  MAIL_USER: Joi.string().optional(),
  MAIL_PASSWORD: Joi.string().optional(),

  // SMS/WhatsApp
  SMS_API_KEY: Joi.string().optional(),
  SMS_API_URL: Joi.string().optional(),

  // Security
  BCRYPT_ROUNDS: Joi.number().min(10).max(15).default(12),

  // Logging
  LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').default('debug'),
}).unknown(true);
