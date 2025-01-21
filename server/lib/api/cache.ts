import Redis from 'redis';
import { promisify } from 'util';

export class CacheManager {
  private client: Redis.RedisClient;
  private getAsync: (key: string) => Promise<string | null>;
  private setAsync: (key: string, value: string) => Promise<unknown>;
  private expireAsync: (key: string, seconds: number) => Promise<unknown>;

  constructor() {
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL environment variable is required for caching');
    }

    this.client = Redis.createClient({
      url: process.env.REDIS_URL,
      retry_strategy: (options) => {
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error('Retry time exhausted');
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.expireAsync = promisify(this.client.expire).bind(this.client);

    this.client.on('error', (err) => console.error('Redis Client Error:', err));
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.getAsync(key);
    return data ? JSON.parse(data) : null;
  }

  async set<T>(key: string, value: T, expireSeconds: number = 86400): Promise<void> {
    await this.setAsync(key, JSON.stringify(value));
    await this.expireAsync(key, expireSeconds);
  }

  async clearCache(pattern: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.keys(pattern, (err, keys) => {
        if (err) return reject(err);
        if (keys.length > 0) {
          this.client.del(keys, (err) => {
            if (err) return reject(err);
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }
}

export const cacheManager = new CacheManager();