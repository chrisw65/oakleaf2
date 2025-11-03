import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '../../user/user.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { EmailTemplateService } from '../services/email-template.service';
import {
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  EmailTemplateQueryDto,
  TestEmailDto,
} from '../dto/email-template.dto';

@ApiTags('Email Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('email/templates')
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Create email template' })
  async create(@Body() createDto: CreateEmailTemplateDto, @Req() req: any) {
    return this.emailTemplateService.create(
      createDto,
      req.user.tenantId,
      req.user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all email templates' })
  async findAll(@Query() queryDto: EmailTemplateQueryDto, @Req() req: any) {
    return this.emailTemplateService.findAll(queryDto, req.user.tenantId);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get email template statistics' })
  async getStatistics(@Req() req: any) {
    return this.emailTemplateService.getStatistics(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get email template by ID' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.emailTemplateService.findOne(id, req.user.tenantId);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get email template by slug' })
  async findBySlug(@Param('slug') slug: string, @Req() req: any) {
    return this.emailTemplateService.findBySlug(slug, req.user.tenantId);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Update email template' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmailTemplateDto,
    @Req() req: any,
  ) {
    return this.emailTemplateService.update(id, updateDto, req.user.tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete email template' })
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.emailTemplateService.remove(id, req.user.tenantId);
    return { message: 'Template deleted successfully' };
  }
}
