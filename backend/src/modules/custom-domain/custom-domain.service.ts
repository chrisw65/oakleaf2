import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomDomain, DomainStatus, DomainType } from './custom-domain.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-log.entity';
import * as dns from 'dns';
import { promisify } from 'util';
import * as crypto from 'crypto';

const resolveTxt = promisify(dns.resolveTxt);
const resolve4 = promisify(dns.resolve4);
const resolveCname = promisify(dns.resolveCname);

export interface CreateCustomDomainDto {
  domain: string;
  type: DomainType;
  resourceId?: string; // Funnel ID or Page ID if type is not TENANT
}

export interface UpdateCustomDomainDto {
  redirects?: {
    from?: string;
    to?: string;
    type?: 301 | 302;
  };
  metadata?: Record<string, any>;
}

export interface VerifyDomainResult {
  verified: boolean;
  status: DomainStatus;
  dnsRecords: {
    required: Array<{
      type: 'A' | 'CNAME' | 'TXT';
      name: string;
      value: string;
      status: 'found' | 'missing' | 'incorrect';
    }>;
    detected?: Array<{
      type: string;
      name: string;
      value: string;
    }>;
  };
  message?: string;
}

@Injectable()
export class CustomDomainService {
  private readonly logger = new Logger(CustomDomainService.name);
  private readonly platformIP = process.env.PLATFORM_IP || '0.0.0.0';
  private readonly platformCNAME = process.env.PLATFORM_CNAME || 'app.oakleaf.com';

  constructor(
    @InjectRepository(CustomDomain)
    private readonly customDomainRepository: Repository<CustomDomain>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create new custom domain
   */
  async create(
    tenantId: string,
    userId: string,
    dto: CreateCustomDomainDto,
  ): Promise<CustomDomain> {
    // Validate domain format
    if (!this.isValidDomain(dto.domain)) {
      throw new BadRequestException('Invalid domain format');
    }

    // Check if domain already exists
    const existing = await this.customDomainRepository.findOne({
      where: { domain: dto.domain },
    });

    if (existing) {
      throw new BadRequestException('Domain already exists');
    }

    // Generate verification token
    const verificationToken = this.generateVerificationToken();

    // Determine required DNS records
    const dnsRecords = this.getRequiredDnsRecords(dto.domain, verificationToken);

    // Create custom domain
    const customDomain = this.customDomainRepository.create({
      tenantId,
      domain: dto.domain,
      type: dto.type,
      resourceId: dto.resourceId,
      status: DomainStatus.PENDING,
      verificationToken,
      dnsRecords,
      sslEnabled: false,
      autoRenewSsl: true,
      verificationAttempts: 0,
    });

    await this.customDomainRepository.save(customDomain);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.CREATE,
      resource: 'custom_domain',
      resourceId: customDomain.id,
      description: `Created custom domain: ${dto.domain}`,
      metadata: { domain: dto.domain, type: dto.type },
    });

    this.logger.log(`Custom domain created: ${customDomain.id} (${dto.domain})`);

    return customDomain;
  }

  /**
   * Verify domain DNS records
   */
  async verifyDomain(
    tenantId: string,
    userId: string,
    domainId: string,
  ): Promise<VerifyDomainResult> {
    const customDomain = await this.findOne(tenantId, domainId);

    // Update status to verifying
    customDomain.status = DomainStatus.VERIFYING;
    customDomain.lastCheckedAt = new Date();
    customDomain.verificationAttempts += 1;
    customDomain.lastVerificationAttempt = new Date();

    try {
      // Check DNS records
      const verificationResult = await this.checkDnsRecords(customDomain);

      // Update DNS records with status
      customDomain.dnsRecords = verificationResult.dnsRecords;

      if (verificationResult.verified) {
        customDomain.status = DomainStatus.VERIFIED;
        customDomain.verifiedAt = new Date();
        customDomain.errorMessage = null;

        this.logger.log(`Domain verified: ${customDomain.domain}`);

        // Audit log
        await this.auditService.log(tenantId, {
          userId,
          action: AuditAction.UPDATE,
          resource: 'custom_domain',
          resourceId: customDomain.id,
          description: `Domain verified: ${customDomain.domain}`,
        });
      } else {
        customDomain.status = DomainStatus.FAILED;
        customDomain.errorMessage = verificationResult.message || 'DNS verification failed';

        this.logger.warn(`Domain verification failed: ${customDomain.domain}`);
      }

      await this.customDomainRepository.save(customDomain);

      return verificationResult;
    } catch (error) {
      customDomain.status = DomainStatus.FAILED;
      customDomain.errorMessage = error.message;
      await this.customDomainRepository.save(customDomain);

      this.logger.error(`Domain verification error: ${customDomain.domain}`, error.stack);
      throw error;
    }
  }

  /**
   * Activate domain (make it live)
   */
  async activate(
    tenantId: string,
    userId: string,
    domainId: string,
  ): Promise<CustomDomain> {
    const customDomain = await this.findOne(tenantId, domainId);

    if (!customDomain.isVerified()) {
      throw new BadRequestException('Domain must be verified before activation');
    }

    customDomain.status = DomainStatus.ACTIVE;
    await this.customDomainRepository.save(customDomain);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.UPDATE,
      resource: 'custom_domain',
      resourceId: customDomain.id,
      description: `Domain activated: ${customDomain.domain}`,
    });

    this.logger.log(`Domain activated: ${customDomain.domain}`);

    return customDomain;
  }

  /**
   * Suspend domain
   */
  async suspend(
    tenantId: string,
    userId: string,
    domainId: string,
    reason?: string,
  ): Promise<CustomDomain> {
    const customDomain = await this.findOne(tenantId, domainId);

    customDomain.status = DomainStatus.SUSPENDED;
    customDomain.errorMessage = reason;
    await this.customDomainRepository.save(customDomain);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.UPDATE,
      resource: 'custom_domain',
      resourceId: customDomain.id,
      description: `Domain suspended: ${customDomain.domain}`,
      metadata: { reason },
    });

    this.logger.log(`Domain suspended: ${customDomain.domain} - ${reason || 'No reason'}`);

    return customDomain;
  }

  /**
   * Update custom domain
   */
  async update(
    tenantId: string,
    userId: string,
    domainId: string,
    dto: UpdateCustomDomainDto,
  ): Promise<CustomDomain> {
    const customDomain = await this.findOne(tenantId, domainId);

    Object.assign(customDomain, dto);
    await this.customDomainRepository.save(customDomain);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.UPDATE,
      resource: 'custom_domain',
      resourceId: customDomain.id,
      description: `Updated custom domain: ${customDomain.domain}`,
    });

    return customDomain;
  }

  /**
   * Delete custom domain
   */
  async delete(tenantId: string, userId: string, domainId: string): Promise<void> {
    const customDomain = await this.findOne(tenantId, domainId);

    await this.customDomainRepository.remove(customDomain);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.DELETE,
      resource: 'custom_domain',
      resourceId: customDomain.id,
      description: `Deleted custom domain: ${customDomain.domain}`,
    });

    this.logger.log(`Domain deleted: ${customDomain.domain}`);
  }

  /**
   * Find custom domain by ID
   */
  async findOne(tenantId: string, domainId: string): Promise<CustomDomain> {
    const customDomain = await this.customDomainRepository.findOne({
      where: { tenantId, id: domainId },
    });

    if (!customDomain) {
      throw new NotFoundException('Custom domain not found');
    }

    return customDomain;
  }

  /**
   * Find custom domain by domain name
   */
  async findByDomain(domain: string): Promise<CustomDomain | null> {
    return await this.customDomainRepository.findOne({
      where: { domain },
    });
  }

  /**
   * Find all custom domains for tenant
   */
  async findAll(tenantId: string): Promise<CustomDomain[]> {
    return await this.customDomainRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find domains by type and resource
   */
  async findByResource(
    tenantId: string,
    type: DomainType,
    resourceId: string,
  ): Promise<CustomDomain[]> {
    return await this.customDomainRepository.find({
      where: { tenantId, type, resourceId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Enable SSL for domain
   */
  async enableSsl(
    tenantId: string,
    userId: string,
    domainId: string,
    provider: string = 'letsencrypt',
  ): Promise<CustomDomain> {
    const customDomain = await this.findOne(tenantId, domainId);

    if (!customDomain.isVerified()) {
      throw new BadRequestException('Domain must be verified before enabling SSL');
    }

    // In production, integrate with Let's Encrypt or Cloudflare
    // For now, mark as enabled with 90-day expiry
    customDomain.sslEnabled = true;
    customDomain.sslProvider = provider;
    customDomain.sslIssuedAt = new Date();
    customDomain.sslExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
    customDomain.autoRenewSsl = true;

    await this.customDomainRepository.save(customDomain);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.UPDATE,
      resource: 'custom_domain',
      resourceId: customDomain.id,
      description: `SSL enabled for domain: ${customDomain.domain}`,
      metadata: { provider },
    });

    this.logger.log(`SSL enabled for domain: ${customDomain.domain} (${provider})`);

    return customDomain;
  }

  /**
   * Renew SSL certificate
   */
  async renewSsl(tenantId: string, domainId: string): Promise<CustomDomain> {
    const customDomain = await this.findOne(tenantId, domainId);

    if (!customDomain.sslEnabled) {
      throw new BadRequestException('SSL not enabled for this domain');
    }

    // In production, integrate with Let's Encrypt renewal process
    customDomain.sslIssuedAt = new Date();
    customDomain.sslExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    await this.customDomainRepository.save(customDomain);

    this.logger.log(`SSL renewed for domain: ${customDomain.domain}`);

    return customDomain;
  }

  /**
   * Check domains that need SSL renewal
   */
  async checkSslRenewal(): Promise<CustomDomain[]> {
    const domains = await this.customDomainRepository.find({
      where: {
        sslEnabled: true,
        autoRenewSsl: true,
        status: DomainStatus.ACTIVE,
      },
    });

    const domainsNeedingRenewal = domains.filter((domain) => domain.sslNeedsRenewal());

    for (const domain of domainsNeedingRenewal) {
      try {
        await this.renewSsl(domain.tenantId, domain.id);
        this.logger.log(`Auto-renewed SSL for: ${domain.domain}`);
      } catch (error) {
        this.logger.error(`Failed to renew SSL for ${domain.domain}:`, error.stack);
      }
    }

    return domainsNeedingRenewal;
  }

  /**
   * Check DNS records for domain
   */
  private async checkDnsRecords(customDomain: CustomDomain): Promise<VerifyDomainResult> {
    const results = {
      verified: true,
      status: DomainStatus.VERIFIED,
      dnsRecords: {
        required: customDomain.dnsRecords?.required || [],
        detected: [],
      },
      message: '',
    };

    for (const record of results.dnsRecords.required) {
      try {
        if (record.type === 'TXT') {
          const txtRecords = await resolveTxt(record.name);
          const flatRecords = txtRecords.flat();
          const found = flatRecords.includes(record.value);

          record.status = found ? 'found' : 'missing';

          if (!found) {
            results.verified = false;
            results.message = `TXT record not found for ${record.name}`;
          }
        } else if (record.type === 'A') {
          const aRecords = await resolve4(record.name);
          const found = aRecords.includes(record.value);

          record.status = found ? 'found' : 'incorrect';

          if (!found) {
            results.verified = false;
            results.message = `A record mismatch for ${record.name}. Expected: ${record.value}, Found: ${aRecords.join(', ')}`;
          }
        } else if (record.type === 'CNAME') {
          const cnameRecords = await resolveCname(record.name);
          const found = cnameRecords.includes(record.value);

          record.status = found ? 'found' : 'incorrect';

          if (!found) {
            results.verified = false;
            results.message = `CNAME record mismatch for ${record.name}. Expected: ${record.value}, Found: ${cnameRecords.join(', ')}`;
          }
        }
      } catch (error) {
        record.status = 'missing';
        results.verified = false;
        results.message = `DNS lookup failed for ${record.name}: ${error.message}`;
        this.logger.warn(`DNS lookup failed for ${record.name}:`, error.message);
      }
    }

    if (!results.verified) {
      results.status = DomainStatus.FAILED;
    }

    return results;
  }

  /**
   * Get required DNS records for domain
   */
  private getRequiredDnsRecords(
    domain: string,
    verificationToken: string,
  ): {
    required: Array<{
      type: 'A' | 'CNAME' | 'TXT';
      name: string;
      value: string;
      status?: 'found' | 'missing' | 'incorrect';
    }>;
  } {
    return {
      required: [
        {
          type: 'TXT',
          name: `_oakleaf-verify.${domain}`,
          value: verificationToken,
          status: 'missing',
        },
        {
          type: 'A',
          name: domain,
          value: this.platformIP,
          status: 'missing',
        },
        {
          type: 'CNAME',
          name: `www.${domain}`,
          value: this.platformCNAME,
          status: 'missing',
        },
      ],
    };
  }

  /**
   * Validate domain format
   */
  private isValidDomain(domain: string): boolean {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    return domainRegex.test(domain);
  }

  /**
   * Generate verification token
   */
  private generateVerificationToken(): string {
    return `oakleaf-verify-${crypto.randomBytes(16).toString('hex')}`;
  }

  /**
   * Get domain statistics
   */
  async getStats(tenantId: string, domainId: string) {
    const customDomain = await this.findOne(tenantId, domainId);

    return {
      id: customDomain.id,
      domain: customDomain.domain,
      type: customDomain.type,
      status: customDomain.status,
      verified: customDomain.isVerified(),
      active: customDomain.isActive(),
      sslEnabled: customDomain.sslEnabled,
      sslProvider: customDomain.sslProvider,
      sslExpiresAt: customDomain.sslExpiresAt,
      daysUntilSslExpiry: customDomain.getDaysUntilSslExpiry(),
      sslNeedsRenewal: customDomain.sslNeedsRenewal(),
      verifiedAt: customDomain.verifiedAt,
      createdAt: customDomain.createdAt,
      verificationAttempts: customDomain.verificationAttempts,
      lastVerificationAttempt: customDomain.lastVerificationAttempt,
    };
  }
}
