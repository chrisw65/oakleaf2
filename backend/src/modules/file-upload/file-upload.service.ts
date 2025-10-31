import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import * as path from 'path';
import { File, FileType, FileStatus, StorageProvider } from './file.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-log.entity';

export interface UploadFileDto {
  file: Express.Multer.File;
  resourceType?: string;
  resourceId?: string;
  isPublic?: boolean;
  metadata?: Record<string, any>;
  expiresIn?: number; // Seconds until expiration
}

export interface GeneratePresignedUrlDto {
  filename: string;
  mimeType: string;
  size: number;
  resourceType?: string;
  resourceId?: string;
  isPublic?: boolean;
  expiresIn?: number;
}

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly cdnUrl?: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly auditService: AuditService,
  ) {
    this.region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET', 'oakleaf-uploads');
    this.cdnUrl = this.configService.get<string>('CDN_URL');

    // Support both S3 and MinIO
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    this.s3Client = new S3Client({
      region: this.region,
      endpoint,
      credentials: accessKeyId && secretAccessKey ? {
        accessKeyId,
        secretAccessKey,
      } : undefined,
      forcePathStyle: !!endpoint, // Required for MinIO
    });
  }

  /**
   * Upload file to S3/MinIO
   */
  async uploadFile(
    tenantId: string,
    userId: string,
    dto: UploadFileDto,
  ): Promise<File> {
    const { file, resourceType, resourceId, isPublic = false, metadata, expiresIn } = dto;

    try {
      // Generate unique key
      const key = this.generateKey(tenantId, file.originalname);

      // Determine file type
      const fileType = this.getFileType(file.mimetype);

      // Calculate file hash
      const hash = this.calculateHash(file.buffer);

      // Check for duplicate
      const existing = await this.fileRepository.findOne({
        where: { tenantId, hash, status: FileStatus.COMPLETED },
      });

      if (existing) {
        this.logger.log(`File already exists: ${existing.id}, returning existing`);
        return existing;
      }

      // Create file record
      const fileRecord = this.fileRepository.create({
        tenantId,
        filename: file.originalname,
        key,
        bucket: this.bucket,
        provider: this.configService.get('S3_ENDPOINT') ? StorageProvider.MINIO : StorageProvider.S3,
        mimeType: file.mimetype,
        type: fileType,
        size: file.size,
        isPublic,
        status: FileStatus.UPLOADING,
        uploadedBy: userId,
        resourceType,
        resourceId,
        metadata,
        hash,
        expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined,
      });

      await this.fileRepository.save(fileRecord);

      // Upload to S3/MinIO
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: isPublic ? 'public-read' : 'private',
          Metadata: {
            tenantId,
            userId,
            originalName: file.originalname,
            ...metadata,
          },
        },
      });

      await upload.done();

      // Update file record
      fileRecord.status = FileStatus.COMPLETED;
      fileRecord.url = isPublic ? this.getPublicUrl(key) : undefined;
      fileRecord.cdnUrl = this.cdnUrl ? `${this.cdnUrl}/${key}` : undefined;

      await this.fileRepository.save(fileRecord);

      // Audit log
      await this.auditService.log(tenantId, {
        userId,
        action: AuditAction.CREATE,
        resource: 'file',
        resourceId: fileRecord.id,
        description: `Uploaded file ${file.originalname}`,
        metadata: {
          filename: file.originalname,
          size: file.size,
          type: fileType,
        },
      });

      this.logger.log(`File uploaded successfully: ${fileRecord.id}`);

      return fileRecord;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Generate presigned URL for client-side upload
   */
  async generatePresignedUploadUrl(
    tenantId: string,
    userId: string,
    dto: GeneratePresignedUrlDto,
  ): Promise<{ uploadUrl: string; file: File }> {
    try {
      const key = this.generateKey(tenantId, dto.filename);
      const fileType = this.getFileType(dto.mimeType);

      // Create file record
      const fileRecord = this.fileRepository.create({
        tenantId,
        filename: dto.filename,
        key,
        bucket: this.bucket,
        provider: this.configService.get('S3_ENDPOINT') ? StorageProvider.MINIO : StorageProvider.S3,
        mimeType: dto.mimeType,
        type: fileType,
        size: dto.size,
        isPublic: dto.isPublic || false,
        status: FileStatus.UPLOADING,
        uploadedBy: userId,
        resourceType: dto.resourceType,
        resourceId: dto.resourceId,
        expiresAt: dto.expiresIn ? new Date(Date.now() + dto.expiresIn * 1000) : undefined,
      });

      await this.fileRepository.save(fileRecord);

      // Generate presigned URL
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: dto.mimeType,
        ACL: dto.isPublic ? 'public-read' : 'private',
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600, // 1 hour
      });

      return { uploadUrl, file: fileRecord };
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL: ${error.message}`);
      throw new BadRequestException(`Failed to generate upload URL: ${error.message}`);
    }
  }

  /**
   * Confirm upload completion (for presigned uploads)
   */
  async confirmUpload(tenantId: string, fileId: string): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { tenantId, id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    try {
      // Verify file exists in S3
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: file.key,
      });

      await this.s3Client.send(command);

      // Update file status
      file.status = FileStatus.COMPLETED;
      file.url = file.isPublic ? this.getPublicUrl(file.key) : undefined;
      file.cdnUrl = this.cdnUrl ? `${this.cdnUrl}/${file.key}` : undefined;

      await this.fileRepository.save(file);

      return file;
    } catch (error) {
      file.status = FileStatus.FAILED;
      file.processingError = error.message;
      await this.fileRepository.save(file);

      throw new BadRequestException('File not found in storage');
    }
  }

  /**
   * Generate presigned download URL
   */
  async getDownloadUrl(tenantId: string, fileId: string, expiresIn = 3600): Promise<string> {
    const file = await this.fileRepository.findOne({
      where: { tenantId, id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.isPublic && file.url) {
      return file.url;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: file.key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });

      // Update access tracking
      file.downloadCount += 1;
      file.lastAccessedAt = new Date();
      await this.fileRepository.save(file);

      return url;
    } catch (error) {
      this.logger.error(`Failed to generate download URL: ${error.message}`);
      throw new BadRequestException('Failed to generate download URL');
    }
  }

  /**
   * Delete file
   */
  async deleteFile(tenantId: string, userId: string, fileId: string): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { tenantId, id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    try {
      // Delete from S3/MinIO
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: file.key,
      });

      await this.s3Client.send(command);

      // Update status
      file.status = FileStatus.DELETED;
      file.deletedAt = new Date();
      await this.fileRepository.save(file);

      // Audit log
      await this.auditService.log(tenantId, {
        userId,
        action: AuditAction.DELETE,
        resource: 'file',
        resourceId: file.id,
        description: `Deleted file ${file.filename}`,
      });

      this.logger.log(`File deleted: ${file.id}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`);
      throw new BadRequestException('Failed to delete file');
    }
  }

  /**
   * Find file by ID
   */
  async findOne(tenantId: string, fileId: string): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { tenantId, id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  /**
   * Find files by resource
   */
  async findByResource(
    tenantId: string,
    resourceType: string,
    resourceId: string,
  ): Promise<File[]> {
    return await this.fileRepository.find({
      where: { tenantId, resourceType, resourceId, status: FileStatus.COMPLETED },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find all files for tenant
   */
  async findAll(tenantId: string, limit = 50): Promise<File[]> {
    return await this.fileRepository.find({
      where: { tenantId, status: FileStatus.COMPLETED },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Clean up expired files
   */
  async cleanupExpiredFiles(): Promise<number> {
    const expiredFiles = await this.fileRepository
      .createQueryBuilder('file')
      .where('file.expiresAt IS NOT NULL')
      .andWhere('file.expiresAt < :now', { now: new Date() })
      .andWhere('file.status != :deleted', { deleted: FileStatus.DELETED })
      .getMany();

    for (const file of expiredFiles) {
      try {
        await this.deleteFile(file.tenantId, 'system', file.id);
      } catch (error) {
        this.logger.error(`Failed to delete expired file ${file.id}: ${error.message}`);
      }
    }

    return expiredFiles.length;
  }

  /**
   * Generate unique storage key
   */
  private generateKey(tenantId: string, filename: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(filename);
    const basename = path.basename(filename, ext);
    const sanitized = basename.replace(/[^a-zA-Z0-9-_]/g, '-');

    return `${tenantId}/${timestamp}-${random}-${sanitized}${ext}`;
  }

  /**
   * Determine file type from MIME type
   */
  private getFileType(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) return FileType.IMAGE;
    if (mimeType.startsWith('video/')) return FileType.VIDEO;
    if (mimeType.startsWith('audio/')) return FileType.AUDIO;

    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument',
      'text/',
    ];

    if (documentTypes.some((type) => mimeType.includes(type))) {
      return FileType.DOCUMENT;
    }

    const archiveTypes = [
      'application/zip',
      'application/x-rar',
      'application/x-tar',
      'application/gzip',
    ];

    if (archiveTypes.some((type) => mimeType.includes(type))) {
      return FileType.ARCHIVE;
    }

    return FileType.OTHER;
  }

  /**
   * Calculate file hash for deduplication
   */
  private calculateHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Get public URL for file
   */
  private getPublicUrl(key: string): string {
    const endpoint = this.configService.get<string>('S3_ENDPOINT');

    if (endpoint) {
      // MinIO
      return `${endpoint}/${this.bucket}/${key}`;
    }

    // S3
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
