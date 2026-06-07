import redis from './redis';

export async function checkRateLimit(userId: string, tool: string): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rate:${userId}:${tool}`;
  const limit = 10; // 10 requests per minute per tool
  const window = 60; // seconds

  const current = await redis.incr(key);
  if (current === 1) await redis.expire(key, window);

  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
  };
}
