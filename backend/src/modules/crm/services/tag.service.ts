import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../contact.entity';
import { CreateTagDto, UpdateTagDto } from '../dto/tag.dto';

@Injectable()
export class TagService {
  private readonly logger = new Logger(TagService.name);

  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  /**
   * Create a new tag
   */
  async create(createTagDto: CreateTagDto, tenantId: string): Promise<Tag> {
    // Check for duplicate name
    const existing = await this.tagRepository.findOne({
      where: { name: createTagDto.name, tenantId },
    });

    if (existing) {
      throw new ConflictException('Tag with this name already exists');
    }

    const tag = this.tagRepository.create({
      ...createTagDto,
      tenantId,
    });

    const saved = await this.tagRepository.save(tag);

    this.logger.log(`Created tag ${saved.id} (${saved.name})`);

    return saved;
  }

  /**
   * Find all tags
   */
  async findAll(tenantId: string): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
  }

  /**
   * Find one tag by ID
   */
  async findOne(id: string, tenantId: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id, tenantId },
      relations: ['contacts'],
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return tag;
  }

  /**
   * Update tag
   */
  async update(
    id: string,
    updateTagDto: UpdateTagDto,
    tenantId: string,
  ): Promise<Tag> {
    const tag = await this.findOne(id, tenantId);

    // Check for name conflict
    if (updateTagDto.name && updateTagDto.name !== tag.name) {
      const existing = await this.tagRepository.findOne({
        where: { name: updateTagDto.name, tenantId },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Tag with this name already exists');
      }
    }

    Object.assign(tag, updateTagDto);

    return this.tagRepository.save(tag);
  }

  /**
   * Delete tag
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const tag = await this.findOne(id, tenantId);
    await this.tagRepository.softRemove(tag);
    this.logger.log(`Deleted tag ${id} (${tag.name})`);
  }
}
