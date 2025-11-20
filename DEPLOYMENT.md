# Deployment Guide

This guide covers deploying the Order Execution Engine to free hosting platforms.

## Prerequisites

- GitHub repository with your code
- Account on one of the hosting platforms below

## Option 1: Railway (Recommended)

Railway provides easy PostgreSQL + Redis + Node.js deployment.

### Steps:

1. **Sign up at [railway.app](https://railway.app)**

2. **Create a new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account and select the repository

3. **Add PostgreSQL:**
   - Click "+ New" → "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL` environment variable

4. **Add Redis:**
   - Click "+ New" → "Database" → "Redis"
   - Railway will automatically set `REDIS_URL` environment variable

5. **Configure Environment Variables:**
   - Go to your service → "Variables"
   - Railway automatically sets `REDIS_URL` and `DATABASE_URL` when services are linked
   - Add manually if needed:
     ```
     NODE_ENV=production
     PORT=3000
     QUEUE_CONCURRENCY=10
     QUEUE_RATE_LIMIT=100
     ```

6. **Deploy:**
   - Railway will automatically deploy on push to main branch
   - Or click "Deploy" manually

7. **Get your URL:**
   - Railway provides a public URL like: `https://your-app.railway.app`
   - Update this in your README

### Railway Troubleshooting

**Redis Connection Issues:**

If you see `ECONNREFUSED` errors:

1. **Verify Redis Service:**
   - Check that Redis service exists in your Railway project
   - Ensure it's "Running" (not paused - free tier pauses after inactivity)

2. **Check REDIS_URL Variable:**
   - Go to Order_Execution_Engine service → Variables
   - Look for `REDIS_URL` - Railway should auto-set this
   - If missing:
     - Go to Redis service → Variables
     - Copy the `REDIS_URL` value
     - Add it to Order_Execution_Engine → Variables

3. **Verify Variable Format:**
   - `REDIS_URL` should be: `redis://default:password@hostname:port`
   - The code supports both `REDIS_URL` and individual `REDIS_HOST`/`REDIS_PORT` variables

4. **Check Logs:**
   - Look for "Redis connected successfully" message
   - Connection errors will show which address/port it's trying

**Note:** Railway automatically links services in the same project. If `REDIS_URL` isn't auto-set, services might not be properly linked.

## Option 2: Render

Render offers a free tier with PostgreSQL.

### Steps:

1. **Sign up at [render.com](https://render.com)**

2. **Create a new Web Service:**
   - Connect your GitHub repository
   - Build command: `npm install`
   - Start command: `npm start`

3. **Add PostgreSQL:**
   - Create a new PostgreSQL database
   - Copy the connection string to `DATABASE_URL`

4. **Add Redis (if needed):**
   - Use Redis Cloud free tier: [redis.com/try-free](https://redis.com/try-free)
   - Add connection details to environment variables

5. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=<from PostgreSQL>
   REDIS_HOST=<from Redis Cloud>
   REDIS_PORT=6379
   REDIS_PASSWORD=<from Redis Cloud>
   ```

6. **Deploy:**
   - Render will deploy automatically
   - Get your URL: `https://your-app.onrender.com`

## Option 3: Fly.io

Good for containerized deployments.

### Steps:

1. **Install Fly CLI:**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **Sign up and login:**
   ```bash
   fly auth signup
   fly auth login
   ```

3. **Create fly.toml:**
   ```bash
   fly launch
   ```

4. **Add PostgreSQL:**
   ```bash
   fly postgres create
   fly postgres attach <postgres-app-name>
   ```

5. **Add Redis:**
   ```bash
   fly redis create
   ```

6. **Deploy:**
   ```bash
   fly deploy
   ```

## Environment Variables for Production

Ensure these are set in your hosting platform:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=<postgresql-connection-string>
REDIS_HOST=<redis-host>
REDIS_PORT=6379
REDIS_PASSWORD=<redis-password-if-needed>
QUEUE_CONCURRENCY=10
QUEUE_RATE_LIMIT=100
```

## Post-Deployment Checklist

- [ ] Verify health endpoint: `https://your-url/health`
- [ ] Test order creation: `POST /api/orders/execute`
- [ ] Test WebSocket connection
- [ ] Check database connection
- [ ] Check Redis connection
- [ ] Update README with deployment URL
- [ ] Test with Postman collection using production URL

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correctly set
- Check if database is accessible from your hosting platform
- Ensure database is running and not paused (some free tiers pause after inactivity)

### Redis Connection Issues
- Verify Redis credentials are correct
- Check if Redis requires SSL/TLS (some cloud providers do)
- Ensure Redis is accessible from your hosting platform
- **Railway**: Ensure `REDIS_URL` is set (auto-set when Redis service is linked)
- **Railway**: Check that Redis service is running (not paused)

### Build Failures
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

## Monitoring

After deployment, monitor:
- Application logs for errors
- Database connection pool
- Redis connection status
- Queue processing times
- Order execution success rate

