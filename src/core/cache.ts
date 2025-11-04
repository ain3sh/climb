/**
 * TTL-based Caching Layer
 * Improves performance by caching expensive list operations
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

export class TTLCache {
  private cache = new Map<string, CacheEntry<any>>();

  /**
   * Get cached data or fetch if expired/missing
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 30000 // 30 seconds default
  ): Promise<T> {
    const cached = this.cache.get(key);

    // Return cached data if not expired
    if (cached && Date.now() < cached.expiry) {
      return cached.data as T;
    }

    // Fetch fresh data
    const data = await fetcher();
    
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });

    return data;
  }

  /**
   * Invalidate specific key or all cache
   */
  invalidate(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const cached = this.cache.get(key);
    return !!cached && Date.now() < cached.expiry;
  }

  /**
   * Get cache stats
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const cache = new TTLCache();

// Periodic cleanup every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);
