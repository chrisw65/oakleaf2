import { Entity, Column, OneToMany, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { PipelineStage } from './pipeline-stage.entity';
import { Opportunity } from './opportunity.entity';

@Entity('pipelines')
export class Pipeline extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'integer', default: 0 })
  opportunityCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalValue: number;

  @Column({ type: 'jsonb', default: {} })
  settings: {
    currency?: string;
    probabilityByStage?: Record<string, number>;
    autoArchiveDays?: number;
    [key: string]: any;
  };

  // Relations
  @OneToMany(() => PipelineStage, (stage) => stage.pipeline, { cascade: true })
  stages: PipelineStage[];

  @OneToMany(() => Opportunity, (opportunity) => opportunity.pipeline)
  opportunities: Opportunity[];
}
