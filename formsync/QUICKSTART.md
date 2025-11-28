# Quick Start Guide

## Prerequisites Check

Before starting:
- ✅ PostgreSQL server running on localhost:5432
- ✅ Redis server running on localhost:6379
- ✅ Node.js >= 18.0.0 installed

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# From project root
cd C:\Users\Yasas Lakmina\.gemini\antigravity\scratch\formsync
npm install
```

### 2. Configure Environment

Edit `C:\Users\Yasas Lakmina\.gemini\antigravity\scratch\formsync\apps\schema-api\.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/formsync?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
OPENAI_API_KEY=your_key_here  # Optional for AI features
```

### 3. Database Setup

```bash
cd apps\schema-api
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

### 4. Start Development Servers

**Option A: Run both together (from project root)**
```bash
npm run dev
```

**Option B: Run separately (recommended for debugging)**

Terminal 1 - Backend:
```bash
cd apps\schema-api
npm run dev
```

Terminal 2 - Frontend:
```bash
cd apps\schema-ui  
npm run dev
```

## Access the Application

- **Frontend UI**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Check Redis is running
- Verify .env file exists and has correct credentials

### Frontend won't connect
- Ensure backend is running on port 3000
- Check browser console for CORS errors

### TypeScript errors
- Run `npm install` in project root
- Clear dist folders and rebuild

## Next Steps

1. Open http://localhost:5173 in your browser
2. Try the **Technical Editor** tab:
   - Paste some JSON/YAML/XML
   - Click "Convert to JSON Schema"
   - Click "Ask AI to Improve" (requires OpenAI key)
   - Click "Validate Schema"

3. Try the **Template Builder** tab:
   - Add fields using the form
   - Configure validations and accessibility
   - Click "Generate Schema"
   - Switch to Technical Editor to see the result
