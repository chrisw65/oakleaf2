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
  ABANDONED = 'abandoned',
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

// ACTIVITIES
export interface ContactActivity {
  id: string;
  contactId: string;
  activityType: string;
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
  userId?: string;
  user?: { id: string; firstName: string; lastName: string; email: string };
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityDto {
  activityType: string;
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
  occurredAt?: string;
}

// NOTES
export interface Note {
  id: string;
  content: string;
  isPinned: boolean;
  noteType?: string;
  contactId?: string;
  opportunityId?: string;
  createdById: string;
  createdBy: { id: string; firstName: string; lastName: string; email: string };
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDto {
  content: string;
  noteType?: string;
  isPinned?: boolean;
}

export interface UpdateNoteDto {
  content?: string;
  noteType?: string;
  isPinned?: boolean;
}

// TASKS
export interface Task {
  id: string;
  title: string;
  description?: string;
  taskType: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  startDate?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  contactId?: string;
  contact?: Contact;
  opportunityId?: string;
  opportunity?: Opportunity;
  createdById: string;
  createdBy?: { id: string; firstName: string; lastName: string; email: string };
  assignedToId?: string;
  assignedTo?: { id: string; firstName: string; lastName: string; email: string };
  hasReminder: boolean;
  reminderDate?: string;
  reminderSent: boolean;
  outcome?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  FOLLOW_UP = 'follow_up',
  TODO = 'todo',
  DEMO = 'demo',
  PROPOSAL = 'proposal',
  OTHER = 'other',
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  taskType?: TaskType;
  priority?: TaskPriority;
  dueDate?: string;
  startDate?: string;
  estimatedDuration?: number;
  contactId?: string;
  opportunityId?: string;
  assignedToId?: string;
  hasReminder?: boolean;
  reminderDate?: string;
  metadata?: Record<string, any>;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  status?: TaskStatus;
  actualDuration?: number;
  outcome?: string;
}

// ANALYTICS
export interface DashboardMetrics {
  pipeline: {
    totalValue: number;
    totalCount: number;
    wonValue: number;
    wonCount: number;
    lostValue: number;
    lostCount: number;
    activeValue: number;
    activeCount: number;
    winRate: number;
    averageDealSize: number;
    byStage: Array<{
      stageName: string;
      count: number;
      value: number;
    }>;
  };
  tasks: {
    total: number;
    overdue: number;
    dueToday: number;
    completed: number;
    completionRate: number;
  };
  contacts: {
    total: number;
    newThisMonth: number;
    activeLeads: number;
    customers: number;
    averageScore: number;
  };
  forecast: {
    currentMonth: number;
    nextMonth: number;
    currentQuarter: number;
  };
}

export interface PipelineHealthReport {
  pipelineId: string;
  pipelineName: string;
  stages: Array<{
    stageId: string;
    stageName: string;
    order: number;
    opportunityCount: number;
    totalValue: number;
    averageValue: number;
    averageDaysInStage: number;
    stalledCount: number;
    conversionRate: number;
  }>;
  totalOpportunities: number;
  totalValue: number;
  averageDealSize: number;
  medianDealSize: number;
  velocity: number;
}

export interface RepPerformanceReport {
  userId: string;
  userName: string;
  metrics: {
    opportunitiesOwned: number;
    opportunitiesWon: number;
    opportunitiesLost: number;
    totalValue: number;
    wonValue: number;
    winRate: number;
    averageDealSize: number;
    tasksCompleted: number;
    tasksOverdue: number;
    activitiesLogged: number;
  };
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

  // ACTIVITIES
  async getContactActivities(
    contactId: string,
    params?: {
      activityType?: string;
      page?: number;
      limit?: number;
      fromDate?: string;
      toDate?: string;
    }
  ): Promise<PaginatedResponse<ContactActivity>> {
    const queryParams = new URLSearchParams();
    if (params?.activityType) queryParams.append('activityType', params.activityType);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params?.toDate) queryParams.append('toDate', params.toDate);

    return apiService.get(`/crm/contacts/${contactId}/activities?${queryParams.toString()}`);
  }

  async createActivity(contactId: string, data: CreateActivityDto): Promise<ContactActivity> {
    return apiService.post(`/crm/contacts/${contactId}/activities`, data);
  }

  async getActivityStats(contactId: string): Promise<any> {
    return apiService.get(`/crm/contacts/${contactId}/activities/stats`);
  }

  async deleteActivity(activityId: string): Promise<void> {
    return apiService.delete(`/crm/contacts/activities/${activityId}`);
  }

  // NOTES
  async getContactNotes(
    contactId: string,
    params?: {
      page?: number;
      limit?: number;
      noteType?: string;
      pinnedOnly?: boolean;
    }
  ): Promise<PaginatedResponse<Note>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.noteType) queryParams.append('noteType', params.noteType);
    if (params?.pinnedOnly) queryParams.append('pinnedOnly', 'true');

    return apiService.get(`/crm/contacts/${contactId}/notes?${queryParams.toString()}`);
  }

  async createNote(contactId: string, data: CreateNoteDto): Promise<Note> {
    return apiService.post(`/crm/contacts/${contactId}/notes`, data);
  }

  async updateNote(noteId: string, data: UpdateNoteDto): Promise<Note> {
    return apiService.put(`/crm/contacts/notes/${noteId}`, data);
  }

  async deleteNote(noteId: string): Promise<void> {
    return apiService.delete(`/crm/contacts/notes/${noteId}`);
  }

  async toggleNotePin(noteId: string): Promise<Note> {
    return apiService.post(`/crm/contacts/notes/${noteId}/toggle-pin`);
  }

  async getNoteStats(contactId: string): Promise<any> {
    return apiService.get(`/crm/contacts/${contactId}/notes/stats`);
  }

  // TASKS
  async getTasks(params?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    taskType?: TaskType;
    contactId?: string;
    opportunityId?: string;
    assignedToId?: string;
    overdue?: boolean;
    dueToday?: boolean;
    dueThisWeek?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Task>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.taskType) queryParams.append('taskType', params.taskType);
    if (params?.contactId) queryParams.append('contactId', params.contactId);
    if (params?.opportunityId) queryParams.append('opportunityId', params.opportunityId);
    if (params?.assignedToId) queryParams.append('assignedToId', params.assignedToId);
    if (params?.overdue) queryParams.append('overdue', 'true');
    if (params?.dueToday) queryParams.append('dueToday', 'true');
    if (params?.dueThisWeek) queryParams.append('dueThisWeek', 'true');
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return apiService.get(`/crm/tasks?${queryParams.toString()}`);
  }

  async getMyTasks(params?: {
    status?: TaskStatus;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Task>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return apiService.get(`/crm/tasks/my-tasks?${queryParams.toString()}`);
  }

  async getMyTaskStats(): Promise<any> {
    return apiService.get('/crm/tasks/my-stats');
  }

  async getUpcomingTasks(days?: number): Promise<Task[]> {
    const url = days ? `/crm/tasks/upcoming?days=${days}` : '/crm/tasks/upcoming';
    return apiService.get(url);
  }

  async getOverdueTasks(): Promise<Task[]> {
    return apiService.get('/crm/tasks/overdue');
  }

  async getDueTodayTasks(): Promise<Task[]> {
    return apiService.get('/crm/tasks/due-today');
  }

  async getTask(id: string): Promise<Task> {
    return apiService.get(`/crm/tasks/${id}`);
  }

  async createTask(data: CreateTaskDto): Promise<Task> {
    return apiService.post('/crm/tasks', data);
  }

  async updateTask(id: string, data: UpdateTaskDto): Promise<Task> {
    return apiService.put(`/crm/tasks/${id}`, data);
  }

  async deleteTask(id: string): Promise<void> {
    return apiService.delete(`/crm/tasks/${id}`);
  }

  async markTaskComplete(id: string, outcome?: string): Promise<Task> {
    return apiService.post(`/crm/tasks/${id}/complete`, { outcome });
  }

  async assignTask(id: string, assignedToId: string): Promise<Task> {
    return apiService.post(`/crm/tasks/${id}/assign`, { assignedToId });
  }

  async updateTaskPriority(id: string, priority: TaskPriority): Promise<Task> {
    return apiService.put(`/crm/tasks/${id}/priority`, { priority });
  }

  async updateTaskDueDate(id: string, dueDate: string): Promise<Task> {
    return apiService.put(`/crm/tasks/${id}/due-date`, { dueDate });
  }

  // ============================================================================
  // ANALYTICS METHODS
  // ============================================================================

  async getDashboardMetrics(userId?: string): Promise<DashboardMetrics> {
    const params = userId ? { userId } : {};
    return apiService.get('/crm/analytics/dashboard', { params });
  }

  async getPipelineHealthReport(pipelineId: string): Promise<PipelineHealthReport> {
    return apiService.get(`/crm/analytics/pipeline-health/${pipelineId}`);
  }

  async getRepPerformanceReport(): Promise<RepPerformanceReport[]> {
    return apiService.get('/crm/analytics/rep-performance');
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  async bulkUpdateContacts(contactIds: string[], updates: Partial<UpdateContactDto>): Promise<{ updated: number; contacts: Contact[] }> {
    return apiService.post('/crm/contacts/bulk/update', { contactIds, updates });
  }

  async bulkDeleteContacts(contactIds: string[]): Promise<{ deleted: number }> {
    return apiService.post('/crm/contacts/bulk/delete', { contactIds });
  }

  async bulkAddTags(contactIds: string[], tagIds: string[]): Promise<{ updated: number }> {
    return apiService.post('/crm/contacts/bulk/add-tags', { contactIds, tagIds });
  }

  async bulkRemoveTags(contactIds: string[], tagIds: string[]): Promise<{ updated: number }> {
    return apiService.post('/crm/contacts/bulk/remove-tags', { contactIds, tagIds });
  }
}

export const crmService = new CrmService();
export default crmService;
