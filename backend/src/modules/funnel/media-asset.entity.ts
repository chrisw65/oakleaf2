import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { User } from '../user/user.entity';

export enum AssetType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  FONT = 'font',
  OTHER = 'other',
}

@Entity('media_assets')
export class MediaAsset extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  filename: string;

  @Column({ type: 'enum', enum: AssetType })
  @Index()
  assetType: AssetType;

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ type: 'varchar', length: 500 })
  url: string; // CDN or storage URL

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnailUrl?: string;

  @Column({ type: 'integer', default: 0 })
  fileSize: number; // bytes

  @Column({ type: 'integer', nullable: true })
  width?: number; // for images/videos

  @Column({ type: 'integer', nullable: true })
  height?: number; // for images/videos

  @Column({ type: 'integer', nullable: true })
  duration?: number; // for videos/audio (seconds)

  @Column({ type: 'varchar', length: 255, nullable: true })
  folder?: string; // Organization

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  altText?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'integer', default: 0 })
  usageCount: number;

  @Column({ name: 'uploaded_by', type: 'uuid' })
  @Index()
  uploadedBy: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: {
    exif?: any; // EXIF data for images
    encoding?: string;
    bitrate?: number;
    [key: string]: any;
  };
}
