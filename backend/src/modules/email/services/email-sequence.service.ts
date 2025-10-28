import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailSequence, SequenceStatus } from '../email-sequence.entity';
import { EmailSequenceStep } from '../email-sequence-step.entity';
import { EmailSequenceSubscriber, SubscriberStatus } from '../email-sequence-subscriber.entity';
import { Contact } from '../../crm/contact.entity';
import {
  CreateEmailSequenceDto,
  UpdateEmailSequenceDto,
  EmailSequenceQueryDto,
  EnrollContactsDto,
  AddSequenceStepDto,
  UpdateSequenceStepDto,
} from '../dto/email-sequence.dto';

@Injectable()
export class EmailSequenceService {
  private readonly logger = new Logger(EmailSequenceService.name);

  constructor(
    @InjectRepository(EmailSequence)
    private readonly sequenceRepository: Repository<EmailSequence>,
    @InjectRepository(EmailSequenceStep)
    private readonly stepRepository: Repository<EmailSequenceStep>,
    @InjectRepository(EmailSequenceSubscriber)
    private readonly subscriberRepository: Repository<EmailSequenceSubscriber>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  /**
   * Create a new sequence
   */
  async create(
    createDto: CreateEmailSequenceDto,
    tenantId: string,
    userId?: string,
  ): Promise<EmailSequence> {
    const sequence = this.sequenceRepository.create({
      ...createDto,
      tenantId,
      createdBy: userId,
    });

    const saved = await this.sequenceRepository.save(sequence);

    // Create steps if provided
    if (createDto.steps && createDto.steps.length > 0) {
      for (const stepDto of createDto.steps) {
        await this.addStep(saved.id, stepDto, tenantId);
      }
    }

    this.logger.log(`Created email sequence: ${saved.name}`);
    return await this.findOne(saved.id, tenantId);
  }

  /**
   * Find all sequences
   */
  async findAll(
    queryDto: EmailSequenceQueryDto,
    tenantId: string,
  ): Promise<{ data: EmailSequence[]; total: number; page: number; limit: number }> {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.sequenceRepository
      .createQueryBuilder('sequence')
      .leftJoinAndSelect('sequence.steps', 'steps')
      .leftJoinAndSelect('sequence.creator', 'creator')
      .where('sequence.tenantId = :tenantId', { tenantId })
      .andWhere('sequence.deletedAt IS NULL');

    if (queryDto.status) {
      queryBuilder.andWhere('sequence.status = :status', { status: queryDto.status });
    }

    if (queryDto.trigger) {
      queryBuilder.andWhere('sequence.trigger = :trigger', { trigger: queryDto.trigger });
    }

    if (queryDto.search) {
      queryBuilder.andWhere('sequence.name ILIKE :search', {
        search: `%${queryDto.search}%`,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy('sequence.createdAt', 'DESC')
      .addOrderBy('steps.position', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * Find sequence by ID
   */
  async findOne(id: string, tenantId: string): Promise<EmailSequence> {
    const sequence = await this.sequenceRepository.findOne({
      where: { id, tenantId },
      relations: ['steps', 'creator'],
      order: { steps: { position: 'ASC' } },
    });

    if (!sequence) {
      throw new NotFoundException('Email sequence not found');
    }

    return sequence;
  }

  /**
   * Update sequence
   */
  async update(
    id: string,
    updateDto: UpdateEmailSequenceDto,
    tenantId: string,
  ): Promise<EmailSequence> {
    const sequence = await this.findOne(id, tenantId);

    Object.assign(sequence, updateDto);
    const updated = await this.sequenceRepository.save(sequence);

    this.logger.log(`Updated email sequence: ${updated.name}`);
    return await this.findOne(updated.id, tenantId);
  }

  /**
   * Delete sequence
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const sequence = await this.findOne(id, tenantId);
    await this.sequenceRepository.softDelete(id);
    this.logger.log(`Deleted email sequence: ${sequence.name}`);
  }

  /**
   * Add step to sequence
   */
  async addStep(
    sequenceId: string,
    stepDto: AddSequenceStepDto,
    tenantId: string,
  ): Promise<EmailSequenceStep> {
    const sequence = await this.findOne(sequenceId, tenantId);

    const step = this.stepRepository.create({
      ...stepDto,
      sequenceId,
      tenantId,
    });

    const saved = await this.stepRepository.save(step);
    this.logger.log(`Added step to sequence ${sequence.name}: ${saved.name}`);

    return saved;
  }

  /**
   * Update step
   */
  async updateStep(
    sequenceId: string,
    stepId: string,
    updateDto: UpdateSequenceStepDto,
    tenantId: string,
  ): Promise<EmailSequenceStep> {
    const step = await this.stepRepository.findOne({
      where: { id: stepId, sequenceId, tenantId },
    });

    if (!step) {
      throw new NotFoundException('Sequence step not found');
    }

    Object.assign(step, updateDto);
    return await this.stepRepository.save(step);
  }

  /**
   * Delete step
   */
  async removeStep(
    sequenceId: string,
    stepId: string,
    tenantId: string,
  ): Promise<void> {
    const step = await this.stepRepository.findOne({
      where: { id: stepId, sequenceId, tenantId },
    });

    if (!step) {
      throw new NotFoundException('Sequence step not found');
    }

    await this.stepRepository.softDelete(stepId);
  }

  /**
   * Enroll contacts in sequence
   */
  async enrollContacts(
    sequenceId: string,
    enrollDto: EnrollContactsDto,
    tenantId: string,
  ): Promise<{ enrolled: number; skipped: number }> {
    const sequence = await this.findOne(sequenceId, tenantId);

    if (sequence.status !== SequenceStatus.ACTIVE) {
      throw new BadRequestException('Can only enroll contacts in active sequences');
    }

    let enrolled = 0;
    let skipped = 0;

    for (const contactId of enrollDto.contactIds) {
      // Check if already enrolled
      const existing = await this.subscriberRepository.findOne({
        where: {
          sequenceId,
          contactId,
          tenantId,
          status: SubscriberStatus.ACTIVE,
        },
      });

      if (existing && !sequence.allowReenrollment) {
        skipped++;
        continue;
      }

      // Calculate next step time
      const firstStep = sequence.steps?.[0];
      const nextStepAt = this.calculateNextStepTime(
        new Date(),
        firstStep?.delayType || 'immediate',
        firstStep?.delayValue || 0,
        sequence.sendTime,
      );

      const subscriber = this.subscriberRepository.create({
        sequenceId,
        contactId,
        tenantId,
        status: SubscriberStatus.ACTIVE,
        currentStep: 0,
        nextStepAt,
        enrolledAt: new Date(),
      });

      await this.subscriberRepository.save(subscriber);
      enrolled++;
    }

    // Update sequence statistics
    await this.sequenceRepository.increment(
      { id: sequenceId },
      'totalEnrolled',
      enrolled,
    );
    await this.sequenceRepository.increment(
      { id: sequenceId },
      'activeSubscribers',
      enrolled,
    );

    this.logger.log(`Enrolled ${enrolled} contacts in sequence ${sequence.name} (${skipped} skipped)`);
    return { enrolled, skipped };
  }

  /**
   * Calculate next step time based on delay
   */
  private calculateNextStepTime(
    from: Date,
    delayType: string,
    delayValue: number,
    preferredTime?: string,
  ): Date {
    const nextTime = new Date(from);

    switch (delayType) {
      case 'immediate':
        return nextTime;
      case 'hours':
        nextTime.setHours(nextTime.getHours() + delayValue);
        break;
      case 'days':
        nextTime.setDate(nextTime.getDate() + delayValue);
        break;
      case 'weeks':
        nextTime.setDate(nextTime.getDate() + delayValue * 7);
        break;
    }

    // Apply preferred send time if specified
    if (preferredTime) {
      const [hours, minutes] = preferredTime.split(':').map(Number);
      nextTime.setHours(hours, minutes, 0, 0);
    }

    return nextTime;
  }

  /**
   * Get sequence statistics
   */
  async getStatistics(
    id: string,
    tenantId: string,
  ): Promise<{
    sequence: EmailSequence;
    completionRate: number;
  }> {
    const sequence = await this.findOne(id, tenantId);

    const completionRate = sequence.totalEnrolled > 0
      ? (sequence.completedSubscribers / sequence.totalEnrolled) * 100
      : 0;

    return {
      sequence,
      completionRate: parseFloat(completionRate.toFixed(2)),
    };
  }
}
