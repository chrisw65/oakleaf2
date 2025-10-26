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
import { Contact } from '../contact.entity';
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
@Controller('contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

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
}
