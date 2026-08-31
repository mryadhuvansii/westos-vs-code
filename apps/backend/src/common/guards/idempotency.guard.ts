import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ConflictException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class IdempotencyGuard implements CanActivate {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.headers['idempotency-key'] as string;

    if (!idempotencyKey) {
      return true; // Allow if no idempotency key provided
    }

    const cacheKey = `idempotency:${idempotencyKey}`;
    const existing = await this.cacheManager.get<string>(cacheKey);

    if (existing) {
      throw new ConflictException('Duplicate request with same idempotency key');
    }

    // Store the idempotency key with 24h TTL
    await this.cacheManager.set(cacheKey, 'processing', 86400);

    return true;
  }
}