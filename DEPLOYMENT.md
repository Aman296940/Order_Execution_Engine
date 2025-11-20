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
   - Add:
     ```
     NODE_ENV=production
     PORT=3000
     REDIS_HOST=<from Redis service>
     REDIS_PORT=6379
     ```

6. **Deploy:**
   - Railway will automatically deploy on push to main branch
   - Or click "Deploy" manually

7. **Get your URL:**
   - Railway provides a public URL like: `https://your-app.railway.app`
   - Update this in your README

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

