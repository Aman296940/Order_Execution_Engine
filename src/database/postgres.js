import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Parse connection string or use individual parameters
function getPoolConfig() {
  const connectionString = process.env.DATABASE_URL;
  
  if (connectionString && connectionString.trim()) {
    try {
      // Parse PostgreSQL connection string manually to handle empty passwords
      // Format: postgresql://user:password@host:port/database
      // Also handles: postgresql://user:@host:port/database (empty password)
      const urlMatch = connectionString.match(/^postgres(ql)?:\/\/(.+)$/);
      if (urlMatch) {
        const rest = urlMatch[2];
        // Split by @ to separate credentials from host
        const parts = rest.split('@');
        
        if (parts.length === 2) {
          const [credentials, hostPart] = parts;
          const [user, password] = credentials.split(':');
          const hostPortDb = hostPart.split('/');
          const hostPort = hostPortDb[0].split(':');
          
          const host = hostPort[0] || 'localhost';
          const port = hostPort[1] ? parseInt(hostPort[1]) : 5432;
          const database = hostPortDb[1] || 'order_engine';
          
          // If password is empty/undefined, use default
          const safePassword = (password && password !== '') 
            ? String(password) 
            : (process.env.DB_PASSWORD || 'postgres');
          
          return {
            host,
            port,
            database,
            user: user || 'postgres',
            password: String(safePassword),
          };
        }
      }
    } catch (error) {
      console.warn('Invalid DATABASE_URL format, using default connection:', error.message);
    }
  }
  
  // Default connection parameters (always use individual params for safety)
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'order_engine',
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || 'postgres'),
  };
}

const pool = new Pool(getPoolConfig());

// Initialize database schema
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        token_in VARCHAR(255) NOT NULL,
        token_out VARCHAR(255) NOT NULL,
        amount_in DECIMAL(20, 8) NOT NULL,
        amount_out DECIMAL(20, 8),
        limit_price DECIMAL(20, 8),
        status VARCHAR(50) NOT NULL,
        dex_provider VARCHAR(50),
        tx_hash VARCHAR(255),
        executed_price DECIMAL(20, 8),
        error TEXT,
        retry_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function saveOrder(order) {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO orders (
        id, type, token_in, token_out, amount_in, amount_out, limit_price,
        status, dex_provider, tx_hash, executed_price, error, retry_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        amount_out = EXCLUDED.amount_out,
        dex_provider = EXCLUDED.dex_provider,
        tx_hash = EXCLUDED.tx_hash,
        executed_price = EXCLUDED.executed_price,
        error = EXCLUDED.error,
        retry_count = EXCLUDED.retry_count,
        updated_at = CURRENT_TIMESTAMP`,
      [
        order.id,
        order.type,
        order.tokenIn,
        order.tokenOut,
        order.amountIn,
        order.amountOut,
        order.limitPrice,
        order.status,
        order.dexProvider,
        order.txHash,
        order.executedPrice,
        order.error,
        order.retryCount,
      ]
    );
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getOrder(orderId) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (result.rows.length === 0) return null;
    return mapRowToOrder(result.rows[0]);
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getOrdersByStatus(status, limit = 100) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC LIMIT $2',
      [status, limit]
    );
    return result.rows.map(mapRowToOrder);
  } catch (error) {
    console.error('Error getting orders by status:', error);
    throw error;
  } finally {
    client.release();
  }
}

function mapRowToOrder(row) {
  return {
    id: row.id,
    type: row.type,
    tokenIn: row.token_in,
    tokenOut: row.token_out,
    amountIn: parseFloat(row.amount_in),
    amountOut: row.amount_out ? parseFloat(row.amount_out) : undefined,
    limitPrice: row.limit_price ? parseFloat(row.limit_price) : undefined,
    status: row.status,
    dexProvider: row.dex_provider,
    txHash: row.tx_hash,
    executedPrice: row.executed_price ? parseFloat(row.executed_price) : undefined,
    error: row.error,
    retryCount: row.retry_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export { pool };

