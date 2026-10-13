
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  public readonly client: Redis;

  constructor(config: ConfigService) {
    const redisUrl = config.get<string>('REDIS_URL');

    if (!redisUrl) {
      throw new Error(
        'REDIS_URL is missing. Configure your Redis connection in the API .env file.',
      );
    }

    this.client = new Redis(redisUrl, {
      // Keep reconnecting after temporary network or Upstash failures.
      retryStrategy: (times: number) => Math.min(times * 500, 5000),

      // Fail commands promptly when Redis cannot respond.
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,

      // Connection health and network settings.
      enableReadyCheck: true,
      connectTimeout: 10000,
      keepAlive: 10000,
    });

    this.client.on('connect', () => {
      this.logger.log('Redis TCP connection established');
    });

    this.client.on('ready', () => {
      this.logger.log('Redis is ready to accept commands');
    });

    this.client.on('reconnecting', (delay: number) => {
      this.logger.warn(`Redis reconnecting in ${delay}ms`);
    });

    this.client.on('error', (err: Error) => {
      this.logger.warn(`Redis connection issue: ${err.message}`);
    });

    this.client.on('end', () => {
      this.logger.warn('Redis connection ended');
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.disconnect();
  }
}
