# Setup Guide - Docker Edition

## Quick Start (Docker Only)

**Prerequisites:**
- Docker Desktop must be installed and running
- If you see "docker daemon is not running" error, start Docker Desktop from the Start menu

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start PostgreSQL and Redis with Docker**
   
   Run these commands in PowerShell or your terminal:
   
   ```powershell
   # Start PostgreSQL container
   docker run --name postgres-order-engine `
     -e POSTGRES_PASSWORD=postgres `
     -e POSTGRES_DB=order_engine `
     -p 5432:5432 `
     -d postgres:15
   
   # Start Redis container
   docker run --name redis-order-engine `
     -p 6379:6379 `
     -d redis:7-alpine
   ```
   
   **Verify containers are running:**
   ```powershell
   docker ps
   # You should see both postgres-order-engine and redis-order-engine containers
   ```

3. **Configure Environment**
   
   Create a `.env` file in the project root with the following content:
   ```env
   PORT=3000
   NODE_ENV=development
   
   # PostgreSQL connection (Docker default settings)
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/order_engine
   
   # Redis configuration (Docker default settings)
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   
   # Queue settings
   QUEUE_CONCURRENCY=10
   QUEUE_RATE_LIMIT=100
   ```

4. **Start the Server**
   ```bash
   npm run dev
   ```

The database schema will be automatically created on first run.

## Docker Management Commands

### Start Containers (if stopped)
```powershell
docker start postgres-order-engine
docker start redis-order-engine
```

### Stop Containers
```powershell
docker stop postgres-order-engine
docker stop redis-order-engine
```

### Remove Containers (to start fresh)
```powershell
docker stop postgres-order-engine redis-order-engine
docker rm postgres-order-engine redis-order-engine
```

### View Container Logs
```powershell
# PostgreSQL logs
docker logs postgres-order-engine

# Redis logs
docker logs redis-order-engine
```

### Access PostgreSQL Container
```powershell
# Connect to PostgreSQL inside the container
docker exec -it postgres-order-engine psql -U postgres -d order_engine
```

### Access Redis Container
```powershell
# Connect to Redis CLI inside the container
docker exec -it redis-order-engine redis-cli
```

## Verify Setup

1. **Check Health Endpoint**
   ```powershell
   # Using PowerShell
   Invoke-WebRequest -Uri http://localhost:3000/health
   
   # Or using curl (if available)
   curl http://localhost:3000/health
   ```

2. **Create a Test Order**
   ```powershell
   node examples/create-order.js
   ```

3. **Connect to WebSocket** (use orderId from step 2)
   ```powershell
   node examples/websocket-client.js <orderId>
   ```

## Troubleshooting

### Docker Daemon Not Running

If you see this error:
```
docker: error during connect: this error may indicate that the docker daemon is not running
```

**Solution:**
1. **Start Docker Desktop:**
   - Open Docker Desktop from the Start menu
   - Wait for Docker Desktop to fully start (you'll see a whale icon in the system tray)
   - The icon should be steady (not animated) when ready

2. **Verify Docker is running:**
   ```powershell
   docker ps
   # Should return an empty list or your running containers (not an error)
   ```

3. **If Docker Desktop won't start:**
   - Make sure virtualization is enabled in your BIOS
   - Check Windows Features: Enable "Virtual Machine Platform" and "Windows Subsystem for Linux" if needed
   - Restart your computer
   - Reinstall Docker Desktop if issues persist

### Docker Containers Not Running
```powershell
# Check container status
docker ps -a

# Start stopped containers
docker start postgres-order-engine redis-order-engine

# If containers don't exist, recreate them using the commands in step 2
```

### PostgreSQL Connection Error
- **Check if PostgreSQL container is running:**
  ```powershell
  docker ps | findstr postgres-order-engine
  ```
  
- **Verify DATABASE_URL in `.env`:**
  ```
  DATABASE_URL=postgresql://postgres:postgres@localhost:5432/order_engine
  ```
  
- **Check PostgreSQL logs:**
  ```powershell
  docker logs postgres-order-engine
  ```
  
- **Test connection from container:**
  ```powershell
  docker exec -it postgres-order-engine psql -U postgres -d order_engine -c "SELECT 1;"
  ```

### Redis Connection Error
- **Check if Redis container is running:**
  ```powershell
  docker ps | findstr redis-order-engine
  ```
  
- **Verify Redis settings in `.env`:**
  ```
  REDIS_HOST=localhost
  REDIS_PORT=6379
  ```
  
- **Check Redis logs:**
  ```powershell
  docker logs redis-order-engine
  ```
  
- **Test Redis connection:**
  ```powershell
  docker exec -it redis-order-engine redis-cli ping
  # Should return: PONG
  ```

### Port Already in Use
If ports 5432 (PostgreSQL) or 6379 (Redis) are already in use:

**Option 1: Stop existing containers/services using those ports**

**Option 2: Use different ports**
```powershell
# PostgreSQL on port 5433
docker run --name postgres-order-engine `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=order_engine `
  -p 5433:5432 `
  -d postgres:15

# Redis on port 6380
docker run --name redis-order-engine `
  -p 6380:6379 `
  -d redis:7-alpine
```

Then update your `.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/order_engine
REDIS_PORT=6380
```

## Alternative: Docker Compose (Optional)

For easier management, you can use `docker-compose.yml`:

Create `docker-compose.yml` in the project root:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: postgres-order-engine
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: order_engine
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: redis-order-engine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

Then use:
```powershell
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Stop and remove volumes (fresh start)
docker-compose down -v
```
