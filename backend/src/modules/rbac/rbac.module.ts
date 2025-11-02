import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { RoleService } from './role.service';
import { PermissionService } from './permission.service';
import { RoleController } from './role.controller';
import { PermissionController } from './permission.controller';
import { PermissionsGuard } from './guards/permissions.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  controllers: [RoleController, PermissionController],
  providers: [RoleService, PermissionService, PermissionsGuard],
  exports: [RoleService, PermissionService, PermissionsGuard],
})
export class RbacModule {}
