import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import type { GeneratePresignedUrlDto } from './file-upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetTenant } from '../../common/decorators/get-tenant.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

@ApiTags('File Upload')
@ApiBearerAuth()
@Controller('files')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  /**
   * Upload file directly
   */
  @Post('upload')
  @RequirePermissions('funnel:create') // Basic permission for file uploads
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async upload(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('resourceType') resourceType?: string,
    @Body('resourceId') resourceId?: string,
    @Body('isPublic') isPublic?: string,
    @Body('expiresIn') expiresIn?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File too large (max 100MB)');
    }

    const uploadedFile = await this.fileUploadService.uploadFile(tenantId, userId, {
      file,
      resourceType,
      resourceId,
      isPublic: isPublic === 'true',
      expiresIn: expiresIn ? parseInt(expiresIn) : undefined,
    });

    return {
      success: true,
      data: uploadedFile,
      message: 'File uploaded successfully',
    };
  }

  /**
   * Generate presigned URL for client-side upload
   */
  @Post('presigned-url')
  @RequirePermissions('funnel:create')
  @ApiOperation({ summary: 'Generate presigned upload URL' })
  @ApiResponse({ status: 201, description: 'Presigned URL generated' })
  async generatePresignedUrl(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Body() dto: GeneratePresignedUrlDto,
  ) {
    // Validate file size
    const maxSize = 100 * 1024 * 1024;
    if (dto.size > maxSize) {
      throw new BadRequestException('File too large (max 100MB)');
    }

    const result = await this.fileUploadService.generatePresignedUploadUrl(
      tenantId,
      userId,
      dto,
    );

    return {
      success: true,
      data: result,
      message: 'Upload URL generated',
    };
  }

  /**
   * Confirm presigned upload completion
   */
  @Post(':fileId/confirm')
  @RequirePermissions('funnel:create')
  @ApiOperation({ summary: 'Confirm upload completion' })
  @ApiResponse({ status: 200, description: 'Upload confirmed' })
  async confirmUpload(@GetTenant() tenantId: string, @Param('fileId') fileId: string) {
    const file = await this.fileUploadService.confirmUpload(tenantId, fileId);

    return {
      success: true,
      data: file,
      message: 'Upload confirmed',
    };
  }

  /**
   * Get file by ID
   */
  @Get(':fileId')
  @RequirePermissions('funnel:read')
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiResponse({ status: 200, description: 'File details' })
  async getFile(@GetTenant() tenantId: string, @Param('fileId') fileId: string) {
    const file = await this.fileUploadService.findOne(tenantId, fileId);

    return {
      success: true,
      data: file,
    };
  }

  /**
   * Get download URL for file
   */
  @Get(':fileId/download')
  @RequirePermissions('funnel:read')
  @ApiOperation({ summary: 'Get download URL' })
  @ApiResponse({ status: 200, description: 'Download URL generated' })
  async getDownloadUrl(
    @GetTenant() tenantId: string,
    @Param('fileId') fileId: string,
    @Query('expiresIn') expiresIn?: string,
  ) {
    const url = await this.fileUploadService.getDownloadUrl(
      tenantId,
      fileId,
      expiresIn ? parseInt(expiresIn) : 3600,
    );

    return {
      success: true,
      data: { url },
    };
  }

  /**
   * Get all files
   */
  @Get()
  @RequirePermissions('funnel:read')
  @ApiOperation({ summary: 'Get all files' })
  @ApiResponse({ status: 200, description: 'List of files' })
  async getFiles(@GetTenant() tenantId: string, @Query('limit') limit?: string) {
    const files = await this.fileUploadService.findAll(
      tenantId,
      limit ? parseInt(limit) : 50,
    );

    return {
      success: true,
      data: files,
      total: files.length,
    };
  }

  /**
   * Get files by resource
   */
  @Get('resource/:resourceType/:resourceId')
  @RequirePermissions('funnel:read')
  @ApiOperation({ summary: 'Get files by resource' })
  @ApiResponse({ status: 200, description: 'Files for resource' })
  async getFilesByResource(
    @GetTenant() tenantId: string,
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
  ) {
    const files = await this.fileUploadService.findByResource(
      tenantId,
      resourceType,
      resourceId,
    );

    return {
      success: true,
      data: files,
      total: files.length,
    };
  }

  /**
   * Delete file
   */
  @Delete(':fileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('funnel:delete')
  @ApiOperation({ summary: 'Delete file' })
  @ApiResponse({ status: 204, description: 'File deleted' })
  async deleteFile(
    @GetTenant() tenantId: string,
    @GetUser() userId: string,
    @Param('fileId') fileId: string,
  ) {
    await this.fileUploadService.deleteFile(tenantId, userId, fileId);
  }
}
