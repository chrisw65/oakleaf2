import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../crm/contact.entity';
import { FormSubmission } from './page-form.entity';

@ApiTags('gdpr')
@Controller('gdpr')
@Public()
export class GdprController {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(FormSubmission)
    private submissionRepository: Repository<FormSubmission>,
  ) {}

  @Get('export/:email')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'GDPR Data Export - Download all personal data' })
  async exportData(@Param('email') email: string) {
    // Find contact
    const contact = await this.contactRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!contact) {
      throw new NotFoundException('No data found for this email address');
    }

    // Find all submissions
    const submissions = await this.submissionRepository.find({
      where: { contactId: contact.id },
      order: { createdAt: 'DESC' },
    });

    // Return all personal data
    return {
      message: 'Your personal data export',
      exportDate: new Date().toISOString(),
      contact: {
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone,
        status: contact.status,
        source: contact.source,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
        metadata: contact.metadata,
      },
      submissions: submissions.map((s) => ({
        submittedAt: s.createdAt,
        data: s.data,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
        consent: s.metadata?.consent,
      })),
      rights: {
        rightToErasure: 'You can request deletion of your data at /gdpr/delete/' + email,
        rightToObject: 'You can unsubscribe at /gdpr/unsubscribe/' + email,
        rightToRectification: 'Contact support to update your information',
      },
    };
  }

  @Delete('delete/:email')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'GDPR Right to Erasure - Delete all personal data' })
  async deleteData(
    @Param('email') email: string,
    @Body() body: { confirm: boolean; reason?: string },
  ) {
    if (!body.confirm) {
      return {
        success: false,
        message: 'Please confirm deletion by setting confirm: true',
      };
    }

    // Find contact
    const contact = await this.contactRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!contact) {
      return {
        success: true,
        message: 'No data found for this email address (already deleted or never existed)',
      };
    }

    // Anonymize submissions (GDPR requires keeping some data for legal/audit purposes)
    await this.submissionRepository.update(
      { contactId: contact.id },
      {
        data: { anonymized: true },
        ipAddress: 'REDACTED',
        userAgent: 'REDACTED',
        contactId: null,
        metadata: {
          anonymized: true,
          anonymizedAt: new Date().toISOString(),
          reason: body.reason || 'User requested deletion',
        } as any,
      },
    );

    // Delete contact
    await this.contactRepository.remove(contact);

    return {
      success: true,
      message: 'Your personal data has been deleted from our systems',
      deletedAt: new Date().toISOString(),
      note: 'Some anonymized data may be retained for legal compliance purposes',
    };
  }

  @Post('unsubscribe')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'GDPR Right to Object - Unsubscribe from marketing' })
  async unsubscribe(@Body() body: { email: string }) {
    const contact = await this.contactRepository.findOne({
      where: { email: body.email.toLowerCase() },
    });

    if (!contact) {
      return {
        success: true,
        message: 'Email not found in our system (already unsubscribed or never subscribed)',
      };
    }

    // Update marketing consent
    if (!contact.metadata) contact.metadata = {};
    contact.metadata.marketingConsent = false;
    contact.metadata.unsubscribedAt = new Date().toISOString();

    // Add to consent history
    if (!contact.metadata.consentHistory) contact.metadata.consentHistory = [];
    contact.metadata.consentHistory.push({
      timestamp: new Date().toISOString(),
      marketing: false,
      action: 'unsubscribe',
      method: 'manual-request',
    });

    await this.contactRepository.save(contact);

    return {
      success: true,
      message: 'You have been unsubscribed from marketing communications',
      email: contact.email,
      unsubscribedAt: new Date().toISOString(),
    };
  }

  @Get('unsubscribe/:email')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Unsubscribe via link (e.g., from email)' })
  async unsubscribeViaLink(@Param('email') email: string) {
    const result = await this.unsubscribe({ email });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: #f5f5f5;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 500px;
            text-align: center;
          }
          h1 { color: #10b981; }
          p { color: #666; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✓ Unsubscribed</h1>
          <p>${result.message}</p>
          <p><small>Email: ${email}</small></p>
          <p><small>You will no longer receive marketing emails from us.</small></p>
        </div>
      </body>
      </html>
    `;
  }
}
