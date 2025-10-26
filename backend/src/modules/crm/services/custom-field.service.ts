import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomField } from '../contact.entity';
import { CreateCustomFieldDto, UpdateCustomFieldDto } from '../dto/custom-field.dto';

@Injectable()
export class CustomFieldService {
  private readonly logger = new Logger(CustomFieldService.name);

  constructor(
    @InjectRepository(CustomField)
    private readonly customFieldRepository: Repository<CustomField>,
  ) {}

  /**
   * Create a new custom field
   */
  async create(
    createCustomFieldDto: CreateCustomFieldDto,
    tenantId: string,
  ): Promise<CustomField> {
    // Check for duplicate field key
    const existing = await this.customFieldRepository.findOne({
      where: { fieldKey: createCustomFieldDto.fieldKey, tenantId },
    });

    if (existing) {
      throw new ConflictException('Custom field with this key already exists');
    }

    const customField = this.customFieldRepository.create({
      ...createCustomFieldDto,
      tenantId,
    });

    const saved = await this.customFieldRepository.save(customField);

    this.logger.log(`Created custom field ${saved.id} (${saved.fieldKey})`);

    return saved;
  }

  /**
   * Find all custom fields
   */
  async findAll(tenantId: string): Promise<CustomField[]> {
    return this.customFieldRepository.find({
      where: { tenantId },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Find one custom field by ID
   */
  async findOne(id: string, tenantId: string): Promise<CustomField> {
    const customField = await this.customFieldRepository.findOne({
      where: { id, tenantId },
    });

    if (!customField) {
      throw new NotFoundException(`Custom field with ID ${id} not found`);
    }

    return customField;
  }

  /**
   * Find custom field by key
   */
  async findByKey(fieldKey: string, tenantId: string): Promise<CustomField | null> {
    return this.customFieldRepository.findOne({
      where: { fieldKey, tenantId },
    });
  }

  /**
   * Update custom field
   */
  async update(
    id: string,
    updateCustomFieldDto: UpdateCustomFieldDto,
    tenantId: string,
  ): Promise<CustomField> {
    const customField = await this.findOne(id, tenantId);

    Object.assign(customField, updateCustomFieldDto);

    return this.customFieldRepository.save(customField);
  }

  /**
   * Delete custom field
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const customField = await this.findOne(id, tenantId);
    await this.customFieldRepository.softRemove(customField);
    this.logger.log(`Deleted custom field ${id} (${customField.fieldKey})`);
  }
}
