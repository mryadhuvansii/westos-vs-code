import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto, BulkAssignRolesDto } from './dto/rbac.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { Req } from '@nestjs/common';

@ApiTags('Admin RBAC')
@Controller('admin/rbac')
@UseGuards(/* JwtAuthGuard, PermissionsGuard */)
@ApiBearerAuth()
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Post('roles')
  // @Permissions('ROLE.CREATE.ALL')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 409, description: 'Role already exists' })
  async createRole(@Body() dto: CreateRoleDto) {
    return this.rbacService.createRole(dto);
  }

  @Get('roles')
  // @Permissions('ROLE.RED.ALL')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  async getRoles() {
    return this.rbacService.getRoles();
  }

  @Get('roles/:id')
  // @Permissions('ROLE.RED.ALL')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async getRole(@Param('id') id: string) {
    return this.rbacService.getRole(id);
  }

  @Patch('roles/:id')
  // @Permissions('ROLE.UPDATE.ALL')
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rbacService.updateRole(id, dto);
  }

  @Delete('roles/:id')
  // @Permissions('ROLE.DELETE.ALL')
  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async deleteRole(@Param('id') id: string) {
    await this.rbacService.deleteRole(id);
    return { message: 'Role deleted successfully' };
  }

  @Post('assign')
  // @Permissions('ROLE.ASSIGN.ALL')
  @ApiOperation({ summary: 'Assign role to admin user' })
  @ApiResponse({ status: 201, description: 'Role assigned successfully' })
  @ApiResponse({ status: 404, description: 'Admin user or role not found' })
  async assignRole(@Body() dto: AssignRoleDto) {
    return this.rbacService.assignRole(dto);
  }

  @Post('bulk-assign')
  // @Permissions('ROLE.ASSIGN.ALL')
  @ApiOperation({ summary: 'Bulk assign roles' })
  @ApiResponse({ status: 201, description: 'Roles assigned successfully' })
  async bulkAssignRoles(@Body() dto: BulkAssignRolesDto) {
    return this.rbacService.bulkAssignRoles(dto);
  }

  @Delete('users/:userId/roles/:roleId')
  // @Permissions('ROLE.ASSIGN.ALL')
  @ApiOperation({ summary: 'Remove role from admin user' })
  @ApiResponse({ status: 200, description: 'Role removed successfully' })
  async removeRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    await this.rbacService.removeRole(userId, roleId);
    return { message: 'Role removed successfully' };
  }

  @Get('users/:userId/roles')
  // @Permissions('ROLE.RED.ALL')
  @ApiOperation({ summary: 'Get user roles' })
  @ApiResponse({ status: 200, description: 'User roles retrieved successfully' })
  async getUserRoles(@Param('userId') userId: string) {
    return this.rbacService.getUserRoles(userId);
  }

  @Get('users/:userId/permissions')
  // @Permissions('ROLE.RED.ALL')
  @ApiOperation({ summary: 'Get user permissions' })
  @ApiResponse({ status: 200, description: 'User permissions retrieved successfully' })
  async getUserPermissions(@Param('userId') userId: string) {
    return this.rbacService.getUserPermissions(userId);
  }

  @Get('me/permissions')
  @ApiOperation({ summary: 'Get current user permissions' })
  @ApiResponse({ status: 200, description: 'Current user permissions retrieved successfully' })
  async getMyPermissions(@Req() req: any) {
    return this.rbacService.getUserPermissions(req.user.id);
  }
}
