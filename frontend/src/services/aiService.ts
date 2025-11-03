import apiService from './api';

export interface GenerateSubjectLinesParams {
  product?: string;
  audience?: string;
  goal?: string;
  tone?: string;
  count?: number;
}

export interface GenerateEmailBodyParams {
  product?: string;
  audience?: string;
  goal?: string;
  tone?: string;
  benefit?: string;
}

export interface GenerateSocialPostParams {
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram';
  topic: string;
  message?: string;
  tone?: string;
  hashtags?: string[];
  goal?: string;
}

export interface ChatMessageParams {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: any;
}

export interface GeneratePageCopyParams {
  pageType: 'landing' | 'sales' | 'checkout' | 'thank-you' | 'webinar';
  product: string;
  targetAudience: string;
  valueProposition?: string;
  features?: string[];
  tone?: string;
}

export interface AnalyzeEmailParams {
  subjectLine?: string;
  body?: string;
}

export interface SubjectLinesResponse {
  subjectLines: string[];
}

export interface EmailBodyResponse {
  body: string;
}

export interface SocialPostsResponse {
  posts: string[];
}

export interface ChatResponse {
  response: string;
}

export interface PageCopyResponse {
  headline: string;
  subheadline: string;
  body: string;
  cta: string;
}

export interface EmailAnalysisResponse {
  subjectLineScore?: number;
  subjectLineFeedback?: string[];
  bodyScore?: number;
  bodyFeedback?: string[];
  overallScore?: number;
  recommendations?: string[];
}

class AIService {
  /**
   * Generate email subject lines using AI
   */
  async generateSubjectLines(params: GenerateSubjectLinesParams): Promise<SubjectLinesResponse> {
    return await apiService.post<SubjectLinesResponse>('/ai/email/subject-lines', params);
  }

  /**
   * Generate email body copy using AI
   */
  async generateEmailBody(params: GenerateEmailBodyParams): Promise<EmailBodyResponse> {
    return await apiService.post<EmailBodyResponse>('/ai/email/body', params);
  }

  /**
   * Generate social media posts using AI
   */
  async generateSocialPost(params: GenerateSocialPostParams): Promise<SocialPostsResponse> {
    return await apiService.post<SocialPostsResponse>('/ai/social/generate', params);
  }

  /**
   * Chat with AI marketing assistant
   */
  async chat(params: ChatMessageParams): Promise<ChatResponse> {
    return await apiService.post<ChatResponse>('/ai/chat', params);
  }

  /**
   * Generate page copy for funnel builder
   */
  async generatePageCopy(params: GeneratePageCopyParams): Promise<PageCopyResponse> {
    return await apiService.post<PageCopyResponse>('/ai/page/generate-copy', params);
  }

  /**
   * Analyze and score email content
   */
  async analyzeEmail(params: AnalyzeEmailParams): Promise<EmailAnalysisResponse> {
    return await apiService.post<EmailAnalysisResponse>('/ai/email/analyze', params);
  }
}

export const aiService = new AIService();
export default aiService;
