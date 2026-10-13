
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

// Safety expiry in case a process crashes before releasing its lock.
const LOCK_TTL_MS = 30_000;

@Injectable()
export class BookingLockService {
  private readonly logger = new Logger(BookingLockService.name);

  constructor(private readonly redis: RedisService) {}

  private buildKey(
    providerId: string,
    specialistId: string | null,
    scheduledAt: Date,
  ): string {
    const target = specialistId
      ? `specialist:${specialistId}`
      : `provider:${providerId}`;

    return `booking-lock:${target}:${scheduledAt.toISOString()}`;
  }

  async acquire(
    providerId: string,
    specialistId: string | null,
    scheduledAt: Date,
  ): Promise<string | null> {
    const client = this.redis.client;

    // Do not attempt a lock using a disconnected Redis client.
    if (client.status !== 'ready') {
      throw new ServiceUnavailableException(
        'Booking is temporarily unavailable. Please try again shortly.',
      );
    }

    const key = this.buildKey(providerId, specialistId, scheduledAt);
    const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      const result = await client.set(
        key,
        token,
        'PX',
        LOCK_TTL_MS,
        'NX',
      );

      // null means another request already holds this lock.
      return result === 'OK' ? token : null;
    } catch (error) {
      this.logger.error(
        'Failed to acquire booking lock',
        error instanceof Error ? error.stack : String(error),
      );

      throw new ServiceUnavailableException(
        'Booking is temporarily unavailable because the booking lock service could not be reached. Please try again shortly.',
      );
    }
  }

  async release(
    providerId: string,
    specialistId: string | null,
    scheduledAt: Date,
    token: string,
  ): Promise<void> {
    const client = this.redis.client;
    const key = this.buildKey(providerId, specialistId, scheduledAt);

    const luaScript = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `;

    try {
      if (client.status !== 'ready') {
        this.logger.warn(
          'Redis unavailable while releasing booking lock; lock will expire automatically.',
        );
        return;
      }

      await client.eval(luaScript, 1, key, token);
    } catch (error) {
      // Do not mask a booking result if the database operation already
      // succeeded. Redis will expire this lock after its TTL.
      this.logger.warn(
        `Could not release booking lock: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
