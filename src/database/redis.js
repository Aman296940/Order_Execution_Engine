import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required by BullMQ
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

export async function setActiveOrder(orderId, orderData) {
  await redis.setex(`order:${orderId}`, 3600, JSON.stringify(orderData)); // 1 hour TTL
}

export async function getActiveOrder(orderId) {
  const data = await redis.get(`order:${orderId}`);
  return data ? JSON.parse(data) : null;
}

export async function removeActiveOrder(orderId) {
  await redis.del(`order:${orderId}`);
}

export async function setWebSocketConnection(orderId, connectionId) {
  await redis.setex(`ws:${orderId}`, 3600, connectionId);
}

export async function getWebSocketConnection(orderId) {
  return await redis.get(`ws:${orderId}`);
}

export { redis };

