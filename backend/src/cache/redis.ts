import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

export const redis = createClient({ url: redisUrl });

redis.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('[redis] error', err);
});

export async function ensureRedis(): Promise<void> {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

export async function invalidateUserSearchCache(userId: number): Promise<void> {
  await ensureRedis();
  const pattern = `notes:search:${userId}:*`;
  const iter = redis.scanIterator({ MATCH: pattern, COUNT: 100 });
  const keys: string[] = [];
  for await (const key of iter) {
    keys.push(String(key));
    if (keys.length >= 1000) {
      await redis.del(keys);
      keys.length = 0;
    }
  }
  if (keys.length) await redis.del(keys);
} 