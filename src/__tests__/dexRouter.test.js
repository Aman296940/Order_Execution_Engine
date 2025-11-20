import { MockDexRouter } from '../services/dexRouter.js';
import { DexProvider } from '../types/order.js';

describe('MockDexRouter', () => {
  let router;

  beforeEach(() => {
    router = new MockDexRouter();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should get Raydium quote', async () => {
    const promise = router.getRaydiumQuote('SOL', 'USDC', 100);
    jest.advanceTimersByTime(200);
    const quote = await promise;

    expect(quote).toHaveProperty('provider', DexProvider.RAYDIUM);
    expect(quote).toHaveProperty('price');
    expect(quote).toHaveProperty('fee', 0.003);
    expect(quote).toHaveProperty('amountOut');
    expect(quote.price).toBeGreaterThan(0);
    expect(quote.amountOut).toBeGreaterThan(0);
  });

  test('should get Meteora quote', async () => {
    const promise = router.getMeteoraQuote('SOL', 'USDC', 100);
    jest.advanceTimersByTime(200);
    const quote = await promise;

    expect(quote).toHaveProperty('provider', DexProvider.METEORA);
    expect(quote).toHaveProperty('price');
    expect(quote).toHaveProperty('fee', 0.002);
    expect(quote).toHaveProperty('amountOut');
    expect(quote.price).toBeGreaterThan(0);
    expect(quote.amountOut).toBeGreaterThan(0);
  });

  test('should return best quote from both DEXs', async () => {
    const promise = router.getBestQuote('SOL', 'USDC', 100);
    jest.advanceTimersByTime(200);
    const bestQuote = await promise;

    expect(bestQuote).toHaveProperty('provider');
    expect([DexProvider.RAYDIUM, DexProvider.METEORA]).toContain(bestQuote.provider);
    expect(bestQuote).toHaveProperty('amountOut');
    expect(bestQuote.amountOut).toBeGreaterThan(0);
  });

  test('should execute swap successfully', async () => {
    // Use real timers for this test due to complex nested async operations
    jest.useRealTimers();
    
    const order = {
      tokenIn: 'SOL',
      tokenOut: 'USDC',
      amountIn: 100,
    };

    // Mock random to avoid failures
    jest.spyOn(Math, 'random').mockReturnValue(0.1);

    const result = await router.executeSwap(DexProvider.RAYDIUM, order);

    expect(result).toHaveProperty('txHash');
    expect(result).toHaveProperty('executedPrice');
    expect(result).toHaveProperty('amountOut');
    expect(result.txHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(result.executedPrice).toBeGreaterThan(0);

    jest.spyOn(Math, 'random').mockRestore();
    jest.useFakeTimers(); // Restore fake timers
  }, 10000); // Increase timeout to 10 seconds
});

