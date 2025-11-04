import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FormSubmission, FormSubmissionStatus } from './page-form.entity';
import { Contact } from '../crm/contact.entity';
import { Page } from './page.entity';

@ApiTags('form-submissions')
@Controller('form-submissions')
export class FormSubmissionController {
  constructor(
    @InjectRepository(FormSubmission)
    private submissionRepository: Repository<FormSubmission>,
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(Page)
    private pageRepository: Repository<Page>,
  ) {}

  @Post('public/:pageId')
  @Public()
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Submit a form from a public page' })
  async submitPublicForm(
    @Param('pageId') pageId: string,
    @Body() body: {
      data: Record<string, any>;
      consent?: {
        marketing: boolean;
        timestamp: string;
        ip: string;
        userAgent: string;
      };
      metadata?: any
    },
  ) {
    // Get the page to verify it exists and get tenantId
    const page = await this.pageRepository.findOne({
      where: { id: pageId, isPublished: true },
    });

    if (!page) {
      return { success: false, message: 'Page not found or not published' };
    }

    // GDPR Compliance: Verify consent was provided
    if (!body.consent || !body.consent.marketing) {
      return {
        success: false,
        message: 'Consent is required to submit this form',
      };
    }

    // Create form submission with GDPR consent audit trail
    const submission = this.submissionRepository.create({
      formId: null, // We'll use pageId as form identifier for now
      data: body.data,
      status: FormSubmissionStatus.COMPLETED,
      ipAddress: body.consent?.ip || body.metadata?.ipAddress,
      userAgent: body.consent?.userAgent || body.metadata?.userAgent,
      referrer: body.metadata?.referrer,
      utmParams: body.metadata?.utmParams || {},
      tenantId: page.tenantId,
      metadata: {
        pageId: pageId,
        pageName: page.name,
        timestamp: new Date().toISOString(),
        // GDPR Consent Audit Trail
        consent: {
          marketing: body.consent.marketing,
          consentGivenAt: body.consent.timestamp,
          consentIp: body.consent.ip,
          consentUserAgent: body.consent.userAgent,
          consentVersion: '1.0', // Track policy version
          consentMethod: 'opt-in-form',
        },
      },
    });

    await this.submissionRepository.save(submission);

    // If there's an email field, try to create/update contact
    const email = body.data.email || body.data.Email || body.data.EMAIL;
    if (email) {
      try {
        // Check if contact exists
        let contact = await this.contactRepository.findOne({
          where: { email, tenantId: page.tenantId },
        });

        if (contact) {
          // Update existing contact - preserve consent history
          contact.firstName = body.data.firstName || body.data.name || contact.firstName;
          contact.lastName = body.data.lastName || contact.lastName;
          contact.phone = body.data.phone || contact.phone;

          // Add new consent to history
          if (!contact.metadata) contact.metadata = {};
          if (!contact.metadata.consentHistory) contact.metadata.consentHistory = [];
          contact.metadata.consentHistory.push({
            timestamp: body.consent.timestamp,
            ip: body.consent.ip,
            userAgent: body.consent.userAgent,
            marketing: body.consent.marketing,
            version: '1.0',
            source: 'opt-in-form',
            submissionId: submission.id,
          });

          await this.contactRepository.save(contact);
        } else {
          // Create new contact with GDPR consent
          contact = this.contactRepository.create({
            email,
            firstName: body.data.firstName || body.data.name || 'Unknown',
            lastName: body.data.lastName,
            phone: body.data.phone,
            status: 'lead' as any,
            source: 'funnel',
            tenantId: page.tenantId,
            metadata: {
              formSubmissionId: submission.id,
              pageId: pageId,
              // GDPR Consent Records
              marketingConsent: true,
              marketingConsentGivenAt: body.consent.timestamp,
              marketingConsentIp: body.consent.ip,
              consentVersion: '1.0',
              consentHistory: [
                {
                  timestamp: body.consent.timestamp,
                  ip: body.consent.ip,
                  userAgent: body.consent.userAgent,
                  marketing: body.consent.marketing,
                  version: '1.0',
                  source: 'opt-in-form',
                  submissionId: submission.id,
                },
              ],
            },
          });
          await this.contactRepository.save(contact);
        }

        // Link contact to submission
        submission.contactId = contact.id;
        await this.submissionRepository.save(submission);
      } catch (error) {
        console.error('Error creating/updating contact:', error);
        // Continue anyway - submission is saved
      }
    }

    // Increment page submissions count
    await this.pageRepository.increment({ id: pageId }, 'submissions', 1);

    return {
      success: true,
      message: 'Form submitted successfully',
      submissionId: submission.id,
    };
  }

  @Get('page/:pageId')
  @ApiOperation({ summary: 'Get form submissions for a page' })
  async getPageSubmissions(
    @Param('pageId') pageId: string,
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    const skip = (page - 1) * limit;

    const [submissions, total] = await this.submissionRepository.findAndCount({
      where: {
        metadata: { pageId } as any,
        tenantId: user.tenantId,
      },
      relations: ['contact'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });

    return {
      data: submissions,
      total,
      page,
      limit,
    };
  }

  @Get('funnel/:funnelId')
  @ApiOperation({ summary: 'Get all form submissions for a funnel' })
  async getFunnelSubmissions(
    @Param('funnelId') funnelId: string,
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    // Get all pages in the funnel
    const pages = await this.pageRepository.find({
      where: { funnelId, tenantId: user.tenantId },
      select: ['id'],
    });

    const pageIds = pages.map((p) => p.id);

    const skip = (page - 1) * limit;

    const [submissions, total] = await this.submissionRepository.findAndCount({
      where: {
        tenantId: user.tenantId,
      },
      relations: ['contact'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });

    // Filter by pageIds in metadata
    const filtered = submissions.filter((s) => pageIds.includes(s.metadata?.pageId));

    return {
      data: filtered,
      total: filtered.length,
      page,
      limit,
    };
  }
}
