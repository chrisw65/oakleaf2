import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { EmailSequence, SequenceStatus, TriggerType } from './email-sequence.entity';
import {
  EmailSequenceSubscriber,
  SubscriberStatus,
} from './email-sequence-subscriber.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-log.entity';
import * as crypto from 'crypto';

export interface CreateSequenceDto {
  name: string;
  description?: string;
  triggerType: TriggerType;
  triggerConfig?: Record<string, any>;
  steps: Array<{
    type: 'email' | 'wait' | 'condition' | 'action';
    emailTemplateId?: string;
    subject?: string;
    delay?: { value: number; unit: string };
    condition?: Record<string, any>;
    action?: Record<string, any>;
  }>;
  goalType?: string;
  goalConfig?: Record<string, any>;
  exitOnGoalAchieved?: boolean;
  allowReentry?: boolean;
  maxSubscribers?: number;
}

export interface UpdateSequenceDto {
  name?: string;
  description?: string;
  triggerConfig?: Record<string, any>;
  steps?: Array<any>;
  goalType?: string;
  goalConfig?: Record<string, any>;
  exitOnGoalAchieved?: boolean;
  allowReentry?: boolean;
  maxSubscribers?: number;
}

export interface EnrollSubscriberDto {
  userId: string;
  enrollmentData?: Record<string, any>;
  customFields?: Record<string, any>;
}

@Injectable()
export class EmailAutomationService {
  private readonly logger = new Logger(EmailAutomationService.name);

  constructor(
    @InjectRepository(EmailSequence)
    private readonly sequenceRepository: Repository<EmailSequence>,
    @InjectRepository(EmailSequenceSubscriber)
    private readonly subscriberRepository: Repository<EmailSequenceSubscriber>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create new email sequence
   */
  async createSequence(
    tenantId: string,
    userId: string,
    dto: CreateSequenceDto,
  ): Promise<EmailSequence> {
    // Add IDs and order to steps
    const steps = dto.steps.map((step, index) => ({
      ...step,
      id: this.generateStepId(),
      order: index,
    }));

    const sequence = this.sequenceRepository.create({
      tenantId,
      ...dto,
      steps,
      status: SequenceStatus.DRAFT,
      createdBy: userId,
      totalSubscribers: 0,
      activeSubscribers: 0,
      completedSubscribers: 0,
      totalEmailsSent: 0,
    } as any) as unknown as EmailSequence;

    await this.sequenceRepository.save(sequence);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.CREATE,
      resource: 'email_sequence',
      resourceId: sequence.id,
      description: `Created email sequence: ${dto.name}`,
      metadata: { triggerType: dto.triggerType, stepsCount: steps.length },
    });

    this.logger.log(`Email sequence created: ${sequence.id} (${dto.name})`);

    return sequence;
  }

  /**
   * Update email sequence
   */
  async updateSequence(
    tenantId: string,
    userId: string,
    sequenceId: string,
    dto: UpdateSequenceDto,
  ): Promise<EmailSequence> {
    const sequence = await this.findOne(tenantId, sequenceId);

    if (sequence.status === SequenceStatus.ACTIVE) {
      throw new BadRequestException('Cannot update active sequence');
    }

    // Update steps with IDs if provided
    if (dto.steps) {
      dto.steps = dto.steps.map((step, index) => ({
        ...step,
        id: step.id || this.generateStepId(),
        order: index,
      }));
    }

    Object.assign(sequence, dto);
    await this.sequenceRepository.save(sequence);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.UPDATE,
      resource: 'email_sequence',
      resourceId: sequence.id,
      description: `Updated email sequence: ${sequence.name}`,
    });

    return sequence;
  }

  /**
   * Activate sequence
   */
  async activateSequence(
    tenantId: string,
    userId: string,
    sequenceId: string,
  ): Promise<EmailSequence> {
    const sequence = await this.findOne(tenantId, sequenceId);

    if (sequence.steps.length === 0) {
      throw new BadRequestException('Sequence must have at least one step');
    }

    sequence.status = SequenceStatus.ACTIVE;
    await this.sequenceRepository.save(sequence);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.UPDATE,
      resource: 'email_sequence',
      resourceId: sequence.id,
      description: `Activated email sequence: ${sequence.name}`,
    });

    this.logger.log(`Email sequence activated: ${sequence.id}`);

    return sequence;
  }

  /**
   * Pause sequence
   */
  async pauseSequence(
    tenantId: string,
    userId: string,
    sequenceId: string,
  ): Promise<EmailSequence> {
    const sequence = await this.findOne(tenantId, sequenceId);

    sequence.status = SequenceStatus.PAUSED;
    await this.sequenceRepository.save(sequence);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.UPDATE,
      resource: 'email_sequence',
      resourceId: sequence.id,
      description: `Paused email sequence: ${sequence.name}`,
    });

    this.logger.log(`Email sequence paused: ${sequence.id}`);

    return sequence;
  }

  /**
   * Enroll subscriber in sequence
   */
  async enrollSubscriber(
    tenantId: string,
    userId: string,
    sequenceId: string,
    dto: EnrollSubscriberDto,
  ): Promise<EmailSequenceSubscriber> {
    const sequence = await this.findOne(tenantId, sequenceId);

    if (!sequence.isActive()) {
      throw new BadRequestException('Sequence is not active');
    }

    if (!sequence.hasCapacity()) {
      throw new BadRequestException('Sequence has reached maximum subscribers');
    }

    // Check if user is already enrolled
    const existing = await this.subscriberRepository.findOne({
      where: {
        tenantId,
        sequenceId,
        userId: dto.userId,
        status: SubscriberStatus.ACTIVE,
      },
    });

    if (existing) {
      if (!sequence.allowReentry) {
        throw new BadRequestException('User is already enrolled in this sequence');
      }
      // Remove existing subscription
      await this.unsubscribeSubscriber(tenantId, userId, sequenceId, dto.userId);
    }

    // Get first step
    const firstStep = sequence.steps[0];

    const subscriber = this.subscriberRepository.create({
      tenantId,
      sequenceId,
      userId: dto.userId,
      status: SubscriberStatus.ACTIVE,
      currentStepId: firstStep.id,
      currentStepIndex: 0,
      enrolledAt: new Date(),
      nextSendAt: new Date(), // Process immediately
      enrollmentData: dto.enrollmentData,
      customFields: dto.customFields,
      emailsSent: 0,
      emailsOpened: 0,
      emailsClicked: 0,
      emailsBounced: 0,
      errorCount: 0,
    });

    await this.subscriberRepository.save(subscriber);

    // Update sequence statistics
    sequence.incrementSubscriber();
    await this.sequenceRepository.save(sequence);

    this.logger.log(`Subscriber enrolled in sequence ${sequenceId}: ${dto.userId}`);

    return subscriber;
  }

  /**
   * Unsubscribe from sequence
   */
  async unsubscribeSubscriber(
    tenantId: string,
    userId: string,
    sequenceId: string,
    subscriberUserId: string,
  ): Promise<void> {
    const subscriber = await this.subscriberRepository.findOne({
      where: {
        tenantId,
        sequenceId,
        userId: subscriberUserId,
      },
    });

    if (!subscriber) {
      throw new NotFoundException('Subscriber not found');
    }

    subscriber.status = SubscriberStatus.UNSUBSCRIBED;
    await this.subscriberRepository.save(subscriber);

    // Update sequence statistics
    const sequence = await this.findOne(tenantId, sequenceId);
    sequence.removeSubscriber();
    await this.sequenceRepository.save(sequence);

    this.logger.log(`Subscriber unsubscribed from sequence ${sequenceId}: ${subscriberUserId}`);
  }

  /**
   * Process pending subscribers (should be called by a cron job)
   */
  async processPendingSubscribers(tenantId?: string): Promise<number> {
    const where: any = {
      status: SubscriberStatus.ACTIVE,
      nextSendAt: LessThanOrEqual(new Date()),
    };

    if (tenantId) {
      where.tenantId = tenantId;
    }

    const subscribers = await this.subscriberRepository.find({
      where,
      take: 100, // Process in batches
    });

    let processedCount = 0;

    for (const subscriber of subscribers) {
      try {
        await this.processSubscriberStep(subscriber);
        processedCount++;
      } catch (error) {
        this.logger.error(
          `Error processing subscriber ${subscriber.id}:`,
          error.stack,
        );
        subscriber.recordError(error.message);
        await this.subscriberRepository.save(subscriber);
      }
    }

    this.logger.log(`Processed ${processedCount} pending subscribers`);

    return processedCount;
  }

  /**
   * Process next step for subscriber
   */
  private async processSubscriberStep(subscriber: EmailSequenceSubscriber): Promise<void> {
    const sequence = await this.sequenceRepository.findOne({
      where: { id: subscriber.sequenceId },
    });

    if (!sequence || !sequence.isActive()) {
      this.logger.warn(`Sequence ${subscriber.sequenceId} is not active`);
      return;
    }

    const currentStep = sequence.steps.find((s) => s.id === subscriber.currentStepId);

    if (!currentStep) {
      // No more steps, complete the subscriber
      subscriber.markCompleted();
      sequence.completeSubscriber();
      await this.subscriberRepository.save(subscriber);
      await this.sequenceRepository.save(sequence);
      return;
    }

    // Process step based on type
    switch (currentStep.type) {
      case 'email':
        await this.processEmailStep(subscriber, sequence, currentStep);
        break;
      case 'wait':
        await this.processWaitStep(subscriber, sequence, currentStep);
        break;
      case 'condition':
        await this.processConditionStep(subscriber, sequence, currentStep);
        break;
      case 'action':
        await this.processActionStep(subscriber, sequence, currentStep);
        break;
    }

    await this.subscriberRepository.save(subscriber);
  }

  /**
   * Process email step
   */
  private async processEmailStep(
    subscriber: EmailSequenceSubscriber,
    sequence: EmailSequence,
    step: any,
  ): Promise<void> {
    // In a real implementation, this would:
    // 1. Fetch the email template
    // 2. Render it with subscriber data
    // 3. Send the email via email service
    // 4. Track the sending

    subscriber.markEmailSent(step.id);
    sequence.incrementEmailSent();

    // Move to next step
    const nextStep = sequence.getNextStep(step.id);
    if (nextStep) {
      subscriber.moveToNextStep(nextStep.id, nextStep.order, nextStep.delay);
    } else {
      subscriber.markCompleted();
      sequence.completeSubscriber();
    }

    this.logger.debug(`Processed email step ${step.id} for subscriber ${subscriber.id}`);
  }

  /**
   * Process wait step
   */
  private async processWaitStep(
    subscriber: EmailSequenceSubscriber,
    sequence: EmailSequence,
    step: any,
  ): Promise<void> {
    // Move to next step with delay
    const nextStep = sequence.getNextStep(step.id);
    if (nextStep) {
      subscriber.moveToNextStep(nextStep.id, nextStep.order, step.delay);
    } else {
      subscriber.markCompleted();
      sequence.completeSubscriber();
    }
  }

  /**
   * Process condition step
   */
  private async processConditionStep(
    subscriber: EmailSequenceSubscriber,
    sequence: EmailSequence,
    step: any,
  ): Promise<void> {
    // Evaluate condition (simplified)
    const conditionResult = this.evaluateCondition(
      step.condition,
      subscriber.customFields || {},
    );

    const nextStep = sequence.getNextStep(step.id, conditionResult);
    if (nextStep) {
      subscriber.moveToNextStep(nextStep.id, nextStep.order, nextStep.delay);
    } else {
      subscriber.markCompleted();
      sequence.completeSubscriber();
    }
  }

  /**
   * Process action step
   */
  private async processActionStep(
    subscriber: EmailSequenceSubscriber,
    sequence: EmailSequence,
    step: any,
  ): Promise<void> {
    // Execute action (add tag, remove tag, update field, etc.)
    // In a real implementation, this would interact with the user/contact service

    // Move to next step
    const nextStep = sequence.getNextStep(step.id);
    if (nextStep) {
      subscriber.moveToNextStep(nextStep.id, nextStep.order, nextStep.delay);
    } else {
      subscriber.markCompleted();
      sequence.completeSubscriber();
    }
  }

  /**
   * Find one sequence
   */
  async findOne(tenantId: string, sequenceId: string): Promise<EmailSequence> {
    const sequence = await this.sequenceRepository.findOne({
      where: { tenantId, id: sequenceId },
    });

    if (!sequence) {
      throw new NotFoundException('Email sequence not found');
    }

    return sequence;
  }

  /**
   * Find all sequences
   */
  async findAll(tenantId: string, status?: SequenceStatus): Promise<EmailSequence[]> {
    const where: any = { tenantId };
    if (status) {
      where.status = status;
    }

    return await this.sequenceRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get sequence statistics
   */
  async getStatistics(tenantId: string, sequenceId: string): Promise<any> {
    const sequence = await this.findOne(tenantId, sequenceId);

    const subscribers = await this.subscriberRepository.find({
      where: { tenantId, sequenceId },
    });

    const totalOpens = subscribers.reduce((sum, s) => sum + s.emailsOpened, 0);
    const totalClicks = subscribers.reduce((sum, s) => sum + s.emailsClicked, 0);

    return {
      sequence: {
        id: sequence.id,
        name: sequence.name,
        status: sequence.status,
        stepsCount: sequence.getStepCount(),
      },
      subscribers: {
        total: sequence.totalSubscribers,
        active: sequence.activeSubscribers,
        completed: sequence.completedSubscribers,
      },
      emails: {
        sent: sequence.totalEmailsSent,
        opened: totalOpens,
        clicked: totalClicks,
        openRate:
          sequence.totalEmailsSent > 0
            ? ((totalOpens / sequence.totalEmailsSent) * 100).toFixed(2)
            : 0,
        clickRate:
          totalOpens > 0 ? ((totalClicks / totalOpens) * 100).toFixed(2) : 0,
      },
    };
  }

  /**
   * Helper: Generate step ID
   */
  private generateStepId(): string {
    return `step_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Helper: Evaluate condition
   */
  private evaluateCondition(condition: any, data: Record<string, any>): boolean {
    const field = data[condition.field];
    const value = condition.value;

    switch (condition.operator) {
      case 'equals':
        return field === value;
      case 'not_equals':
        return field !== value;
      case 'contains':
        return String(field).includes(String(value));
      case 'greater_than':
        return Number(field) > Number(value);
      case 'less_than':
        return Number(field) < Number(value);
      default:
        return false;
    }
  }
}
