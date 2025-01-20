interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

interface Cache {
  get: <T>(key: string, prefix?: string) => T | null;
  set: <T>(key: string, value: T, ttl?: number, prefix?: string) => void;
  clear: (prefix?: string) => void;
}

export function setupCache(): Cache {
  const cache = new Map<string, CacheItem<any>>();
  const DEFAULT_TTL = 1000 * 60 * 60; // 1 hour

  const getFullKey = (key: string, prefix?: string) => 
    prefix ? `${prefix}:${key}` : key;

  return {
    get: <T>(key: string, prefix?: string): T | null => {
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
    set: <T>(key: string, value: T, ttl = DEFAULT_TTL, prefix?: string): void => {
      const fullKey = getFullKey(key, prefix);
      cache.set(fullKey, {
        value,
        timestamp: Date.now(),
        ttl,
      });
    },
    clear: (prefix?: string): void => {
      if (prefix) {
        for (const key of cache.keys()) {
          if (key.startsWith(`${prefix}:`)) {
            cache.delete(key);
          }
        }
      } else {
        cache.clear();
      }
    },
  };
}