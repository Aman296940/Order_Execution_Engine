import { v4 as uuidv4 } from 'uuid';
import { OrderType, OrderStatus } from '../types/order.js';
import { saveOrder } from '../database/postgres.js';
import { setActiveOrder, setWebSocketConnection } from '../database/redis.js';
import { enqueueOrder } from '../queue/orderQueue.js';
import { registerConnection } from '../websocket/manager.js';

/**
 * Validate order request
 */
function validateOrderRequest(body) {
  const errors = [];

  if (!body.type || !Object.values(OrderType).includes(body.type)) {
    errors.push('Invalid order type. Must be one of: market, limit, sniper');
  }

  if (!body.tokenIn || typeof body.tokenIn !== 'string') {
    errors.push('tokenIn is required and must be a string');
  }

  if (!body.tokenOut || typeof body.tokenOut !== 'string') {
    errors.push('tokenOut is required and must be a string');
  }

  if (!body.amountIn || typeof body.amountIn !== 'number' || body.amountIn <= 0) {
    errors.push('amountIn is required and must be a positive number');
  }

  if (body.type === OrderType.LIMIT && (!body.limitPrice || body.limitPrice <= 0)) {
    errors.push('limitPrice is required for limit orders and must be positive');
  }

  return errors;
}

/**
 * POST /api/orders/execute
 * Creates order and returns orderId
 */
export async function executeOrderRoute(fastify) {
  fastify.post('/api/orders/execute', async (request, reply) => {
    try {
      // Validate request body
      const validationErrors = validateOrderRequest(request.body);
      if (validationErrors.length > 0) {
        return reply.code(400).send({
          error: 'Validation failed',
          details: validationErrors,
        });
      }

      // Create order
      const orderId = uuidv4();
      const order = {
        id: orderId,
        type: request.body.type,
        tokenIn: request.body.tokenIn,
        tokenOut: request.body.tokenOut,
        amountIn: request.body.amountIn,
        limitPrice: request.body.limitPrice,
        status: OrderStatus.PENDING,
        retryCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save order to database
      await saveOrder(order);
      await setActiveOrder(orderId, order);

      // Add to processing queue
      await enqueueOrder(orderId);

      // Return orderId for HTTP-only requests
      return reply.code(201).send({
        orderId,
        status: order.status,
        message: 'Order created successfully. Connect via WebSocket for status updates.',
        websocketUrl: `/api/orders/${orderId}/ws`,
      });
    } catch (error) {
      console.error('Error creating order:', error);
      return reply.code(500).send({
        error: 'Internal server error',
        message: error.message,
      });
    }
  });
}

/**
 * WebSocket handler for order status updates
 */
export async function orderWebSocketRoute(fastify) {
  fastify.get('/api/orders/:orderId/ws', { websocket: true }, (connection, req) => {
    const orderId = req.params.orderId;

    // Register WebSocket connection
    registerConnection(orderId, connection);

    // Send initial connection confirmation
    connection.socket.send(JSON.stringify({
      orderId,
      status: 'connected',
      message: 'WebSocket connection established',
      timestamp: new Date(),
    }));

    connection.socket.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Received message from order ${orderId}:`, data);
        
        // Echo back or handle ping/pong
        if (data.type === 'ping') {
          connection.socket.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date(),
          }));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
  });
}

