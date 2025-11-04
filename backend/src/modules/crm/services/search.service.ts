import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Contact } from '../contact.entity';
import { Opportunity } from '../opportunity.entity';
import { Task } from '../task.entity';

export interface SearchResult {
  type: 'contact' | 'opportunity' | 'task';
  id: string;
  title: string;
  subtitle?: string;
  score?: number;
  metadata?: Record<string, any>;
}

export interface GlobalSearchResults {
  contacts: SearchResult[];
  opportunities: SearchResult[];
  tasks: SearchResult[];
  total: number;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    @InjectRepository(Opportunity)
    private opportunityRepository: Repository<Opportunity>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  /**
   * Global search across all CRM entities
   */
  async globalSearch(query: string, tenantId: string, limit: number = 10): Promise<GlobalSearchResults> {
    if (!query || query.trim().length < 2) {
      return {
        contacts: [],
        opportunities: [],
        tasks: [],
        total: 0,
      };
    }

    const searchTerm = `%${query.trim()}%`;

    // Search contacts
    const contacts = await this.contactRepository
      .createQueryBuilder('contact')
      .where('contact.tenantId = :tenantId', { tenantId })
      .andWhere(
        '(contact.firstName ILIKE :search OR contact.lastName ILIKE :search OR contact.email ILIKE :search OR contact.company ILIKE :search OR contact.phone ILIKE :search)',
        { search: searchTerm },
      )
      .orderBy('contact.score', 'DESC')
      .limit(limit)
      .getMany();

    const contactResults: SearchResult[] = contacts.map(c => ({
      type: 'contact',
      id: c.id,
      title: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email,
      subtitle: c.company || c.email,
      score: c.score,
      metadata: {
        email: c.email,
        phone: c.phone,
        status: c.status,
      },
    }));

    // Search opportunities
    const opportunities = await this.opportunityRepository
      .createQueryBuilder('opportunity')
      .where('opportunity.tenantId = :tenantId', { tenantId })
      .andWhere('(opportunity.title ILIKE :search OR opportunity.description ILIKE :search)', {
        search: searchTerm,
      })
      .orderBy('opportunity.value', 'DESC')
      .limit(limit)
      .getMany();

    const opportunityResults: SearchResult[] = opportunities.map(o => ({
      type: 'opportunity',
      id: o.id,
      title: o.title,
      subtitle: o.value ? `$${o.value.toLocaleString()}` : undefined,
      metadata: {
        status: o.status,
        probability: o.probability,
        expectedCloseDate: o.expectedCloseDate,
      },
    }));

    // Search tasks
    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.tenantId = :tenantId', { tenantId })
      .andWhere('(task.title ILIKE :search OR task.description ILIKE :search)', { search: searchTerm })
      .orderBy('task.dueDate', 'ASC')
      .limit(limit)
      .getMany();

    const taskResults: SearchResult[] = tasks.map(t => ({
      type: 'task',
      id: t.id,
      title: t.title,
      subtitle: t.dueDate ? `Due: ${new Date(t.dueDate).toLocaleDateString()}` : undefined,
      metadata: {
        status: t.status,
        priority: t.priority,
        taskType: t.taskType,
      },
    }));

    return {
      contacts: contactResults,
      opportunities: opportunityResults,
      tasks: taskResults,
      total: contactResults.length + opportunityResults.length + taskResults.length,
    };
  }

  /**
   * Search contacts only (more detailed)
   */
  async searchContacts(
    query: string,
    tenantId: string,
    limit: number = 50,
  ): Promise<{ data: Contact[]; total: number }> {
    if (!query || query.trim().length < 2) {
      return { data: [], total: 0 };
    }

    const searchTerm = `%${query.trim()}%`;

    const [data, total] = await this.contactRepository
      .createQueryBuilder('contact')
      .where('contact.tenantId = :tenantId', { tenantId })
      .andWhere(
        '(contact.firstName ILIKE :search OR contact.lastName ILIKE :search OR contact.email ILIKE :search OR contact.company ILIKE :search OR contact.phone ILIKE :search OR contact.jobTitle ILIKE :search)',
        { search: searchTerm },
      )
      .leftJoinAndSelect('contact.tags', 'tags')
      .orderBy('contact.score', 'DESC')
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }
}
