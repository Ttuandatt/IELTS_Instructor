# ⌨️ CLI Commands Reference — IELTS Helper

> **Mã tài liệu:** STEP4-CLI  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21

---

## 1. Infrastructure

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start Postgres + Redis containers |
| `docker compose down` | Stop containers (keep data) |
| `docker compose down -v` | Stop containers + delete volumes (reset data) |
| `docker compose ps` | Check container status |
| `docker compose logs postgres` | View Postgres logs |
| `docker compose logs redis` | View Redis logs |
| `docker exec -it ielts-postgres psql -U postgres -d ielts_helper` | Connect to Postgres shell |
| `docker exec -it ielts-redis redis-cli` | Connect to Redis CLI |

---

## 2. Backend (NestJS)

| Command | Description |
|---------|-------------|
| `cd apps/backend` | Navigate to backend directory |
| `npm run start:dev` | Start in dev mode (watch) on port 3001 |
| `npm run start:debug` | Start with debug mode (attach VS Code debugger) |
| `npm run build` | Compile TypeScript |
| `npm run start:prod` | Start compiled production build |
| `npm test` | Run unit tests (Jest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage report |
| `npm run test:e2e` | Run end-to-end tests (Supertest) |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Run Prettier |

### Database Commands

| Command | Description |
|---------|-------------|
| `npx prisma migrate dev --name CreateUsers` | Create new migration (dev) |
| `npx prisma migrate deploy` | Run pending migrations (prod) |
| `npx prisma migrate status` | Show migration status |
| `npx prisma migrate reset` | Reset database and re-apply migrations |
| `npx prisma studio` | Open Prisma Studio (DB browser) |
| `npm run seed` | Run seed script (admin user + sample data) |
| `npx prisma migrate dev --name AddTestModeAndInstructor` | Create migration for test_mode + instructor fields |

### Worker Commands

| Command | Description |
|---------|-------------|
| `npm run worker:dev` | Start BullMQ worker in dev mode |
| `npm run worker:prod` | Start worker in production mode |

---

## 3. Frontend (Next.js)

| Command | Description |
|---------|-------------|
| `cd apps/frontend` | Navigate to frontend directory |
| `npm run dev` | Start dev server on port 3000 (HMR) |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm test` | Run tests (Vitest + RTL) |
| `npm run test:watch` | Tests in watch mode |
| `npm run lint` | Run ESLint (Next.js rules) |
| `npm run lint:fix` | Auto-fix |
| `npm run format` | Run Prettier |

---

## 4. Quick Verification Commands

```bash
# 1. Health check
curl http://localhost:3001/api/health

# 2. Register a test user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","display_name":"Test User"}'

# 3. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# 4. Check reading passages (use token from login response)
curl http://localhost:3001/api/reading/passages \
  -H "Authorization: Bearer <access_token>"

# 5. Check Redis
docker exec -it ielts-redis redis-cli PING
# Expected: PONG

# 6. Check Postgres
docker exec -it ielts-postgres psql -U postgres -d ielts_helper -c "SELECT count(*) FROM users;"

# 7. Submit reading in Practice mode
curl -X POST http://localhost:3001/api/reading/passages/<passage_id>/submit \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"question_id":"q-001","value":"B"}],"test_mode":"practice"}'

# 8. Access instructor panel (requires instructor role)
curl http://localhost:3001/api/instructor/writing-submissions \
  -H "Authorization: Bearer <instructor_token>"

# 9. Check content stats (social proof)
curl http://localhost:3001/api/content/stats \
  -H "Authorization: Bearer <access_token>"
```

---

## 5. Useful Shortcuts

| Alias (add to shell) | Command |
|----------------------|---------|
| `ielts-up` | `cd <project-root> && docker compose up -d` |
| `ielts-be` | `cd apps/backend && npm run start:dev` |
| `ielts-fe` | `cd apps/frontend && npm run dev` |
| `ielts-worker` | `cd apps/backend && npm run worker:dev` |
| `ielts-reset` | `docker compose down -v && docker compose up -d && cd apps/backend && npx prisma migrate deploy && npm run seed` |

---

> **Tham chiếu:** [dev_onboarding_guide](dev_onboarding_guide.md)
