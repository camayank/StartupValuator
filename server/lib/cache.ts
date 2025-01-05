export function setupCache() {
  const cache = new Map<string, any>();
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
