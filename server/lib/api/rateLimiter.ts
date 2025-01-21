import { RateLimiterRedis } from 'rate-limiter-flexible';
import { createClient } from 'redis';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is required for rate limiting');
}

const redisClient = createClient({
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

redisClient.on('error', (err) => {
  console.error('Redis Rate Limiter Error:', err);
});

redisClient.connect().catch(console.error);

export const apiRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'api_rate_limit',
  points: 100, // Number of requests
  duration: 60, // Per minute
});

export class APIRateLimiter {
  private limiter: RateLimiterRedis;
  private serviceName: string;

  constructor(serviceName: string, pointsPerMinute: number) {
    this.serviceName = serviceName;
    this.limiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: `rate_limit_${serviceName}`,
      points: pointsPerMinute,
      duration: 60
    });
  }

  async checkRateLimit(): Promise<void> {
    try {
      await this.limiter.consume(this.serviceName);
    } catch (error) {
      throw new Error(`Rate limit exceeded for ${this.serviceName}`);
    }
  }
}