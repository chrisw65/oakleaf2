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
import { OpportunityService } from '../services/opportunity.service';
import { Opportunity } from '../opportunity.entity';
import {
  CreateOpportunityDto,
  UpdateOpportunityDto,
  MoveOpportunityDto,
  WinOpportunityDto,
  LoseOpportunityDto,
  OpportunityQueryDto,
} from '../dto/opportunity.dto';

@ApiTags('Opportunities')
@Controller('opportunities')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OpportunityController {
  constructor(private readonly opportunityService: OpportunityService) {}

  @Post()
  @ApiOperation({ summary: 'Create new opportunity' })
  @ApiResponse({ status: 201, description: 'Opportunity created successfully' })
  async create(
    @Body() createOpportunityDto: CreateOpportunityDto,
    @CurrentUser() user: any,
  ): Promise<Opportunity> {
    return this.opportunityService.create(createOpportunityDto, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all opportunities with filters' })
  @ApiResponse({ status: 200, description: 'List of opportunities' })
  async findAll(
    @Query() queryDto: OpportunityQueryDto,
    @CurrentUser() user: any,
  ): Promise<{ data: Opportunity[]; total: number; page: number; limit: number }> {
    return this.opportunityService.findAll(queryDto, user.tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get opportunity statistics' })
  @ApiResponse({ status: 200, description: 'Opportunity statistics' })
  async getStats(@CurrentUser() user: any): Promise<any> {
    return this.opportunityService.getStats(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get opportunity by ID' })
  @ApiParam({ name: 'id', description: 'Opportunity ID' })
  @ApiResponse({ status: 200, description: 'Opportunity details' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Opportunity> {
    return this.opportunityService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update opportunity' })
  @ApiParam({ name: 'id', description: 'Opportunity ID' })
  @ApiResponse({ status: 200, description: 'Opportunity updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateOpportunityDto: UpdateOpportunityDto,
    @CurrentUser() user: any,
  ): Promise<Opportunity> {
    return this.opportunityService.update(id, updateOpportunityDto, user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete opportunity' })
  @ApiParam({ name: 'id', description: 'Opportunity ID' })
  @ApiResponse({ status: 200, description: 'Opportunity deleted successfully' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    await this.opportunityService.remove(id, user.tenantId);
    return { message: 'Opportunity deleted successfully' };
  }

  @Post(':id/move')
  @ApiOperation({ summary: 'Move opportunity to different stage' })
  @ApiParam({ name: 'id', description: 'Opportunity ID' })
  @ApiResponse({ status: 200, description: 'Opportunity moved successfully' })
  async move(
    @Param('id') id: string,
    @Body() moveDto: MoveOpportunityDto,
    @CurrentUser() user: any,
  ): Promise<Opportunity> {
    return this.opportunityService.move(id, moveDto, user.tenantId);
  }

  @Post(':id/win')
  @ApiOperation({ summary: 'Mark opportunity as won' })
  @ApiParam({ name: 'id', description: 'Opportunity ID' })
  @ApiResponse({ status: 200, description: 'Opportunity marked as won' })
  async win(
    @Param('id') id: string,
    @Body() winDto: WinOpportunityDto,
    @CurrentUser() user: any,
  ): Promise<Opportunity> {
    return this.opportunityService.win(id, winDto, user.tenantId);
  }

  @Post(':id/lose')
  @ApiOperation({ summary: 'Mark opportunity as lost' })
  @ApiParam({ name: 'id', description: 'Opportunity ID' })
  @ApiResponse({ status: 200, description: 'Opportunity marked as lost' })
  async lose(
    @Param('id') id: string,
    @Body() loseDto: LoseOpportunityDto,
    @CurrentUser() user: any,
  ): Promise<Opportunity> {
    return this.opportunityService.lose(id, loseDto, user.tenantId);
  }
}
