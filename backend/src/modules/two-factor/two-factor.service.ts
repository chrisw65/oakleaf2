import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { TwoFactorAuth } from './two-factor.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-log.entity';

export interface Setup2FADto {
  userId: string;
  email: string;
  appName?: string;
}

export interface Verify2FADto {
  token: string;
}

export interface Enable2FADto {
  token: string;
}

@Injectable()
export class TwoFactorService {
  private readonly logger = new Logger(TwoFactorService.name);
  private readonly encryptionKey: string;

  constructor(
    @InjectRepository(TwoFactorAuth)
    private readonly twoFactorRepository: Repository<TwoFactorAuth>,
    private readonly auditService: AuditService,
  ) {
    // In production, use environment variable
    this.encryptionKey = process.env.TWO_FACTOR_ENCRYPTION_KEY || 'default-key-change-in-production';
  }

  /**
   * Setup 2FA for user (generate secret and QR code)
   */
  async setup(tenantId: string, userId: string, dto: Setup2FADto): Promise<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }> {
    // Check if 2FA already enabled
    const existing = await this.twoFactorRepository.findOne({
      where: { tenantId, userId },
    });

    if (existing && existing.isEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${dto.appName || 'OakLeaf'} (${dto.email})`,
      length: 32,
    });

    // Generate backup codes
    const backupCodes = this.generateBackupCodes(10);

    // Encrypt secret and backup codes
    const encryptedSecret = this.encrypt(secret.base32);
    const encryptedBackupCodes = backupCodes.map(code => this.encrypt(code));

    // Save to database
    if (existing) {
      existing.secret = encryptedSecret;
      existing.backupCodes = encryptedBackupCodes;
      existing.backupCodesUsed = 0;
      await this.twoFactorRepository.save(existing);
    } else {
      const twoFactor = this.twoFactorRepository.create({
        tenantId,
        userId,
        secret: encryptedSecret,
        backupCodes: encryptedBackupCodes,
        backupCodesUsed: 0,
        isEnabled: false,
      });
      await this.twoFactorRepository.save(twoFactor);
    }

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.CREATE,
      resource: '2fa',
      description: '2FA setup initiated',
    });

    return {
      secret: secret.base32,
      qrCode,
      backupCodes,
    };
  }

  /**
   * Enable 2FA after verifying token
   */
  async enable(tenantId: string, userId: string, dto: Enable2FADto): Promise<void> {
    const twoFactor = await this.twoFactorRepository.findOne({
      where: { tenantId, userId },
    });

    if (!twoFactor) {
      throw new NotFoundException('2FA not set up');
    }

    if (twoFactor.isEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    // Verify token
    const isValid = await this.verifyToken(tenantId, userId, dto.token);

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    // Enable 2FA
    twoFactor.isEnabled = true;
    twoFactor.enabledAt = new Date();
    await this.twoFactorRepository.save(twoFactor);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.UPDATE,
      resource: '2fa',
      description: '2FA enabled',
    });
  }

  /**
   * Disable 2FA
   */
  async disable(tenantId: string, userId: string, token: string): Promise<void> {
    const twoFactor = await this.twoFactorRepository.findOne({
      where: { tenantId, userId },
    });

    if (!twoFactor || !twoFactor.isEnabled) {
      throw new NotFoundException('2FA is not enabled');
    }

    // Verify token before disabling
    const isValid = await this.verifyToken(tenantId, userId, token);

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    // Disable 2FA
    twoFactor.isEnabled = false;
    twoFactor.enabledAt = undefined;
    await this.twoFactorRepository.save(twoFactor);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.UPDATE,
      resource: '2fa',
      description: '2FA disabled',
    });
  }

  /**
   * Verify 2FA token
   */
  async verifyToken(tenantId: string, userId: string, token: string): Promise<boolean> {
    const twoFactor = await this.twoFactorRepository.findOne({
      where: { tenantId, userId },
    });

    if (!twoFactor) {
      return false;
    }

    // Check if locked
    if (twoFactor.isLocked()) {
      throw new BadRequestException('2FA is temporarily locked due to too many failed attempts');
    }

    // Decrypt secret
    const secret = this.decrypt(twoFactor.secret);

    // Verify TOTP token
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before and after
    });

    if (isValid) {
      // Reset failed attempts
      twoFactor.resetFailedAttempts();
      twoFactor.lastUsedAt = new Date();
      await this.twoFactorRepository.save(twoFactor);
      return true;
    }

    // Check backup codes
    if (twoFactor.backupCodes && twoFactor.backupCodes.length > 0) {
      for (let i = 0; i < twoFactor.backupCodes.length; i++) {
        const backupCode = this.decrypt(twoFactor.backupCodes[i]);
        if (backupCode === token && i >= twoFactor.backupCodesUsed) {
          // Mark backup code as used
          twoFactor.backupCodesUsed = i + 1;
          twoFactor.lastUsedAt = new Date();
          await this.twoFactorRepository.save(twoFactor);

          // Audit log
          await this.auditService.log(tenantId, {
            userId,
            action: AuditAction.UPDATE,
            resource: '2fa',
            description: 'Backup code used for 2FA verification',
          });

          return true;
        }
      }
    }

    // Invalid token - increment failed attempts
    twoFactor.incrementFailedAttempts();
    await this.twoFactorRepository.save(twoFactor);

    return false;
  }

  /**
   * Check if 2FA is enabled for user
   */
  async isEnabled(tenantId: string, userId: string): Promise<boolean> {
    const twoFactor = await this.twoFactorRepository.findOne({
      where: { tenantId, userId },
    });

    return twoFactor?.isEnabled || false;
  }

  /**
   * Get 2FA status for user
   */
  async getStatus(tenantId: string, userId: string) {
    const twoFactor = await this.twoFactorRepository.findOne({
      where: { tenantId, userId },
    });

    if (!twoFactor) {
      return {
        enabled: false,
        setupCompleted: false,
      };
    }

    return {
      enabled: twoFactor.isEnabled,
      setupCompleted: true,
      enabledAt: twoFactor.enabledAt,
      lastUsedAt: twoFactor.lastUsedAt,
      backupCodesRemaining: twoFactor.backupCodes
        ? twoFactor.backupCodes.length - twoFactor.backupCodesUsed
        : 0,
      isLocked: twoFactor.isLocked(),
      lockedUntil: twoFactor.lockedUntil,
    };
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(tenantId: string, userId: string, token: string): Promise<string[]> {
    const twoFactor = await this.twoFactorRepository.findOne({
      where: { tenantId, userId },
    });

    if (!twoFactor || !twoFactor.isEnabled) {
      throw new NotFoundException('2FA is not enabled');
    }

    // Verify token before regenerating
    const isValid = await this.verifyToken(tenantId, userId, token);

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    // Generate new backup codes
    const backupCodes = this.generateBackupCodes(10);
    const encryptedBackupCodes = backupCodes.map(code => this.encrypt(code));

    twoFactor.backupCodes = encryptedBackupCodes;
    twoFactor.backupCodesUsed = 0;
    await this.twoFactorRepository.save(twoFactor);

    // Audit log
    await this.auditService.log(tenantId, {
      userId,
      action: AuditAction.UPDATE,
      resource: '2fa',
      description: '2FA backup codes regenerated',
    });

    return backupCodes;
  }

  /**
   * Generate random backup codes
   */
  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Encrypt sensitive data
   */
  private encrypt(text: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt sensitive data
   */
  private decrypt(encryptedText: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
