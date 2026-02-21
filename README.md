# IELTS Helper

Practice IELTS Reading & Writing with AI-powered feedback.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | NestJS 10, TypeScript, TypeORM |
| Database | PostgreSQL 15 |
| Cache/Queue | Redis 7, BullMQ |
| AI Scoring | OpenAI / Google Gemini (hybrid rule + LLM) |

## Quick Start

### Prerequisites

- Node.js 20+
- Docker Desktop
- npm

### 1. Start infrastructure

```bash
docker compose up -d
```

### 2. Backend

```bash
cd apps/backend
cp .env .env  # already provided with dev defaults
npm run start:dev
# → http://localhost:3001/api/health
```

### 3. Frontend

```bash
cd apps/frontend
npm run dev
# → http://localhost:3000
```

### 4. Health check

```bash
curl http://localhost:3001/api/health
```

## Project Structure

```
├── apps/
│   ├── frontend/     # Next.js 14 (port 3000)
│   └── backend/      # NestJS 10 (port 3001)
├── docs/             # PRD & planning documents
├── docker-compose.yml
└── .env.example
```

## Documentation

All project documentation lives in `docs/`:

- `step1_business_idea/` — Requirements intake
- `step2_lowcode/` — Screens, flows, data, rules
- `step3_prd/` — 17 PRD files + OpenAPI spec
- `step4_implementation_plan/` — Sprint plan, onboarding, CLI, testing guide

## License

Private — All rights reserved.
