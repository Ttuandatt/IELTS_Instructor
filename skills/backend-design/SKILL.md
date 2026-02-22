---
name: backend-design
description: "Design and implement production-grade backend systems with the right architecture pattern. Use this skill when: building a new backend service or API, scaffolding NestJS modules/controllers/services, choosing between architecture patterns (Clean Architecture, Modular Monolith, Hexagonal, Standard MVC), designing REST/GraphQL/WebSocket APIs, setting up error handling/validation/logging, or structuring database and caching layers. Also use when user says 'create module', 'add endpoint', 'design API', 'backend structure', or asks about backend best practices. Includes architecture selection questionnaire. Primarily targets NestJS + TypeScript + Prisma but principles apply broadly."
---

# Backend Design

Design production-grade backend systems by selecting the right architecture, then implementing with best practices.

## Workflow

1. **Assess context** → Run architecture questionnaire (or skip to default)
2. **Select pattern** → Match project context to architecture
3. **Scaffold structure** → Generate folder structure + boilerplate
4. **Implement features** → Follow pattern rules + API/DB/cache best practices
5. **Validate** → Run build + tests to verify

## Architecture Selection

Ask user (or infer from project context):

| Question | Options |
|----------|---------|
| Team size | Solo / 2-5 / 6-15 / 15+ |
| Lifespan | Prototype / 1-2yr / 3+yr |
| Domain complexity | Simple CRUD / Moderate / Complex rules |
| Scaling plan | Single service / May split / Microservices |
| Experience level | Junior / Mixed / Senior |
| Time to market | ASAP / Balanced / Quality-first |

### Decision Matrix

| Context | Pattern |
|---------|---------|
| Solo, prototype, CRUD, ASAP | **NestJS Standard** |
| Small team, moderate, may split later | **Modular Monolith** (default) |
| Senior, complex domain, long-term | **Clean Architecture** |
| Many integrations, testability critical | **Hexagonal** |

Default if skipped: **Modular Monolith**.

For detailed folder structures, rules, and implementation examples for each pattern, consult `references/architecture-patterns.md`.

## API Design Quick Reference

| Style | When to use |
|-------|-------------|
| REST | Default for all CRUD + resource APIs |
| GraphQL | Complex queries with deep relations |
| WebSocket | Real-time: notifications, live scoring, chat |

**REST conventions:** plural nouns, kebab-case, `/api/v1/` prefix, consistent envelope `{ data, meta, error }`.

For complete API design patterns (pagination, filtering, error codes, GraphQL schema design, WebSocket gateway setup), consult `references/api-design.md`.

## Core Implementation Rules

### Error Handling (layered)
- **Domain** → custom errors (e.g., `PassageNotFoundError`)
- **Service** → catch infra errors, wrap to HTTP exceptions (Prisma P2002 → 409 Conflict)
- **Global filter** → consistent `{ error: { code, message } }`, log with correlation ID, never leak stack traces

### Validation (4 layers)
1. **DTO**: `class-validator` decorators
2. **Pipe**: global `ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true })`
3. **Service**: business rules
4. **DB**: Prisma schema constraints

### Database (Prisma)
- Repository pattern wrapping Prisma Client
- `$transaction()` for multi-step writes
- Soft delete via `deletedAt` + middleware
- `@@index` on frequently queried fields
- One migration per feature, never edit existing

### Caching (Redis)
- Cache-aside pattern: check → miss → query → store
- Key format: `{module}:{entity}:{id}`
- Invalidate on write, scope user data in keys
- Short TTL (60s) volatile, long TTL (1h+) stable

### Auth & Security
- JWT: short access (15min) + long refresh (7d, httpOnly cookie, rotate on use)
- RBAC: `@Roles()` decorator + `RolesGuard` + resource ownership check
- Checklist: rate limiting, CORS whitelist, Helmet, input sanitization, CSRF

### Logging
- Structured JSON (Pino or NestJS Logger)
- Include `[ModuleName]` context + `requestId` correlation
- Log: requests, business events, external calls, errors
- Never log: passwords, tokens, PII

### Testing (Unit + Integration)
- Unit: Jest, mocked deps, `*.spec.ts` co-located, 80%+ service coverage
- Integration: real test DB, `TestingModule`, seed/clean per test, 70%+ controller coverage
- Domain/entities: 90%+ (pure logic)

For expanded patterns, examples, and checklists, consult `references/api-design.md`.
