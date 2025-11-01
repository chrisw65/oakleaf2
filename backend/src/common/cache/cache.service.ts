import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Tags for cache invalidation
}

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.cacheManager.get<T>(key);
    return value ?? null;
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const ttl = options?.ttl ? options.ttl * 1000 : undefined; // Convert to milliseconds
    await this.cacheManager.set(key, value, ttl);

    // Store tags for invalidation
    if (options?.tags && options.tags.length > 0) {
      for (const tag of options.tags) {
        const tagKey = this.getTagKey(tag);
        const taggedKeys = (await this.get<string[]>(tagKey)) || [];
        if (!taggedKeys.includes(key)) {
          taggedKeys.push(key);
          await this.cacheManager.set(tagKey, taggedKeys);
        }
      }
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Clear all cache
   */
  async reset(): Promise<void> {
    // Note: reset() method might not be available in all cache managers
    // Use with caution or implement store-specific clearing
    if ('reset' in this.cacheManager && typeof (this.cacheManager as any).reset === 'function') {
      await (this.cacheManager as any).reset();
    } else {
      console.warn('Cache reset not supported by current cache manager');
    }
  }

  /**
   * Get or set cache (memoization pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  /**
   * Invalidate cache by tag
   */
  async invalidateByTag(tag: string): Promise<void> {
    const tagKey = this.getTagKey(tag);
    const taggedKeys = (await this.get<string[]>(tagKey)) || [];

    // Delete all keys with this tag
    for (const key of taggedKeys) {
      await this.del(key);
    }

    // Delete the tag itself
    await this.del(tagKey);
  }

  /**
   * Invalidate multiple tags
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    await Promise.all(tags.map((tag) => this.invalidateByTag(tag)));
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidateByPattern(pattern: string): Promise<void> {
    // Note: This requires Redis SCAN command
    // Implementation would depend on the cache store
    console.warn('Pattern invalidation not implemented for all cache stores');
  }

  /**
   * Check if key exists
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null && value !== undefined;
  }

  /**
   * Get cache key with tenant prefix
   */
  getTenantKey(tenantId: string, key: string): string {
    return `tenant:${tenantId}:${key}`;
  }

  /**
   * Get cache key for user
   */
  getUserKey(userId: string, key: string): string {
    return `user:${userId}:${key}`;
  }

  /**
   * Get cache key for entity
   */
  getEntityKey(entityType: string, entityId: string): string {
    return `entity:${entityType}:${entityId}`;
  }

  /**
   * Get tag key
   */
  private getTagKey(tag: string): string {
    return `tag:${tag}`;
  }

  /**
   * Wrap async function with caching
   */
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    return this.getOrSet(key, fn, options);
  }

  /**
   * Remember value for specific TTL
   */
  async remember<T>(
    key: string,
    ttl: number,
    factory: () => Promise<T>,
  ): Promise<T> {
    return this.getOrSet(key, factory, { ttl });
  }

  /**
   * Remember forever (very long TTL)
   */
  async rememberForever<T>(key: string, factory: () => Promise<T>): Promise<T> {
    return this.getOrSet(key, factory, { ttl: 60 * 60 * 24 * 365 }); // 1 year
  }

  /**
   * Increment counter
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    const current = (await this.get<number>(key)) || 0;
    const newValue = current + amount;
    await this.set(key, newValue);
    return newValue;
  }

  /**
   * Decrement counter
   */
  async decrement(key: string, amount: number = 1): Promise<number> {
    return this.increment(key, -amount);
  }

  /**
   * Cache multiple values at once
   */
  async mset(items: Array<{ key: string; value: any; options?: CacheOptions }>): Promise<void> {
    await Promise.all(
      items.map((item) => this.set(item.key, item.value, item.options)),
    );
  }

  /**
   * Get multiple values at once
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map((key) => this.get<T>(key)));
  }
}
