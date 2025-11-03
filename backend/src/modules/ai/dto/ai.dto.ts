import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsArray, IsNumber, IsObject, Min, Max } from 'class-validator';

export class GenerateSubjectLinesDto {
  @ApiPropertyOptional({ description: 'Product or service name' })
  @IsOptional()
  @IsString()
  product?: string;

  @ApiPropertyOptional({ description: 'Target audience' })
  @IsOptional()
  @IsString()
  audience?: string;

  @ApiPropertyOptional({ description: 'Email goal (open, click, sale, engage)' })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiPropertyOptional({ description: 'Tone (professional, friendly, casual, urgent, humorous)' })
  @IsOptional()
  @IsIn(['professional', 'friendly', 'casual', 'urgent', 'humorous'])
  tone?: string;

  @ApiPropertyOptional({ description: 'Number of subject lines to generate', default: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  count?: number;
}

export class GenerateEmailBodyDto {
  @ApiPropertyOptional({ description: 'Product or service name' })
  @IsOptional()
  @IsString()
  product?: string;

  @ApiPropertyOptional({ description: 'Target audience' })
  @IsOptional()
  @IsString()
  audience?: string;

  @ApiPropertyOptional({ description: 'Email goal' })
  @IsOptional()
  @IsString()
  goal?: string;

  @ApiPropertyOptional({ description: 'Tone of voice' })
  @IsOptional()
  @IsIn(['professional', 'friendly', 'casual', 'urgent', 'humorous'])
  tone?: string;

  @ApiPropertyOptional({ description: 'Key benefit to highlight' })
  @IsOptional()
  @IsString()
  benefit?: string;
}

export class GenerateSocialPostDto {
  @ApiProperty({ description: 'Social media platform' })
  @IsString()
  @IsIn(['twitter', 'linkedin', 'facebook', 'instagram'])
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram';

  @ApiProperty({ description: 'Topic or announcement' })
  @IsString()
  topic: string;

  @ApiPropertyOptional({ description: 'Key message (optional)' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Tone of voice' })
  @IsOptional()
  @IsIn(['professional', 'friendly', 'casual', 'urgent', 'humorous'])
  tone?: string;

  @ApiPropertyOptional({ description: 'Hashtags to include' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @ApiPropertyOptional({ description: 'Post goal' })
  @IsOptional()
  @IsString()
  goal?: string;
}

export class ChatMessageDto {
  @ApiProperty({ description: 'User message' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Conversation history' })
  @IsOptional()
  @IsArray()
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;

  @ApiPropertyOptional({ description: 'Additional context (user stats, recent campaigns, etc.)' })
  @IsOptional()
  @IsObject()
  context?: any;
}

export class GeneratePageCopyDto {
  @ApiProperty({ description: 'Type of page' })
  @IsString()
  @IsIn(['landing', 'sales', 'checkout', 'thank-you', 'webinar'])
  pageType: 'landing' | 'sales' | 'checkout' | 'thank-you' | 'webinar';

  @ApiProperty({ description: 'Product or service name' })
  @IsString()
  product: string;

  @ApiProperty({ description: 'Target audience' })
  @IsString()
  targetAudience: string;

  @ApiPropertyOptional({ description: 'Value proposition' })
  @IsOptional()
  @IsString()
  valueProposition?: string;

  @ApiPropertyOptional({ description: 'List of features' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ description: 'Tone of voice' })
  @IsOptional()
  @IsIn(['professional', 'friendly', 'casual', 'urgent', 'humorous'])
  tone?: string;
}

export class AnalyzeEmailDto {
  @ApiPropertyOptional({ description: 'Email subject line to analyze' })
  @IsOptional()
  @IsString()
  subjectLine?: string;

  @ApiPropertyOptional({ description: 'Email body to analyze' })
  @IsOptional()
  @IsString()
  body?: string;
}

// Response DTOs
export class SubjectLinesResponseDto {
  @ApiProperty({ description: 'Generated subject lines' })
  subjectLines: string[];
}

export class EmailBodyResponseDto {
  @ApiProperty({ description: 'Generated email body' })
  body: string;
}

export class SocialPostsResponseDto {
  @ApiProperty({ description: 'Generated social posts' })
  posts: string[];
}

export class ChatResponseDto {
  @ApiProperty({ description: 'AI assistant response' })
  response: string;
}

export class PageCopyResponseDto {
  @ApiProperty({ description: 'Headline' })
  headline: string;

  @ApiProperty({ description: 'Subheadline' })
  subheadline: string;

  @ApiProperty({ description: 'Body copy' })
  body: string;

  @ApiProperty({ description: 'Call-to-action text' })
  cta: string;
}

export class EmailAnalysisResponseDto {
  @ApiProperty({ description: 'Subject line score (0-100)', required: false })
  subjectLineScore?: number;

  @ApiProperty({ description: 'Subject line feedback', type: [String], required: false })
  subjectLineFeedback?: string[];

  @ApiProperty({ description: 'Body score (0-100)', required: false })
  bodyScore?: number;

  @ApiProperty({ description: 'Body feedback', type: [String], required: false })
  bodyFeedback?: string[];

  @ApiProperty({ description: 'Overall email score (0-100)', required: false })
  overallScore?: number;

  @ApiProperty({ description: 'Improvement recommendations', type: [String], required: false })
  recommendations?: string[];
}
