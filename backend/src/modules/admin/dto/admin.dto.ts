import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsBoolean, IsEmail } from 'class-validator';
import { UserRole } from '../../user/user.entity';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: UserRole, description: 'New role for the user' })
  @IsEnum(UserRole)
  role: UserRole;
}

export class UpdateUserStatusDto {
  @ApiProperty({ description: 'Is user active' })
  @IsBoolean()
  isActive: boolean;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class DashboardStatsDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  activeUsers: number;

  @ApiProperty()
  totalTenants: number;

  @ApiProperty()
  totalFunnels: number;

  @ApiProperty()
  totalContacts: number;

  @ApiProperty()
  totalOrders: number;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  newUsersToday: number;

  @ApiProperty()
  newUsersThisWeek: number;

  @ApiProperty()
  newUsersThisMonth: number;
}

export class ActivityLogDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  action: string;

  @ApiProperty()
  entity: string;

  @ApiProperty()
  entityId: string;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  ipAddress?: string;
}

export class AnalyticsDataDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  users: number;

  @ApiProperty()
  revenue: number;

  @ApiProperty()
  orders: number;

  @ApiProperty()
  contacts: number;
}
