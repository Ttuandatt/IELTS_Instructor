# Performance Guide

Profiling, optimization, database tuning, and CDN patterns.

## Performance Budget

Define targets before optimizing:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| API p50 latency | < 100ms | Application metrics (Prometheus) |
| API p99 latency | < 500ms | Application metrics |
| Time to first byte | < 200ms | Synthetic monitoring |
| Database query time | < 50ms | Prisma query logging |
| Cache hit ratio | > 90% | Redis INFO stats |
| Error rate | < 0.1% | Application logs / APM |

---

## Backend Performance

### Profiling Workflow

```
1. Measure   → Identify the actual bottleneck (don't guess)
2. Profile   → Find the specific slow code path
3. Optimize  → Fix the bottleneck
4. Verify    → Confirm improvement with metrics
5. Monitor   → Set alerts to catch regressions
```

### Common Bottlenecks

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| All endpoints slow | DB connection exhaustion | Increase pool, add PgBouncer |
| One endpoint slow | N+1 query | Use `include` in Prisma, add DataLoader |
| Slow under load | No caching | Add Redis cache-aside for hot data |
| Memory growing | Memory leak | Profile with `--inspect`, check for unbounded arrays |
| CPU spikes | Synchronous heavy computation | Move to worker thread or queue |

### NestJS-Specific Optimizations

```typescript
// 1. Enable compression
import compression from 'compression';
app.use(compression());

// 2. Use fastify instead of express (2-3x throughput)
const app = await NestFactory.create<NestFastifyApplication>(
  AppModule,
  new FastifyAdapter(),
);

// 3. Lazy-load modules (reduce startup time)
@Module({
  imports: [
    LazyModuleLoader, // NestJS built-in
  ],
})

// 4. Response caching with interceptor
@UseInterceptors(CacheInterceptor)
@CacheTTL(60)
@Get('passages')
findAll() { ... }
```

---

## Database Performance (PostgreSQL + Prisma)

### Query Optimization

```sql
-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### Indexing Strategy

```prisma
// Index frequently filtered/sorted fields
model Passage {
  id         String     @id @default(uuid())
  title      String
  difficulty Difficulty
  createdAt  DateTime   @default(now())
  authorId   String

  @@index([difficulty])            // Filter by difficulty
  @@index([authorId])              // Filter by author
  @@index([createdAt(sort: Desc)]) // Sort by newest
  @@index([difficulty, createdAt]) // Composite for filter + sort
}
```

### Index Rules
- Index columns used in `WHERE`, `ORDER BY`, `JOIN`
- Composite indexes: put equality columns first, range/sort last
- Don't over-index (each index slows writes)
- Monitor with `pg_stat_user_indexes` — remove unused indexes

### N+1 Prevention

```typescript
// ❌ N+1 — fires 1 + N queries
const passages = await prisma.passage.findMany();
for (const p of passages) {
  const questions = await prisma.question.findMany({ where: { passageId: p.id } });
}

// ✅ Eager load — fires 2 queries total
const passages = await prisma.passage.findMany({
  include: { questions: true },
});

// ✅ Selective fields — reduce data transfer
const passages = await prisma.passage.findMany({
  select: { id: true, title: true, difficulty: true },
});
```

### Pagination Performance

```typescript
// Offset (simple, slow for large offsets)
prisma.passage.findMany({ skip: 1000, take: 20 });  // Scans 1020 rows

// Cursor (fast, constant time)
prisma.passage.findMany({
  take: 20,
  skip: 1,  // Skip the cursor itself
  cursor: { id: lastId },
  orderBy: { createdAt: 'desc' },
});
```

### Connection Pool Sizing

```
Formula: pool_size = (core_count * 2) + effective_spindle_count
Typical: 10-20 connections per app instance

Prisma:
  DATABASE_URL="postgresql://...?connection_limit=10&pool_timeout=10"

Warning signs:
  - "Too many connections" errors → add PgBouncer
  - Slow queries not explained by data → pool exhaustion
```

---

## Caching Performance (Redis)

### Key Design

```
Pattern:   {module}:{entity}:{identifier}:{variant}
Examples:
  reading:passage:abc123              → Single entity
  reading:passages:difficulty:HARD    → Filtered list
  user:profile:def456                → User-scoped
  reading:passage:abc123:v2          → Versioned

TTL Guidelines:
  User session:    15 min (match access token)
  Entity cache:    5-60 min (depends on write frequency)
  List/search:     1-5 min (invalidate more aggressively)
  Static config:   1-24 hours
```

### Cache Warming

```typescript
// Pre-warm critical cache on app startup
@Injectable()
export class CacheWarmerService implements OnModuleInit {
  async onModuleInit() {
    const hotPassages = await this.prisma.passage.findMany({
      where: { isPublished: true },
      take: 100,
      orderBy: { viewCount: 'desc' },
    });
    for (const p of hotPassages) {
      await this.cache.set(`reading:passage:${p.id}`, p, 3600);
    }
  }
}
```

### Cache Stampede Prevention

When many requests hit a cache miss simultaneously:
```
Solution 1: Mutex lock — first request computes, others wait
Solution 2: Stale-while-revalidate — serve stale, refresh in background
Solution 3: Probabilistic early expiry — refresh before actual TTL
```

---

## CDN & Static Assets

### CDN Strategy

```
Static assets (JS, CSS, images) → CDN with long cache (1 year + cache busting)
API responses                    → No CDN (or short cache for public data)
User uploads                     → Object storage (S3) + CDN

Cache headers:
  Static:  Cache-Control: public, max-age=31536000, immutable
  API:     Cache-Control: private, no-cache
  Upload:  Cache-Control: public, max-age=86400
```

---

## Monitoring & Alerting

### Key Metrics to Track

```
Application:
  - Request rate (RPS)
  - Error rate (4xx, 5xx)
  - Latency (p50, p95, p99)
  - Active connections

Database:
  - Query duration
  - Connection pool usage
  - Slow query count
  - Replication lag

Cache:
  - Hit/miss ratio
  - Memory usage
  - Eviction rate

Infrastructure:
  - CPU / Memory / Disk
  - Network I/O
  - Container restarts
```

### Alert Thresholds

| Alert | Condition | Severity |
|-------|-----------|----------|
| High error rate | 5xx > 1% for 5 min | Critical |
| High latency | p99 > 2s for 5 min | Warning |
| DB connections near limit | > 80% pool | Warning |
| Disk space low | < 20% free | Warning |
| Cache miss ratio high | > 50% for 10 min | Info |
| Zero traffic | 0 requests for 5 min | Critical |

### Structured Logging for Performance

```typescript
// Log slow operations for analysis
this.logger.warn({
  event: 'slow_query',
  duration_ms: 450,
  query: 'findMany passages',
  filters: { difficulty: 'HARD' },
  requestId: req.id,
});
```
