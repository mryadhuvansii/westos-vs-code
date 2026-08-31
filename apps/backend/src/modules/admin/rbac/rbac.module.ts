import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { AdminRoleAssignment } from './entities/admin-role-assignment.entity';
import { AdminUser } from '../auth/entities/admin-user.entity';
import { AdminAuthModule } from '../auth/admin-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      Permission,
      AdminRoleAssignment,
      AdminUser,
    ]),
    forwardRef(() => AdminAuthModule),
  ],
  controllers: [RbacController],
  providers: [RbacService],
  exports: [RbacService],
})
export class RbacModule {}