import { registerConnection, emitStatusUpdate, removeConnection } from '../websocket/manager.js';
import { OrderStatus } from '../types/order.js';

describe('WebSocket Manager', () => {
  let mockConnection;
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      readyState: 1, // OPEN
      send: jest.fn(),
      on: jest.fn(),
    };

    mockConnection = {
      socket: mockSocket,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should register WebSocket connection', () => {
    registerConnection('test-order-123', mockConnection);
    
    expect(mockSocket.on).toHaveBeenCalledWith('close', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  test('should emit status update to open connection', async () => {
    registerConnection('test-order-123', mockConnection);
    
    await emitStatusUpdate('test-order-123', {
      status: OrderStatus.ROUTING,
      timestamp: new Date(),
    });

    expect(mockSocket.send).toHaveBeenCalled();
    const sentData = JSON.parse(mockSocket.send.mock.calls[0][0]);
    expect(sentData.status).toBe(OrderStatus.ROUTING);
  });

  test('should not send to closed connection', async () => {
    mockSocket.readyState = 3; // CLOSED
    registerConnection('test-order-123', mockConnection);
    
    await emitStatusUpdate('test-order-123', {
      status: OrderStatus.ROUTING,
      timestamp: new Date(),
    });

    expect(mockSocket.send).not.toHaveBeenCalled();
  });

  test('should remove connection', () => {
    registerConnection('test-order-123', mockConnection);
    removeConnection('test-order-123');
    
    // Connection should be removed, so emitStatusUpdate should not send
    mockSocket.readyState = 1;
    emitStatusUpdate('test-order-123', {
      status: OrderStatus.ROUTING,
      timestamp: new Date(),
    });

    expect(mockSocket.send).not.toHaveBeenCalled();
  });
});

