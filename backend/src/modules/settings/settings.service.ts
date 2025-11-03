import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting, SettingKey } from './settings.entity';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  private readonly encryptionKey: string;

  constructor(
    @InjectRepository(PlatformSetting)
    private readonly settingsRepository: Repository<PlatformSetting>,
    private readonly configService: ConfigService,
  ) {
    // Use a consistent encryption key from environment or generate one
    this.encryptionKey = this.configService.get<string>('SETTINGS_ENCRYPTION_KEY') ||
      'default-key-change-in-production-32ch'; // Must be 32 characters for AES-256
  }

  /**
   * Get a setting value by key for a tenant
   */
  async get(tenantId: string, key: string): Promise<string | null> {
    const setting = await this.settingsRepository.findOne({
      where: { tenantId, key },
    });

    if (!setting || !setting.isEnabled) {
      return null;
    }

    // Decrypt if encrypted
    if (setting.isEncrypted && setting.value) {
      try {
        return this.decrypt(setting.value);
      } catch (error) {
        this.logger.error(`Failed to decrypt setting ${key}:`, error);
        return null;
      }
    }

    return setting.value;
  }

  /**
   * Get multiple settings at once
   */
  async getMany(tenantId: string, keys: string[]): Promise<Record<string, string>> {
    const settings = await this.settingsRepository.find({
      where: keys.map(key => ({ tenantId, key })),
    });

    const result: Record<string, string> = {};

    for (const setting of settings) {
      if (setting.isEnabled) {
        if (setting.isEncrypted && setting.value) {
          try {
            result[setting.key] = this.decrypt(setting.value);
          } catch (error) {
            this.logger.error(`Failed to decrypt setting ${setting.key}:`, error);
          }
        } else {
          result[setting.key] = setting.value;
        }
      }
    }

    return result;
  }

  /**
   * Set a setting value
   */
  async set(
    tenantId: string,
    key: string,
    value: string,
    options?: {
      description?: string;
      isEncrypted?: boolean;
      isEnabled?: boolean;
    },
  ): Promise<PlatformSetting> {
    let processedValue = value;

    // Encrypt if specified
    if (options?.isEncrypted) {
      processedValue = this.encrypt(value);
    }

    // Check if setting exists
    let setting = await this.settingsRepository.findOne({
      where: { tenantId, key },
    });

    if (setting) {
      // Update existing
      setting.value = processedValue;
      if (options?.description !== undefined) {
        setting.description = options.description;
      }
      if (options?.isEncrypted !== undefined) {
        setting.isEncrypted = options.isEncrypted;
      }
      if (options?.isEnabled !== undefined) {
        setting.isEnabled = options.isEnabled;
      }
    } else {
      // Create new
      setting = this.settingsRepository.create({
        tenantId,
        key,
        value: processedValue,
        description: options?.description,
        isEncrypted: options?.isEncrypted || false,
        isEnabled: options?.isEnabled !== undefined ? options.isEnabled : true,
      });
    }

    return await this.settingsRepository.save(setting);
  }

  /**
   * Delete a setting
   */
  async delete(tenantId: string, key: string): Promise<void> {
    await this.settingsRepository.delete({ tenantId, key });
  }

  /**
   * Get all settings for a tenant (excluding encrypted values)
   */
  async getAll(tenantId: string): Promise<PlatformSetting[]> {
    const settings = await this.settingsRepository.find({
      where: { tenantId },
    });

    // Mask encrypted values for security
    return settings.map(setting => {
      if (setting.isEncrypted && setting.value) {
        return {
          ...setting,
          value: '***encrypted***',
        };
      }
      return setting;
    });
  }

  /**
   * Check if a setting is enabled
   */
  async isEnabled(tenantId: string, key: string): Promise<boolean> {
    const setting = await this.settingsRepository.findOne({
      where: { tenantId, key },
    });

    return setting?.isEnabled || false;
  }

  /**
   * Encrypt a value using AES-256
   */
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey),
      iv,
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV + encrypted data
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt a value using AES-256
   */
  private decrypt(text: string): string {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey),
      iv,
    );

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
