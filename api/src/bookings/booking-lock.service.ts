import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

const LOCK_TTL_MS = 10_000; // auto-expire safety net if release() is never called
                            // (e.g. process crash mid-booking) — see release() below.

@Injectable()
export class BookingLockService {
  constructor(private redis: RedisService) {}

  private buildKey(providerId: string, specialistId: string | null, scheduledAt: Date): string {
    // Lock is scoped to specialist when one is chosen (two different specialists
    // at the same salon can serve customers at the same time), and falls back to
    // provider-level when no specialist is assigned yet (service-first flow).
    const target = specialistId ? `specialist:${specialistId}` : `provider:${providerId}`;
    return `booking-lock:${target}:${scheduledAt.toISOString()}`;
  }

  /**
   * Attempts to acquire an exclusive lock on a booking slot.
   * Returns a lock token if successful, or null if the slot is already locked
   * by a concurrent request.
   *
   * Uses SET key value NX PX ttl — atomic in Redis, so two simultaneous
   * requests for the same slot can never both succeed.
   */
  async acquire(providerId: string, specialistId: string | null, scheduledAt: Date): Promise<string | null> {
    const key = this.buildKey(providerId, specialistId, scheduledAt);
    const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const result = await this.redis.client.set(key, token, 'PX', LOCK_TTL_MS, 'NX');
    return result === 'OK' ? token : null;
  }

  /**
   * Releases a lock — but only if the caller still holds it (token match).
   * Prevents a slow request from releasing a lock that's since been
   * re-acquired by someone else after this one's TTL expired.
   */
  async release(providerId: string, specialistId: string | null, scheduledAt: Date, token: string): Promise<void> {
    const key = this.buildKey(providerId, specialistId, scheduledAt);

    // Lua script makes the "check token, then delete" sequence atomic —
    // without this, a race between the GET and DEL could release someone
    // else's lock.
    const luaScript = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `;
    await this.redis.client.eval(luaScript, 1, key, token);
  }
}
