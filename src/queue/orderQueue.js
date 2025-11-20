import { Queue, Worker } from 'bullmq';
import { redis } from '../database/redis.js';
import { processOrder } from '../services/orderProcessor.js';
import dotenv from 'dotenv';

dotenv.config();

// Create order queue
export const orderQueue = new Queue('order-execution', {
  connection: redis,
  defaultJobOptions: {
    attempts: 1, // We handle retries in processOrder
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 1000,
    },
    removeOnFail: {
      age: 86400, // Keep failed jobs for 24 hours
    },
  },
});

// Create worker with concurrency and rate limiting
const concurrency = parseInt(process.env.QUEUE_CONCURRENCY || '10');
const rateLimit = {
  max: parseInt(process.env.QUEUE_RATE_LIMIT || '100'),
  duration: 60000, // per minute
};

export const orderWorker = new Worker(
  'order-execution',
  async (job) => {
    const { orderId } = job.data;
    console.log(`Processing order ${orderId} (Job ID: ${job.id})`);
    
    try {
      const result = await processOrder(orderId);
      return result;
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency,
    limiter: rateLimit,
  }
);

orderWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

orderWorker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

orderWorker.on('error', (err) => {
  console.error('Order worker error:', err);
});

/**
 * Add order to queue
 */
export async function enqueueOrder(orderId) {
  await orderQueue.add('execute-order', { orderId }, {
    jobId: orderId, // Use orderId as jobId to prevent duplicates
    priority: 1,
  });
  console.log(`Order ${orderId} added to queue`);
}

