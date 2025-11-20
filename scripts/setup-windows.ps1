# Windows Setup Script for Order Execution Engine
# Run this script in PowerShell as Administrator

Write-Host "🚀 Setting up Order Execution Engine on Windows..." -ForegroundColor Green

# Check if Docker is installed
Write-Host "`n📦 Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found. Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

# Check if Docker is running
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop" -ForegroundColor Red
    exit 1
}

# Set up PostgreSQL
Write-Host "`n🐘 Setting up PostgreSQL..." -ForegroundColor Yellow
$postgresContainer = docker ps -a --filter "name=postgres-order-engine" --format "{{.Names}}"
if ($postgresContainer -eq "postgres-order-engine") {
    Write-Host "PostgreSQL container exists. Starting it..." -ForegroundColor Yellow
    docker start postgres-order-engine
} else {
    Write-Host "Creating PostgreSQL container..." -ForegroundColor Yellow
    docker run --name postgres-order-engine `
        -e POSTGRES_PASSWORD=postgres `
        -e POSTGRES_DB=order_engine `
        -p 5432:5432 `
        -d postgres:15
    Start-Sleep -Seconds 5
}
Write-Host "✅ PostgreSQL is ready" -ForegroundColor Green

# Set up Redis
Write-Host "`n🔴 Setting up Redis..." -ForegroundColor Yellow
$redisContainer = docker ps -a --filter "name=redis-order-engine" --format "{{.Names}}"
if ($redisContainer -eq "redis-order-engine") {
    Write-Host "Redis container exists. Starting it..." -ForegroundColor Yellow
    docker start redis-order-engine
} else {
    Write-Host "Creating Redis container..." -ForegroundColor Yellow
    docker run --name redis-order-engine `
        -p 6379:6379 `
        -d redis:7-alpine
    Start-Sleep -Seconds 3
}
Write-Host "✅ Redis is ready" -ForegroundColor Green

# Check if .env file exists
Write-Host "`n📝 Checking environment configuration..." -ForegroundColor Yellow
if (-Not (Test-Path ".env")) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env file created. Please review and update if needed." -ForegroundColor Green
    } else {
        Write-Host "⚠️  .env.example not found. Creating default .env..." -ForegroundColor Yellow
        @"
PORT=3000
NODE_ENV=development

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/order_engine

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

QUEUE_CONCURRENCY=10
QUEUE_RATE_LIMIT=100
"@ | Out-File -FilePath ".env" -Encoding utf8
        Write-Host "✅ .env file created with default values." -ForegroundColor Green
    }
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Install npm dependencies
Write-Host "`n📦 Installing npm dependencies..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ package.json not found" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Review .env file and update if needed" -ForegroundColor White
Write-Host "2. Start the server: npm run dev" -ForegroundColor White
Write-Host "3. Test the API: node examples/create-order.js" -ForegroundColor White



