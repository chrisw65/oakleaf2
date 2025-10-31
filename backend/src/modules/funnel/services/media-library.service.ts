import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { MediaAsset, AssetType } from '../media-asset.entity';
import {
  CreateMediaAssetDto,
  UpdateMediaAssetDto,
  MediaAssetQueryDto,
} from '../dto/media-asset.dto';

@Injectable()
export class MediaLibraryService {
  constructor(
    @InjectRepository(MediaAsset)
    private readonly assetRepository: Repository<MediaAsset>,
  ) {}

  async createAsset(
    tenantId: string,
    userId: string,
    dto: CreateMediaAssetDto,
  ): Promise<MediaAsset> {
    const asset = this.assetRepository.create({
      ...dto,
      uploadedBy: userId,
      tenantId,
    });

    return await this.assetRepository.save(asset);
  }

  async updateAsset(
    tenantId: string,
    assetId: string,
    dto: UpdateMediaAssetDto,
  ): Promise<MediaAsset> {
    const asset = await this.assetRepository.findOne({
      where: { id: assetId, tenantId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    Object.assign(asset, dto);
    return await this.assetRepository.save(asset);
  }

  async deleteAsset(tenantId: string, assetId: string): Promise<void> {
    const asset = await this.assetRepository.findOne({
      where: { id: assetId, tenantId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    await this.assetRepository.remove(asset);
  }

  async getAssets(
    tenantId: string,
    query: MediaAssetQueryDto,
  ): Promise<{ assets: MediaAsset[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (query.assetType) {
      where.assetType = query.assetType;
    }

    if (query.folder) {
      where.folder = query.folder;
    }

    let queryBuilder = this.assetRepository
      .createQueryBuilder('asset')
      .where(where);

    // Search by name or tags
    if (query.search) {
      queryBuilder = queryBuilder.andWhere(
        '(asset.name ILIKE :search OR :searchTag = ANY(asset.tags))',
        {
          search: `%${query.search}%`,
          searchTag: query.search,
        },
      );
    }

    const [assets, total] = await queryBuilder
      .orderBy('asset.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      assets,
      total,
      page,
      limit,
    };
  }

  async getAsset(tenantId: string, assetId: string): Promise<MediaAsset> {
    const asset = await this.assetRepository.findOne({
      where: { id: assetId, tenantId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  async incrementUsageCount(
    tenantId: string,
    assetId: string,
  ): Promise<void> {
    await this.assetRepository.increment(
      { id: assetId, tenantId },
      'usageCount',
      1,
    );
  }

  async getFolders(tenantId: string): Promise<string[]> {
    const result = await this.assetRepository
      .createQueryBuilder('asset')
      .select('DISTINCT asset.folder', 'folder')
      .where('asset.tenantId = :tenantId', { tenantId })
      .andWhere('asset.folder IS NOT NULL')
      .getRawMany();

    return result.map((r) => r.folder);
  }

  async getTags(tenantId: string): Promise<string[]> {
    const assets = await this.assetRepository.find({
      where: { tenantId },
      select: ['tags'],
    });

    const allTags = assets.reduce((tags, asset) => {
      if (asset.tags && asset.tags.length > 0) {
        tags.push(...asset.tags);
      }
      return tags;
    }, [] as string[]);

    // Return unique tags
    return [...new Set(allTags)];
  }

  async getAssetsByType(
    tenantId: string,
    assetType: AssetType,
  ): Promise<MediaAsset[]> {
    return await this.assetRepository.find({
      where: { tenantId, assetType },
      order: { createdAt: 'DESC' },
    });
  }
}
