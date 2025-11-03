import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  GenerateSubjectLinesDto,
  GenerateEmailBodyDto,
  GenerateSocialPostDto,
  ChatMessageDto,
  GeneratePageCopyDto,
  AnalyzeEmailDto,
  SubjectLinesResponseDto,
  EmailBodyResponseDto,
  SocialPostsResponseDto,
  ChatResponseDto,
  PageCopyResponseDto,
  EmailAnalysisResponseDto,
} from './dto/ai.dto';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('email/subject-lines')
  @ApiOperation({ summary: 'Generate email subject lines using AI' })
  @ApiResponse({ status: 200, description: 'Subject lines generated', type: SubjectLinesResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'OpenAI service not configured or error occurred' })
  async generateSubjectLines(@Body() dto: GenerateSubjectLinesDto): Promise<SubjectLinesResponseDto> {
    const subjectLines = await this.aiService.generateEmailSubjectLines(dto);
    return { subjectLines };
  }

  @Post('email/body')
  @ApiOperation({ summary: 'Generate email body copy using AI' })
  @ApiResponse({ status: 200, description: 'Email body generated', type: EmailBodyResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'OpenAI service not configured or error occurred' })
  async generateEmailBody(@Body() dto: GenerateEmailBodyDto): Promise<EmailBodyResponseDto> {
    const body = await this.aiService.generateEmailBody(dto);
    return { body };
  }

  @Post('social/generate')
  @ApiOperation({ summary: 'Generate social media posts using AI' })
  @ApiResponse({ status: 200, description: 'Social posts generated', type: SocialPostsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'OpenAI service not configured or error occurred' })
  async generateSocialPost(@Body() dto: GenerateSocialPostDto): Promise<SocialPostsResponseDto> {
    const posts = await this.aiService.generateSocialPost(dto);
    return { posts };
  }

  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI marketing assistant' })
  @ApiResponse({ status: 200, description: 'AI response generated', type: ChatResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'OpenAI service not configured or error occurred' })
  async chat(@Body() dto: ChatMessageDto): Promise<ChatResponseDto> {
    const response = await this.aiService.chat(dto);
    return { response };
  }

  @Post('page/generate-copy')
  @ApiOperation({ summary: 'Generate page copy for funnel builder' })
  @ApiResponse({ status: 200, description: 'Page copy generated', type: PageCopyResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'OpenAI service not configured or error occurred' })
  async generatePageCopy(@Body() dto: GeneratePageCopyDto): Promise<PageCopyResponseDto> {
    return await this.aiService.generatePageCopy(dto);
  }

  @Post('email/analyze')
  @ApiOperation({ summary: 'Analyze and score email content' })
  @ApiResponse({ status: 200, description: 'Email analyzed', type: EmailAnalysisResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'OpenAI service not configured or error occurred' })
  async analyzeEmail(@Body() dto: AnalyzeEmailDto): Promise<EmailAnalysisResponseDto> {
    return await this.aiService.analyzeEmail(dto);
  }
}
