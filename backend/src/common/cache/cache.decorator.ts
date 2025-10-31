import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache:key';
export const CACHE_TTL_METADATA = 'cache:ttl';
export const CACHE_TAGS_METADATA = 'cache:tags';

export interface CacheDecoratorOptions {
  /**
   * Cache key or function to generate key
   */
  key?: string | ((...args: any[]) => string);

  /**
   * TTL in seconds
   */
  ttl?: number;

  /**
   * Tags for cache invalidation
   */
  tags?: string[] | ((...args: any[]) => string[]);

  /**
   * Condition function to determine if should cache
   */
  condition?: (...args: any[]) => boolean;
}

/**
 * Decorator to cache method results
 * Usage:
 * @Cacheable({ key: 'user-profile', ttl: 300, tags: ['user'] })
 * async getUserProfile(userId: string) { ... }
 */
export function Cacheable(options: CacheDecoratorOptions = {}): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Check condition
      if (options.condition && !options.condition(...args)) {
        return originalMethod.apply(this, args);
      }

      const cacheService = (this as any).cacheService;
      if (!cacheService) {
        console.warn(
          `CacheService not found in ${target.constructor.name}. Skipping cache.`,
        );
        return originalMethod.apply(this, args);
      }

      // Generate cache key
      let cacheKey: string;
      if (typeof options.key === 'function') {
        cacheKey = options.key(...args);
      } else if (options.key) {
        cacheKey = options.key;
      } else {
        // Default key: className:methodName:args
        const className = target.constructor.name;
        const argsKey = JSON.stringify(args);
        cacheKey = `${className}:${String(propertyKey)}:${argsKey}`;
      }

      // Generate tags
      let tags: string[] | undefined;
      if (options.tags) {
        tags = typeof options.tags === 'function' ? options.tags(...args) : options.tags;
      }

      // Use cache service
      return cacheService.getOrSet(
        cacheKey,
        () => originalMethod.apply(this, args),
        {
          ttl: options.ttl,
          tags,
        },
      );
    };

    // Store metadata for potential use
    SetMetadata(CACHE_KEY_METADATA, options.key)(
      target,
      propertyKey,
      descriptor,
    );
    if (options.ttl) {
      SetMetadata(CACHE_TTL_METADATA, options.ttl)(
        target,
        propertyKey,
        descriptor,
      );
    }
    if (options.tags) {
      SetMetadata(CACHE_TAGS_METADATA, options.tags)(
        target,
        propertyKey,
        descriptor,
      );
    }

    return descriptor;
  };
}

/**
 * Decorator to invalidate cache after method execution
 * Usage:
 * @CacheEvict({ tags: ['user'] })
 * async updateUser(userId: string, data: any) { ... }
 */
export function CacheEvict(options: {
  key?: string | ((...args: any[]) => string);
  tags?: string[] | ((...args: any[]) => string[]);
  allEntries?: boolean;
}): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      const cacheService = (this as any).cacheService;
      if (!cacheService) {
        return result;
      }

      // Clear all entries
      if (options.allEntries) {
        await cacheService.reset();
        return result;
      }

      // Invalidate by key
      if (options.key) {
        const key =
          typeof options.key === 'function' ? options.key(...args) : options.key;
        await cacheService.del(key);
      }

      // Invalidate by tags
      if (options.tags) {
        const tags =
          typeof options.tags === 'function'
            ? options.tags(...args)
            : options.tags;
        await cacheService.invalidateByTags(tags);
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * Decorator to cache and evict simultaneously
 * Useful for updates that should invalidate old cache and set new
 */
export function CachePut(options: CacheDecoratorOptions & {
  evictTags?: string[];
}): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheService = (this as any).cacheService;
      if (!cacheService) {
        return originalMethod.apply(this, args);
      }

      // Evict old cache if tags specified
      if (options.evictTags) {
        await cacheService.invalidateByTags(options.evictTags);
      }

      // Execute method
      const result = await originalMethod.apply(this, args);

      // Generate cache key
      let cacheKey: string;
      if (typeof options.key === 'function') {
        cacheKey = options.key(...args);
      } else if (options.key) {
        cacheKey = options.key;
      } else {
        const className = target.constructor.name;
        const argsKey = JSON.stringify(args);
        cacheKey = `${className}:${String(propertyKey)}:${argsKey}`;
      }

      // Generate tags
      let tags: string[] | undefined;
      if (options.tags) {
        tags = typeof options.tags === 'function' ? options.tags(...args) : options.tags;
      }

      // Set cache
      await cacheService.set(cacheKey, result, {
        ttl: options.ttl,
        tags,
      });

      return result;
    };

    return descriptor;
  };
}
