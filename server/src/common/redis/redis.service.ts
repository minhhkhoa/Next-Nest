import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://127.0.0.1:6379';

    this.client = new Redis(redisUrl, {
      connectTimeout: 7000,
      lazyConnect: false,
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
    });

    this.client.on('error', (error) => {
      this.logger.error(`Redis Connection Error: ${error?.message || error}`);
    });
  }

  async get<T = any>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (value === null) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async set(key: string, value: unknown, ttlMs?: number): Promise<void> {
    const payload = typeof value === 'string' ? value : JSON.stringify(value);

    if (typeof ttlMs === 'number' && ttlMs > 0) {
      await this.client.set(key, payload, 'PX', ttlMs);
      return;
    }

    await this.client.set(key, payload);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}
