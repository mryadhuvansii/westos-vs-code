import { IsString, IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateRoleDto {
  @ApiProperty({ example: 'content_manager' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Manages content and products', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [String], example: ['PRODUCT.READ.ALL', 'PRODUCT.UPDATE.ALL'] })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}

export class UpdateRoleDto {
  @ApiProperty({ example: 'Updated content manager', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [String], example: ['PRODUCT.READ.ALL', 'PRODUCT.UPDATE.ALL', 'PRODUCT.CREATE.ALL'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export class AssignRoleDto {
  @ApiProperty({ example: 'admin-user-uuid' })
  @IsUUID()
  adminUserId: string;

  @ApiProperty({ example: 'role-uuid' })
  @IsUUID()
  roleId: string;

  @ApiProperty({ type: [String], example: ['warehouse-uuid-1', 'warehouse-uuid-2'], required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  warehouseScope?: string[];
}

export class BulkAssignRolesDto {
  @ApiProperty({ type: [AssignRoleDto] })
  @ValidateNested({ each: true })
  @Type(() => AssignRoleDto)
  assignments: AssignRoleDto[];
}