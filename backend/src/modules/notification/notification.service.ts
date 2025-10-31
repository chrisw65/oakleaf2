import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Notification, NotificationType, NotificationPriority } from './notification.entity';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
  color?: string;
  data?: Record<string, any>;
  groupKey?: string;
  expiresIn?: number; // Seconds until expiration
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  /**
   * Create notification
   */
  async create(tenantId: string, dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...dto,
      tenantId,
      priority: dto.priority || NotificationPriority.NORMAL,
      expiresAt: dto.expiresIn ? new Date(Date.now() + dto.expiresIn * 1000) : undefined,
    });

    return await this.notificationRepository.save(notification);
  }

  /**
   * Create and send notification (will be sent via WebSocket)
   */
  async createAndSend(
    tenantId: string,
    dto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = await this.create(tenantId, dto);

    // Mark as sent (WebSocket gateway will handle actual sending)
    notification.isSent = true;
    notification.sentAt = new Date();
    await this.notificationRepository.save(notification);

    return notification;
  }

  /**
   * Bulk create notifications
   */
  async bulkCreate(
    tenantId: string,
    notifications: CreateNotificationDto[],
  ): Promise<Notification[]> {
    const entities = notifications.map((dto) =>
      this.notificationRepository.create({
        ...dto,
        tenantId,
        priority: dto.priority || NotificationPriority.NORMAL,
      }),
    );

    return await this.notificationRepository.save(entities);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(tenantId: string, notificationId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { tenantId, id: notificationId },
    });

    if (notification) {
      notification.markAsRead();
      await this.notificationRepository.save(notification);
    }

    return notification!;
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(tenantId: string, userId: string): Promise<number> {
    const result = await this.notificationRepository.update(
      { tenantId, userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    return result.affected || 0;
  }

  /**
   * Get unread notifications for user
   */
  async getUnread(tenantId: string, userId: string, limit = 50): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { tenantId, userId, isRead: false },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get all notifications for user
   */
  async getAll(
    tenantId: string,
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { tenantId, userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(tenantId: string, userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { tenantId, userId, isRead: false },
    });
  }

  /**
   * Delete notification
   */
  async delete(tenantId: string, notificationId: string): Promise<void> {
    await this.notificationRepository.delete({ tenantId, id: notificationId });
  }

  /**
   * Delete all notifications for user
   */
  async deleteAll(tenantId: string, userId: string): Promise<number> {
    const result = await this.notificationRepository.delete({ tenantId, userId });
    return result.affected || 0;
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpired(): Promise<number> {
    const result = await this.notificationRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    return result.affected || 0;
  }

  /**
   * Clean up old read notifications (older than X days)
   */
  async cleanupOldRead(days = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.notificationRepository.delete({
      isRead: true,
      readAt: LessThan(cutoffDate),
    });

    return result.affected || 0;
  }

  /**
   * Get notification statistics for user
   */
  async getStats(
    tenantId: string,
    userId: string,
  ): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const notifications = await this.notificationRepository.find({
      where: { tenantId, userId },
    });

    const stats = {
      total: notifications.length,
      unread: notifications.filter((n) => !n.isRead).length,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
    };

    for (const notification of notifications) {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
      stats.byPriority[notification.priority] =
        (stats.byPriority[notification.priority] || 0) + 1;
    }

    return stats;
  }
}
