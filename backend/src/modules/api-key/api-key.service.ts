import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ApiKey, ApiKeyStatus } from './api-key.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-log.entity';

export interface CreateApiKeyDto {
  name: string;
  permissions?: string[];
  allowedIps?: string[];
  rateLimit?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
  };
  expiresIn?: number; // Days until expiration
  metadata?: Record<string, any>;
}

export interface UpdateApiKeyDto {
  name?: string;
  permissions?: string[];
  allowedIps?: string[];
  rateLimit?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
  };
  metadata?: Record<string, any>;
}

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create new API key
   */
  async create(
    tenantId: string,
    userId: string,
    dto: CreateApiKeyDto,
  ): Promise<{ apiKey: ApiKey; plainKey: string }> {
    // Generate API key
    const plainKey = this.generateApiKey();
    const hashedKey = this.hashKey(plainKey);
    const prefix = plainKey.substring(0, 12); // e.g., "ak_live_xxxx"

    // Calculate expiration
    const expiresAt = dto.expiresIn
      ? new Date(Date.now() + dto.expiresIn * 24 * 60 * 60 * 1000)
      : undefined;

    // Create API key
    const apiKey = this.apiKeyRepository.create({
      tenantId,
      name: dto.name,
      key: hashedKey,
      prefix,
      createdBy: userId,
      permissions: dto.permissions,
      allowedIps: dto.allowedIps,
      rateLimit: dto.rateLimit,
      metadata: dto.metadata,
      expiresAt,
      status: ApiKeyStatus.ACTIVE,
    });

    await this.apiKeyRepository.save(apiKey);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.CREATE,
      resource: 'api_key',
      resourceId: apiKey.id,
      description: `Created API key: ${dto.name}`,
      metadata: { prefix, expiresAt },
    });

    this.logger.log(`API key created: ${apiKey.id} (${prefix})`);

    // Return API key with plain key (only shown once!)
    return { apiKey, plainKey };
  }

  /**
   * Validate API key
   */
  async validate(key: string, ip?: string): Promise<ApiKey | null> {
    const hashedKey = this.hashKey(key);

    const apiKey = await this.apiKeyRepository.findOne({
      where: { key: hashedKey },
    });

    if (!apiKey) {
      return null;
    }

    // Check if valid
    if (!apiKey.isValid()) {
      return null;
    }

    // Check expiration
    if (apiKey.isExpired()) {
      apiKey.status = ApiKeyStatus.EXPIRED;
      await this.apiKeyRepository.save(apiKey);
      return null;
    }

    // Check IP whitelist
    if (ip && !apiKey.isIpAllowed(ip)) {
      this.logger.warn(`API key ${apiKey.prefix} used from unauthorized IP: ${ip}`);
      return null;
    }

    // Update usage
    apiKey.incrementUsage();
    await this.apiKeyRepository.save(apiKey);

    return apiKey;
  }

  /**
   * Update API key
   */
  async update(
    tenantId: string,
    userId: string,
    apiKeyId: string,
    dto: UpdateApiKeyDto,
  ): Promise<ApiKey> {
    const apiKey = await this.findOne(tenantId, apiKeyId);

    Object.assign(apiKey, dto);
    await this.apiKeyRepository.save(apiKey);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.UPDATE,
      resource: 'api_key',
      resourceId: apiKey.id,
      description: `Updated API key: ${apiKey.name}`,
    });

    return apiKey;
  }

  /**
   * Revoke API key
   */
  async revoke(
    tenantId: string,
    userId: string,
    apiKeyId: string,
    reason?: string,
  ): Promise<void> {
    const apiKey = await this.findOne(tenantId, apiKeyId);

    apiKey.revoke(userId, reason);
    await this.apiKeyRepository.save(apiKey);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.DELETE,
      resource: 'api_key',
      resourceId: apiKey.id,
      description: `Revoked API key: ${apiKey.name}`,
      metadata: { reason },
    });

    this.logger.log(`API key revoked: ${apiKey.id} - ${reason || 'No reason provided'}`);
  }

  /**
   * Delete API key
   */
  async delete(tenantId: string, userId: string, apiKeyId: string): Promise<void> {
    const apiKey = await this.findOne(tenantId, apiKeyId);

    await this.apiKeyRepository.remove(apiKey);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.DELETE,
      resource: 'api_key',
      resourceId: apiKey.id,
      description: `Deleted API key: ${apiKey.name}`,
    });
  }

  /**
   * Find API key by ID
   */
  async findOne(tenantId: string, apiKeyId: string): Promise<ApiKey> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { tenantId, id: apiKeyId },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    return apiKey;
  }

  /**
   * Find all API keys for tenant
   */
  async findAll(tenantId: string): Promise<ApiKey[]> {
    return await this.apiKeyRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get API key statistics
   */
  async getStats(tenantId: string, apiKeyId: string) {
    const apiKey = await this.findOne(tenantId, apiKeyId);

    return {
      id: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.prefix,
      status: apiKey.status,
      usageCount: apiKey.usageCount,
      lastUsedAt: apiKey.lastUsedAt,
      createdAt: apiKey.createdAt,
      expiresAt: apiKey.expiresAt,
      daysUntilExpiry: apiKey.expiresAt
        ? Math.ceil((apiKey.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null,
    };
  }

  /**
   * Generate random API key
   */
  private generateApiKey(): string {
    // Generate key in format: ak_live_xxxxxxxxxxxxxxxxxxxxx
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return `ak_live_${randomBytes}`;
  }

  /**
   * Hash API key for storage
   */
  private hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  /**
   * Clean up expired keys
   */
  async cleanupExpired(tenantId?: string): Promise<number> {
    const query = this.apiKeyRepository
      .createQueryBuilder('apiKey')
      .where('apiKey.expiresAt < :now', { now: new Date() })
      .andWhere('apiKey.status != :expired', { expired: ApiKeyStatus.EXPIRED });

    if (tenantId) {
      query.andWhere('apiKey.tenantId = :tenantId', { tenantId });
    }

    const expiredKeys = await query.getMany();

    for (const key of expiredKeys) {
      key.status = ApiKeyStatus.EXPIRED;
      await this.apiKeyRepository.save(key);
    }

    return expiredKeys.length;
  }
}
