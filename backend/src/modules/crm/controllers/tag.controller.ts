import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
import { TagService } from '../services/tag.service';
import { Tag } from '../contact.entity';
import { CreateTagDto, UpdateTagDto } from '../dto/tag.dto';

@ApiTags('Tags')
@Controller('crm/tags')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @ApiOperation({ summary: 'Create new tag' })
  @ApiResponse({ status: 201, description: 'Tag created successfully' })
  async create(
    @Body() createTagDto: CreateTagDto,
    @CurrentUser() user: any,
  ): Promise<Tag> {
    return this.tagService.create(createTagDto, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({ status: 200, description: 'List of tags' })
  async findAll(@CurrentUser() user: any): Promise<Tag[]> {
    return this.tagService.findAll(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({ status: 200, description: 'Tag details' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Tag> {
    return this.tagService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({ status: 200, description: 'Tag updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
    @CurrentUser() user: any,
  ): Promise<Tag> {
    return this.tagService.update(id, updateTagDto, user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({ status: 200, description: 'Tag deleted successfully' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    await this.tagService.remove(id, user.tenantId);
    return { message: 'Tag deleted successfully' };
  }
}
