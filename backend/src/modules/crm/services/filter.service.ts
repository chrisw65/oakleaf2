import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Brackets, WhereExpressionBuilder } from 'typeorm';
import { SavedFilter, FilterGroup, FilterCondition } from '../saved-filter.entity';
import { Contact } from '../contact.entity';

export class CreateFilterDto {
  name: string;
  entityType: string;
  filterConfig: FilterGroup;
  isPublic?: boolean;
  description?: string;
  isDefault?: boolean;
}

export type UpdateFilterDto = Partial<CreateFilterDto>;

@Injectable()
export class FilterService {
  constructor(
    @InjectRepository(SavedFilter)
    private filterRepository: Repository<SavedFilter>,
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  /**
   * Create a saved filter
   */
  async create(createDto: CreateFilterDto, userId: string, tenantId: string): Promise<SavedFilter> {
    const filter = this.filterRepository.create({
      ...createDto,
      createdById: userId,
      tenantId,
    });

    return await this.filterRepository.save(filter);
  }

  /**
   * Get all saved filters for a user
   */
  async findAll(
    entityType: string,
    userId: string,
    tenantId: string,
  ): Promise<SavedFilter[]> {
    return await this.filterRepository.find({
      where: [
        { entityType, tenantId, createdById: userId },
        { entityType, tenantId, isPublic: true },
      ],
      order: { isDefault: 'DESC', name: 'ASC' },
    });
  }

  /**
   * Get a single saved filter
   */
  async findOne(id: string, userId: string, tenantId: string): Promise<SavedFilter> {
    const filter = await this.filterRepository.findOne({
      where: [
        { id, tenantId, createdById: userId },
        { id, tenantId, isPublic: true },
      ],
    });

    if (!filter) {
      throw new NotFoundException('Filter not found');
    }

    return filter;
  }

  /**
   * Update a saved filter
   */
  async update(
    id: string,
    updateDto: UpdateFilterDto,
    userId: string,
    tenantId: string,
  ): Promise<SavedFilter> {
    const filter = await this.filterRepository.findOne({
      where: { id, tenantId, createdById: userId },
    });

    if (!filter) {
      throw new NotFoundException('Filter not found or you do not have permission to update it');
    }

    Object.assign(filter, updateDto);
    return await this.filterRepository.save(filter);
  }

  /**
   * Delete a saved filter
   */
  async remove(id: string, userId: string, tenantId: string): Promise<void> {
    const filter = await this.filterRepository.findOne({
      where: { id, tenantId, createdById: userId },
    });

    if (!filter) {
      throw new NotFoundException('Filter not found or you do not have permission to delete it');
    }

    await this.filterRepository.remove(filter);
  }

  /**
   * Apply advanced filter to contacts query
   */
  applyFilterToContactQuery(
    query: SelectQueryBuilder<Contact>,
    filterConfig: FilterGroup,
  ): SelectQueryBuilder<Contact> {
    if (!filterConfig || !filterConfig.conditions || filterConfig.conditions.length === 0) {
      return query;
    }

    const applyConditions = (
      qb: SelectQueryBuilder<Contact> | WhereExpressionBuilder,
      group: FilterGroup,
      paramPrefix: string,
    ) => {
      const logic = group.logic === 'OR' ? 'orWhere' : 'andWhere';

      qb[logic](
        new Brackets((subQb) => {
          group.conditions.forEach((condition, idx) => {
            const paramName = `${paramPrefix}_${idx}`;
            this.applyCondition(subQb, condition, paramName);
          });

          // Handle nested groups
          if (group.groups && group.groups.length > 0) {
            group.groups.forEach((nestedGroup, groupIdx) => {
              applyConditions(subQb, nestedGroup, `${paramPrefix}_g${groupIdx}`);
            });
          }
        }),
      );
    };

    applyConditions(query, filterConfig, 'filter');
    return query;
  }

  /**
   * Apply a single condition to query
   */
  private applyCondition(
    qb: WhereExpressionBuilder,
    condition: FilterCondition,
    paramName: string,
  ): void {
    const field = `contact.${condition.field}`;

    switch (condition.operator) {
      case 'equals':
        qb.andWhere(`${field} = :${paramName}`, { [paramName]: condition.value });
        break;

      case 'notEquals':
        qb.andWhere(`${field} != :${paramName}`, { [paramName]: condition.value });
        break;

      case 'contains':
        qb.andWhere(`${field} ILIKE :${paramName}`, { [paramName]: `%${condition.value}%` });
        break;

      case 'notContains':
        qb.andWhere(`${field} NOT ILIKE :${paramName}`, { [paramName]: `%${condition.value}%` });
        break;

      case 'greaterThan':
        qb.andWhere(`${field} > :${paramName}`, { [paramName]: condition.value });
        break;

      case 'lessThan':
        qb.andWhere(`${field} < :${paramName}`, { [paramName]: condition.value });
        break;

      case 'between':
        if (condition.values && condition.values.length === 2) {
          qb.andWhere(`${field} BETWEEN :${paramName}Start AND :${paramName}End`, {
            [`${paramName}Start`]: condition.values[0],
            [`${paramName}End`]: condition.values[1],
          });
        }
        break;

      case 'in':
        if (condition.values && condition.values.length > 0) {
          qb.andWhere(`${field} IN (:...${paramName})`, { [paramName]: condition.values });
        }
        break;

      case 'notIn':
        if (condition.values && condition.values.length > 0) {
          qb.andWhere(`${field} NOT IN (:...${paramName})`, { [paramName]: condition.values });
        }
        break;

      case 'isNull':
        qb.andWhere(`${field} IS NULL`);
        break;

      case 'isNotNull':
        qb.andWhere(`${field} IS NOT NULL`);
        break;

      default:
        throw new BadRequestException(`Unknown operator: ${condition.operator}`);
    }
  }

  /**
   * Apply saved filter to contacts and return results
   */
  async applyFilterToContacts(
    filterId: string,
    userId: string,
    tenantId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ data: Contact[]; total: number; page: number; limit: number }> {
    const filter = await this.findOne(filterId, userId, tenantId);

    const query = this.contactRepository
      .createQueryBuilder('contact')
      .where('contact.tenantId = :tenantId', { tenantId })
      .leftJoinAndSelect('contact.tags', 'tags')
      .orderBy('contact.createdAt', 'DESC');

    this.applyFilterToContactQuery(query, filter.filterConfig);

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
