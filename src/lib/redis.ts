import { Redis } from 'ioredis'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

let redis: Redis | null = null

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(REDIS_URL, {
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      maxRetriesPerRequest: 3,
    })

    redis.on('error', (err) => {
      console.error('Redis error:', err)
    })

    redis.on('connect', () => {
      console.log('Redis connected')
    })
  }

  return redis
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient()
    const cached = await client.get(key)
    if (cached) {
      return JSON.parse(cached) as T
    }
    return null
  } catch {
    return null
  }
}

export async function setCachedData<T>(key: string, data: T, ttlSeconds = 3600): Promise<void> {
  try {
    const client = getRedisClient()
    await client.setex(key, ttlSeconds, JSON.stringify(data))
  } catch (err) {
    console.error('Redis cache set error:', err)
  }
}
