import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantPlan, TenantStatus } from './tenant.entity';

export interface CreateTenantDto {
  name: string;
  subdomain?: string;
  customDomain?: string;
  plan?: TenantPlan;
}

export interface UpdateTenantDto {
  name?: string;
  subdomain?: string;
  customDomain?: string;
  plan?: TenantPlan;
  status?: TenantStatus;
  settings?: Record<string, any>;
  branding?: Record<string, any>;
}

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Check if subdomain already exists
    if (createTenantDto.subdomain) {
      const existing = await this.tenantRepository.findOne({
        where: { subdomain: createTenantDto.subdomain },
      });
      if (existing) {
        throw new ConflictException('Subdomain already exists');
      }
    }

    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      plan: createTenantDto.plan || TenantPlan.STARTER,
      status: TenantStatus.TRIAL,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
    });

    return this.tenantRepository.save(tenant);
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async findBySubdomain(subdomain: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { subdomain },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    // Check subdomain uniqueness if being updated
    if (
      updateTenantDto.subdomain &&
      updateTenantDto.subdomain !== tenant.subdomain
    ) {
      const existing = await this.tenantRepository.findOne({
        where: { subdomain: updateTenantDto.subdomain },
      });
      if (existing) {
        throw new ConflictException('Subdomain already exists');
      }
    }

    Object.assign(tenant, updateTenantDto);
    return this.tenantRepository.save(tenant);
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    await this.tenantRepository.softRemove(tenant);
  }

  async isActive(tenantId: string): Promise<boolean> {
    const tenant = await this.findOne(tenantId);
    return tenant.status === TenantStatus.ACTIVE;
  }
}
