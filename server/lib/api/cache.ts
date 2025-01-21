import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

export class CacheManager {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL environment variable is required for caching');
    }

    this.client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            throw new Error('Redis connection lost');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
      this.isConnected = true;
    });

    this.client.connect().catch(console.error);
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) {
      console.warn('Redis not connected, skipping cache get');
      return null;
    }

    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, expireSeconds: number = 86400): Promise<void> {
    if (!this.isConnected) {
      console.warn('Redis not connected, skipping cache set');
      return;
    }

    try {
      await this.client.set(key, JSON.stringify(value), {
        EX: expireSeconds
      });
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async clearCache(pattern: string): Promise<void> {
    if (!this.isConnected) {
      console.warn('Redis not connected, skipping cache clear');
      return;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('Redis clear cache error:', error);
    }
  }
}

export const cacheManager = new CacheManager();