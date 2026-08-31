import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { AdminRoleAssignment } from './entities/admin-role-assignment.entity';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto, BulkAssignRolesDto } from './dto/rbac.dto';
import { AdminUser } from '../auth/entities/admin-user.entity';
import { AdminAuthService } from '../auth/admin-auth.service';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(AdminRoleAssignment)
    private roleAssignmentRepository: Repository<AdminRoleAssignment>,
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    @Inject(forwardRef(() => AdminAuthService))
    private adminAuthService: any,
  ) {}

  async createRole(dto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findOne({ where: { name: dto.name } });
    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    const permissions = await this.permissionRepository.findByIds(dto.permissions);
    if (permissions.length !== dto.permissions.length) {
      throw new NotFoundException('One or more permissions not found');
    }

    const role = this.roleRepository.create({
      name: dto.name,
      description: dto.description,
      permissions,
    });

    return this.roleRepository.save(role);
  }

  async getRoles(): Promise<Role[]> {
    return this.roleRepository.find({ relations: ['permissions'] });
  }

  async getRole(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id }, relations: ['permissions'] });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.getRole(id);

    if (dto.permissions) {
      const permissions = await this.permissionRepository.findByIds(dto.permissions);
      if (permissions.length !== dto.permissions.length) {
        throw new NotFoundException('One or more permissions not found');
      }
      role.permissions = permissions;
    }

    if (dto.description !== undefined) {
      role.description = dto.description;
    }

    return this.roleRepository.save(role);
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.getRole(id);
    await this.roleRepository.remove(role);
  }

  async assignRole(dto: AssignRoleDto): Promise<AdminRoleAssignment> {
    const adminUser = await this.adminUserRepository.findOne({ where: { id: dto.adminUserId } });
    if (!adminUser) {
      throw new NotFoundException('Admin user not found');
    }

    const role = await this.getRole(dto.roleId);

    const existingAssignment = await this.roleAssignmentRepository.findOne({
      where: { adminUserId: dto.adminUserId, roleId: dto.roleId },
    });

    if (existingAssignment) {
      existingAssignment.warehouseScope = dto.warehouseScope;
      return this.roleAssignmentRepository.save(existingAssignment);
    }

    const assignment = this.roleAssignmentRepository.create({
      adminUserId: dto.adminUserId,
      roleId: dto.roleId,
      warehouseScope: dto.warehouseScope,
    });

    return this.roleAssignmentRepository.save(assignment);
  }

  async bulkAssignRoles(dto: BulkAssignRolesDto): Promise<AdminRoleAssignment[]> {
    const results: AdminRoleAssignment[] = [];
    for (const assignment of dto.assignments) {
      const result = await this.assignRole(assignment);
      results.push(result);
    }
    return results;
  }

  async removeRole(adminUserId: string, roleId: string): Promise<void> {
    await this.roleAssignmentRepository.delete({ adminUserId, roleId });
  }

  async getUserRoles(adminUserId: string): Promise<Role[]> {
    const assignments = await this.roleAssignmentRepository.find({
      where: { adminUserId },
      relations: ['role', 'role.permissions'],
    });
    return assignments.map(a => a.role);
  }

  async getUserPermissions(adminUserId: string): Promise<string[]> {
    const roles = await this.getUserRoles(adminUserId);
    const permissions = new Set<string>();
    
    for (const role of roles) {
      for (const permission of role.permissions) {
        permissions.add(`${permission.resource}.${permission.action}.${permission.scope}`);
      }
    }
    
    return Array.from(permissions);
  }

  async getAdminWithRoles(adminUserId: string) {
    const adminUser = await this.adminUserRepository.findOne({
      where: { id: adminUserId },
      relations: ['roleAssignments', 'roleAssignments.role', 'roleAssignments.role.permissions'],
    });

    if (!adminUser) {
      throw new NotFoundException('Admin user not found');
    }

    const roles = adminUser.roleAssignments.map(a => a.role);
    const permissions = new Set<string>();
    
    for (const role of roles) {
      for (const permission of role.permissions) {
        permissions.add(`${permission.resource}.${permission.action}.${permission.scope}`);
      }
    }

    return {
      ...adminUser,
      roles,
      permissions: Array.from(permissions),
    };
  }
}