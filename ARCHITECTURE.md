# 🏗️ Architecture: Single-Service vs Multi-Service

## ✅ Current Architecture (Single-Service)

```
Railway Project
├── Node.js Service (apps/backend)
│   ├── Express API (/api/*)
│   ├── Serves Web UI (all other routes)
│   └── Serves static files from apps/web/dist/
│
└── PostgreSQL Database
```

### How it works:

1. **Build Process**:
   - Backend TypeScript → JavaScript (`apps/backend/dist/`)
   - Web UI React → Static files (`apps/web/dist/`)
   - Backend serves web UI from `../web/dist/`

2. **Routing**:
   - `/api/artworks` → Backend API
   - `/robots.txt` → Backend API
   - `/terms` → Backend API
   - `/*` (everything else) → Web UI (React SPA)

3. **Deployment**:
   - One Railway service
   - Root directory: `apps/backend`
   - Builds both backend + web
   - Single domain: `https://your-app.railway.app`

### Advantages:

✅ **Lower Cost**: ~$10-20/month (vs $15-30)
✅ **No CORS Issues**: Same origin for API and UI
✅ **Simpler Management**: One service to monitor
✅ **Fewer Environment Variables**: No need for `VITE_API_BASE_URL`
✅ **Faster Builds**: Builds sequentially in one pipeline
✅ **Same Domain**: Better for SEO and sharing

---

## ❌ Old Architecture (Multi-Service)

```
Railway Project
├── Backend Service (apps/backend)
│   └── Express API only
│
├── Web Service (apps/web)
│   └── Serves React app
│
└── PostgreSQL Database
```

### How it worked:

1. **Build Process**:
   - Two separate build pipelines
   - Two separate deployments
   - Two separate domains

2. **Routing**:
   - `https://backend.railway.app/api/*` → API
   - `https://web.railway.app/*` → Web UI

3. **Cross-Origin Setup**:
   - Required CORS configuration
   - Required `VITE_API_BASE_URL` env var
   - Required `CORS_ORIGINS` env var

### Disadvantages:

❌ **Higher Cost**: ~$15-30/month
❌ **CORS Complexity**: Need to configure cross-origin
❌ **More Configuration**: More env vars to manage
❌ **Two Services**: More monitoring, more logs
❌ **Deployment Coordination**: Update both if API changes

---

## 🔄 Why We Changed

Your question: *"why do we put all of this as 3 separate services, that's just cooked for Railway, can't we use the same method we used with the imagethingy project?"*

**Answer**: You're absolutely right! We were over-engineering it.

### What we learned from imagethingy:

- Single Node.js service can serve both API and frontend
- Express can serve static files efficiently
- No need for separate services for simple projects
- Lower cost, simpler deployment

### When to use multi-service:

- Very high traffic (need independent scaling)
- Different tech stacks (e.g., Python backend, Node.js frontend server)
- Microservices architecture
- Team separation (backend team, frontend team)

### For QRart MVP:

Single-service is perfect because:
- Low to medium traffic expected
- Same tech stack (Node.js for both)
- Simple monorepo structure
- MVP cost optimization

---

## 📊 Cost Comparison

### Single-Service (Current)
```
Node.js Service: $5-10/month
PostgreSQL DB:   $5-10/month
─────────────────────────────
Total:           $10-20/month ✅
```

### Multi-Service (Old)
```
Backend Service: $5-10/month
Web Service:     $5-10/month
PostgreSQL DB:   $5-10/month
─────────────────────────────
Total:           $15-30/month ❌
```

**Savings: $5-10/month (33-50% cheaper!)**

---

## 🛠️ Technical Implementation

### Backend serves static files:

```typescript
// apps/backend/src/index.ts

if (process.env.NODE_ENV === 'production') {
  const webDistPath = new URL('../../web/dist', import.meta.url).pathname;
  
  // Serve static files
  app.use(express.static(webDistPath));
  
  // SPA fallback
  app.get('*', (_req, res) => {
    res.sendFile(`${webDistPath}/index.html`);
  });
}
```

### Build command:

```json
{
  "scripts": {
    "build:full": "npm run build && cd ../web && npm run build"
  }
}
```

### Railway configuration:

```toml
[build]
buildCommand = "npm install && npm run prisma:generate && npm run build:full"

[deploy]
startCommand = "npm run prisma:migrate:prod && npm run start"
```

---

## 🚀 Migration Impact

### What Changed:

✅ `apps/backend/src/index.ts` - Added static file serving
✅ `apps/backend/package.json` - Added `build:full` script
✅ `apps/backend/railway.toml` - Updated build command
✅ `apps/web/.env.example` - Removed `VITE_API_BASE_URL` requirement
✅ Deleted `apps/web/railway.toml` - No longer needed
✅ Documentation updated - RAILWAY.md, README.md, QUICKSTART.md

### What Didn't Change:

✅ All application code (API, Web UI, Extension)
✅ Database schema
✅ Local development workflow
✅ Extension functionality

### Backwards Compatible:

✅ Local dev still works the same (separate processes)
✅ Extension still works (just configure with single URL)
✅ API contracts unchanged

---

## 🎯 Summary

**Old Way (Multi-Service)**:
- Backend service + Web service + Database
- More expensive, more complex
- Good for: Large apps, microservices

**New Way (Single-Service)** ✅:
- One service serves both API and UI
- Cheaper, simpler, faster
- Good for: MVPs, small-medium apps

**Result**: Same functionality, 50% lower cost, simpler deployment! 🎉
