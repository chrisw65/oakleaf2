import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import OpenAI from 'openai';
import { SettingsService } from '../settings/settings.service';
import { SettingKey } from '../settings/settings.entity';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    @Inject(forwardRef(() => SettingsService))
    private readonly settingsService: SettingsService,
  ) {
    this.logger.log('AI service initialized with OpenAI and Ollama support');
  }

  /**
   * Get AI provider type for a tenant
   */
  private async getAIProvider(tenantId: string): Promise<'openai' | 'ollama'> {
    const provider = await this.settingsService.get(tenantId, 'ai_provider' as SettingKey);
    return (provider as 'openai' | 'ollama') || 'openai';
  }

  /**
   * Get OpenAI client for a specific tenant using their API key from settings
   */
  private async getOpenAIClient(tenantId: string): Promise<OpenAI> {
    const apiKey = await this.settingsService.get(tenantId, SettingKey.OPENAI_API_KEY);
    const isEnabled = await this.settingsService.isEnabled(tenantId, SettingKey.OPENAI_ENABLED);

    if (!isEnabled) {
      throw new Error('OpenAI is disabled. Please enable it in Settings or switch to Ollama.');
    }

    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please configure it in Settings > AI Configuration.');
    }

    return new OpenAI({ apiKey });
  }

  /**
   * Get Ollama client (OpenAI-compatible)
   */
  private async getOllamaClient(tenantId: string): Promise<OpenAI> {
    const ollamaUrl = await this.settingsService.get(tenantId, 'ollama_url' as SettingKey);
    const isEnabled = await this.settingsService.isEnabled(tenantId, 'ollama_enabled' as SettingKey);

    if (!isEnabled) {
      throw new Error('Ollama is disabled. Please enable it in Settings or switch to OpenAI.');
    }

    if (!ollamaUrl) {
      throw new Error('Ollama URL not configured. Please configure it in Settings > AI Configuration.');
    }

    // Ollama is OpenAI-compatible, so we can use the same client
    return new OpenAI({
      baseURL: `${ollamaUrl}/v1`,
      apiKey: 'ollama', // Ollama doesn't require an API key, but OpenAI client expects one
    });
  }

  /**
   * Get AI client (OpenAI or Ollama) based on tenant settings
   */
  private async getAIClient(tenantId: string): Promise<{
    client: OpenAI;
    provider: 'openai' | 'ollama';
    model: string;
  }> {
    const provider = await this.getAIProvider(tenantId);

    if (provider === 'ollama') {
      const client = await this.getOllamaClient(tenantId);
      const model = await this.settingsService.get(tenantId, 'ollama_model' as SettingKey) || 'llama2';
      return { client, provider: 'ollama', model };
    } else {
      const client = await this.getOpenAIClient(tenantId);
      return { client, provider: 'openai', model: 'gpt-4o-mini' };
    }
  }

  /**
   * Generate email subject lines using AI
   */
  async generateEmailSubjectLines(
    tenantId: string,
    params: {
      product?: string;
      audience?: string;
      goal?: string;
      tone?: string;
      count?: number;
    },
  ): Promise<string[]> {
    const { client, model } = await this.getAIClient(tenantId);
    const { product, audience, goal, tone = 'professional', count = 3 } = params;

    const prompt = `Generate ${count} compelling email subject lines with the following criteria:
- Product/Service: ${product || 'General'}
- Target Audience: ${audience || 'General audience'}
- Goal: ${goal || 'Increase engagement'}
- Tone: ${tone}

Requirements:
- 40-50 characters optimal length
- Include personalization tokens where appropriate ([Name], [Company])
- Use power words and emotional triggers
- Avoid spam trigger words
- Each subject line should be unique and compelling

Return ONLY the subject lines, one per line, without numbering or extra formatting.`;

    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert email marketing copywriter with 15+ years of experience. You specialize in writing high-converting email subject lines that achieve 40%+ open rates.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 500,
      });

      const subjectLines = completion.choices[0].message.content
        ?.trim()
        .split('\n')
        .filter((line) => line.trim().length > 0);

      return subjectLines || [];
    } catch (error) {
      this.logger.error('Error generating subject lines:', error);
      throw error;
    }
  }

  /**
   * Generate email body copy using AI
   */
  async generateEmailBody(
    tenantId: string,
    params: {
      product?: string;
      audience?: string;
      goal?: string;
      tone?: string;
      benefit?: string;
    },
  ): Promise<string> {
    const { client, model } = await this.getAIClient(tenantId);
    const { product, audience, goal, tone = 'professional', benefit } = params;

    const prompt = `Write a compelling email body with the following criteria:
- Product/Service: ${product || 'General offering'}
- Target Audience: ${audience || 'General audience'}
- Goal: ${goal || 'Drive engagement'}
- Tone: ${tone}
- Key Benefit: ${benefit || 'Helps achieve goals faster'}

Requirements:
- Keep under 200 words
- Use short paragraphs (2-3 sentences max)
- Include personalization (use [Name], [Company] placeholders)
- Focus on benefits, not features
- Include exactly ONE clear call-to-action
- Use "you/your" language
- Mobile-friendly formatting
- No subject line (body only)

Return the email body ready to use.`;

    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert email marketing copywriter. Write conversational, benefit-focused email copy that drives action.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      return completion.choices[0].message.content?.trim() || '';
    } catch (error) {
      this.logger.error('Error generating email body:', error);
      throw error;
    }
  }

  /**
   * Generate social media post using AI
   */
  async generateSocialPost(
    tenantId: string,
    params: {
      platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram';
      topic: string;
      message?: string;
      tone?: string;
      hashtags?: string[];
      goal?: string;
    },
  ): Promise<string[]> {
    const { client, model } = await this.getAIClient(tenantId);
    const { platform, topic, message, tone = 'professional', hashtags = [], goal } = params;

    const platformGuidelines = {
      twitter: 'Max 280 characters. Concise and punchy. Use 2-3 hashtags max.',
      linkedin: 'Professional tone. 1300-2000 characters. Use 3-5 hashtags. Focus on insights and value.',
      facebook: 'Conversational and engaging. 40-80 words optimal. Use 1-2 hashtags. Include emojis.',
      instagram: 'Visual-first. 125-150 words. Use 8-15 hashtags. Include emojis and calls-to-action.',
    };

    const prompt = `Generate 3 engaging ${platform} posts about: ${topic}
${message ? `Key message: ${message}` : ''}
Tone: ${tone}
Goal: ${goal || 'Drive engagement'}
${hashtags.length > 0 ? `Include these hashtags: ${hashtags.map(h => '#' + h).join(' ')}` : ''}

Platform guidelines: ${platformGuidelines[platform]}

Return 3 different variations, each on a new line, separated by "---"`;

    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are a social media marketing expert specializing in ${platform}. You create engaging posts that drive high engagement rates.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      });

      const posts = completion.choices[0].message.content
        ?.trim()
        .split('---')
        .map((post) => post.trim())
        .filter((post) => post.length > 0);

      return posts || [];
    } catch (error) {
      this.logger.error('Error generating social post:', error);
      throw error;
    }
  }

  /**
   * AI Marketing Assistant Chatbot
   */
  async chat(
    tenantId: string,
    params: {
      message: string;
      conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
      context?: {
        userStats?: any;
        recentCampaigns?: any[];
      };
    },
  ): Promise<string> {
    const { client, model } = await this.getAIClient(tenantId);
    const { message, conversationHistory = [], context } = params;

    const systemPrompt = `You are an AI Marketing Assistant for a funnel builder and email marketing platform. You help users with:
- Email marketing strategies and optimization
- Funnel creation and conversion optimization
- Audience segmentation
- Campaign performance analysis
- Content creation and copywriting
- A/B testing recommendations

You have access to the user's platform data and should provide specific, actionable advice.

${context?.userStats ? `User Stats: ${JSON.stringify(context.userStats)}` : ''}
${context?.recentCampaigns ? `Recent Campaigns: ${JSON.stringify(context.recentCampaigns)}` : ''}

Be conversational, helpful, and specific. Provide actionable recommendations with examples.`;

    try {
      const messages: any[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content: message },
      ];

      const completion = await client.chat.completions.create({
        model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return completion.choices[0].message.content?.trim() || '';
    } catch (error) {
      this.logger.error('Error in chat:', error);
      throw error;
    }
  }

  /**
   * Generate page copy for funnel builder
   */
  async generatePageCopy(
    tenantId: string,
    params: {
      pageType: 'landing' | 'sales' | 'checkout' | 'thank-you' | 'webinar';
      product: string;
      targetAudience: string;
      valueProposition?: string;
      features?: string[];
      tone?: string;
    },
  ): Promise<{
    headline: string;
    subheadline: string;
    body: string;
    cta: string;
  }> {
    const { client, model } = await this.getAIClient(tenantId);
    const { pageType, product, targetAudience, valueProposition, features = [], tone = 'professional' } = params;

    const prompt = `Generate compelling copy for a ${pageType} page:

Product: ${product}
Target Audience: ${targetAudience}
Value Proposition: ${valueProposition || 'Not specified'}
Features: ${features.join(', ') || 'Not specified'}
Tone: ${tone}

Generate the following:
1. Headline (attention-grabbing, benefit-focused, 8-12 words)
2. Subheadline (elaborates on headline, 15-20 words)
3. Body (3-4 short paragraphs explaining benefits and building trust)
4. Call-to-Action (clear, action-oriented, 2-5 words)

Format your response as JSON:
{
  "headline": "...",
  "subheadline": "...",
  "body": "...",
  "cta": "..."
}`;

    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert conversion copywriter specializing in high-converting sales pages and landing pages.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
      });

      const response = JSON.parse(completion.choices[0].message.content || '{}');
      return response;
    } catch (error) {
      this.logger.error('Error generating page copy:', error);
      throw error;
    }
  }

  /**
   * Analyze and score email content
   */
  async analyzeEmail(
    tenantId: string,
    params: {
      subjectLine?: string;
      body?: string;
    },
  ): Promise<{
    subjectLineScore?: number;
    subjectLineFeedback?: string[];
    bodyScore?: number;
    bodyFeedback?: string[];
    overallScore?: number;
    recommendations?: string[];
  }> {
    const { client, model } = await this.getAIClient(tenantId);
    const { subjectLine, body } = params;

    const prompt = `Analyze this email and provide detailed scoring and recommendations:

${subjectLine ? `Subject Line: ${subjectLine}` : ''}
${body ? `Body:\n${body}` : ''}

Analyze and score (0-100) based on:
- Length optimization
- Personalization
- Power words and emotional triggers
- Call-to-action clarity
- Mobile-friendliness
- Spam trigger avoidance
- Readability

Provide specific, actionable recommendations for improvement.

Format as JSON:
{
  "subjectLineScore": 85,
  "subjectLineFeedback": ["feedback1", "feedback2"],
  "bodyScore": 78,
  "bodyFeedback": ["feedback1", "feedback2"],
  "overallScore": 82,
  "recommendations": ["rec1", "rec2", "rec3"]
}`;

    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert email marketing analyst. Provide detailed, actionable feedback.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      });

      const analysis = JSON.parse(completion.choices[0].message.content || '{}');
      return analysis;
    } catch (error) {
      this.logger.error('Error analyzing email:', error);
      throw error;
    }
  }
}
