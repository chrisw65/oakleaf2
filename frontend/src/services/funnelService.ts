import apiService from './api';

// Funnel Types
export enum FunnelStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

export enum PageType {
  LANDING = 'landing',
  SALES = 'sales',
  UPSELL = 'upsell',
  DOWNSELL = 'downsell',
  THANK_YOU = 'thank_you',
  OPTIN = 'optin',
  WEBINAR = 'webinar',
}

export interface FunnelPage {
  id: string;
  funnelId: string;
  name: string;
  slug: string;
  type: PageType;
  order: number;
  template?: string;
  content?: any; // JSON content for page builder
  customCss?: string;
  customJs?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  isPublished: boolean;
  publishedAt?: string;
  // Analytics
  views: number;
  uniqueVisitors: number;
  conversions: number;
  conversionRate: number;
  // A/B Testing
  abTestEnabled: boolean;
  abTestVariants?: FunnelPageVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface FunnelPageVariant {
  id: string;
  pageId: string;
  name: string;
  content: any;
  traffic: number; // Percentage of traffic
  views: number;
  conversions: number;
  conversionRate: number;
  isWinner?: boolean;
}

export interface Funnel {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  status: FunnelStatus;
  domain?: string;
  subdomain?: string;
  // Pages
  pages: FunnelPage[];
  // Analytics
  totalViews: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: number;
  averageOrderValue: number;
  // Settings
  trackingCode?: string;
  pixelCode?: string;
  gaCode?: string;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface FunnelStep {
  id: string;
  pageId: string;
  name: string;
  type: PageType;
  order: number;
  views: number;
  dropoffRate: number;
}

export interface FunnelAnalytics {
  funnelId: string;
  dateRange: {
    start: string;
    end: string;
  };
  overview: {
    totalViews: number;
    uniqueVisitors: number;
    totalConversions: number;
    conversionRate: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  steps: FunnelStep[];
  chartData: {
    date: string;
    views: number;
    conversions: number;
    revenue: number;
  }[];
  topPages: {
    pageId: string;
    pageName: string;
    views: number;
    conversions: number;
    conversionRate: number;
  }[];
  traffic: {
    source: string;
    visitors: number;
    conversions: number;
    conversionRate: number;
  }[];
}

export interface CreateFunnelDto {
  name: string;
  slug: string;
  description?: string;
  type?: string;
  customDomain?: string;
  settings?: Record<string, any>;
  theme?: Record<string, any>;
}

export interface UpdateFunnelDto {
  name?: string;
  slug?: string;
  description?: string;
  status?: FunnelStatus;
  type?: string;
  customDomain?: string;
  favicon?: string;
  settings?: Record<string, any>;
  theme?: Record<string, any>;
}

export interface CreatePageDto {
  name: string;
  slug: string;
  type: PageType;
  order: number;
  template?: string;
  content?: any;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdatePageDto {
  name?: string;
  slug?: string;
  type?: PageType;
  order?: number;
  content?: any;
  customCss?: string;
  customJs?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  isPublished?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

class FunnelService {
  // Funnels
  async getFunnels(page = 1, pageSize = 20): Promise<PaginatedResponse<Funnel>> {
    return apiService.get(`/funnels?page=${page}&pageSize=${pageSize}`);
  }

  async getFunnel(id: string): Promise<Funnel> {
    return apiService.get(`/funnels/${id}`);
  }

  async createFunnel(data: CreateFunnelDto): Promise<Funnel> {
    return apiService.post('/funnels', data);
  }

  async updateFunnel(id: string, data: UpdateFunnelDto): Promise<Funnel> {
    return apiService.put(`/funnels/${id}`, data);
  }

  async deleteFunnel(id: string): Promise<void> {
    return apiService.delete(`/funnels/${id}`);
  }

  async duplicateFunnel(id: string): Promise<Funnel> {
    return apiService.post(`/funnels/${id}/duplicate`);
  }

  async publishFunnel(id: string): Promise<Funnel> {
    return apiService.post(`/funnels/${id}/publish`);
  }

  async unpublishFunnel(id: string): Promise<Funnel> {
    return apiService.post(`/funnels/${id}/unpublish`);
  }

  // Funnel Pages
  async getPages(funnelId: string): Promise<FunnelPage[]> {
    return apiService.get(`/funnels/${funnelId}/pages`);
  }

  async getPage(funnelId: string, pageId: string): Promise<FunnelPage> {
    return apiService.get(`/funnels/${funnelId}/pages/${pageId}`);
  }

  async createPage(funnelId: string, data: CreatePageDto): Promise<FunnelPage> {
    return apiService.post(`/funnels/${funnelId}/pages`, data);
  }

  async updatePage(funnelId: string, pageId: string, data: UpdatePageDto): Promise<FunnelPage> {
    return apiService.put(`/funnels/${funnelId}/pages/${pageId}`, data);
  }

  async deletePage(funnelId: string, pageId: string): Promise<void> {
    return apiService.delete(`/funnels/${funnelId}/pages/${pageId}`);
  }

  async reorderPages(funnelId: string, pageOrders: { id: string; order: number }[]): Promise<void> {
    return apiService.post(`/funnels/${funnelId}/pages/reorder`, { pageOrders });
  }

  async publishPage(funnelId: string, pageId: string): Promise<FunnelPage> {
    return apiService.post(`/funnels/${funnelId}/pages/${pageId}/publish`);
  }

  async unpublishPage(funnelId: string, pageId: string): Promise<FunnelPage> {
    return apiService.post(`/funnels/${funnelId}/pages/${pageId}/unpublish`);
  }

  // A/B Testing
  async createVariant(funnelId: string, pageId: string, data: { name: string; content: any; traffic: number }): Promise<FunnelPageVariant> {
    return apiService.post(`/funnels/${funnelId}/pages/${pageId}/variants`, data);
  }

  async updateVariant(funnelId: string, pageId: string, variantId: string, data: any): Promise<FunnelPageVariant> {
    return apiService.put(`/funnels/${funnelId}/pages/${pageId}/variants/${variantId}`, data);
  }

  async deleteVariant(funnelId: string, pageId: string, variantId: string): Promise<void> {
    return apiService.delete(`/funnels/${funnelId}/pages/${pageId}/variants/${variantId}`);
  }

  async setWinningVariant(funnelId: string, pageId: string, variantId: string): Promise<void> {
    return apiService.post(`/funnels/${funnelId}/pages/${pageId}/variants/${variantId}/set-winner`);
  }

  // Analytics
  async getAnalytics(funnelId: string, startDate?: string, endDate?: string): Promise<FunnelAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiService.get(`/funnels/${funnelId}/analytics?${params.toString()}`);
  }

  async getPageAnalytics(funnelId: string, pageId: string, startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return apiService.get(`/funnels/${funnelId}/pages/${pageId}/analytics?${params.toString()}`);
  }
}

export const funnelService = new FunnelService();
export default funnelService;
