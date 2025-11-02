import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class EmailAutomation2000000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'email_sequences',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
        { name: 'tenantId', type: 'uuid' },
        { name: 'name', type: 'varchar', length: '255' },
        { name: 'description', type: 'text', isNullable: true },
        { name: 'status', type: 'enum', enum: ['draft', 'active', 'paused', 'completed', 'archived'], default: "'draft'" },
        { name: 'triggerType', type: 'varchar', length: '50' },
        { name: 'triggerConfig', type: 'jsonb', isNullable: true },
        { name: 'steps', type: 'jsonb' },
        { name: 'goalType', type: 'varchar', length: '100', isNullable: true },
        { name: 'goalConfig', type: 'jsonb', isNullable: true },
        { name: 'exitOnGoalAchieved', type: 'boolean', default: true },
        { name: 'allowReentry', type: 'boolean', default: false },
        { name: 'maxSubscribers', type: 'int', isNullable: true },
        { name: 'totalSubscribers', type: 'int', default: 0 },
        { name: 'activeSubscribers', type: 'int', default: 0 },
        { name: 'completedSubscribers', type: 'int', default: 0 },
        { name: 'totalEmailsSent', type: 'int', default: 0 },
        { name: 'createdBy', type: 'uuid', isNullable: true },
        { name: 'lastRunAt', type: 'timestamp', isNullable: true },
        { name: 'metadata', type: 'jsonb', isNullable: true },
        { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
      ],
    }), true);

    await queryRunner.createTable(new Table({
      name: 'email_sequence_subscribers',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
        { name: 'tenantId', type: 'uuid' },
        { name: 'sequenceId', type: 'uuid' },
        { name: 'userId', type: 'varchar', length: '255' },
        { name: 'status', type: 'enum', enum: ['active', 'paused', 'completed', 'unsubscribed', 'bounced', 'failed'], default: "'active'" },
        { name: 'currentStepId', type: 'varchar', length: '50', isNullable: true },
        { name: 'currentStepIndex', type: 'int', default: 0 },
        { name: 'enrolledAt', type: 'timestamp' },
        { name: 'completedAt', type: 'timestamp', isNullable: true },
        { name: 'nextSendAt', type: 'timestamp', isNullable: true },
        { name: 'lastEmailSentAt', type: 'timestamp', isNullable: true },
        { name: 'emailsSent', type: 'int', default: 0 },
        { name: 'emailsOpened', type: 'int', default: 0 },
        { name: 'emailsClicked', type: 'int', default: 0 },
        { name: 'emailsBounced', type: 'int', default: 0 },
        { name: 'engagementData', type: 'jsonb', isNullable: true },
        { name: 'goalAchieved', type: 'boolean', default: false },
        { name: 'goalAchievedAt', type: 'timestamp', isNullable: true },
        { name: 'enrollmentData', type: 'jsonb', isNullable: true },
        { name: 'customFields', type: 'jsonb', isNullable: true },
        { name: 'lastError', type: 'text', isNullable: true },
        { name: 'lastErrorAt', type: 'timestamp', isNullable: true },
        { name: 'errorCount', type: 'int', default: 0 },
        { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
      ],
    }), true);

    await queryRunner.createIndex('email_sequences', new TableIndex({ name: 'IDX_seq_tenant_status', columnNames: ['tenantId', 'status'] }));
    await queryRunner.createIndex('email_sequence_subscribers', new TableIndex({ name: 'IDX_sub_tenant_seq_status', columnNames: ['tenantId', 'sequenceId', 'status'] }));
    await queryRunner.createIndex('email_sequence_subscribers', new TableIndex({ name: 'IDX_sub_next_send', columnNames: ['nextSendAt'] }));

    await queryRunner.createForeignKey('email_sequences', new TableForeignKey({ name: 'FK_seq_tenant', columnNames: ['tenantId'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('email_sequence_subscribers', new TableForeignKey({ name: 'FK_sub_tenant', columnNames: ['tenantId'], referencedTableName: 'tenants', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('email_sequence_subscribers', new TableForeignKey({ name: 'FK_sub_seq', columnNames: ['sequenceId'], referencedTableName: 'email_sequences', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('email_sequence_subscribers', 'FK_sub_seq');
    await queryRunner.dropForeignKey('email_sequence_subscribers', 'FK_sub_tenant');
    await queryRunner.dropForeignKey('email_sequences', 'FK_seq_tenant');
    await queryRunner.dropTable('email_sequence_subscribers');
    await queryRunner.dropTable('email_sequences');
  }
}
