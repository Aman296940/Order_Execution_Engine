import { orderQueue, enqueueOrder } from '../queue/orderQueue.js';

describe('Order Queue', () => {
  afterEach(async () => {
    await orderQueue.obliterate({ force: true });
  });

  test('should enqueue order', async () => {
    const orderId = 'test-order-123';
    await enqueueOrder(orderId);

    const job = await orderQueue.getJob(orderId);
    expect(job).toBeDefined();
    expect(job.data.orderId).toBe(orderId);
  });

  test('should prevent duplicate orders with same orderId', async () => {
    const orderId = 'test-order-456';
    await enqueueOrder(orderId);
    await enqueueOrder(orderId);

    const jobs = await orderQueue.getJobs(['waiting', 'active']);
    const jobsWithOrderId = jobs.filter(job => job.data.orderId === orderId);
    expect(jobsWithOrderId.length).toBe(1);
  });
});

