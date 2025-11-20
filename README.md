# Order Execution Engine

A high-performance order execution engine with DEX routing and real-time WebSocket status updates. This engine processes market orders with intelligent routing between Raydium and Meteora DEXs to ensure best execution prices.

## 🎯 Order Type Choice: Market Orders

**Why Market Orders?**

I chose to implement **Market Orders** as the primary order type because:

1. **Simplicity & Clarity**: Market orders provide the clearest demonstration of the core architecture - DEX routing, queue management, and real-time status updates - without the complexity of price monitoring or launch detection.

2. **Immediate Execution**: Market orders execute immediately at the best available price, making it ideal for showcasing the routing logic and execution pipeline.

3. **Extensibility**: The same engine architecture can easily be extended to support Limit and Sniper orders:
   - **Limit Orders**: Add a price monitoring service that checks current market price against the limit price before routing to DEXs
   - **Sniper Orders**: Add a token launch/migration detection service that triggers execution when conditions are met

## 🏗️ Architecture

### Components

1. **Fastify Server**: HTTP server with WebSocket support for real-time updates
2. **DEX Router**: Mock implementation that fetches quotes from Raydium and Meteora, selecting the best price
3. **Order Queue**: BullMQ-based queue system with concurrency control (10 concurrent orders, 100 orders/minute)
4. **Database**: PostgreSQL for order history, Redis for active orders and WebSocket connections
5. **WebSocket Manager**: Handles real-time status updates to connected clients

### Order Execution Flow

```
1. POST /api/orders/execute
   ↓
2. Order Validation & Creation (status: "pending")
   ↓
3. Add to Processing Queue
   ↓
4. Worker picks up order
   ↓
5. DEX Routing (status: "routing")
   - Fetch quotes from Raydium & Meteora
   - Select best price
   ↓
6. Transaction Building (status: "building")
   ↓
7. Transaction Submission (status: "submitted")
   ↓
8. Execution & Confirmation (status: "confirmed")
   - Returns txHash and executed price
```

### Status Updates (via WebSocket)

- `pending` - Order received and queued
- `routing` - Comparing DEX prices
- `building` - Creating transaction
- `submitted` - Transaction sent to network
- `confirmed` - Transaction successful (includes `txHash`)
- `failed` - Execution failed (includes error message)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- Redis 6+

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd OrderExecutionEngine
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/order_engine

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

QUEUE_CONCURRENCY=10
QUEUE_RATE_LIMIT=100
```

4. Initialize PostgreSQL database:
```bash
# Create database
createdb order_engine

# Or using psql:
psql -U postgres -c "CREATE DATABASE order_engine;"
```

5. Start Redis:
```bash
redis-server
```

6. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### POST /api/orders/execute

Creates a new order and returns orderId.

**Request Body:**
```json
{
  "type": "market",
  "tokenIn": "SOL",
  "tokenOut": "USDC",
  "amountIn": 100
}
```

**Response:**
```json
{
  "orderId": "uuid-here",
  "status": "pending",
  "message": "Order created successfully. Connect via WebSocket for status updates."
}
```

### WebSocket: /api/orders/:orderId/ws

Connect to this endpoint to receive real-time status updates for an order.

**Connection:**
```javascript
const ws = new WebSocket('ws://localhost:3000/api/orders/{orderId}/ws');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('Status update:', update);
};
```

**Status Update Format:**
```json
{
  "orderId": "uuid-here",
  "status": "routing",
  "dexProvider": "raydium",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /health

Health check endpoint.

## 🧪 Testing

The project includes **24+ unit and integration tests** covering:
- DEX router logic and quote comparison
- Order queue behavior and concurrency
- WebSocket lifecycle and status updates
- Route validation and error handling
- Database operations
- Order processing pipeline

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 📖 Example Usage

### Create an Order

```bash
node examples/create-order.js
```

This will create a market order and return the `orderId` and WebSocket URL.

### Connect to WebSocket for Status Updates

```bash
node examples/websocket-client.js <orderId>
```

Replace `<orderId>` with the order ID returned from the create order endpoint.

### Complete Example Flow

```bash
# Terminal 1: Start the server
npm run dev

# Terminal 2: Create an order
node examples/create-order.js
# Copy the orderId from the output

# Terminal 3: Connect to WebSocket (replace ORDER_ID)
node examples/websocket-client.js ORDER_ID
```

You'll see real-time status updates as the order progresses through:
- `pending` → `routing` → `building` → `submitted` → `confirmed`

## 📊 Queue Configuration

- **Concurrency**: 10 orders processed simultaneously
- **Rate Limit**: 100 orders per minute
- **Retry Logic**: Exponential backoff with up to 3 attempts
- **Failed Orders**: Persisted with error details for post-mortem analysis

## 🔧 Mock Implementation Details

The current implementation uses mock DEX routing:

- **Raydium**: Simulates 200ms quote fetch, 0.3% fee, price variance 0.98-1.02x
- **Meteora**: Simulates 200ms quote fetch, 0.2% fee, price variance 0.97-1.02x
- **Execution**: Simulates 2-3 second transaction execution
- **Failures**: 5% random failure rate for testing retry logic

## 📦 Project Structure

```
OrderExecutionEngine/
├── src/
│   ├── __tests__/          # Test files
│   ├── database/           # PostgreSQL and Redis connections
│   ├── queue/              # BullMQ queue configuration
│   ├── routes/             # API routes
│   ├── services/           # Business logic (DEX router, order processor)
│   ├── types/              # Type definitions
│   ├── websocket/          # WebSocket connection manager
│   └── index.js            # Application entry point
├── package.json
├── jest.config.js
└── README.md
```

## 🚢 Deployment

### Production URL

**Deployed at:** https://orderexecutionengine-production.up.railway.app/

### Deploy to Railway (Recommended)

1. **Sign up at [railway.app](https://railway.app)**

2. **Create a new project:**
   - Click "New Project" → "Deploy from GitHub repo"
   - Connect your GitHub account and select the repository

3. **Add PostgreSQL:**
   - Click "+ New" → "Database" → "PostgreSQL"
   - Railway automatically sets `DATABASE_URL` environment variable

4. **Add Redis:**
   - Click "+ New" → "Database" → "Redis"
   - Railway automatically sets `REDIS_URL` environment variable

5. **Configure Environment Variables:**
   - Go to your service → "Variables"
   - Railway auto-sets `REDIS_URL` and `DATABASE_URL` when services are linked
   - Add if needed:
     ```
     NODE_ENV=production
     PORT=3000
     QUEUE_CONCURRENCY=10
     QUEUE_RATE_LIMIT=100
     ```

6. **Deploy:**
   - Railway automatically deploys on push to main branch
   - Get your public URL from Railway dashboard

### Environment Variables

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=<auto-set by Railway>
REDIS_URL=<auto-set by Railway>
QUEUE_CONCURRENCY=10
QUEUE_RATE_LIMIT=100
```

### Troubleshooting

**Redis Connection Issues on Railway:**
- Verify Redis service exists and is "Running" (not paused)
- Check that `REDIS_URL` is set in your service Variables
- If missing, copy `REDIS_URL` from Redis service → Variables and add to your app service
- Format should be: `redis://default:password@hostname:port`

**Note:** Railway automatically links services in the same project. The database schema is created automatically on first run.

## 📝 Postman/Insomnia Collection

See `postman_collection.json` for API collection with example requests.

## 🎥 Demo Video

**Video Link:** [Add YouTube link here after uploading]

The demo video shows:
- Order flow through the system and design decisions
- Submitting 3-5 orders simultaneously
- WebSocket showing all status updates (pending → routing → confirmed)
- DEX routing decisions in logs/console
- Queue processing multiple orders

## 🔍 Monitoring & Logging

- All order status transitions are logged
- DEX routing decisions are logged with price comparisons
- Failed orders include error details for debugging
- WebSocket connection lifecycle is tracked

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT

