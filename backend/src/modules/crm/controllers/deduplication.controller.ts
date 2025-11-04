import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { DeduplicationService, DuplicateGroup, MergeContactsDto } from '../services/deduplication.service';
import { Contact } from '../contact.entity';

@ApiTags('Contact Deduplication')
@Controller('crm/deduplication')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DeduplicationController {
  constructor(private readonly deduplicationService: DeduplicationService) {}

  @Get('find-duplicates')
  @ApiOperation({ summary: 'Find potential duplicate contacts' })
  @ApiResponse({ status: 200, description: 'Duplicate groups retrieved successfully' })
  async findDuplicates(@CurrentUser() user?: any): Promise<DuplicateGroup[]> {
    return this.deduplicationService.findDuplicates(user.tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get duplicate statistics' })
  @ApiResponse({ status: 200, description: 'Duplicate stats retrieved successfully' })
  async getStats(
    @CurrentUser() user?: any,
  ): Promise<{ totalDuplicateGroups: number; totalDuplicateContacts: number; byConfidence: any }> {
    return this.deduplicationService.getDuplicateStats(user.tenantId);
  }

  @Post('merge')
  @ApiOperation({ summary: 'Merge duplicate contacts' })
  @ApiResponse({ status: 200, description: 'Contacts merged successfully' })
  async merge(
    @Body() mergeDto: MergeContactsDto,
    @CurrentUser() user?: any,
  ): Promise<Contact> {
    return this.deduplicationService.mergeContacts(mergeDto, user.tenantId);
  }
}
