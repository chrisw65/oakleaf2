import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PageService } from './page.service';
import {
  CreatePageDto,
  UpdatePageDto,
  CreatePageVariantDto,
  ReorderPagesDto,
} from './dto/page.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('pages')
@ApiBearerAuth('JWT-auth')
@Controller('pages')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new page' })
  async create(@Body() createPageDto: CreatePageDto, @CurrentUser() user: any) {
    return this.pageService.create(createPageDto, user.tenantId);
  }

  @Get('funnel/:funnelId')
  @ApiOperation({ summary: 'Get all pages in a funnel' })
  async findAll(@Param('funnelId') funnelId: string, @CurrentUser() user: any) {
    return this.pageService.findAll(funnelId, user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get page by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.pageService.findOne(id, user.tenantId);
  }

  @Get('funnel/:funnelId/slug/:slug')
  @ApiOperation({ summary: 'Get page by slug' })
  async findBySlug(
    @Param('funnelId') funnelId: string,
    @Param('slug') slug: string,
    @CurrentUser() user: any,
  ) {
    return this.pageService.findBySlug(funnelId, slug, user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update page' })
  async update(
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
    @CurrentUser() user: any,
  ) {
    return this.pageService.update(id, updatePageDto, user.tenantId);
  }

  @Post('funnel/:funnelId/reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reorder pages in funnel' })
  async reorder(
    @Param('funnelId') funnelId: string,
    @Body() reorderDto: ReorderPagesDto,
    @CurrentUser() user: any,
  ) {
    return this.pageService.reorder(funnelId, reorderDto, user.tenantId);
  }

  @Post('variant')
  @ApiOperation({ summary: 'Create A/B test variant' })
  async createVariant(
    @Body() createVariantDto: CreatePageVariantDto,
    @CurrentUser() user: any,
  ) {
    return this.pageService.createVariant(createVariantDto, user.tenantId);
  }

  @Get(':id/variants')
  @ApiOperation({ summary: 'Get page variants for A/B testing' })
  async getVariants(@Param('id') id: string, @CurrentUser() user: any) {
    return this.pageService.getVariants(id, user.tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete page' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.pageService.remove(id, user.tenantId);
  }
}
