import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FunnelService } from './funnel.service';
import { CreateFunnelDto, UpdateFunnelDto, CloneFunnelDto } from './dto/funnel.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FunnelStatus } from './funnel.entity';

@ApiTags('funnels')
@ApiBearerAuth('JWT-auth')
@Controller('funnels')
export class FunnelController {
  constructor(private readonly funnelService: FunnelService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new funnel' })
  async create(
    @Body() createFunnelDto: CreateFunnelDto,
    @CurrentUser() user: any,
  ) {
    return this.funnelService.create(createFunnelDto, user.tenantId, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all funnels' })
  async findAll(
    @CurrentUser() user: any,
    @Query('status') status?: FunnelStatus,
  ) {
    return this.funnelService.findAll(user.tenantId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get funnel by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.funnelService.findOne(id, user.tenantId);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get funnel by slug' })
  async findBySlug(@Param('slug') slug: string, @CurrentUser() user: any) {
    return this.funnelService.findBySlug(slug, user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update funnel' })
  async update(
    @Param('id') id: string,
    @Body() updateFunnelDto: UpdateFunnelDto,
    @CurrentUser() user: any,
  ) {
    return this.funnelService.update(id, updateFunnelDto, user.tenantId);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish funnel' })
  async publish(@Param('id') id: string, @CurrentUser() user: any) {
    return this.funnelService.publish(id, user.tenantId);
  }

  @Post(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpublish funnel' })
  async unpublish(@Param('id') id: string, @CurrentUser() user: any) {
    return this.funnelService.unpublish(id, user.tenantId);
  }

  @Post(':id/clone')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Clone funnel' })
  async clone(
    @Param('id') id: string,
    @Body() cloneFunnelDto: CloneFunnelDto,
    @CurrentUser() user: any,
  ) {
    return this.funnelService.clone(id, cloneFunnelDto, user.tenantId, user.id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get funnel statistics' })
  async getStats(@Param('id') id: string, @CurrentUser() user: any) {
    return this.funnelService.getStats(id, user.tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete funnel' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.funnelService.remove(id, user.tenantId);
  }
}
