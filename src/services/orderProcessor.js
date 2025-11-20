import { OrderStatus, DexProvider } from '../types/order.js';
import { MockDexRouter } from './dexRouter.js';
import { saveOrder, getOrder } from '../database/postgres.js';
import { setActiveOrder, removeActiveOrder } from '../database/redis.js';
import { emitStatusUpdate } from '../websocket/manager.js';

const dexRouter = new MockDexRouter();

// Helper function for delays
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Process order through the execution pipeline
 */
export async function processOrder(orderId) {
  let order = await getOrder(orderId);
  if (!order) {
    throw new Error(`Order ${orderId} not found`);
  }

  try {
    // Step 1: PENDING -> ROUTING
    order.status = OrderStatus.ROUTING;
    await updateOrderStatus(order, null, null, null);
    await emitStatusUpdate(orderId, {
      status: OrderStatus.ROUTING,
      timestamp: new Date(),
    });

    // Step 2: Get best quote from DEXs
    const bestQuote = await dexRouter.getBestQuote(
      order.tokenIn,
      order.tokenOut,
      order.amountIn
    );

    // Step 3: ROUTING -> BUILDING
    order.status = OrderStatus.BUILDING;
    order.dexProvider = bestQuote.provider;
    await updateOrderStatus(order, null, null, null);
    await emitStatusUpdate(orderId, {
      status: OrderStatus.BUILDING,
      dexProvider: bestQuote.provider,
      timestamp: new Date(),
    });

    // Simulate transaction building delay
    await sleep(500);

    // Step 4: BUILDING -> SUBMITTED
    order.status = OrderStatus.SUBMITTED;
    await updateOrderStatus(order, null, null, null);
    await emitStatusUpdate(orderId, {
      status: OrderStatus.SUBMITTED,
      dexProvider: bestQuote.provider,
      timestamp: new Date(),
    });

    // Step 5: Execute swap
    const swapResult = await dexRouter.executeSwap(bestQuote.provider, order);

    // Step 6: SUBMITTED -> CONFIRMED
    order.status = OrderStatus.CONFIRMED;
    order.txHash = swapResult.txHash;
    order.executedPrice = swapResult.executedPrice;
    order.amountOut = swapResult.amountOut;
    await updateOrderStatus(order, swapResult.txHash, swapResult.executedPrice, swapResult.amountOut);
    await emitStatusUpdate(orderId, {
      status: OrderStatus.CONFIRMED,
      dexProvider: bestQuote.provider,
      txHash: swapResult.txHash,
      executedPrice: swapResult.executedPrice,
      timestamp: new Date(),
    });

    // Remove from active orders
    await removeActiveOrder(orderId);

    return order;
  } catch (error) {
    console.error(`Error processing order ${orderId}:`, error);
    
    // Handle retry logic
    if (order.retryCount < 3) {
      order.retryCount += 1;
      const backoffDelay = Math.pow(2, order.retryCount) * 1000; // Exponential backoff
      
      console.log(`Retrying order ${orderId} (attempt ${order.retryCount}/3) after ${backoffDelay}ms`);
      
      await updateOrderStatus(order, null, null, null);
      await sleep(backoffDelay);
      
      // Retry processing
      return await processOrder(orderId);
    } else {
      // Max retries reached - mark as failed
      order.status = OrderStatus.FAILED;
      order.error = error.message;
      await updateOrderStatus(order, null, null, null);
      await emitStatusUpdate(orderId, {
        status: OrderStatus.FAILED,
        error: error.message,
        timestamp: new Date(),
      });
      
      await removeActiveOrder(orderId);
      throw error;
    }
  }
}

async function updateOrderStatus(order, txHash, executedPrice, amountOut) {
  if (txHash) order.txHash = txHash;
  if (executedPrice) order.executedPrice = executedPrice;
  if (amountOut) order.amountOut = amountOut;
  
  await saveOrder(order);
  await setActiveOrder(order.id, order);
}

