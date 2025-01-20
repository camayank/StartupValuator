interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

interface Cache {
  get: <T>(key: string, prefix?: string) => Promise<T | null>;
  set: <T>(key: string, value: T, ttl?: number, prefix?: string) => Promise<void>;
  clear: (prefix?: string) => Promise<void>;
}

export const setupCache = (): Cache => {
  const cache = new Map<string, CacheItem<any>>();
  const DEFAULT_TTL = 1000 * 60 * 60; // 1 hour
  const AI_ANALYSIS_TTL = 1000 * 60 * 30; // 30 minutes for AI responses

  const getFullKey = (key: string, prefix?: string) => 
    prefix ? `${prefix}:${key}` : key;

  return {
    get: async <T>(key: string, prefix?: string): Promise<T | null> => {
      const fullKey = getFullKey(key, prefix);
      const item = cache.get(fullKey);
      if (!item) return null;

      const { value, timestamp, ttl } = item;
      if (Date.now() - timestamp > ttl) {
        cache.delete(fullKey);
        return null;
      }

      return value as T;
    },

    set: async <T>(key: string, value: T, ttl = DEFAULT_TTL, prefix?: string): Promise<void> => {
      const fullKey = getFullKey(key, prefix);
      cache.set(fullKey, {
        value,
        timestamp: Date.now(),
        ttl: prefix?.startsWith('ai-analysis') ? AI_ANALYSIS_TTL : ttl,
      });
    },

    clear: async (prefix?: string): Promise<void> => {
      if (prefix) {
        for (const key of Array.from(cache.keys())) {
          if (key.startsWith(`${prefix}:`)) {
            cache.delete(key);
          }
        }
      } else {
        cache.clear();
      }
    },
  };
};

// Create and export the cache instance
export const cache = setupCache();