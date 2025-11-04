import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { SearchService, GlobalSearchResults } from '../services/search.service';
import { Contact } from '../contact.entity';

@ApiTags('Search')
@Controller('crm/search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('global')
  @ApiOperation({ summary: 'Global search across all CRM entities' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, description: 'Results per type' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async globalSearch(
    @Query('q') query: string,
    @Query('limit') limit?: number,
    @CurrentUser() user?: any,
  ): Promise<GlobalSearchResults> {
    return this.searchService.globalSearch(
      query,
      user.tenantId,
      limit ? parseInt(limit.toString(), 10) : 10,
    );
  }

  @Get('contacts')
  @ApiOperation({ summary: 'Search contacts' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Contact search results retrieved successfully' })
  async searchContacts(
    @Query('q') query: string,
    @Query('limit') limit?: number,
    @CurrentUser() user?: any,
  ): Promise<{ data: Contact[]; total: number }> {
    return this.searchService.searchContacts(
      query,
      user.tenantId,
      limit ? parseInt(limit.toString(), 10) : 50,
    );
  }
}
