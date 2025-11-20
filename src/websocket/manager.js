// WebSocket connection manager
const connections = new Map();

/**
 * Register a WebSocket connection for an order
 */
export function registerConnection(orderId, connection) {
  connections.set(orderId, connection);
  console.log(`WebSocket connection registered for order ${orderId}`);
  
  // Fastify WebSocket connection uses socket property
  const socket = connection.socket;
  
  socket.on('close', () => {
    connections.delete(orderId);
    console.log(`WebSocket connection closed for order ${orderId}`);
  });
  
  socket.on('error', (error) => {
    console.error(`WebSocket error for order ${orderId}:`, error);
    connections.delete(orderId);
  });
}

/**
 * Emit status update to WebSocket connection
 */
export async function emitStatusUpdate(orderId, update) {
  const connection = connections.get(orderId);
  if (connection && connection.socket) {
    const socket = connection.socket;
    // Check if socket is open (1 = OPEN)
    if (socket.readyState === 1) {
      try {
        socket.send(JSON.stringify({
          orderId,
          ...update,
        }));
        console.log(`Status update sent for order ${orderId}:`, update.status);
      } catch (error) {
        console.error(`Error sending status update for order ${orderId}:`, error);
        connections.delete(orderId);
      }
    } else {
      console.warn(`WebSocket for order ${orderId} is not open (state: ${socket.readyState})`);
      connections.delete(orderId);
    }
  }
}

/**
 * Remove connection
 */
export function removeConnection(orderId) {
  connections.delete(orderId);
}

