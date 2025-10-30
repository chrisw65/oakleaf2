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
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

interface AuthRequest extends Request {
  user: {
    userId: string;
    tenantId: string;
    email: string;
  };
}
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PageBuilderService } from '../services/page-builder.service';
import { TemplateLibraryService } from '../services/template-library.service';
import { MediaLibraryService } from '../services/media-library.service';
import { FormBuilderService } from '../services/form-builder.service';
import { PopupBuilderService } from '../services/popup-builder.service';
import { ThemeService } from '../services/theme.service';
import {
  CreatePageElementDto,
  UpdatePageElementDto,
  DuplicatePageElementDto,
  ReorderPageElementsDto,
} from '../dto/page-element.dto';
import {
  CreatePageBlockDto,
  UpdatePageBlockDto,
  AddBlockToPageDto,
} from '../dto/page-block.dto';
import {
  CreateTemplateCategoryDto,
  UpdateTemplateCategoryDto,
  CreateTemplateReviewDto,
  UpdateTemplateReviewDto,
  SaveFunnelAsTemplateDto,
  CloneTemplateDto,
} from '../dto/template-library.dto';
import {
  CreateMediaAssetDto,
  UpdateMediaAssetDto,
  MediaAssetQueryDto,
} from '../dto/media-asset.dto';
import {
  CreatePageFormDto,
  UpdatePageFormDto,
  SubmitFormDto,
} from '../dto/page-form.dto';
import {
  CreatePagePopupDto,
  UpdatePagePopupDto,
} from '../dto/page-popup.dto';
import {
  CreatePageThemeDto,
  UpdatePageThemeDto,
  ApplyThemeDto,
} from '../dto/page-theme.dto';

@ApiTags('Page Builder')
@Controller('funnels/page-builder')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PageBuilderController {
  constructor(
    private readonly pageBuilderService: PageBuilderService,
    private readonly templateLibraryService: TemplateLibraryService,
    private readonly mediaLibraryService: MediaLibraryService,
    private readonly formBuilderService: FormBuilderService,
    private readonly popupBuilderService: PopupBuilderService,
    private readonly themeService: ThemeService,
  ) {}

  // ==================== Page Elements ====================

  @Post('elements')
  @ApiOperation({ summary: 'Create page element' })
  async createElement(@Req() req: AuthRequest, @Body() dto: CreatePageElementDto) {
    return this.pageBuilderService.createElement(req.user.tenantId, dto);
  }

  @Put('elements/:id')
  @ApiOperation({ summary: 'Update page element' })
  async updateElement(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdatePageElementDto,
  ) {
    return this.pageBuilderService.updateElement(req.user.tenantId, id, dto);
  }

  @Delete('elements/:id')
  @ApiOperation({ summary: 'Delete page element' })
  async deleteElement(@Req() req: AuthRequest, @Param('id') id: string) {
    await this.pageBuilderService.deleteElement(req.user.tenantId, id);
    return { message: 'Element deleted successfully' };
  }

  @Get('elements/:id')
  @ApiOperation({ summary: 'Get page element' })
  async getElement(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.pageBuilderService.getElement(req.user.tenantId, id);
  }

  @Get('pages/:pageId/elements')
  @ApiOperation({ summary: 'Get all elements for a page' })
  async getPageElements(@Req() req: AuthRequest, @Param('pageId') pageId: string) {
    return this.pageBuilderService.getPageElements(req.user.tenantId, pageId);
  }

  @Post('elements/duplicate')
  @ApiOperation({ summary: 'Duplicate page element' })
  async duplicateElement(@Req() req: AuthRequest, @Body() dto: DuplicatePageElementDto) {
    return this.pageBuilderService.duplicateElement(req.user.tenantId, dto);
  }

  @Post('pages/:pageId/elements/reorder')
  @ApiOperation({ summary: 'Reorder page elements' })
  async reorderElements(
    @Req() req: AuthRequest,
    @Param('pageId') pageId: string,
    @Body() dto: ReorderPageElementsDto,
  ) {
    return this.pageBuilderService.reorderElements(req.user.tenantId, pageId, dto);
  }

  // ==================== Page Blocks ====================

  @Post('blocks')
  @ApiOperation({ summary: 'Create page block' })
  async createBlock(@Req() req: AuthRequest, @Body() dto: CreatePageBlockDto) {
    return this.pageBuilderService.createBlock(req.user.tenantId, dto);
  }

  @Put('blocks/:id')
  @ApiOperation({ summary: 'Update page block' })
  async updateBlock(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdatePageBlockDto,
  ) {
    return this.pageBuilderService.updateBlock(req.user.tenantId, id, dto);
  }

  @Delete('blocks/:id')
  @ApiOperation({ summary: 'Delete page block' })
  async deleteBlock(@Req() req: AuthRequest, @Param('id') id: string) {
    await this.pageBuilderService.deleteBlock(req.user.tenantId, id);
    return { message: 'Block deleted successfully' };
  }

  @Get('blocks')
  @ApiOperation({ summary: 'Get all blocks' })
  async getBlocks(@Req() req: AuthRequest, @Query('category') category?: string) {
    return this.pageBuilderService.getBlocks(req.user.tenantId, category);
  }

  @Get('blocks/:id')
  @ApiOperation({ summary: 'Get page block' })
  async getBlock(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.pageBuilderService.getBlock(req.user.tenantId, id);
  }

  @Post('blocks/add-to-page')
  @ApiOperation({ summary: 'Add block to page' })
  async addBlockToPage(@Req() req: AuthRequest, @Body() dto: AddBlockToPageDto) {
    return this.pageBuilderService.addBlockToPage(req.user.tenantId, dto);
  }

  // ==================== Template Library ====================

  @Post('templates/categories')
  @ApiOperation({ summary: 'Create template category' })
  async createTemplateCategory(@Req() req: AuthRequest, @Body() dto: CreateTemplateCategoryDto) {
    return this.templateLibraryService.createCategory(req.user.tenantId, dto);
  }

  @Put('templates/categories/:id')
  @ApiOperation({ summary: 'Update template category' })
  async updateTemplateCategory(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateTemplateCategoryDto,
  ) {
    return this.templateLibraryService.updateCategory(req.user.tenantId, id, dto);
  }

  @Delete('templates/categories/:id')
  @ApiOperation({ summary: 'Delete template category' })
  async deleteTemplateCategory(@Req() req: AuthRequest, @Param('id') id: string) {
    await this.templateLibraryService.deleteCategory(req.user.tenantId, id);
    return { message: 'Category deleted successfully' };
  }

  @Get('templates/categories')
  @ApiOperation({ summary: 'Get all template categories' })
  async getTemplateCategories(@Req() req: AuthRequest) {
    return this.templateLibraryService.getCategories(req.user.tenantId);
  }

  @Post('templates/save-funnel')
  @ApiOperation({ summary: 'Save funnel as template' })
  async saveFunnelAsTemplate(@Req() req: AuthRequest, @Body() dto: SaveFunnelAsTemplateDto) {
    return this.templateLibraryService.saveFunnelAsTemplate(
      req.user.tenantId,
      req.user.userId,
      dto,
    );
  }

  @Post('templates/clone')
  @ApiOperation({ summary: 'Clone template to create funnel' })
  async cloneTemplate(@Req() req: AuthRequest, @Body() dto: CloneTemplateDto) {
    return this.templateLibraryService.cloneTemplate(req.user.tenantId, dto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all templates' })
  async getTemplates(@Req() req: AuthRequest, @Query('categoryId') categoryId?: string) {
    return this.templateLibraryService.getTemplates(req.user.tenantId, categoryId);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get template' })
  async getTemplate(@Param('id') id: string) {
    return this.templateLibraryService.getTemplate(id);
  }

  @Post('templates/:templateId/reviews')
  @ApiOperation({ summary: 'Create template review' })
  async createTemplateReview(
    @Req() req: AuthRequest,
    @Param('templateId') templateId: string,
    @Body() dto: CreateTemplateReviewDto,
  ) {
    return this.templateLibraryService.createReview(
      req.user.tenantId,
      req.user.userId,
      { ...dto, templateId },
    );
  }

  @Put('templates/reviews/:id')
  @ApiOperation({ summary: 'Update template review' })
  async updateTemplateReview(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateTemplateReviewDto,
  ) {
    return this.templateLibraryService.updateReview(
      req.user.tenantId,
      req.user.userId,
      id,
      dto,
    );
  }

  @Delete('templates/reviews/:id')
  @ApiOperation({ summary: 'Delete template review' })
  async deleteTemplateReview(@Req() req: AuthRequest, @Param('id') id: string) {
    await this.templateLibraryService.deleteReview(
      req.user.tenantId,
      req.user.userId,
      id,
    );
    return { message: 'Review deleted successfully' };
  }

  // ==================== Media Library ====================

  @Post('media')
  @ApiOperation({ summary: 'Upload media asset' })
  async createMediaAsset(@Req() req: AuthRequest, @Body() dto: CreateMediaAssetDto) {
    return this.mediaLibraryService.createAsset(
      req.user.tenantId,
      req.user.userId,
      dto,
    );
  }

  @Put('media/:id')
  @ApiOperation({ summary: 'Update media asset' })
  async updateMediaAsset(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateMediaAssetDto,
  ) {
    return this.mediaLibraryService.updateAsset(req.user.tenantId, id, dto);
  }

  @Delete('media/:id')
  @ApiOperation({ summary: 'Delete media asset' })
  async deleteMediaAsset(@Req() req: AuthRequest, @Param('id') id: string) {
    await this.mediaLibraryService.deleteAsset(req.user.tenantId, id);
    return { message: 'Asset deleted successfully' };
  }

  @Get('media')
  @ApiOperation({ summary: 'Get all media assets' })
  async getMediaAssets(@Req() req: AuthRequest, @Query() query: MediaAssetQueryDto) {
    return this.mediaLibraryService.getAssets(req.user.tenantId, query);
  }

  @Get('media/:id')
  @ApiOperation({ summary: 'Get media asset' })
  async getMediaAsset(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.mediaLibraryService.getAsset(req.user.tenantId, id);
  }

  @Get('media/folders/list')
  @ApiOperation({ summary: 'Get all folders' })
  async getMediaFolders(@Req() req: AuthRequest) {
    return this.mediaLibraryService.getFolders(req.user.tenantId);
  }

  @Get('media/tags/list')
  @ApiOperation({ summary: 'Get all tags' })
  async getMediaTags(@Req() req: AuthRequest) {
    return this.mediaLibraryService.getTags(req.user.tenantId);
  }

  // ==================== Form Builder ====================

  @Post('forms')
  @ApiOperation({ summary: 'Create form' })
  async createForm(@Req() req: AuthRequest, @Body() dto: CreatePageFormDto) {
    return this.formBuilderService.createForm(req.user.tenantId, dto);
  }

  @Put('forms/:id')
  @ApiOperation({ summary: 'Update form' })
  async updateForm(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdatePageFormDto,
  ) {
    return this.formBuilderService.updateForm(req.user.tenantId, id, dto);
  }

  @Delete('forms/:id')
  @ApiOperation({ summary: 'Delete form' })
  async deleteForm(@Req() req: AuthRequest, @Param('id') id: string) {
    await this.formBuilderService.deleteForm(req.user.tenantId, id);
    return { message: 'Form deleted successfully' };
  }

  @Get('forms')
  @ApiOperation({ summary: 'Get all forms' })
  async getForms(@Req() req: AuthRequest, @Query('pageId') pageId?: string) {
    return this.formBuilderService.getForms(req.user.tenantId, pageId);
  }

  @Get('forms/:id')
  @ApiOperation({ summary: 'Get form' })
  async getForm(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.formBuilderService.getForm(req.user.tenantId, id);
  }

  @Post('forms/submit')
  @ApiOperation({ summary: 'Submit form' })
  async submitForm(@Req() req: AuthRequest, @Body() dto: SubmitFormDto) {
    return this.formBuilderService.submitForm(req.user.tenantId, dto);
  }

  @Get('forms/:formId/submissions')
  @ApiOperation({ summary: 'Get form submissions' })
  async getFormSubmissions(@Req() req: AuthRequest, @Param('formId') formId: string) {
    return this.formBuilderService.getSubmissions(req.user.tenantId, formId);
  }

  @Get('forms/submissions/:id')
  @ApiOperation({ summary: 'Get form submission' })
  async getFormSubmission(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.formBuilderService.getSubmission(req.user.tenantId, id);
  }

  // ==================== Popup Builder ====================

  @Post('popups')
  @ApiOperation({ summary: 'Create popup' })
  async createPopup(@Req() req: AuthRequest, @Body() dto: CreatePagePopupDto) {
    return this.popupBuilderService.createPopup(req.user.tenantId, dto);
  }

  @Put('popups/:id')
  @ApiOperation({ summary: 'Update popup' })
  async updatePopup(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdatePagePopupDto,
  ) {
    return this.popupBuilderService.updatePopup(req.user.tenantId, id, dto);
  }

  @Delete('popups/:id')
  @ApiOperation({ summary: 'Delete popup' })
  async deletePopup(@Req() req: AuthRequest, @Param('id') id: string) {
    await this.popupBuilderService.deletePopup(req.user.tenantId, id);
    return { message: 'Popup deleted successfully' };
  }

  @Get('popups')
  @ApiOperation({ summary: 'Get all popups' })
  async getPopups(@Req() req: AuthRequest, @Query('pageId') pageId?: string) {
    return this.popupBuilderService.getPopups(req.user.tenantId, pageId);
  }

  @Get('popups/:id')
  @ApiOperation({ summary: 'Get popup' })
  async getPopup(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.popupBuilderService.getPopup(req.user.tenantId, id);
  }

  @Post('popups/:id/track-view')
  @ApiOperation({ summary: 'Track popup view' })
  async trackPopupView(@Req() req: AuthRequest, @Param('id') id: string) {
    await this.popupBuilderService.trackPopupView(req.user.tenantId, id);
    return { message: 'View tracked' };
  }

  @Post('popups/:id/track-conversion')
  @ApiOperation({ summary: 'Track popup conversion' })
  async trackPopupConversion(@Req() req: AuthRequest, @Param('id') id: string) {
    await this.popupBuilderService.trackPopupConversion(req.user.tenantId, id);
    return { message: 'Conversion tracked' };
  }

  // ==================== Themes ====================

  @Post('themes')
  @ApiOperation({ summary: 'Create theme' })
  async createTheme(@Req() req: AuthRequest, @Body() dto: CreatePageThemeDto) {
    return this.themeService.createTheme(req.user.tenantId, req.user.userId, dto);
  }

  @Put('themes/:id')
  @ApiOperation({ summary: 'Update theme' })
  async updateTheme(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdatePageThemeDto,
  ) {
    return this.themeService.updateTheme(req.user.tenantId, id, dto);
  }

  @Delete('themes/:id')
  @ApiOperation({ summary: 'Delete theme' })
  async deleteTheme(@Req() req: AuthRequest, @Param('id') id: string) {
    await this.themeService.deleteTheme(req.user.tenantId, id);
    return { message: 'Theme deleted successfully' };
  }

  @Get('themes')
  @ApiOperation({ summary: 'Get all themes' })
  async getThemes(@Req() req: AuthRequest, @Query('category') category?: string) {
    return this.themeService.getThemes(req.user.tenantId, category);
  }

  @Get('themes/:id')
  @ApiOperation({ summary: 'Get theme' })
  async getTheme(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.themeService.getTheme(req.user.tenantId, id);
  }

  @Post('themes/apply')
  @ApiOperation({ summary: 'Apply theme to funnel or page' })
  async applyTheme(@Req() req: AuthRequest, @Body() dto: ApplyThemeDto) {
    return this.themeService.applyTheme(req.user.tenantId, dto);
  }

  @Post('themes/:id/duplicate')
  @ApiOperation({ summary: 'Duplicate theme' })
  async duplicateTheme(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: { name: string },
  ) {
    return this.themeService.duplicateTheme(req.user.tenantId, id, body.name);
  }
}
