import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Note } from '../note.entity';
import { ContactActivityService } from './contact-activity.service';

export interface CreateNoteDto {
  content: string;
  noteType?: string;
  contactId?: string;
  opportunityId?: string;
  isPinned?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateNoteDto {
  content?: string;
  noteType?: string;
  isPinned?: boolean;
  metadata?: Record<string, any>;
}

export interface NoteFilterDto {
  contactId?: string;
  opportunityId?: string;
  noteType?: string;
  createdById?: string;
  page?: number;
  limit?: number;
  pinnedOnly?: boolean;
}

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
    private activityService: ContactActivityService,
  ) {}

  /**
   * Create a new note
   */
  async create(
    createNoteDto: CreateNoteDto,
    createdById: string,
    tenantId: string,
  ): Promise<Note> {
    // Ensure at least one relation is provided
    if (!createNoteDto.contactId && !createNoteDto.opportunityId) {
      throw new Error('Note must be attached to a contact or opportunity');
    }

    const note = this.noteRepository.create({
      ...createNoteDto,
      createdById,
      tenantId,
    });

    const savedNote = await this.noteRepository.save(note);

    // Log activity if attached to a contact
    if (savedNote.contactId) {
      try {
        await this.activityService.logNoteAdded(
          savedNote.contactId,
          savedNote.id,
          savedNote.content,
          createdById,
          tenantId,
        );
      } catch (error) {
        console.error('Failed to log note activity:', error);
      }
    }

    return savedNote;
  }

  /**
   * Find notes with filtering and pagination
   */
  async findAll(
    filters: NoteFilterDto,
    tenantId: string,
  ): Promise<{ data: Note[]; total: number; page: number; limit: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Note> = {
      tenantId,
    };

    if (filters.contactId) {
      where.contactId = filters.contactId;
    }

    if (filters.opportunityId) {
      where.opportunityId = filters.opportunityId;
    }

    if (filters.noteType) {
      where.noteType = filters.noteType;
    }

    if (filters.createdById) {
      where.createdById = filters.createdById;
    }

    if (filters.pinnedOnly) {
      where.isPinned = true;
    }

    const [data, total] = await this.noteRepository.findAndCount({
      where,
      relations: ['createdBy', 'contact', 'opportunity'],
      order: {
        isPinned: 'DESC', // Pinned notes first
        createdAt: 'DESC',
      },
      take: limit,
      skip,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Find a single note by ID
   */
  async findOne(id: string, tenantId: string): Promise<Note> {
    const note = await this.noteRepository.findOne({
      where: { id, tenantId },
      relations: ['createdBy', 'contact', 'opportunity'],
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  /**
   * Update a note
   */
  async update(
    id: string,
    updateNoteDto: UpdateNoteDto,
    userId: string,
    tenantId: string,
  ): Promise<Note> {
    const note = await this.findOne(id, tenantId);

    // Only the creator can edit the note
    if (note.createdById !== userId) {
      throw new ForbiddenException('You can only edit your own notes');
    }

    Object.assign(note, updateNoteDto);
    note.editedAt = new Date();

    return await this.noteRepository.save(note);
  }

  /**
   * Delete a note
   */
  async remove(id: string, userId: string, tenantId: string): Promise<void> {
    const note = await this.findOne(id, tenantId);

    // Only the creator can delete the note
    if (note.createdById !== userId) {
      throw new ForbiddenException('You can only delete your own notes');
    }

    await this.noteRepository.remove(note);
  }

  /**
   * Toggle pin status
   */
  async togglePin(id: string, userId: string, tenantId: string): Promise<Note> {
    const note = await this.findOne(id, tenantId);

    // Only the creator can pin/unpin
    if (note.createdById !== userId) {
      throw new ForbiddenException('You can only pin/unpin your own notes');
    }

    note.isPinned = !note.isPinned;
    return await this.noteRepository.save(note);
  }

  /**
   * Get notes statistics for a contact
   */
  async getContactNoteStats(contactId: string, tenantId: string): Promise<{
    total: number;
    pinned: number;
    byType: Record<string, number>;
    recentNotes: Note[];
  }> {
    const notes = await this.noteRepository.find({
      where: { contactId, tenantId },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });

    const byType: Record<string, number> = {};
    notes.forEach((note) => {
      const type = note.noteType || 'general';
      byType[type] = (byType[type] || 0) + 1;
    });

    return {
      total: notes.length,
      pinned: notes.filter((n) => n.isPinned).length,
      byType,
      recentNotes: notes.slice(0, 10),
    };
  }

  /**
   * Get notes statistics for an opportunity
   */
  async getOpportunityNoteStats(opportunityId: string, tenantId: string): Promise<{
    total: number;
    pinned: number;
    byType: Record<string, number>;
    recentNotes: Note[];
  }> {
    const notes = await this.noteRepository.find({
      where: { opportunityId, tenantId },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });

    const byType: Record<string, number> = {};
    notes.forEach((note) => {
      const type = note.noteType || 'general';
      byType[type] = (byType[type] || 0) + 1;
    });

    return {
      total: notes.length,
      pinned: notes.filter((n) => n.isPinned).length,
      byType,
      recentNotes: notes.slice(0, 10),
    };
  }

  /**
   * Search notes by content
   */
  async search(
    searchTerm: string,
    tenantId: string,
    filters?: Partial<NoteFilterDto>,
  ): Promise<Note[]> {
    const query = this.noteRepository
      .createQueryBuilder('note')
      .where('note.tenantId = :tenantId', { tenantId })
      .andWhere('note.content ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      })
      .leftJoinAndSelect('note.createdBy', 'createdBy')
      .leftJoinAndSelect('note.contact', 'contact')
      .leftJoinAndSelect('note.opportunity', 'opportunity')
      .orderBy('note.createdAt', 'DESC')
      .limit(50);

    if (filters?.contactId) {
      query.andWhere('note.contactId = :contactId', {
        contactId: filters.contactId,
      });
    }

    if (filters?.opportunityId) {
      query.andWhere('note.opportunityId = :opportunityId', {
        opportunityId: filters.opportunityId,
      });
    }

    return await query.getMany();
  }
}
