# Cloud & DevOps Reference

AWS/GCP patterns, Docker, CI/CD, Infrastructure as Code, and observability.

## Container Architecture (Docker)

### Dockerfile Best Practices (Node.js / NestJS)

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
USER appuser
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

### Key Rules
- Multi-stage builds (minimize image size)
- Run as non-root user
- Copy `package*.json` first (cache npm install layer)
- `.dockerignore`: `node_modules`, `.git`, `.env`, `dist`
- Pin base image versions (not `latest`)
- Health check: `HEALTHCHECK CMD wget -q --spider http://localhost:3001/health || exit 1`

### Docker Compose (Local Dev)

```yaml
services:
  backend:
    build: ./backend
    ports: ["3001:3001"]
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/ielts
      REDIS_URL: redis://cache:6379
    depends_on:
      db: { condition: service_healthy }
      cache: { condition: service_started }

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ielts
      POSTGRES_PASSWORD: postgres
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  cache:
    image: redis:7-alpine
    ports: ["6379:6379"]

volumes:
  pgdata:
```

---

## CI/CD Pipeline

### GitHub Actions Template

```yaml
name: CI/CD

on:
  push: { branches: [main] }
  pull_request: { branches: [main] }

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env: { POSTGRES_DB: test, POSTGRES_PASSWORD: test }
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npx prisma generate
      - run: npx prisma migrate deploy
        env: { DATABASE_URL: postgresql://postgres:test@localhost:5432/test }
      - run: npm run test
      - run: npm run test:e2e

  build:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t app:${{ github.sha }} .
      # Push to registry, deploy, etc.
```

### Pipeline Stages

```
PR:     lint → unit tests → integration tests → build check
Merge:  lint → tests → build → push image → deploy staging → smoke test
Release: deploy production → health check → rollback if unhealthy
```

---

## Cloud Architecture Patterns

### Small-Scale (Current: Solo/Small Team)

```
                    ┌─── CDN (Vercel/Cloudflare)
                    │     ↓
Users → DNS → Load Balancer → Frontend (Next.js on Vercel)
                    │
                    └──→ Backend (NestJS)
                          │         │
                         PostgreSQL  Redis
                         (managed)  (managed)
```

**Recommended services:**
| Component | AWS | GCP | Budget |
|-----------|-----|-----|--------|
| Frontend | Amplify / Vercel | Cloud Run / Vercel | Vercel free tier |
| Backend | ECS Fargate / App Runner | Cloud Run | Cloud Run free tier |
| Database | RDS PostgreSQL | Cloud SQL | Smallest instance |
| Cache | ElastiCache Redis | Memorystore | Smallest instance |
| Storage | S3 | Cloud Storage | Pay-per-use |

### Medium-Scale (Growing Team, More Traffic)

```
Users → CDN → Load Balancer → API Gateway (rate limit, auth)
                                    │
                              ┌─────┼─────┐
                              │     │     │
                           Backend Backend Backend (auto-scaled)
                              │     │     │
                              └─────┼─────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
               PostgreSQL      Redis          Message Queue
              (primary +      (cluster)       (SQS/Pub-Sub)
               replica)                           │
                                              Workers
                                          (scoring, emails)
```

Add when needed:
- Read replicas for PostgreSQL (read-heavy)
- Redis cluster for high cache throughput
- Message queue for async processing (scoring, email)
- Auto-scaling policies for backend instances

---

## Infrastructure as Code (IaC)

### Decision Matrix

| Tool | Best For |
|------|----------|
| Terraform | Multi-cloud, production infrastructure |
| Pulumi | Developers who prefer TypeScript over HCL |
| AWS CDK | AWS-only, TypeScript-first |
| Docker Compose | Local development, simple deployments |

### Terraform Example (AWS)

```hcl
# Minimal production setup
resource "aws_ecs_service" "backend" {
  name            = "ielts-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.private_subnets
    security_groups = [aws_security_group.backend.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 3001
  }
}
```

---

## Observability Stack

### Three Pillars

| Pillar | Tool (Self-hosted) | Tool (Managed) |
|--------|--------------------|----------------|
| Logs | Loki + Grafana | CloudWatch / Cloud Logging |
| Metrics | Prometheus + Grafana | CloudWatch / Cloud Monitoring |
| Traces | Jaeger / Tempo | X-Ray / Cloud Trace |

### NestJS Integration

```typescript
// Prometheus metrics
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: { enabled: true },
    }),
  ],
})

// Custom metrics
@Injectable()
export class MetricsService {
  private httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  });
}
```

### Health Check Endpoint

```typescript
// @nestjs/terminus
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: PrismaHealthIndicator,
    private redis: RedisHealthIndicator,
  ) {}

  @Get()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.pingCheck('cache'),
    ]);
  }
}
```

---

## Deployment Strategies

| Strategy | Risk | Downtime | When |
|----------|------|----------|------|
| Rolling | Low | Zero | Default for most updates |
| Blue-Green | Very Low | Zero | Major releases, easy rollback |
| Canary | Lowest | Zero | Risky changes, gradual rollout |
| Recreate | High | Yes | Dev/staging, breaking changes |

### Rollback Plan

```
1. Monitor: Watch error rate + latency for 10 min after deploy
2. Alert: If error rate > 1% or p99 > 2x baseline
3. Rollback: Redeploy previous image tag
4. Investigate: Check logs with correlation IDs
5. Fix: Patch → test → redeploy
```

---

## Environment Management

```
Environment hierarchy:
  local     → Docker Compose, .env file
  dev       → Shared dev server, auto-deploy on merge to dev branch
  staging   → Mirror of production, manual deploy for QA
  production→ Auto-deploy on tag/release, with approval gate

Env vars per environment:
  - DATABASE_URL    (different DB per env)
  - REDIS_URL       (different cache per env)
  - JWT_SECRET      (different secret per env)
  - LOG_LEVEL       (debug in dev, warn in prod)
  - CORS_ORIGIN     (specific domain per env)
```
