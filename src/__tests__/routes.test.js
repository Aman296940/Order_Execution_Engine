import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import { executeOrderRoute } from '../routes/orders.js';
import { OrderType } from '../types/order.js';

describe('Order Routes', () => {
  let app;

  beforeEach(async () => {
    app = Fastify();
    await app.register(fastifyWebsocket);
    await app.register(executeOrderRoute);
  });

  afterEach(async () => {
    await app.close();
  });

  test('POST /api/orders/execute should create order with valid data', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/orders/execute',
      payload: {
        type: OrderType.MARKET,
        tokenIn: 'SOL',
        tokenOut: 'USDC',
        amountIn: 100,
      },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('orderId');
    expect(body).toHaveProperty('status', 'pending');
  });

  test('POST /api/orders/execute should reject invalid order type', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/orders/execute',
      payload: {
        type: 'invalid',
        tokenIn: 'SOL',
        tokenOut: 'USDC',
        amountIn: 100,
      },
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('error', 'Validation failed');
  });

  test('POST /api/orders/execute should reject missing required fields', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/orders/execute',
      payload: {
        type: OrderType.MARKET,
        tokenIn: 'SOL',
        // missing tokenOut and amountIn
      },
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('error', 'Validation failed');
  });

  test('POST /api/orders/execute should require limitPrice for limit orders', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/orders/execute',
      payload: {
        type: OrderType.LIMIT,
        tokenIn: 'SOL',
        tokenOut: 'USDC',
        amountIn: 100,
        // missing limitPrice
      },
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('error', 'Validation failed');
  });
});

