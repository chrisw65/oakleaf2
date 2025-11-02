import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';

export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  ARCHIVE = 'archive',
  OTHER = 'other',
}

export enum FileStatus {
  UPLOADING = 'uploading',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELETED = 'deleted',
}

export enum StorageProvider {
  S3 = 's3',
  MINIO = 'minio',
  LOCAL = 'local',
}

/**
 * File entity for tracking uploaded files
 * Supports S3, MinIO, and local storage
 */
@Entity('files')
@Index(['tenantId', 'status'])
@Index(['uploadedBy'])
export class File extends TenantBaseEntity {
  @Column()
  filename: string; // Original filename

  @Column()
  key: string; // Storage key/path

  @Column()
  bucket: string; // S3 bucket or storage location

  @Column({
    type: 'enum',
    enum: StorageProvider,
    default: StorageProvider.S3,
  })
  provider: StorageProvider;

  @Column()
  mimeType: string; // e.g., image/jpeg, application/pdf

  @Column({
    type: 'enum',
    enum: FileType,
  })
  type: FileType;

  @Column({ type: 'bigint' })
  size: number; // File size in bytes

  @Column({ nullable: true })
  url?: string; // Public URL (if public)

  @Column({ nullable: true })
  cdnUrl?: string; // CDN URL (if using CDN)

  @Column({ default: false })
  isPublic: boolean; // Public or private file

  @Column({
    type: 'enum',
    enum: FileStatus,
    default: FileStatus.UPLOADING,
  })
  status: FileStatus;

  @Column()
  uploadedBy: string; // User ID who uploaded

  @Column({ nullable: true })
  resourceType?: string; // e.g., 'funnel', 'product', 'user'

  @Column({ nullable: true })
  resourceId?: string; // ID of related resource

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    width?: number; // Image/video width
    height?: number; // Image/video height
    duration?: number; // Video/audio duration in seconds
    thumbnailUrl?: string; // Thumbnail for video/image
    alt?: string; // Alt text for images
    description?: string;
    tags?: string[];
    [key: string]: any;
  };

  @Column({ type: 'varchar', nullable: true })
  hash?: string; // File hash for deduplication

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date; // Auto-delete date (for temp files)

  @Column({ type: 'int', default: 0 })
  downloadCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastAccessedAt?: Date;

  @Column({ nullable: true })
  uploadId?: string; // Multipart upload ID (for large files)

  @Column({ default: false })
  isProcessed: boolean; // For images/videos that need processing

  @Column({ type: 'text', nullable: true })
  processingError?: string;

  /**
   * Get file extension
   */
  getExtension(): string {
    const parts = this.filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * Get human-readable file size
   */
  getHumanSize(): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = this.size;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Check if file is an image
   */
  isImage(): boolean {
    return this.type === FileType.IMAGE;
  }

  /**
   * Check if file is a video
   */
  isVideo(): boolean {
    return this.type === FileType.VIDEO;
  }

  /**
   * Check if file is expired
   */
  isExpired(): boolean {
    if (!this.expiresAt) {
      return false;
    }
    return new Date() > this.expiresAt;
  }
}
