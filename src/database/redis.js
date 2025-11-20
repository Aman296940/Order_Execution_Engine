import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Support both REDIS_URL (Railway format: redis://default:password@host:port)
// and individual host/port/password variables
function getRedisConfig() {
  const baseConfig = {
    maxRetriesPerRequest: null, // Required by BullMQ
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  };

  // Railway provides REDIS_URL as connection string
  if (process.env.REDIS_URL) {
    // ioredis can parse REDIS_URL directly
    return baseConfig;
  }
  
  // Fall back to individual variables for local development
  return {
    ...baseConfig,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  };
}

// Create Redis connection
// If REDIS_URL is provided (Railway), use it directly
// Otherwise, use individual config options
const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL, getRedisConfig())
  : new Redis(getRedisConfig());

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
  console.error('Redis config check:');
  console.error('  REDIS_URL:', process.env.REDIS_URL ? 'Set' : 'Not set');
  console.error('  REDIS_HOST:', process.env.REDIS_HOST || 'localhost (default)');
  console.error('  REDIS_PORT:', process.env.REDIS_PORT || '6379 (default)');
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
  if (process.env.REDIS_URL) {
    console.log('Using REDIS_URL connection string');
  } else {
    console.log(`Connected to ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`);
  }
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

