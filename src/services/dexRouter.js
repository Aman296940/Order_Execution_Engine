import { DexProvider } from '../types/order.js';

// Mock base price for simulation
const BASE_PRICE = 1.0;

// Simulate network delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Generate mock transaction hash
const generateMockTxHash = () => {
  return '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

export class MockDexRouter {
  /**
   * Get quote from Raydium
   * Simulates network delay and price variance
   */
  async getRaydiumQuote(tokenIn, tokenOut, amount) {
    // Simulate network delay (200ms)
    await sleep(200);
    
    // Return price with some variance (0.98 to 1.02 of base price)
    const price = BASE_PRICE * (0.98 + Math.random() * 0.04);
    const fee = 0.003; // 0.3% fee
    
    return {
      provider: DexProvider.RAYDIUM,
      price,
      fee,
      amountOut: amount * price * (1 - fee),
      executionTime: 2000 + Math.random() * 1000, // 2-3 seconds
    };
  }

  /**
   * Get quote from Meteora
   * Simulates network delay and price variance
   */
  async getMeteoraQuote(tokenIn, tokenOut, amount) {
    // Simulate network delay (200ms)
    await sleep(200);
    
    // Return price with some variance (0.97 to 1.02 of base price)
    const price = BASE_PRICE * (0.97 + Math.random() * 0.05);
    const fee = 0.002; // 0.2% fee
    
    return {
      provider: DexProvider.METEORA,
      price,
      fee,
      amountOut: amount * price * (1 - fee),
      executionTime: 2000 + Math.random() * 1000, // 2-3 seconds
    };
  }

  /**
   * Get quotes from both DEXs and return the best one
   */
  async getBestQuote(tokenIn, tokenOut, amount) {
    try {
      // Fetch quotes concurrently
      const [raydiumQuote, meteoraQuote] = await Promise.all([
        this.getRaydiumQuote(tokenIn, tokenOut, amount),
        this.getMeteoraQuote(tokenIn, tokenOut, amount),
      ]);

      // Compare by amountOut (best execution price)
      const bestQuote = raydiumQuote.amountOut > meteoraQuote.amountOut 
        ? raydiumQuote 
        : meteoraQuote;

      console.log(`DEX Routing Decision:
        Raydium: ${raydiumQuote.amountOut.toFixed(8)} ${tokenOut} (price: ${raydiumQuote.price.toFixed(6)})
        Meteora: ${meteoraQuote.amountOut.toFixed(8)} ${tokenOut} (price: ${meteoraQuote.price.toFixed(6)})
        Selected: ${bestQuote.provider} (${bestQuote.amountOut.toFixed(8)} ${tokenOut})`);

      return bestQuote;
    } catch (error) {
      console.error('Error getting DEX quotes:', error);
      throw error;
    }
  }

  /**
   * Execute swap on the chosen DEX
   * Simulates transaction execution
   */
  async executeSwap(dexProvider, order) {
    // Simulate 2-3 second execution time
    const executionTime = 2000 + Math.random() * 1000;
    await sleep(executionTime);

    // Get quote for final execution price
    const quote = dexProvider === DexProvider.RAYDIUM
      ? await this.getRaydiumQuote(order.tokenIn, order.tokenOut, order.amountIn)
      : await this.getMeteoraQuote(order.tokenIn, order.tokenOut, order.amountIn);

    // Simulate occasional failures (5% failure rate)
    if (Math.random() < 0.05) {
      throw new Error(`Swap execution failed on ${dexProvider}: Network timeout`);
    }

    return {
      txHash: generateMockTxHash(),
      executedPrice: quote.price,
      amountOut: quote.amountOut,
    };
  }
}

