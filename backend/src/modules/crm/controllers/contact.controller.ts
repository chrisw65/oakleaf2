import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ContactService } from '../services/contact.service';
import { ContactActivityService, CreateActivityDto, ActivityFilterDto } from '../services/contact-activity.service';
import { NoteService, CreateNoteDto, UpdateNoteDto, NoteFilterDto } from '../services/note.service';
import { Contact, ContactActivity } from '../contact.entity';
import { Note } from '../note.entity';
import {
  CreateContactDto,
  UpdateContactDto,
  ContactQueryDto,
  ImportContactsDto,
  AddNoteDto,
  AddTagsDto,
  RemoveTagsDto,
} from '../dto/contact.dto';

@ApiTags('Contacts')
@Controller('crm/contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ContactController {
  constructor(
    private readonly contactService: ContactService,
    private readonly activityService: ContactActivityService,
    private readonly noteService: NoteService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new contact' })
  @ApiResponse({ status: 201, description: 'Contact created successfully' })
  @ApiResponse({ status: 409, description: 'Contact with email already exists' })
  async create(
    @Body() createContactDto: CreateContactDto,
    @CurrentUser() user: any,
  ): Promise<Contact> {
    return this.contactService.create(createContactDto, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contacts with filters' })
  @ApiResponse({ status: 200, description: 'List of contacts' })
  async findAll(
    @Query() queryDto: ContactQueryDto,
    @CurrentUser() user: any,
  ): Promise<{ data: Contact[]; total: number; page: number; limit: number }> {
    return this.contactService.findAll(queryDto, user.tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get contact statistics' })
  @ApiResponse({ status: 200, description: 'Contact statistics' })
  async getStats(@CurrentUser() user: any): Promise<any> {
    return this.contactService.getStats(user.tenantId);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import contacts from CSV' })
  @ApiResponse({ status: 201, description: 'Contacts imported successfully' })
  async importCsv(
    @Body() importDto: ImportContactsDto,
    @CurrentUser() user: any,
  ): Promise<{ imported: number; skipped: number; errors: string[] }> {
    return this.contactService.importFromCsv(importDto, user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact by ID' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: 200, description: 'Contact details' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Contact> {
    return this.contactService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update contact' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: 200, description: 'Contact updated successfully' })
  @ApiResponse({ status: 404, description: 'Contact not found' })
  async update(
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
    @CurrentUser() user: any,
  ): Promise<Contact> {
    return this.contactService.update(id, updateContactDto, user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete contact' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: 200, description: 'Contact deleted successfully' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    await this.contactService.remove(id, user.tenantId);
    return { message: 'Contact deleted successfully' };
  }

  @Post(':id/tags')
  @ApiOperation({ summary: 'Add tags to contact' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: 200, description: 'Tags added successfully' })
  async addTags(
    @Param('id') id: string,
    @Body() addTagsDto: AddTagsDto,
    @CurrentUser() user: any,
  ): Promise<Contact> {
    return this.contactService.addTags(id, addTagsDto.tagIds, user.tenantId);
  }

  @Delete(':id/tags')
  @ApiOperation({ summary: 'Remove tags from contact' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: 200, description: 'Tags removed successfully' })
  async removeTags(
    @Param('id') id: string,
    @Body() removeTagsDto: RemoveTagsDto,
    @CurrentUser() user: any,
  ): Promise<Contact> {
    return this.contactService.removeTags(id, removeTagsDto.tagIds, user.tenantId);
  }

  @Post(':id/subscribe')
  @ApiOperation({ summary: 'Subscribe contact' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: 200, description: 'Contact subscribed successfully' })
  async subscribe(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Contact> {
    return this.contactService.subscribe(id, user.tenantId);
  }

  @Post(':id/unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe contact' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: 200, description: 'Contact unsubscribed successfully' })
  async unsubscribe(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Contact> {
    return this.contactService.unsubscribe(id, user.tenantId);
  }

  @Put(':id/score')
  @ApiOperation({ summary: 'Update contact lead score' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: 200, description: 'Score updated successfully' })
  async updateScore(
    @Param('id') id: string,
    @Body('score') score: number,
    @CurrentUser() user: any,
  ): Promise<Contact> {
    return this.contactService.updateScore(id, score, user.tenantId);
  }

  // ========== ACTIVITY ENDPOINTS ==========

  @Get(':id/activities')
  @ApiOperation({ summary: 'Get contact activity timeline' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: 200, description: 'List of contact activities' })
  async getActivities(
    @Param('id') contactId: string,
    @Query('activityType') activityType?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @CurrentUser() user?: any,
  ): Promise<{ data: ContactActivity[]; total: number; page: number; limit: number }> {
    const filters: ActivityFilterDto = {
      activityType,
      page: page ? parseInt(page.toString(), 10) : 1,
      limit: limit ? parseInt(limit.toString(), 10) : 50,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    };

    return this.activityService.findByContact(contactId, user.tenantId, filters);
  }

  @Post(':id/activities')
  @ApiOperation({ summary: 'Add activity to contact' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: 201, description: 'Activity created successfully' })
  async createActivity(
    @Param('id') contactId: string,
    @Body() createActivityDto: CreateActivityDto,
    @CurrentUser() user: any,
  ): Promise<ContactActivity> {
    return this.activityService.create(
      {
        ...createActivityDto,
        contactId,
        userId: user.id,
      },
      user.tenantId,
    );
  }

  @Get(':id/activities/stats')
  @ApiOperation({ summary: 'Get contact activity statistics' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: 200, description: 'Activity statistics' })
  async getActivityStats(
    @Param('id') contactId: string,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.activityService.getContactActivityStats(contactId, user.tenantId);
  }

  @Delete('activities/:activityId')
  @ApiOperation({ summary: 'Delete an activity' })
  @ApiParam({ name: 'activityId', description: 'Activity ID' })
  @ApiResponse({ status: 200, description: 'Activity deleted successfully' })
  async deleteActivity(
    @Param('activityId') activityId: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    await this.activityService.remove(activityId, user.tenantId);
    return { message: 'Activity deleted successfully' };
  }

  // ========== NOTE ENDPOINTS ==========

  @Get(':id/notes')
  @ApiOperation({ summary: 'Get contact notes' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: 200, description: 'List of notes' })
  async getNotes(
    @Param('id') contactId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('noteType') noteType?: string,
    @Query('pinnedOnly') pinnedOnly?: boolean,
    @CurrentUser() user?: any,
  ): Promise<{ data: Note[]; total: number; page: number; limit: number }> {
    const filters: NoteFilterDto = {
      contactId,
      page: page ? parseInt(page.toString(), 10) : 1,
      limit: limit ? parseInt(limit.toString(), 10) : 50,
      noteType,
      pinnedOnly,
    };

    return this.noteService.findAll(filters, user.tenantId);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add note to contact' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: 201, description: 'Note created successfully' })
  async createNote(
    @Param('id') contactId: string,
    @Body() createNoteDto: CreateNoteDto,
    @CurrentUser() user: any,
  ): Promise<Note> {
    return this.noteService.create(
      {
        ...createNoteDto,
        contactId,
      },
      user.id,
      user.tenantId,
    );
  }

  @Get(':id/notes/stats')
  @ApiOperation({ summary: 'Get contact note statistics' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({ status: 200, description: 'Note statistics' })
  async getNoteStats(
    @Param('id') contactId: string,
    @CurrentUser() user: any,
  ): Promise<any> {
    return this.noteService.getContactNoteStats(contactId, user.tenantId);
  }

  @Put('notes/:noteId')
  @ApiOperation({ summary: 'Update a note' })
  @ApiParam({ name: 'noteId', description: 'Note ID' })
  @ApiResponse({ status: 200, description: 'Note updated successfully' })
  async updateNote(
    @Param('noteId') noteId: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @CurrentUser() user: any,
  ): Promise<Note> {
    return this.noteService.update(noteId, updateNoteDto, user.id, user.tenantId);
  }

  @Delete('notes/:noteId')
  @ApiOperation({ summary: 'Delete a note' })
  @ApiParam({ name: 'noteId', description: 'Note ID' })
  @ApiResponse({ status: 200, description: 'Note deleted successfully' })
  async deleteNote(
    @Param('noteId') noteId: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    await this.noteService.remove(noteId, user.id, user.tenantId);
    return { message: 'Note deleted successfully' };
  }

  @Post('notes/:noteId/toggle-pin')
  @ApiOperation({ summary: 'Toggle note pin status' })
  @ApiParam({ name: 'noteId', description: 'Note ID' })
  @ApiResponse({ status: 200, description: 'Note pin status toggled' })
  async toggleNotePin(
    @Param('noteId') noteId: string,
    @CurrentUser() user: any,
  ): Promise<Note> {
    return this.noteService.togglePin(noteId, user.id, user.tenantId);
  }
}
