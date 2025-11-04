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
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { FilterService, CreateFilterDto, UpdateFilterDto } from '../services/filter.service';
import { SavedFilter } from '../saved-filter.entity';
import { Contact } from '../contact.entity';

@ApiTags('Saved Filters')
@Controller('crm/filters')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilterController {
  constructor(private readonly filterService: FilterService) {}

  @Post()
  @ApiOperation({ summary: 'Create a saved filter' })
  @ApiResponse({ status: 201, description: 'Filter created successfully' })
  async create(
    @Body() createDto: CreateFilterDto,
    @CurrentUser() user?: any,
  ): Promise<SavedFilter> {
    return this.filterService.create(createDto, user.id, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all saved filters for entity type' })
  @ApiQuery({ name: 'entityType', required: true, description: 'Entity type (contact, opportunity, task)' })
  @ApiResponse({ status: 200, description: 'Filters retrieved successfully' })
  async findAll(
    @Query('entityType') entityType: string,
    @CurrentUser() user?: any,
  ): Promise<SavedFilter[]> {
    return this.filterService.findAll(entityType, user.id, user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a saved filter by ID' })
  @ApiParam({ name: 'id', description: 'Filter ID' })
  @ApiResponse({ status: 200, description: 'Filter retrieved successfully' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user?: any,
  ): Promise<SavedFilter> {
    return this.filterService.findOne(id, user.id, user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a saved filter' })
  @ApiParam({ name: 'id', description: 'Filter ID' })
  @ApiResponse({ status: 200, description: 'Filter updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateFilterDto,
    @CurrentUser() user?: any,
  ): Promise<SavedFilter> {
    return this.filterService.update(id, updateDto, user.id, user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a saved filter' })
  @ApiParam({ name: 'id', description: 'Filter ID' })
  @ApiResponse({ status: 200, description: 'Filter deleted successfully' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user?: any,
  ): Promise<{ message: string }> {
    await this.filterService.remove(id, user.id, user.tenantId);
    return { message: 'Filter deleted successfully' };
  }

  @Post(':id/apply')
  @ApiOperation({ summary: 'Apply a saved filter to contacts' })
  @ApiParam({ name: 'id', description: 'Filter ID' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Filter applied successfully' })
  async applyFilter(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @CurrentUser() user?: any,
  ): Promise<{ data: Contact[]; total: number; page: number; limit: number }> {
    return this.filterService.applyFilterToContacts(
      id,
      user.id,
      user.tenantId,
      page ? parseInt(page.toString(), 10) : 1,
      limit ? parseInt(limit.toString(), 10) : 50,
    );
  }
}
