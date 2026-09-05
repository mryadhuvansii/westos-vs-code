import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, any>;
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = request.headers['x-request-id'] as string;

    // @ts-ignore - Workspace rxjs version mismatch between root and backend node_modules
    return next.handle().pipe(
      // @ts-ignore - Workspace rxjs version mismatch
      map((data: any): ApiResponse<any> => {
        // If data is already in the standard format, return as-is
        if (data && typeof data === 'object' && 'success' in data) {
          return data as ApiResponse<any>;
        }

        return {
          success: true,
          data,
          meta: {
            requestId,
            timestamp: new Date().toISOString(),
          },
        };
      }),
    );
  }
}