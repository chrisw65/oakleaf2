import apiService from './api';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface EmailCampaign {
  id: string;
  tenantId: string;
  name: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  templateId?: string;
  template?: EmailTemplate;
  segmentId?: string;
  segment?: Segment;
  status: CampaignStatus;
  scheduledAt?: string;
  sentAt?: string;
  stats: CampaignStats;
  createdAt: string;
  updatedAt: string;
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  SENT = 'sent',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived',
}

export interface CampaignStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
}

export interface CreateCampaignDto {
  name: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  templateId?: string;
  segmentId?: string;
  scheduledAt?: string;
}

export interface UpdateCampaignDto extends Partial<CreateCampaignDto> {
  status?: CampaignStatus;
}

export interface EmailTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  subject?: string;
  content: string;
  variables?: string[];
  thumbnail?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateDto {
  name: string;
  description?: string;
  subject?: string;
  content: string;
  isPublic?: boolean;
}

export interface UpdateTemplateDto extends Partial<CreateTemplateDto> {}

export interface EmailSequence {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  triggerType: SequenceTriggerType;
  triggerValue?: string;
  status: SequenceStatus;
  steps: SequenceStep[];
  stats: SequenceStats;
  createdAt: string;
  updatedAt: string;
}

export enum SequenceTriggerType {
  MANUAL = 'manual',
  TAG_ADDED = 'tag_added',
  SEGMENT_JOINED = 'segment_joined',
  FORM_SUBMITTED = 'form_submitted',
  WEBHOOK = 'webhook',
}

export enum SequenceStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  DRAFT = 'draft',
}

export interface SequenceStep {
  id: string;
  sequenceId: string;
  order: number;
  name: string;
  delayDays: number;
  delayHours: number;
  templateId?: string;
  template?: EmailTemplate;
  subject: string;
  fromName: string;
  fromEmail: string;
  stats: StepStats;
  createdAt: string;
  updatedAt: string;
}

export interface StepStats {
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

export interface SequenceStats {
  totalSubscribers: number;
  activeSubscribers: number;
  completedSubscribers: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
}

export interface CreateSequenceDto {
  name: string;
  description?: string;
  triggerType: SequenceTriggerType;
  triggerValue?: string;
}

export interface UpdateSequenceDto extends Partial<CreateSequenceDto> {
  status?: SequenceStatus;
}

export interface CreateSequenceStepDto {
  name: string;
  delayDays: number;
  delayHours: number;
  templateId?: string;
  subject: string;
  fromName: string;
  fromEmail: string;
}

export interface Segment {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: SegmentType;
  conditions?: SegmentCondition[];
  contactCount: number;
  createdAt: string;
  updatedAt: string;
}

export enum SegmentType {
  STATIC = 'static',
  DYNAMIC = 'dynamic',
}

export interface SegmentCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  IN = 'in',
  NOT_IN = 'not_in',
}

export interface CreateSegmentDto {
  name: string;
  description?: string;
  type: SegmentType;
  conditions?: SegmentCondition[];
}

export interface UpdateSegmentDto extends Partial<CreateSegmentDto> {}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// EMAIL SERVICE
// ============================================================================

class EmailService {
  // CAMPAIGNS
  async getCampaigns(page = 1, limit = 10): Promise<PaginatedResponse<EmailCampaign>> {
    return apiService.get(`/email/campaigns?page=${page}&limit=${limit}`);
  }

  async getCampaign(id: string): Promise<EmailCampaign> {
    return apiService.get(`/email/campaigns/${id}`);
  }

  async createCampaign(data: CreateCampaignDto): Promise<EmailCampaign> {
    return apiService.post('/email/campaigns', data);
  }

  async updateCampaign(id: string, data: UpdateCampaignDto): Promise<EmailCampaign> {
    return apiService.put(`/email/campaigns/${id}`, data);
  }

  async deleteCampaign(id: string): Promise<void> {
    return apiService.delete(`/email/campaigns/${id}`);
  }

  async sendCampaign(id: string): Promise<EmailCampaign> {
    return apiService.post(`/email/campaigns/${id}/send`);
  }

  async scheduleCampaign(id: string, scheduledAt: string): Promise<EmailCampaign> {
    return apiService.post(`/email/campaigns/${id}/schedule`, { scheduledAt });
  }

  async pauseCampaign(id: string): Promise<EmailCampaign> {
    return apiService.post(`/email/campaigns/${id}/pause`);
  }

  async getCampaignStats(id: string): Promise<CampaignStats> {
    return apiService.get(`/email/campaigns/${id}/stats`);
  }

  // TEMPLATES
  async getTemplates(page = 1, limit = 20): Promise<PaginatedResponse<EmailTemplate>> {
    return apiService.get(`/email/templates?page=${page}&limit=${limit}`);
  }

  async getTemplate(id: string): Promise<EmailTemplate> {
    return apiService.get(`/email/templates/${id}`);
  }

  async createTemplate(data: CreateTemplateDto): Promise<EmailTemplate> {
    return apiService.post('/email/templates', data);
  }

  async updateTemplate(id: string, data: UpdateTemplateDto): Promise<EmailTemplate> {
    return apiService.put(`/email/templates/${id}`, data);
  }

  async deleteTemplate(id: string): Promise<void> {
    return apiService.delete(`/email/templates/${id}`);
  }

  async duplicateTemplate(id: string): Promise<EmailTemplate> {
    return apiService.post(`/email/templates/${id}/duplicate`);
  }

  // SEQUENCES
  async getSequences(): Promise<EmailSequence[]> {
    return apiService.get('/email/sequences');
  }

  async getSequence(id: string): Promise<EmailSequence> {
    return apiService.get(`/email/sequences/${id}`);
  }

  async createSequence(data: CreateSequenceDto): Promise<EmailSequence> {
    return apiService.post('/email/sequences', data);
  }

  async updateSequence(id: string, data: UpdateSequenceDto): Promise<EmailSequence> {
    return apiService.put(`/email/sequences/${id}`, data);
  }

  async deleteSequence(id: string): Promise<void> {
    return apiService.delete(`/email/sequences/${id}`);
  }

  async addSequenceStep(sequenceId: string, data: CreateSequenceStepDto): Promise<EmailSequence> {
    return apiService.post(`/email/sequences/${sequenceId}/steps`, data);
  }

  async updateSequenceStep(sequenceId: string, stepId: string, data: Partial<CreateSequenceStepDto>): Promise<EmailSequence> {
    return apiService.put(`/email/sequences/${sequenceId}/steps/${stepId}`, data);
  }

  async deleteSequenceStep(sequenceId: string, stepId: string): Promise<EmailSequence> {
    return apiService.delete(`/email/sequences/${sequenceId}/steps/${stepId}`);
  }

  async reorderSequenceSteps(sequenceId: string, stepIds: string[]): Promise<EmailSequence> {
    return apiService.post(`/email/sequences/${sequenceId}/steps/reorder`, { stepIds });
  }

  // SEGMENTS
  async getSegments(): Promise<Segment[]> {
    return apiService.get('/email/segments');
  }

  async getSegment(id: string): Promise<Segment> {
    return apiService.get(`/email/segments/${id}`);
  }

  async createSegment(data: CreateSegmentDto): Promise<Segment> {
    return apiService.post('/email/segments', data);
  }

  async updateSegment(id: string, data: UpdateSegmentDto): Promise<Segment> {
    return apiService.put(`/email/segments/${id}`, data);
  }

  async deleteSegment(id: string): Promise<void> {
    return apiService.delete(`/email/segments/${id}`);
  }

  async refreshSegment(id: string): Promise<Segment> {
    return apiService.post(`/email/segments/${id}/refresh`);
  }
}

export const emailService = new EmailService();
export default emailService;
