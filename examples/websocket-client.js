/**
 * Example WebSocket client for order status updates
 * 
 * Usage:
 *   node examples/websocket-client.js <orderId>
 * 
 * Or use in your own code:
 *   import WebSocket from 'ws';
 *   const ws = new WebSocket('ws://localhost:3000/api/orders/{orderId}/ws');
 */

import WebSocket from 'ws';

const orderId = process.argv[2];

if (!orderId) {
  console.error('Usage: node websocket-client.js <orderId>');
  console.error('Example: node websocket-client.js 123e4567-e89b-12d3-a456-426614174000');
  process.exit(1);
}

const wsUrl = `ws://localhost:3000/api/orders/${orderId}/ws`;
console.log(`Connecting to ${wsUrl}...`);

const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('✅ WebSocket connection established');
  
  // Send ping every 30 seconds to keep connection alive
  setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }));
    }
  }, 30000);
});

ws.on('message', (data) => {
  try {
    const update = JSON.parse(data.toString());
    console.log('\n📨 Status Update:');
    console.log(JSON.stringify(update, null, 2));
    
    if (update.status === 'confirmed') {
      console.log('\n✅ Order confirmed!');
      console.log(`Transaction Hash: ${update.txHash}`);
      console.log(`Executed Price: ${update.executedPrice}`);
      ws.close();
    } else if (update.status === 'failed') {
      console.log('\n❌ Order failed!');
      console.log(`Error: ${update.error}`);
      ws.close();
    }
  } catch (error) {
    console.error('Error parsing message:', error);
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error.message);
});

ws.on('close', () => {
  console.log('\n🔌 WebSocket connection closed');
  process.exit(0);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down...');
  ws.close();
});

