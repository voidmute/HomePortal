import Redis from "ioredis";

let redis: Redis | null = null;
let redisDisabled = false;

const memoryStore = new Map<string, { count: number; resetAt: number }>();

function disableRedis() {
  redisDisabled = true;
  if (redis) {
    redis.disconnect();
    redis = null;
  }
}

async function tryRedis(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number } | null> {
  const url = process.env.REDIS_URL;
  if (!url || redisDisabled) return null;

  if (!redis) {
    redis = new Redis(url, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
      retryStrategy: () => null,
    });
    redis.on("error", () => {
      disableRedis();
    });
  }

  try {
    if (redis.status === "wait") {
      await redis.connect();
    }
    if (redis.status !== "ready") return null;

    const redisKey = `ratelimit:${key}`;
    const current = await redis.incr(redisKey);
    if (current === 1) {
      await redis.pexpire(redisKey, windowMs);
    }
    return { allowed: current <= limit, remaining: Math.max(0, limit - current) };
  } catch {
    disableRedis();
    return null;
  }
}

function checkMemory(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  entry.count++;
  return { allowed: entry.count <= limit, remaining: Math.max(0, limit - entry.count) };
}

export async function checkRateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 15 * 60 * 1000
): Promise<{ allowed: boolean; remaining: number }> {
  const redisResult = await tryRedis(key, limit, windowMs);
  if (redisResult) return redisResult;
  return checkMemory(key, limit, windowMs);
}
