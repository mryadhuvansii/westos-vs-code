import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAuthModule } from './auth/admin-auth.module';
import { RbacModule } from './rbac/rbac.module';

@Module({
  imports: [
    forwardRef(() => AdminAuthModule),
    forwardRef(() => RbacModule),
  ],
  exports: [AdminAuthModule, RbacModule],
})
export class AdminModule {}