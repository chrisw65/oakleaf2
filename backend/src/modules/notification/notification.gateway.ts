import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationService } from './notification.service';
import { Notification } from './notification.entity';

/**
 * WebSocket gateway for real-time notifications
 * Supports authenticated connections and room-based broadcasting
 */
@WebSocketGateway({
  cors: {
    origin: '*', // Configure properly in production
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private readonly userConnections: Map<string, Set<string>> = new Map(); // userId -> socketIds

  constructor(
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Handle client connection
   */
  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub || payload.userId;
      const tenantId = payload.tenantId;

      if (!userId || !tenantId) {
        this.logger.warn(`Invalid token payload for client ${client.id}`);
        client.disconnect();
        return;
      }

      // Store user info in socket
      client.data.userId = userId;
      client.data.tenantId = tenantId;

      // Track connection
      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, new Set());
      }
      this.userConnections.get(userId)!.add(client.id);

      // Join user-specific room
      await client.join(`user:${userId}`);
      await client.join(`tenant:${tenantId}`);

      this.logger.log(`Client ${client.id} connected as user ${userId}`);

      // Send unread count
      const unreadCount = await this.notificationService.getUnreadCount(tenantId, userId);
      client.emit('unread_count', { count: unreadCount });

      // Send recent unread notifications
      const unread = await this.notificationService.getUnread(tenantId, userId, 10);
      if (unread.length > 0) {
        client.emit('initial_notifications', unread);
      }
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (userId) {
      const connections = this.userConnections.get(userId);
      if (connections) {
        connections.delete(client.id);
        if (connections.size === 0) {
          this.userConnections.delete(userId);
        }
      }
    }

    this.logger.log(`Client ${client.id} disconnected`);
  }

  /**
   * Mark notification as read
   */
  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @MessageBody() data: { notificationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { tenantId, userId } = client.data;

    try {
      await this.notificationService.markAsRead(tenantId, data.notificationId);

      // Send updated unread count
      const unreadCount = await this.notificationService.getUnreadCount(tenantId, userId);
      client.emit('unread_count', { count: unreadCount });

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to mark notification as read: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark all notifications as read
   */
  @SubscribeMessage('mark_all_read')
  async handleMarkAllRead(@ConnectedSocket() client: Socket) {
    const { tenantId, userId } = client.data;

    try {
      await this.notificationService.markAllAsRead(tenantId, userId);

      // Send updated unread count
      client.emit('unread_count', { count: 0 });

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to mark all notifications as read: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get unread notifications
   */
  @SubscribeMessage('get_unread')
  async handleGetUnread(@ConnectedSocket() client: Socket) {
    const { tenantId, userId } = client.data;

    try {
      const notifications = await this.notificationService.getUnread(tenantId, userId);
      return { success: true, data: notifications };
    } catch (error) {
      this.logger.error(`Failed to get unread notifications: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to specific user
   */
  async sendToUser(userId: string, notification: Notification) {
    this.server.to(`user:${userId}`).emit('notification', notification);
    this.logger.log(`Sent notification ${notification.id} to user ${userId}`);
  }

  /**
   * Send notification to all users in tenant
   */
  async sendToTenant(tenantId: string, notification: Notification) {
    this.server.to(`tenant:${tenantId}`).emit('notification', notification);
    this.logger.log(`Sent notification ${notification.id} to tenant ${tenantId}`);
  }

  /**
   * Broadcast to all connected clients
   */
  async broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    const connections = this.userConnections.get(userId);
    return !!connections && connections.size > 0;
  }

  /**
   * Get number of connected users
   */
  getConnectedUsersCount(): number {
    return this.userConnections.size;
  }

  /**
   * Get all connected user IDs
   */
  getConnectedUserIds(): string[] {
    return Array.from(this.userConnections.keys());
  }
}
