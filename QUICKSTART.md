# Quick Start Guide

## Indian Startup Valuation Platform

Get up and running in 5 minutes!

---

## Prerequisites

- ✅ Node.js 20+ installed
- ✅ PostgreSQL 15+ installed and running
- ✅ Git installed
- ✅ Terminal/Command line access

---

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/camayank/StartupValuator.git
cd StartupValuator
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages (~2-3 minutes).

### 3. Set Up Database

**Option A: Using existing PostgreSQL**

```bash
# Create database
createdb startup_valuator

# Or using psql
psql -U postgres
CREATE DATABASE startup_valuator;
\q
```

**Option B: Using Docker**

```bash
docker run --name postgres-valuator \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=startup_valuator \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### 4. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
nano .env  # or use your favorite editor
```

Minimal required configuration:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/startup_valuator
JWT_SECRET=your-secret-key-here
```

### 5. Run Database Migrations

**Option A: Using Drizzle**

```bash
npm run db:push
```

**Option B: Manual SQL**

```bash
psql -U postgres -d startup_valuator -f db/migrations/001_indian_startup_schema.sql
```

### 6. Start Development Server

```bash
npm run dev
```

Server will start at **http://localhost:3000**

---

## Verify Installation

### Check Server Status

```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Check Database Connection

```bash
# In PostgreSQL
psql -U postgres -d startup_valuator

# List tables
\dt

# Should see:
# - companies
# - financial_data
# - valuations
# - investment_readiness_scores
# - government_schemes
# etc.
```

---

## Quick Test - Run a Valuation

### Using cURL

```bash
# Create a test company (replace with your auth token after implementing auth)
curl -X POST http://localhost:3000/api/v1/companies \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Fintech Pvt Ltd",
    "legalEntityType": "pvt_ltd",
    "incorporationDate": "2022-01-15",
    "industrySector": "fintech",
    "currentStage": "revenue",
    "registeredAddress": "123 MG Road",
    "state": "Karnataka",
    "city": "Bangalore",
    "pincode": "560001"
  }'
```

### Using TypeScript (in Node REPL)

```bash
node --loader ts-node/esm
```

```typescript
import { calculateBerkusValuation } from './server/services/valuation';

const result = await calculateBerkusValuation({
  soundIdea: 8,
  prototypeExists: true,
  qualityManagementTeam: 7,
  strategicRelationships: 6,
  productRolloutOrSales: 5
});

console.log(`Valuation: ₹${(result.equityValue / 10000000).toFixed(2)} crore`);
```

---

## Common Issues & Solutions

### Issue 1: Port 3000 already in use

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Issue 2: Database connection failed

```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
psql postgresql://postgres:password@localhost:5432/startup_valuator
```

### Issue 3: TypeScript errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript version
npx tsc --version  # Should be 5.6.x
```

### Issue 4: Permission denied on migrations

```bash
# Fix file permissions
chmod +x db/migrations/*.sql

# Or run with sudo
sudo psql -U postgres -d startup_valuator -f db/migrations/001_indian_startup_schema.sql
```

---

## Next Steps

### 1. Explore the Code

```bash
# Core valuation engines
cd server/services/valuation
ls -la
# dcf.service.ts
# berkus.service.ts
# scorecard.service.ts
# etc.

# Database schema
cd db/schema
cat indian-startup.ts
```

### 2. Read Documentation

- **Full README**: [`README_INDIAN_STARTUP_PLATFORM.md`](README_INDIAN_STARTUP_PLATFORM.md)
- **Implementation Summary**: [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md)

### 3. Run Tests (Coming Soon)

```bash
npm test
```

### 4. Build for Production

```bash
npm run build
npm start
```

---

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/my-new-feature
```

### 2. Make Changes

```bash
# Edit files
code .

# Check types
npm run check

# Format code
npm run format  # (if configured)
```

### 3. Commit & Push

```bash
git add .
git commit -m "Add: my new feature"
git push origin feature/my-new-feature
```

### 4. Create Pull Request

Go to GitHub and create a PR from your branch.

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run check            # TypeScript type checking
npm run build            # Build for production

# Database
npm run db:push          # Push schema changes
npm run db:pull          # Pull schema from database
npm run db:studio        # Open Drizzle Studio (GUI)

# Docker
docker-compose up -d     # Start all services
docker-compose down      # Stop all services
docker-compose logs -f   # View logs

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report
```

---

## Configuration Tips

### Environment-Specific Configs

```bash
# Development
cp .env.example .env.development
export NODE_ENV=development

# Staging
cp .env.example .env.staging
export NODE_ENV=staging

# Production
cp .env.example .env.production
export NODE_ENV=production
```

### Database Connection Pooling

```env
# For high traffic
DB_POOL_MIN=10
DB_POOL_MAX=50
```

### Enable Debug Logging

```env
LOG_LEVEL=debug
NODE_ENV=development
```

---

## Support & Help

- **Documentation**: Full docs in `README_INDIAN_STARTUP_PLATFORM.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Issues**: GitHub Issues tab
- **Email**: support@ca4cpa.com

---

## Quick Reference

### Indian Regulatory Formats

```typescript
CIN:  L99999MH2020PTC999999
GST:  22AAAAA0000A1Z5
PAN:  AAAAA9999A
Phone: 9876543210 (starts with 6-9)
Pincode: 400001 (6 digits)
```

### Valuation Ranges

| Stage | Pre-Revenue | Seed | Series A |
|-------|------------|------|----------|
| **Fintech** | ₹2.5cr | ₹6cr | ₹20cr |
| **SaaS** | ₹2.2cr | ₹5.5cr | ₹18cr |
| **E-commerce** | ₹1.5cr | ₹4cr | ₹12cr |

### Investment Readiness

| Score | Status | Meaning |
|-------|--------|---------|
| **80-100** | Highly Ready | Investor-ready |
| **65-79** | Ready | Minor improvements needed |
| **50-64** | Moderate | 2-4 months to ready |
| **35-49** | Needs Improvement | 4-6 months required |
| **0-34** | Not Ready | 9-12 months to ready |

---

**You're all set! Start building amazing valuations! 🚀**
