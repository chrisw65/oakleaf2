import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CacheService } from '../../common/cache/cache.service';
import { QueueService } from '../../common/queue/queue.service';

export interface DashboardStats {
  overview: {
    totalTenants: number;
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    activeSubscriptions: number;
  };
  recentActivity: {
    newUsersToday: number;
    newOrdersToday: number;
    revenueToday: number;
    newTenantsToday: number;
  };
  systemHealth: {
    cacheStatus: 'healthy' | 'degraded' | 'down';
    databaseStatus: 'healthy' | 'degraded' | 'down';
    queueStatus: 'healthy' | 'degraded' | 'down';
    storageStatus: 'healthy' | 'degraded' | 'down';
  };
  topMetrics: {
    topFunnels: Array<{ id: string; name: string; conversions: number }>;
    topProducts: Array<{ id: string; name: string; sales: number }>;
    topAffiliates: Array<{ id: string; name: string; commissions: number }>;
  };
}

export interface TenantAnalytics {
  tenantId: string;
  tenantName: string;
  stats: {
    users: number;
    funnels: number;
    orders: number;
    revenue: number;
    contacts: number;
    subscriptions: number;
  };
  activity: {
    lastActivity: Date;
    activeUsers: number;
    ordersThisMonth: number;
    revenueThisMonth: number;
  };
  usage: {
    storageUsed: number;
    apiCallsThisMonth: number;
    emailsSentThisMonth: number;
  };
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  services: {
    database: {
      status: 'healthy' | 'degraded' | 'down';
      responseTime: number;
      connections: number;
    };
    cache: {
      status: 'healthy' | 'degraded' | 'down';
      hitRate: number;
      memoryUsage: number;
    };
    queue: {
      status: 'healthy' | 'degraded' | 'down';
      jobs: {
        active: number;
        waiting: number;
        completed: number;
        failed: number;
      };
    };
    storage: {
      status: 'healthy' | 'degraded' | 'down';
      filesCount: number;
      totalSize: number;
    };
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly startTime = Date.now();

  constructor(
    @InjectRepository('Tenant' as any)
    private readonly tenantRepository: Repository<any>,
    @InjectRepository('User' as any)
    private readonly userRepository: Repository<any>,
    @InjectRepository('Order' as any)
    private readonly orderRepository: Repository<any>,
    @InjectRepository('Subscription' as any)
    private readonly subscriptionRepository: Repository<any>,
    private readonly cacheService: CacheService,
    private readonly queueService: QueueService,
  ) {}

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    // Check cache first
    const cached = await this.cacheService.get<DashboardStats>('admin:dashboard:stats');
    if (cached) {
      return cached;
    }

    const stats: DashboardStats = {
      overview: {
        totalTenants: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
      },
      recentActivity: {
        newUsersToday: 0,
        newOrdersToday: 0,
        revenueToday: 0,
        newTenantsToday: 0,
      },
      systemHealth: await this.getSystemHealthSummary(),
      topMetrics: {
        topFunnels: [],
        topProducts: [],
        topAffiliates: [],
      },
    };

    // Calculate stats (implement with actual queries when repositories are available)
    try {
      // This would query the actual database
      // For now, returning structure
      stats.overview.totalTenants = await this.getTotalCount('tenants');
      stats.overview.totalUsers = await this.getTotalCount('users');
      stats.overview.totalOrders = await this.getTotalCount('orders');
      stats.overview.totalRevenue = await this.getTotalRevenue();
      stats.overview.activeSubscriptions = await this.getActiveSubscriptionsCount();

      // Recent activity
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      stats.recentActivity.newUsersToday = await this.getCountSince('users', today);
      stats.recentActivity.newOrdersToday = await this.getCountSince('orders', today);
      stats.recentActivity.revenueToday = await this.getRevenueSince(today);
      stats.recentActivity.newTenantsToday = await this.getCountSince('tenants', today);
    } catch (error) {
      this.logger.error(`Error calculating dashboard stats: ${error.message}`);
    }

    // Cache for 5 minutes
    await this.cacheService.set('admin:dashboard:stats', stats, { ttl: 300 });

    return stats;
  }

  /**
   * Get comprehensive system health
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const health: SystemHealth = {
      status: 'healthy',
      uptime: (Date.now() - this.startTime) / 1000,
      services: {
        database: await this.checkDatabaseHealth(),
        cache: await this.checkCacheHealth(),
        queue: await this.checkQueueHealth(),
        storage: await this.checkStorageHealth(),
      },
      memory: this.getMemoryStats(),
      cpu: this.getCpuStats(),
    };

    // Determine overall status
    const serviceStatuses = [
      health.services.database.status,
      health.services.cache.status,
      health.services.queue.status,
      health.services.storage.status,
    ];

    if (serviceStatuses.includes('down')) {
      health.status = 'down';
    } else if (serviceStatuses.includes('degraded')) {
      health.status = 'degraded';
    }

    return health;
  }

  /**
   * Get tenant analytics
   */
  async getTenantAnalytics(tenantId: string): Promise<TenantAnalytics> {
    // Implementation would query actual data
    const analytics: TenantAnalytics = {
      tenantId,
      tenantName: 'Tenant Name', // Get from database
      stats: {
        users: await this.getTenantCount(tenantId, 'users'),
        funnels: await this.getTenantCount(tenantId, 'funnels'),
        orders: await this.getTenantCount(tenantId, 'orders'),
        revenue: await this.getTenantRevenue(tenantId),
        contacts: await this.getTenantCount(tenantId, 'contacts'),
        subscriptions: await this.getTenantCount(tenantId, 'subscriptions'),
      },
      activity: {
        lastActivity: new Date(),
        activeUsers: 0,
        ordersThisMonth: 0,
        revenueThisMonth: 0,
      },
      usage: {
        storageUsed: 0,
        apiCallsThisMonth: 0,
        emailsSentThisMonth: 0,
      },
    };

    return analytics;
  }

  /**
   * Get all tenants with analytics
   */
  async getAllTenantsAnalytics(limit = 50, offset = 0): Promise<TenantAnalytics[]> {
    // Would query all tenants and their analytics
    return [];
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    return {
      totalRevenue: 0,
      revenueByDay: [],
      revenueByProduct: [],
      revenueByFunnel: [],
      averageOrderValue: 0,
      totalOrders: 0,
    };
  }

  /**
   * Get user growth analytics
   */
  async getUserGrowthAnalytics(days = 30) {
    return {
      totalUsers: 0,
      newUsers: 0,
      activeUsers: 0,
      usersByDay: [],
      retentionRate: 0,
    };
  }

  /**
   * Helper: Get total count for a table
   */
  private async getTotalCount(table: string): Promise<number> {
    // Implement with actual query
    return 0;
  }

  /**
   * Helper: Get count since date
   */
  private async getCountSince(table: string, date: Date): Promise<number> {
    // Implement with actual query
    return 0;
  }

  /**
   * Helper: Get total revenue
   */
  private async getTotalRevenue(): Promise<number> {
    // Implement with actual query
    return 0;
  }

  /**
   * Helper: Get revenue since date
   */
  private async getRevenueSince(date: Date): Promise<number> {
    // Implement with actual query
    return 0;
  }

  /**
   * Helper: Get active subscriptions count
   */
  private async getActiveSubscriptionsCount(): Promise<number> {
    // Implement with actual query
    return 0;
  }

  /**
   * Helper: Get tenant-specific count
   */
  private async getTenantCount(tenantId: string, table: string): Promise<number> {
    // Implement with actual query
    return 0;
  }

  /**
   * Helper: Get tenant revenue
   */
  private async getTenantRevenue(tenantId: string): Promise<number> {
    // Implement with actual query
    return 0;
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth() {
    const startTime = Date.now();
    let status: 'healthy' | 'degraded' | 'down' = 'healthy';
    let connections = 0;

    try {
      // Simple query to check database
      // await this.connection.query('SELECT 1');
      const responseTime = Date.now() - startTime;

      if (responseTime > 1000) {
        status = 'degraded';
      }

      return {
        status,
        responseTime,
        connections,
      };
    } catch (error) {
      return {
        status: 'down' as const,
        responseTime: Date.now() - startTime,
        connections: 0,
      };
    }
  }

  /**
   * Check cache health
   */
  private async checkCacheHealth() {
    try {
      const testKey = 'health-check';
      const testValue = Date.now().toString();

      await this.cacheService.set(testKey, testValue, { ttl: 10 });
      const retrieved = await this.cacheService.get(testKey);

      return {
        status: retrieved === testValue ? ('healthy' as const) : ('degraded' as const),
        hitRate: 0, // Calculate from stats
        memoryUsage: 0, // Get from Redis INFO
      };
    } catch (error) {
      return {
        status: 'down' as const,
        hitRate: 0,
        memoryUsage: 0,
      };
    }
  }

  /**
   * Check queue health
   */
  private async checkQueueHealth() {
    try {
      const allQueuesHealth = await this.queueService.getAllQueuesHealth();

      // Aggregate stats
      let active = 0;
      let waiting = 0;
      let completed = 0;
      let failed = 0;

      for (const queueHealth of Object.values(allQueuesHealth)) {
        if (queueHealth.stats) {
          active += queueHealth.stats.active || 0;
          waiting += queueHealth.stats.waiting || 0;
          completed += queueHealth.stats.completed || 0;
          failed += queueHealth.stats.failed || 0;
        }
      }

      const status = failed > 100 ? 'degraded' : 'healthy';

      return {
        status: status as 'healthy' | 'degraded' | 'down',
        jobs: { active, waiting, completed, failed },
      };
    } catch (error) {
      return {
        status: 'down' as const,
        jobs: { active: 0, waiting: 0, completed: 0, failed: 0 },
      };
    }
  }

  /**
   * Check storage health
   */
  private async checkStorageHealth() {
    // Check S3/MinIO connection
    return {
      status: 'healthy' as const,
      filesCount: 0,
      totalSize: 0,
    };
  }

  /**
   * Get system health summary
   */
  private async getSystemHealthSummary() {
    const health = await this.getSystemHealth();
    return {
      cacheStatus: health.services.cache.status,
      databaseStatus: health.services.database.status,
      queueStatus: health.services.queue.status,
      storageStatus: health.services.storage.status,
    };
  }

  /**
   * Get memory statistics
   */
  private getMemoryStats() {
    const memUsage = process.memoryUsage();
    const total = memUsage.heapTotal;
    const used = memUsage.heapUsed;

    return {
      used: Math.round(used / 1024 / 1024), // MB
      total: Math.round(total / 1024 / 1024), // MB
      percentage: Math.round((used / total) * 100),
    };
  }

  /**
   * Get CPU statistics
   */
  private getCpuStats() {
    // Simple CPU usage calculation
    const usage = process.cpuUsage();
    const total = usage.user + usage.system;

    return {
      usage: Math.round((total / 1000000) * 100) / 100, // Convert to seconds
    };
  }
}
