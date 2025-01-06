interface CacheItem<T> {
  value: T;
  timestamp: number;
}

interface Cache {
  get: (key: string) => any | null;
  set: (key: string, value: any) => void;
  clear: () => void;
}

export function setupCache(): Cache {
  const cache = new Map<string, CacheItem<any>>();
  const CACHE_TTL = 1000 * 60 * 60; // 1 hour

  return {
    get: (key: string) => {
      const item = cache.get(key);
      if (!item) return null;

      const { value, timestamp } = item;
      if (Date.now() - timestamp > CACHE_TTL) {
        cache.delete(key);
        return null;
      }

      return value;
    },
    set: (key: string, value: any) => {
      cache.set(key, {
        value,
        timestamp: Date.now(),
      });
    },
    clear: () => {
      cache.clear();
    },
  };
}