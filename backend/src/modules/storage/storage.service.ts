import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as path from 'path';

export interface UploadedFile {
  url: string;
  key: string;
  filename: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class StorageService {
  constructor(private configService: ConfigService) {}

  /**
   * Generate a unique filename with original extension
   */
  generateFileName(originalName: string): string {
    const ext = path.extname(originalName);
    const hash = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    return `${timestamp}-${hash}${ext}`;
  }

  /**
   * Get upload path based on file type
   */
  getUploadPath(fileType: string): string {
    const baseFolder = 'uploads';
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    switch (fileType) {
      case 'image':
        return `${baseFolder}/images/${year}/${month}`;
      case 'video':
        return `${baseFolder}/videos/${year}/${month}`;
      case 'document':
        return `${baseFolder}/documents/${year}/${month}`;
      case 'avatar':
        return `${baseFolder}/avatars/${year}/${month}`;
      case 'template':
        return `${baseFolder}/templates/${year}/${month}`;
      default:
        return `${baseFolder}/files/${year}/${month}`;
    }
  }

  /**
   * Upload file to storage (S3/MinIO)
   * Note: This is a placeholder. Actual implementation would use AWS SDK or MinIO client
   */
  async uploadFile(
    file: any,
    fileType: string,
    tenantId: string,
  ): Promise<UploadedFile> {
    const originalName = file.originalname || 'file';
    const mimetype = file.mimetype || 'application/octet-stream';
    const buffer = Buffer.isBuffer(file) ? file : file.buffer;
    const size = buffer.length;

    const fileName = this.generateFileName(originalName);
    const uploadPath = this.getUploadPath(fileType);
    const key = `${tenantId}/${uploadPath}/${fileName}`;

    // TODO: Implement actual S3/MinIO upload
    // For now, return a mock URL
    const cdnUrl = this.configService.get('cdn.url') || this.configService.get('s3.endpoint');
    const bucket = this.configService.get('s3.bucket');
    const url = `${cdnUrl}/${bucket}/${key}`;

    return {
      url,
      key,
      filename: originalName,
      mimetype,
      size,
    };
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: any[],
    fileType: string,
    tenantId: string,
  ): Promise<UploadedFile[]> {
    return Promise.all(files.map(file => this.uploadFile(file, fileType, tenantId)));
  }

  /**
   * Delete file from storage
   * Note: This is a placeholder. Actual implementation would use AWS SDK or MinIO client
   */
  async deleteFile(key: string): Promise<void> {
    // TODO: Implement actual S3/MinIO delete
    console.log(`Deleting file: ${key}`);
  }

  /**
   * Generate signed URL for temporary access
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    // TODO: Implement actual S3/MinIO signed URL generation
    const cdnUrl = this.configService.get('cdn.url') || this.configService.get('s3.endpoint');
    const bucket = this.configService.get('s3.bucket');
    return `${cdnUrl}/${bucket}/${key}?expires=${expiresIn}`;
  }

  /**
   * Validate file type
   */
  validateFileType(mimetype: string, allowedTypes: string[]): boolean {
    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.split('/')[0];
        return mimetype.startsWith(baseType);
      }
      return mimetype === type;
    });
  }

  /**
   * Validate file size
   */
  validateFileSize(size: number, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return size <= maxSizeInBytes;
  }
}
