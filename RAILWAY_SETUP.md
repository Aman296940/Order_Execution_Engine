# Railway Deployment Setup

This guide helps you fix the Redis connection issue on Railway.

## The Problem

Railway provides Redis via `REDIS_URL` environment variable, but the app might not be detecting it correctly.

## Solution Steps

### 1. Verify Redis Service is Added

In Railway dashboard:
- Go to your project
- Check if you see a "Redis" service
- If not, click "+ New" → "Database" → "Redis"

### 2. Link Redis to Your App

1. Click on your **Order_Execution_Engine** service
2. Go to **Variables** tab
3. Look for `REDIS_URL` - Railway should auto-add this when Redis is linked
4. If `REDIS_URL` is missing:
   - Go to your **Redis** service
   - Click **Variables** tab
   - Copy the `REDIS_URL` value
   - Go back to **Order_Execution_Engine** service
   - Add it as a new variable

### 3. Verify Environment Variables

In your **Order_Execution_Engine** service → **Variables**, ensure you have:

```
NODE_ENV=production
PORT=3000
REDIS_URL=<should be auto-set by Railway>
DATABASE_URL=<should be auto-set by Railway>
QUEUE_CONCURRENCY=10
QUEUE_RATE_LIMIT=100
```

**Important**: Railway automatically sets `REDIS_URL` and `DATABASE_URL` when you link services, but you need to make sure:
- Redis service is in the same project
- Services are linked (Railway does this automatically when you add them to the same project)

### 4. Manual Redis URL (If Auto-Link Fails)

If Railway didn't auto-link, you can manually add:

1. Go to **Redis** service → **Variables**
2. Copy the connection details (host, port, password)
3. Format as: `redis://default:PASSWORD@HOST:PORT`
4. Add to **Order_Execution_Engine** → **Variables** as `REDIS_URL`

### 5. Redeploy

After setting variables:
- Railway will auto-redeploy, OR
- Click **Deploy** button manually
- Check logs to verify Redis connection

## Troubleshooting

### Still Getting Connection Refused?

1. **Check Redis Service Status:**
   - Go to Redis service
   - Verify it's "Running" (not paused)
   - Railway free tier pauses services after inactivity

2. **Check Variable Names:**
   - Railway uses `REDIS_URL` (not `REDIS_HOST`)
   - The code now supports both formats

3. **Check Logs:**
   - Look for "Redis connected successfully" message
   - If you see connection errors, the URL format might be wrong

4. **Test Connection Format:**
   - `REDIS_URL` should look like: `redis://default:password@hostname:port`
   - Or: `rediss://default:password@hostname:port` (for SSL)

### Railway-Specific Notes

- Railway automatically links services in the same project
- `REDIS_URL` is set automatically when Redis is added
- Services must be in the same project to auto-link
- Free tier services may pause - they auto-resume on request

## Quick Fix Command

If you have Railway CLI installed:

```bash
railway variables set REDIS_URL=$(railway variables --service redis | grep REDIS_URL)
```

But the easiest way is through the Railway dashboard:
1. Redis service → Variables → Copy REDIS_URL
2. Order_Execution_Engine service → Variables → Add REDIS_URL

## After Fix

Once Redis connects, you should see in logs:
```
Redis connected successfully
```

And the deployment should stay running (not crash).

