import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, Like, ILike } from 'typeorm';
import { Contact, ContactStatus, Tag, CustomField, ContactCustomFieldValue } from '../contact.entity';
import {
  CreateContactDto,
  UpdateContactDto,
  ContactQueryDto,
  ImportContactsDto,
} from '../dto/contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(CustomField)
    private readonly customFieldRepository: Repository<CustomField>,
    @InjectRepository(ContactCustomFieldValue)
    private readonly customFieldValueRepository: Repository<ContactCustomFieldValue>,
  ) {}

  /**
   * Create a new contact
   */
  async create(
    createContactDto: CreateContactDto,
    tenantId: string,
  ): Promise<Contact> {
    // Check for duplicate email
    const existing = await this.contactRepository.findOne({
      where: { email: createContactDto.email, tenantId },
    });

    if (existing) {
      throw new ConflictException('Contact with this email already exists');
    }

    const contact = this.contactRepository.create({
      ...createContactDto,
      tenantId,
    });

    const saved = await this.contactRepository.save(contact);

    // Handle tags
    if (createContactDto.tagIds && createContactDto.tagIds.length > 0) {
      await this.addTags(saved.id, createContactDto.tagIds, tenantId);
    }

    // Handle custom fields
    if (createContactDto.customFields) {
      await this.updateCustomFields(
        saved.id,
        createContactDto.customFields,
        tenantId,
      );
    }

    this.logger.log(`Created contact ${saved.id} (${saved.email})`);

    return this.findOne(saved.id, tenantId);
  }

  /**
   * Find all contacts with filters and pagination
   */
  async findAll(
    queryDto: ContactQueryDto,
    tenantId: string,
  ): Promise<{ data: Contact[]; total: number; page: number; limit: number }> {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.contactRepository
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.tags', 'tags')
      .leftJoinAndSelect('contact.owner', 'owner')
      .where('contact.tenantId = :tenantId', { tenantId });

    // Search
    if (queryDto.search) {
      queryBuilder.andWhere(
        '(contact.firstName ILIKE :search OR contact.lastName ILIKE :search OR contact.email ILIKE :search OR contact.company ILIKE :search)',
        { search: `%${queryDto.search}%` },
      );
    }

    // Filter by status
    if (queryDto.status) {
      queryBuilder.andWhere('contact.status = :status', {
        status: queryDto.status,
      });
    }

    // Filter by source
    if (queryDto.source) {
      queryBuilder.andWhere('contact.source = :source', {
        source: queryDto.source,
      });
    }

    // Filter by owner
    if (queryDto.ownerId) {
      queryBuilder.andWhere('contact.ownerId = :ownerId', {
        ownerId: queryDto.ownerId,
      });
    }

    // Filter by tags
    if (queryDto.tagIds) {
      const tagIdArray = queryDto.tagIds.split(',');
      queryBuilder.andWhere('tags.id IN (:...tagIds)', { tagIds: tagIdArray });
    }

    // Filter by score range
    if (queryDto.minScore !== undefined) {
      queryBuilder.andWhere('contact.score >= :minScore', {
        minScore: queryDto.minScore,
      });
    }

    if (queryDto.maxScore !== undefined) {
      queryBuilder.andWhere('contact.score <= :maxScore', {
        maxScore: queryDto.maxScore,
      });
    }

    // Filter by creation date
    if (queryDto.createdAfter) {
      queryBuilder.andWhere('contact.createdAt >= :createdAfter', {
        createdAfter: new Date(queryDto.createdAfter),
      });
    }

    if (queryDto.createdBefore) {
      queryBuilder.andWhere('contact.createdAt <= :createdBefore', {
        createdBefore: new Date(queryDto.createdBefore),
      });
    }

    // Sorting
    const sortBy = queryDto.sortBy || 'createdAt';
    const sortOrder = queryDto.sortOrder || 'DESC';
    queryBuilder.orderBy(`contact.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    // Pagination
    queryBuilder.take(limit).skip(skip);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * Find one contact by ID
   */
  async findOne(id: string, tenantId: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id, tenantId },
      relations: [
        'tags',
        'owner',
        'customFieldValues',
        'customFieldValues.customField',
        'opportunities',
        'opportunities.pipeline',
        'opportunities.stage',
      ],
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    return contact;
  }

  /**
   * Find contact by email
   */
  async findByEmail(email: string, tenantId: string): Promise<Contact | null> {
    return this.contactRepository.findOne({
      where: { email, tenantId },
      relations: ['tags', 'owner'],
    });
  }

  /**
   * Update contact
   */
  async update(
    id: string,
    updateContactDto: UpdateContactDto,
    tenantId: string,
  ): Promise<Contact> {
    const contact = await this.findOne(id, tenantId);

    // Check for email conflict
    if (updateContactDto.email && updateContactDto.email !== contact.email) {
      const existing = await this.contactRepository.findOne({
        where: { email: updateContactDto.email, tenantId },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Contact with this email already exists');
      }
    }

    Object.assign(contact, updateContactDto);

    return this.contactRepository.save(contact);
  }

  /**
   * Delete contact
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const contact = await this.findOne(id, tenantId);
    await this.contactRepository.softRemove(contact);
    this.logger.log(`Deleted contact ${id} (${contact.email})`);
  }

  /**
   * Add tags to contact
   */
  async addTags(
    contactId: string,
    tagIds: string[],
    tenantId: string,
  ): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id: contactId, tenantId },
      relations: ['tags'],
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    const tags = await this.tagRepository.find({
      where: { id: In(tagIds), tenantId },
    });

    // Merge new tags with existing tags
    const existingTagIds = contact.tags.map((t) => t.id);
    const newTags = tags.filter((t) => !existingTagIds.includes(t.id));

    contact.tags = [...contact.tags, ...newTags];

    await this.contactRepository.save(contact);

    // Update tag contact counts
    for (const tag of newTags) {
      await this.tagRepository.increment({ id: tag.id }, 'contactCount', 1);
    }

    return this.findOne(contactId, tenantId);
  }

  /**
   * Remove tags from contact
   */
  async removeTags(
    contactId: string,
    tagIds: string[],
    tenantId: string,
  ): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id: contactId, tenantId },
      relations: ['tags'],
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    contact.tags = contact.tags.filter((tag) => !tagIds.includes(tag.id));

    await this.contactRepository.save(contact);

    // Update tag contact counts
    for (const tagId of tagIds) {
      await this.tagRepository.decrement({ id: tagId }, 'contactCount', 1);
    }

    return this.findOne(contactId, tenantId);
  }

  /**
   * Update custom field values for a contact
   */
  async updateCustomFields(
    contactId: string,
    customFields: Record<string, any>,
    tenantId: string,
  ): Promise<void> {
    const contact = await this.findOne(contactId, tenantId);

    for (const [fieldKey, value] of Object.entries(customFields)) {
      const customField = await this.customFieldRepository.findOne({
        where: { fieldKey, tenantId },
      });

      if (!customField) {
        this.logger.warn(`Custom field ${fieldKey} not found, skipping`);
        continue;
      }

      // Check if value already exists
      let fieldValue = await this.customFieldValueRepository.findOne({
        where: {
          contactId: contact.id,
          customFieldId: customField.id,
          tenantId,
        },
      });

      if (fieldValue) {
        fieldValue.value = value;
      } else {
        fieldValue = this.customFieldValueRepository.create({
          tenantId,
          contactId: contact.id,
          customFieldId: customField.id,
          value,
        });
      }

      await this.customFieldValueRepository.save(fieldValue);
    }

    this.logger.log(`Updated custom fields for contact ${contactId}`);
  }

  /**
   * Import contacts from CSV
   */
  async importFromCsv(
    importDto: ImportContactsDto,
    tenantId: string,
  ): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const lines = importDto.csvData.split('\n').filter((line) => line.trim());

    if (lines.length < 2) {
      throw new BadRequestException('CSV must have header and at least one data row');
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const errors: string[] = [];
    let imported = 0;
    let skipped = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      try {
        // Required field: email
        if (!row.email) {
          errors.push(`Row ${i + 1}: Missing email`);
          skipped++;
          continue;
        }

        // Check for duplicate
        if (importDto.skipDuplicates) {
          const existing = await this.findByEmail(row.email, tenantId);
          if (existing) {
            skipped++;
            continue;
          }
        }

        // Create contact
        await this.create(
          {
            email: row.email,
            firstName: row.firstname || row.first_name,
            lastName: row.lastname || row.last_name,
            phone: row.phone,
            company: row.company,
            jobTitle: row.job_title || row.jobtitle,
            city: row.city,
            state: row.state,
            country: row.country,
            ownerId: importDto.ownerId,
            tagIds: importDto.tagIds,
          },
          tenantId,
        );

        imported++;
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
        skipped++;
      }
    }

    this.logger.log(
      `Imported ${imported} contacts, skipped ${skipped}, errors: ${errors.length}`,
    );

    return { imported, skipped, errors };
  }

  /**
   * Update lead score
   */
  async updateScore(
    contactId: string,
    score: number,
    tenantId: string,
  ): Promise<Contact> {
    const contact = await this.findOne(contactId, tenantId);
    contact.score = score;
    return this.contactRepository.save(contact);
  }

  /**
   * Subscribe contact
   */
  async subscribe(contactId: string, tenantId: string): Promise<Contact> {
    const contact = await this.findOne(contactId, tenantId);
    contact.isSubscribed = true;
    contact.subscribedAt = new Date();
    contact.status = ContactStatus.ACTIVE;
    return this.contactRepository.save(contact);
  }

  /**
   * Unsubscribe contact
   */
  async unsubscribe(contactId: string, tenantId: string): Promise<Contact> {
    const contact = await this.findOne(contactId, tenantId);
    contact.isSubscribed = false;
    contact.unsubscribedAt = new Date();
    contact.status = ContactStatus.UNSUBSCRIBED;
    return this.contactRepository.save(contact);
  }

  /**
   * Get contact statistics
   */
  async getStats(tenantId: string): Promise<any> {
    const total = await this.contactRepository.count({ where: { tenantId } });

    const byStatus = await this.contactRepository
      .createQueryBuilder('contact')
      .select('contact.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('contact.tenantId = :tenantId', { tenantId })
      .groupBy('contact.status')
      .getRawMany();

    const bySource = await this.contactRepository
      .createQueryBuilder('contact')
      .select('contact.source', 'source')
      .addSelect('COUNT(*)', 'count')
      .where('contact.tenantId = :tenantId', { tenantId })
      .groupBy('contact.source')
      .getRawMany();

    return {
      total,
      byStatus,
      bySource,
    };
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Bulk update contacts
   */
  async bulkUpdate(
    contactIds: string[],
    updates: Partial<UpdateContactDto>,
    tenantId: string,
  ): Promise<{ updated: number; contacts: Contact[] }> {
    if (!contactIds || contactIds.length === 0) {
      throw new BadRequestException('No contact IDs provided');
    }

    // Verify all contacts belong to tenant
    const contacts = await this.contactRepository.find({
      where: {
        id: In(contactIds),
        tenantId,
      },
    });

    if (contacts.length === 0) {
      throw new NotFoundException('No contacts found');
    }

    // Apply updates to each contact
    const updatedContacts: Contact[] = [];
    for (const contact of contacts) {
      Object.assign(contact, updates);
      const saved = await this.contactRepository.save(contact);
      updatedContacts.push(saved);
    }

    return {
      updated: updatedContacts.length,
      contacts: updatedContacts,
    };
  }

  /**
   * Bulk delete contacts
   */
  async bulkDelete(contactIds: string[], tenantId: string): Promise<{ deleted: number }> {
    if (!contactIds || contactIds.length === 0) {
      throw new BadRequestException('No contact IDs provided');
    }

    const result = await this.contactRepository.delete({
      id: In(contactIds),
      tenantId,
    });

    return {
      deleted: result.affected || 0,
    };
  }

  /**
   * Bulk add tags to contacts
   */
  async bulkAddTags(
    contactIds: string[],
    tagIds: string[],
    tenantId: string,
  ): Promise<{ updated: number }> {
    if (!contactIds || contactIds.length === 0) {
      throw new BadRequestException('No contact IDs provided');
    }

    if (!tagIds || tagIds.length === 0) {
      throw new BadRequestException('No tag IDs provided');
    }

    const contacts = await this.contactRepository.find({
      where: {
        id: In(contactIds),
        tenantId,
      },
      relations: ['tags'],
    });

    const tags = await this.tagRepository.find({
      where: {
        id: In(tagIds),
        tenantId,
      },
    });

    if (tags.length === 0) {
      throw new NotFoundException('No tags found');
    }

    let updated = 0;
    for (const contact of contacts) {
      // Add tags that don't already exist
      const existingTagIds = contact.tags?.map(t => t.id) || [];
      const newTags = tags.filter(t => !existingTagIds.includes(t.id));

      if (newTags.length > 0) {
        contact.tags = [...(contact.tags || []), ...newTags];
        await this.contactRepository.save(contact);
        updated++;
      }
    }

    return { updated };
  }

  /**
   * Bulk remove tags from contacts
   */
  async bulkRemoveTags(
    contactIds: string[],
    tagIds: string[],
    tenantId: string,
  ): Promise<{ updated: number }> {
    if (!contactIds || contactIds.length === 0) {
      throw new BadRequestException('No contact IDs provided');
    }

    if (!tagIds || tagIds.length === 0) {
      throw new BadRequestException('No tag IDs provided');
    }

    const contacts = await this.contactRepository.find({
      where: {
        id: In(contactIds),
        tenantId,
      },
      relations: ['tags'],
    });

    let updated = 0;
    for (const contact of contacts) {
      const originalTagCount = contact.tags?.length || 0;
      contact.tags = contact.tags?.filter(t => !tagIds.includes(t.id)) || [];

      if (contact.tags.length < originalTagCount) {
        await this.contactRepository.save(contact);
        updated++;
      }
    }

    return { updated };
  }
}
