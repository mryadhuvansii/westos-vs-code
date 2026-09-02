import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // CORS
  const frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:3000');
  const allowedOrigins = frontendUrl.split(',').map((url: string) => url.trim());
  
  app.enableCors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'Idempotency-Key'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validationError: { target: false },
    }),
  );

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Request ID middleware
  app.use(new RequestIdMiddleware().use.bind(new RequestIdMiddleware()));

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Westos API')
      .setDescription('Westos D2C E-Commerce Platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication')
      .addTag('customers', 'Customer Management')
      .addTag('catalogue', 'Product Catalogue')
      .addTag('cart', 'Shopping Cart')
      .addTag('checkout', 'Checkout')
      .addTag('orders', 'Order Management')
      .addTag('payments', 'Payments')
      .addTag('shipping', 'Shipping & Fulfillment')
      .addTag('returns', 'Returns & Refunds')
      .addTag('admin', 'Admin Operations')
      .build();

    const document = SwaggerModule.createDocument(app as any, config);
    SwaggerModule.setup('docs', app as any, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = configService.get('PORT', 3001);
  await app.listen(port);
  console.log(`🚀 Westos API running on http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/docs`);
}

bootstrap();