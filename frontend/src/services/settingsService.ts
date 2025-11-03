import apiService from './api';

export interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  isEncrypted: boolean;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SetSettingParams {
  key: string;
  value: string;
  description?: string;
  isEncrypted?: boolean;
  isEnabled?: boolean;
}

class SettingsService {
  /**
   * Get all settings for current tenant
   */
  async getAll(): Promise<PlatformSetting[]> {
    return await apiService.get<PlatformSetting[]>('/settings');
  }

  /**
   * Get a specific setting value
   */
  async get(key: string): Promise<string | null> {
    const response = await apiService.get<{ value: string | null }>(`/settings/${key}`);
    return response.value;
  }

  /**
   * Set a setting value (Admin only)
   */
  async set(params: SetSettingParams): Promise<PlatformSetting> {
    return await apiService.post<PlatformSetting>('/settings', params);
  }

  /**
   * Delete a setting (Admin only)
   */
  async delete(key: string): Promise<void> {
    await apiService.delete(`/settings/${key}`);
  }

  /**
   * Check if AI features are enabled
   */
  async isAIEnabled(): Promise<boolean> {
    try {
      const value = await this.get('openai_enabled');
      return value === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Check if OpenAI API key is configured
   */
  async isOpenAIConfigured(): Promise<boolean> {
    try {
      const value = await this.get('openai_api_key');
      return value !== null && value.length > 0;
    } catch {
      return false;
    }
  }
}

export const settingsService = new SettingsService();
export default settingsService;
