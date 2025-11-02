import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../common/entities/tenant-base.entity';

/**
 * Two-Factor Authentication entity
 * Stores 2FA configuration for users
 */
@Entity('two_factor_auth')
@Index(['userId'], { unique: true })
export class TwoFactorAuth extends TenantBaseEntity {
  @Column()
  userId: string;

  @Column()
  secret: string; // TOTP secret (encrypted)

  @Column({ default: false })
  isEnabled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  enabledAt?: Date;

  @Column({ type: 'simple-array', nullable: true })
  backupCodes?: string[]; // Encrypted backup codes

  @Column({ default: 0 })
  backupCodesUsed: number;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  @Column({ default: 0 })
  failedAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil?: Date;

  /**
   * Check if 2FA is locked due to failed attempts
   */
  isLocked(): boolean {
    if (!this.lockedUntil) {
      return false;
    }
    return new Date() < this.lockedUntil;
  }

  /**
   * Lock 2FA for specified minutes
   */
  lock(minutes: number): void {
    this.lockedUntil = new Date(Date.now() + minutes * 60 * 1000);
  }

  /**
   * Unlock 2FA
   */
  unlock(): void {
    this.lockedUntil = undefined;
    this.failedAttempts = 0;
  }

  /**
   * Increment failed attempts
   */
  incrementFailedAttempts(): void {
    this.failedAttempts += 1;

    // Lock after 5 failed attempts for 30 minutes
    if (this.failedAttempts >= 5) {
      this.lock(30);
    }
  }

  /**
   * Reset failed attempts
   */
  resetFailedAttempts(): void {
    this.failedAttempts = 0;
    this.lockedUntil = undefined;
  }

  /**
   * Check if backup codes available
   */
  hasBackupCodes(): boolean {
    return !!(
      this.backupCodes &&
      this.backupCodes.length > 0 &&
      this.backupCodesUsed < this.backupCodes.length
    );
  }
}
