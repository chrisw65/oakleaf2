import apiService from './api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Contact {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  source?: string;
  status: ContactStatus;
  score?: number;
  tags?: Tag[];
  customFields?: Record<string, any>;
  lastContactedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ContactStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNSUBSCRIBED = 'unsubscribed',
  BOUNCED = 'bounced',
  BLOCKED = 'blocked',
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface CreateContactDto {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  source?: string;
  status?: ContactStatus;
  customFields?: Record<string, any>;
  tagIds?: string[];
}

export interface UpdateContactDto extends Partial<CreateContactDto> {}

export interface ContactFilters {
  search?: string;
  status?: ContactStatus;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Opportunity {
  id: string;
  tenantId: string;
  title: string;
  contactId?: string;
  contact?: Contact;
  pipelineId: string;
  pipeline?: Pipeline;
  stageId: string;
  stage?: PipelineStage;
  value: number;
  currency: string;
  probability?: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  status: OpportunityStatus;
  description?: string;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export enum OpportunityStatus {
  OPEN = 'open',
  WON = 'won',
  LOST = 'lost',
}

export interface CreateOpportunityDto {
  title: string;
  contactId?: string;
  pipelineId: string;
  stageId: string;
  value: number;
  currency?: string;
  probability?: number;
  expectedCloseDate?: string;
  description?: string;
  customFields?: Record<string, any>;
}

export interface UpdateOpportunityDto extends Partial<CreateOpportunityDto> {
  status?: OpportunityStatus;
  actualCloseDate?: string;
}

export interface Pipeline {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  stages: PipelineStage[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  id: string;
  pipelineId: string;
  name: string;
  order: number;
  probability?: number;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePipelineDto {
  name: string;
  description?: string;
  stages: Array<{ name: string; probability?: number; color?: string }>;
}

export interface UpdatePipelineDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

// ============================================================================
// CRM SERVICE
// ============================================================================

class CrmService {
  // CONTACTS
  async getContacts(filters?: ContactFilters): Promise<PaginatedResponse<Contact>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.tags?.length) params.append('tagIds', filters.tags.join(','));
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    return apiService.get(`/crm/contacts?${params.toString()}`);
  }

  async getContact(id: string): Promise<Contact> {
    return apiService.get(`/crm/contacts/${id}`);
  }

  async createContact(data: CreateContactDto): Promise<Contact> {
    return apiService.post('/crm/contacts', data);
  }

  async updateContact(id: string, data: UpdateContactDto): Promise<Contact> {
    return apiService.put(`/crm/contacts/${id}`, data);
  }

  async deleteContact(id: string): Promise<void> {
    return apiService.delete(`/crm/contacts/${id}`);
  }

  async addTagsToContact(contactId: string, tagIds: string[]): Promise<Contact> {
    return apiService.post(`/crm/contacts/${contactId}/tags`, { tagIds });
  }

  async removeTagFromContact(contactId: string, tagId: string): Promise<Contact> {
    return apiService.delete(`/crm/contacts/${contactId}/tags/${tagId}`);
  }

  // TAGS
  async getTags(): Promise<Tag[]> {
    return apiService.get('/crm/tags');
  }

  async createTag(data: { name: string; color?: string }): Promise<Tag> {
    return apiService.post('/crm/tags', data);
  }

  async deleteTag(id: string): Promise<void> {
    return apiService.delete(`/crm/tags/${id}`);
  }

  // OPPORTUNITIES
  async getOpportunities(pipelineId?: string): Promise<Opportunity[]> {
    const url = pipelineId ? `/crm/opportunities?pipelineId=${pipelineId}` : '/crm/opportunities';
    return apiService.get(url);
  }

  async getOpportunity(id: string): Promise<Opportunity> {
    return apiService.get(`/crm/opportunities/${id}`);
  }

  async createOpportunity(data: CreateOpportunityDto): Promise<Opportunity> {
    return apiService.post('/crm/opportunities', data);
  }

  async updateOpportunity(id: string, data: UpdateOpportunityDto): Promise<Opportunity> {
    return apiService.put(`/crm/opportunities/${id}`, data);
  }

  async deleteOpportunity(id: string): Promise<void> {
    return apiService.delete(`/crm/opportunities/${id}`);
  }

  async moveOpportunity(id: string, stageId: string): Promise<Opportunity> {
    return apiService.put(`/crm/opportunities/${id}/move`, { stageId });
  }

  // PIPELINES
  async getPipelines(): Promise<Pipeline[]> {
    return apiService.get('/crm/pipelines');
  }

  async getPipeline(id: string): Promise<Pipeline> {
    return apiService.get(`/crm/pipelines/${id}`);
  }

  async createPipeline(data: CreatePipelineDto): Promise<Pipeline> {
    return apiService.post('/crm/pipelines', data);
  }

  async updatePipeline(id: string, data: UpdatePipelineDto): Promise<Pipeline> {
    return apiService.put(`/crm/pipelines/${id}`, data);
  }

  async deletePipeline(id: string): Promise<void> {
    return apiService.delete(`/crm/pipelines/${id}`);
  }

  async addStage(pipelineId: string, data: { name: string; probability?: number; color?: string }): Promise<Pipeline> {
    return apiService.post(`/crm/pipelines/${pipelineId}/stages`, data);
  }

  async updateStage(pipelineId: string, stageId: string, data: { name?: string; probability?: number; color?: string }): Promise<Pipeline> {
    return apiService.put(`/crm/pipelines/${pipelineId}/stages/${stageId}`, data);
  }

  async deleteStage(pipelineId: string, stageId: string): Promise<Pipeline> {
    return apiService.delete(`/crm/pipelines/${pipelineId}/stages/${stageId}`);
  }

  async reorderStages(pipelineId: string, stageIds: string[]): Promise<Pipeline> {
    return apiService.post(`/crm/pipelines/${pipelineId}/stages/reorder`, { stageIds });
  }
}

export const crmService = new CrmService();
export default crmService;
