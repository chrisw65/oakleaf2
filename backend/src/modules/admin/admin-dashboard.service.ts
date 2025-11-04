import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from '../user/user.entity';
import { Tenant } from '../tenant/tenant.entity';
import { Funnel } from '../funnel/funnel.entity';
import { Contact } from '../crm/contact.entity';
import { Order } from '../order/order.entity';
import { DashboardStatsDto, ActivityLogDto, AnalyticsDataDto } from './dto/admin.dto';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(Funnel)
    private readonly funnelRepository: Repository<Funnel>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStatsDto> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeUsers,
      totalTenants,
      totalFunnels,
      totalContacts,
      totalOrders,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
      this.tenantRepository.count(),
      this.funnelRepository.count(),
      this.contactRepository.count(),
      this.orderRepository.count(),
      this.userRepository.count({ where: { createdAt: MoreThan(todayStart) } }),
      this.userRepository.count({ where: { createdAt: MoreThan(weekStart) } }),
      this.userRepository.count({ where: { createdAt: MoreThan(monthStart) } }),
    ]);

    // Calculate total revenue
    const orders = await this.orderRepository.find();
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    return {
      totalUsers,
      activeUsers,
      totalTenants,
      totalFunnels,
      totalContacts,
      totalOrders,
      totalRevenue,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
    };
  }

  /**
   * Get recent activity logs
   */
  async getRecentActivity(limit: number = 20): Promise<ActivityLogDto[]> {
    // For now, we'll return user creation activity
    // In a real system, you'd have a dedicated activity log table
    const recentUsers = await this.userRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return recentUsers.map(user => ({
      id: user.id,
      userId: user.id,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      action: 'User Created',
      entity: 'User',
      entityId: user.id,
      timestamp: user.createdAt,
      ipAddress: undefined,
    }));
  }

  /**
   * Get analytics data for charts (last 30 days)
   */
  async getAnalyticsData(days: number = 30): Promise<AnalyticsDataDto[]> {
    const result: AnalyticsDataDto[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const [users, orders, contacts] = await Promise.all([
        this.userRepository.count({
          where: {
            createdAt: MoreThan(dayStart),
          },
        }),
        this.orderRepository.count({
          where: {
            createdAt: MoreThan(dayStart),
          },
        }),
        this.contactRepository.count({
          where: {
            createdAt: MoreThan(dayStart),
          },
        }),
      ]);

      const dayOrders = await this.orderRepository.find({
        where: {
          createdAt: MoreThan(dayStart),
        },
      });
      const revenue = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);

      result.push({
        date: dayStart.toISOString().split('T')[0],
        users,
        revenue,
        orders,
        contacts,
      });
    }

    return result;
  }
}
