// @ts-nocheck
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageForm, FormSubmission, FormSubmissionStatus } from '../page-form.entity';
import { Page } from '../page.entity';
import { Contact } from '../../crm/contact.entity';
import {
  CreatePageFormDto,
  UpdatePageFormDto,
  SubmitFormDto,
} from '../dto/page-form.dto';

@Injectable()
export class FormBuilderService {
  constructor(
    @InjectRepository(PageForm)
    private readonly formRepository: Repository<PageForm>,
    @InjectRepository(FormSubmission)
    private readonly submissionRepository: Repository<FormSubmission>,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async createForm(
    tenantId: string,
    dto: CreatePageFormDto,
  ): Promise<PageForm> {
    // Validate page if provided
    if (dto.pageId) {
      const page = await this.pageRepository.findOne({
        where: { id: dto.pageId, tenantId },
      });

      if (!page) {
        throw new NotFoundException('Page not found');
      }
    }

    // @ts-ignore - TypeORM DeepPartial type issue
    const form = this.formRepository.create({
      ...dto,
      tenantId,
    });

    return await this.formRepository.save(form);
  }

  async updateForm(
    tenantId: string,
    formId: string,
    dto: UpdatePageFormDto,
  ): Promise<PageForm> {
    const form = await this.formRepository.findOne({
      where: { id: formId, tenantId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    Object.assign(form, dto);
    return await this.formRepository.save(form);
  }

  async deleteForm(tenantId: string, formId: string): Promise<void> {
    const form = await this.formRepository.findOne({
      where: { id: formId, tenantId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    await this.formRepository.remove(form);
  }

  async getForms(
    tenantId: string,
    pageId?: string,
  ): Promise<PageForm[]> {
    const where: any = { tenantId };

    if (pageId) {
      where.pageId = pageId;
    }

    return await this.formRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async getForm(tenantId: string, formId: string): Promise<PageForm> {
    const form = await this.formRepository.findOne({
      where: { id: formId, tenantId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    return form;
  }

  async submitForm(
    tenantId: string,
    dto: SubmitFormDto,
  ): Promise<FormSubmission> {
    const form = await this.formRepository.findOne({
      where: { id: dto.formId, tenantId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (!form.isActive) {
      throw new BadRequestException('Form is not active');
    }

    // Validate required fields
    const missingFields = form.fields
      .filter((field) => field.required && !dto.data[field.name])
      .map((field) => field.name);

    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Missing required fields: ${missingFields.join(', ')}`,
      );
    }

    // Create or update contact if configured
    let contactId: string | undefined;
    if (form.integrations?.crm?.createContact) {
      contactId = await this.handleContactCreation(tenantId, form, dto.data);
    }

    // Create submission
    const submission = this.submissionRepository.create({
      formId: dto.formId,
      contactId,
      data: dto.data,
      status: FormSubmissionStatus.PENDING,
      ipAddress: dto.sessionData?.ipAddress,
      userAgent: dto.sessionData?.userAgent,
      referrer: dto.sessionData?.referrer,
      utmParams: dto.sessionData?.utmParams || {},
      tenantId,
    });

    const saved = await this.submissionRepository.save(submission);

    // Update form analytics
    await this.updateFormAnalytics(form.id, tenantId);

    // Process form actions (async)
    this.processFormActions(form, saved, dto.data).catch((error) => {
      console.error('Error processing form actions:', error);
    });

    return saved;
  }

  async getSubmissions(
    tenantId: string,
    formId: string,
  ): Promise<FormSubmission[]> {
    return await this.submissionRepository.find({
      where: { formId, tenantId },
      relations: ['contact'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSubmission(
    tenantId: string,
    submissionId: string,
  ): Promise<FormSubmission> {
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId, tenantId },
      relations: ['contact', 'form'],
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return submission;
  }

  // ==================== Helper Methods ====================

  private async handleContactCreation(
    tenantId: string,
    form: PageForm,
    data: Record<string, any>,
  ): Promise<string> {
    // Extract email from form data
    const emailField = form.fields.find((f) => f.type === 'email');
    const email = emailField ? data[emailField.name] : null;

      // @ts-ignore - Return type mismatch
    if (!email) {
      return undefined;
    }

    // Check if contact exists
    let contact = await this.contactRepository.findOne({
      where: { email, tenantId },
    });

    const contactData: any = {
      email,
    };

    // Map form fields to contact fields
    const fieldMapping = form.integrations?.crm?.fieldMapping || {};
    for (const [formFieldName, contactFieldName] of Object.entries(fieldMapping)) {
      if (data[formFieldName]) {
        contactData[contactFieldName as string] = data[formFieldName];
      }
    }

    // Auto-map common fields
    const nameField = form.fields.find((f) => f.name === 'name' || f.name === 'fullName');
    if (nameField && data[nameField.name]) {
      contactData.firstName = data[nameField.name];
    }

    const phoneField = form.fields.find((f) => f.type === 'phone');
    if (phoneField && data[phoneField.name]) {
      contactData.phone = data[phoneField.name];
    }

    if (contact && form.integrations?.crm?.updateContact) {
      // Update existing contact
      Object.assign(contact, contactData);
      contact = await this.contactRepository.save(contact);
      // @ts-ignore - TypeORM type issue
    } else if (!contact) {
      // Create new contact
      contact = this.contactRepository.create({
        ...contactData,
        status: 'lead',
        tenantId,
      });
      contact = await this.contactRepository.save(contact);
    }

    return contact.id;
  }

  private async processFormActions(
    form: PageForm,
    submission: FormSubmission,
    data: Record<string, any>,
  ): Promise<void> {
    const actions = form.actions || [];

    for (const action of actions.sort((a, b) => a.order - b.order)) {
      try {
        switch (action.type) {
          case 'send_email':
            await this.sendEmail(form, submission, data, action.config);
            break;
          case 'webhook':
            await this.triggerWebhook(form, submission, data, action.config);
            break;
          case 'tag':
            await this.addTag(submission.contactId, action.config.tag);
            break;
          // Add more action types as needed
        }
      } catch (error) {
        // Log error but continue processing
        submission.processingErrors.push({
          action: action.type,
          error: error.message,
          timestamp: new Date(),
        });
      }
    }

    // Update submission status
    submission.status = FormSubmissionStatus.COMPLETED;
    await this.submissionRepository.save(submission);
  }

  private async sendEmail(
    form: PageForm,
    submission: FormSubmission,
    data: Record<string, any>,
    config: any,
  ): Promise<void> {
    // TODO: Implement email sending logic
    console.log('Sending email for form submission:', submission.id);
  }

  private async triggerWebhook(
    form: PageForm,
    submission: FormSubmission,
    data: Record<string, any>,
    config: any,
  ): Promise<void> {
    // TODO: Implement webhook logic
    console.log('Triggering webhook for form submission:', submission.id);
  }

  private async addTag(contactId: string, tag: string): Promise<void> {
    if (!contactId) return;

    const contact = await this.contactRepository.findOne({
      where: { id: contactId },
    });

    if (contact) {
      const tags = contact.tags || [];
      if (!tags.includes(tag)) {
        tags.push(tag);
        contact.tags = tags;
        await this.contactRepository.save(contact);
      }
    }
  }

  private async updateFormAnalytics(
    formId: string,
    tenantId: string,
  ): Promise<void> {
    const form = await this.formRepository.findOne({
      where: { id: formId, tenantId },
    });

    if (!form) return;

    // Increment submissions
    form.submissions += 1;

    // Calculate conversion rate
    if (form.views > 0) {
      form.conversionRate = (form.submissions / form.views) * 100;
    }

    await this.formRepository.save(form);
  }
}
