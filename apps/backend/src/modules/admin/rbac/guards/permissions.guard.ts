import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../../auth/decorators/permissions.decorator';
import { AdminAuthService } from '../auth/admin-auth.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('AdminAuthService') private adminAuthService: AdminAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Check if user has all required permissions
    const userPermissions = user.permissions || [];
    
    const hasPermission = requiredPermissions.every((permission) => {
      return userPermissions.some((userPerm: string) => {
        if (userPerm === permission) return true;
        
        const [resource, action, scope] = permission.split('.');
        const [userResource, userAction, userScope] = userPerm.split('.');
        
        return (
          (resource === userResource || resource === '*') &&
          (action === userAction || action === '*') &&
          (scope === userScope || scope === '*')
        );
      });
    });

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}