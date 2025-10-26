import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';
import { Pipeline } from './pipeline.entity';
import { Opportunity } from './opportunity.entity';

export enum StageType {
  OPEN = 'open',
  WON = 'won',
  LOST = 'lost',
}

@Entity('pipeline_stages')
export class PipelineStage extends TenantBaseEntity {
  @Column({ name: 'pipeline_id', type: 'uuid' })
  @Index()
  pipelineId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'integer' })
  position: number; // Order in the pipeline

  @Column({
    type: 'enum',
    enum: StageType,
    default: StageType.OPEN,
  })
  stageType: StageType;

  @Column({ type: 'integer', default: 0 })
  probability: number; // Win probability percentage (0-100)

  @Column({ type: 'varchar', length: 7, default: '#3B82F6' })
  color: string; // Hex color code

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 0 })
  opportunityCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalValue: number;

  // Relations
  @ManyToOne(() => Pipeline, (pipeline) => pipeline.stages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pipeline_id' })
  pipeline: Pipeline;

  @OneToMany(() => Opportunity, (opportunity) => opportunity.stage)
  opportunities: Opportunity[];
}
