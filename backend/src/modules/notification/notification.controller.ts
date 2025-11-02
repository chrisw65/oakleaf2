import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetTenant } from '../../common/decorators/get-tenant.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  /**
   * Get all notifications
   */
  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({ status: 200, description: 'List of notifications' })
  async getAll(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const notifications = await this.notificationService.getAll(
      tenantId,
      userId,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );

    return {
      success: true,
      data: notifications,
      total: notifications.length,
    };
  }

  /**
   * Get unread notifications
   */
  @Get('unread')
  @ApiOperation({ summary: 'Get unread notifications' })
  @ApiResponse({ status: 200, description: 'List of unread notifications' })
  async getUnread(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Query('limit') limit?: string,
  ) {
    const notifications = await this.notificationService.getUnread(
      tenantId,
      userId,
      limit ? parseInt(limit) : 50,
    );

    return {
      success: true,
      data: notifications,
      total: notifications.length,
    };
  }

  /**
   * Get unread count
   */
  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count' })
  async getUnreadCount(@GetTenant() tenantId: string, @GetUser() userId: string) {
    const count = await this.notificationService.getUnreadCount(tenantId, userId);

    return {
      success: true,
      data: { count },
    };
  }

  /**
   * Get notification statistics
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get notification statistics' })
  @ApiResponse({ status: 200, description: 'Notification statistics' })
  async getStats(@GetTenant() tenantId: string, @GetUser() userId: string) {
    const stats = await this.notificationService.getStats(tenantId, userId);

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Mark notification as read
   */
  @Post(':notificationId/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('notificationId') notificationId: string,
  ) {
    const notification = await this.notificationService.markAsRead(tenantId, notificationId);

    // Send updated count via WebSocket
    const count = await this.notificationService.getUnreadCount(tenantId, userId);
    if (this.notificationGateway.isUserConnected(userId)) {
      this.notificationGateway.server.to(`user:${userId}`).emit('unread_count', { count });
    }

    return {
      success: true,
      data: notification,
      message: 'Notification marked as read',
    };
  }

  /**
   * Mark all notifications as read
   */
  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@GetTenant() tenantId: string, @GetUser() userId: string) {
    const affected = await this.notificationService.markAllAsRead(tenantId, userId);

    // Send updated count via WebSocket
    if (this.notificationGateway.isUserConnected(userId)) {
      this.notificationGateway.server.to(`user:${userId}`).emit('unread_count', { count: 0 });
    }

    return {
      success: true,
      message: `Marked ${affected} notifications as read`,
      affected,
    };
  }

  /**
   * Delete notification
   */
  @Delete(':notificationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({ status: 204, description: 'Notification deleted' })
  async delete(@GetTenant() tenantId: string, @Param('notificationId') notificationId: string) {
    await this.notificationService.delete(tenantId, notificationId);
  }

  /**
   * Delete all notifications
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete all notifications' })
  @ApiResponse({ status: 200, description: 'All notifications deleted' })
  async deleteAll(@GetTenant() tenantId: string, @GetUser() userId: string) {
    const affected = await this.notificationService.deleteAll(tenantId, userId);

    return {
      success: true,
      message: `Deleted ${affected} notifications`,
      affected,
    };
  }

  /**
   * Get WebSocket connection status
   */
  @Get('connection/status')
  @ApiOperation({ summary: 'Get WebSocket connection status' })
  @ApiResponse({ status: 200, description: 'Connection status' })
  async getConnectionStatus(@GetUser() userId: string) {
    const isConnected = this.notificationGateway.isUserConnected(userId);

    return {
      success: true,
      data: {
        isConnected,
        connectedUsers: this.notificationGateway.getConnectedUsersCount(),
      },
    };
  }
}
