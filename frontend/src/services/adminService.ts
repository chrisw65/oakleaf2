import apiService from './api';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTenants: number;
  totalFunnels: number;
  totalContacts: number;
  totalOrders: number;
  totalRevenue: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: Date;
  ipAddress?: string;
}

export interface AnalyticsData {
  date: string;
  users: number;
  revenue: number;
  orders: number;
  contacts: number;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  tenantId: string;
}

class AdminService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiService.get<{ success: boolean; data: DashboardStats }>('/admin/dashboard/enhanced-stats');
    return response.data;
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit = 20): Promise<ActivityLog[]> {
    const response = await apiService.get<{ success: boolean; data: ActivityLog[] }>(`/admin/dashboard/enhanced-activity?limit=${limit}`);
    return response.data;
  }

  /**
   * Get analytics data
   */
  async getAnalyticsData(days = 30): Promise<AnalyticsData[]> {
    const response = await apiService.get<{ success: boolean; data: AnalyticsData[] }>(`/admin/dashboard/enhanced-analytics?days=${days}`);
    return response.data;
  }

  /**
   * Get all users
   */
  async getAllUsers(tenantId?: string): Promise<User[]> {
    const url = tenantId ? `/admin/users?tenantId=${tenantId}` : '/admin/users';
    const response = await apiService.get<{ success: boolean; data: User[] }>(url);
    return response.data;
  }

  /**
   * Search users
   */
  async searchUsers(query: string): Promise<User[]> {
    const response = await apiService.get<{ success: boolean; data: User[] }>(`/admin/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User> {
    const response = await apiService.get<{ success: boolean; data: User }>(`/admin/users/${id}`);
    return response.data;
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await apiService.put<{ success: boolean; data: User }>(`/admin/users/${id}`, data);
    return response.data;
  }

  /**
   * Promote user to admin
   */
  async promoteToAdmin(id: string): Promise<User> {
    const response = await apiService.post<{ success: boolean; data: User; message: string }>(`/admin/users/${id}/promote`);
    return response.data;
  }

  /**
   * Demote admin to user
   */
  async demoteToUser(id: string): Promise<User> {
    const response = await apiService.post<{ success: boolean; data: User; message: string }>(`/admin/users/${id}/demote`);
    return response.data;
  }

  /**
   * Activate/deactivate user
   */
  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    const response = await apiService.put<{ success: boolean; data: User; message: string }>(`/admin/users/${id}/status`, { isActive });
    return response.data;
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    await apiService.delete(`/admin/users/${id}`);
  }
}

export const adminService = new AdminService();
export default adminService;
