/**
 * Example script to create an order
 * 
 * Usage:
 *   node examples/create-order.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function createOrder() {
  try {
    const response = await fetch(`${API_URL}/api/orders/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'market',
        tokenIn: 'SOL',
        tokenOut: 'USDC',
        amountIn: 100,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error, null, 2));
    }

    const result = await response.json();
    console.log('✅ Order created successfully!');
    console.log(JSON.stringify(result, null, 2));
    console.log(`\n📡 Connect to WebSocket: ws://localhost:3000${result.websocketUrl}`);
    console.log(`   Example: node examples/websocket-client.js ${result.orderId}`);
    
    return result.orderId;
  } catch (error) {
    console.error('❌ Error creating order:', error.message);
    process.exit(1);
  }
}

createOrder();

