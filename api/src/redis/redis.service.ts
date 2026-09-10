import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  public readonly client: Redis;

  constructor(config: ConfigService) {
    this.client = new Redis(config.get<string>('REDIS_URL') ?? 'redis://localhost:6379', {
      // Limits retry spam to a fixed number of attempts with backoff,
      // instead of hammering the connection every second forever.
      retryStrategy: (times) => {
        if (times > 5) return null; // stop retrying after 5 attempts
        return Math.min(times * 500, 3000);
      },
      maxRetriesPerRequest: 1, // fail fast per-command instead of queuing forever
    });

    // Log once per state change instead of letting ioredis's default
    // unhandled-error spam flood the console every reconnect attempt.
    this.client.on('error', (err) => {
      this.logger.warn(`Redis connection issue: ${err.message}`);
    });
    this.client.on('connect', () => {
      this.logger.log('Redis connected');
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}