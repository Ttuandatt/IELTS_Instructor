# 🚀 Dev Onboarding Guide — IELTS Helper

> **Mã tài liệu:** STEP4-ONBOARD  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft

---

## 1. Prerequisites

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | 20 LTS+ | `node -v` |
| pnpm (or npm) | 8+ | `pnpm -v` |
| Docker Desktop | Latest | `docker -v` |
| Git | 2.30+ | `git -v` |
| VS Code | Latest | — |
| LLM API Key | — | At least one: OpenAI or Google |

### Recommended VS Code Extensions

| Extension | Purpose |
|-----------|---------|
| ESLint | Linting |
| Prettier | Formatting |
| Tailwind CSS IntelliSense | CSS class autocomplete |
| Prisma (if using Prisma) | Schema highlighting |
| Thunder Client | API testing (alternative to Postman) |
| Docker | Container management |

---

## 2. Initial Setup

### Step 1: Clone & Install

```bash
# Clone repository
git clone <repo-url> ielts-helper
cd ielts-helper

# Install dependencies
pnpm install
# or
cd apps/frontend && npm install && cd ../backend && npm install && cd ../..
```

### Step 2: Environment Configuration

```bash
# Copy environment templates
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Edit backend .env with your values:
# - DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ielts_helper
# - REDIS_URL=redis://localhost:6379
# - JWT_SECRET=<generate-a-random-string>
# - JWT_REFRESH_SECRET=<generate-another-random-string>
# - OPENAI_API_KEY=sk-...  (or GOOGLE_API_KEY)
# - ADMIN_PASSWORD=<choose-admin-password>
# - INSTRUCTOR_PASSWORD=<choose-instructor-password>  (for seed instructor user)

# Edit frontend .env:
# - NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Step 3: Start Infrastructure

```bash
# Start Postgres + Redis via Docker
docker compose up -d

# Verify containers are running
docker compose ps
# Expected: postgres (5432), redis (6379) both "Up"
```

### Step 4: Database Setup

```bash
cd apps/backend

# Run migrations
npx prisma migrate deploy

# Seed initial data (admin user + sample content)
npm run seed
```

### Step 5: Start Applications

```bash
# Terminal 1: Backend (port 3001)
cd apps/backend
npm run start:dev

# Terminal 2: Frontend (port 3000)
cd apps/frontend
npm run dev

# Terminal 3: Worker (if separate process)
cd apps/backend
npm run worker:dev
```

### Step 6: Verify

```bash
# Health check
curl http://localhost:3001/api/health
# Expected: {"status":"ok","db":true,"redis":true}

# Open frontend
# Navigate to http://localhost:3000
# Login with admin credentials from .env

# Instructor panel
# Login as instructor → navigate to http://localhost:3000/instructor/writing-submissions
```

---

## 3. Sharing via Dev Tunnel

### Option A: VS Code Dev Tunnels

1. Open VS Code Command Palette: `Ctrl+Shift+P`
2. Search "Forward a Port"
3. Forward ports 3000 and 3001
4. Set visibility to "Public" (or "Organization")
5. Share the generated URLs

### Option B: Manual Port Forward

```bash
# Using VS Code "Ports" panel (bottom bar)
# Click "Forward Port" → 3000, 3001
# Right-click → "Port Visibility" → "Public"
```

**Note:** Update `NEXT_PUBLIC_API_URL` in frontend `.env` to point to the tunnel URL for backend when sharing.

---

## 4. Common Development Tasks

| Task | Command |
|------|---------|
| Start backend | `cd apps/backend && npm run start:dev` |
| Start frontend | `cd apps/frontend && npm run dev` |
| Run backend tests | `cd apps/backend && npm test` |
| Run frontend tests | `cd apps/frontend && npm test` |
| Run linting | `npm run lint` |
| Create migration | `cd apps/backend && npx prisma migrate dev --name MigrationName` |
| Run migrations | `cd apps/backend && npx prisma migrate deploy` |
| Reset database | `cd apps/backend && npx prisma migrate reset && npm run seed` |
| Open Prisma Studio | `cd apps/backend && npx prisma studio` |
| View queue dashboard | Navigate to `http://localhost:3001/admin/queues` |
| View logs | Check terminal output (structured JSON via Pino) |

---

## 5. Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot connect to database" | Check Docker: `docker compose ps`. Verify `DATABASE_URL` in `.env`. |
| "Redis connection refused" | Check Docker. Verify `REDIS_URL`. |
| "JWT malformed" | Clear browser localStorage. Re-login. |
| "CORS error" | Check backend CORS config matches frontend URL. |
| "LLM API error" | Check API key in `.env`. Verify quota/billing. |
| Port already in use | Kill process: `npx kill-port 3000` or `npx kill-port 3001` |
| Migration error | Check Prisma schema matches migration. Try `npx prisma migrate reset` then re-run. |

---

> **Tham chiếu:** [12_technical_constraints](../step3_prd/12_technical_constraints.md) | [implementation_plan](implementation_plan.md)
