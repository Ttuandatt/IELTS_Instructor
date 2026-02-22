# System Design Patterns

## Caching Strategies

### Cache-Aside (Lazy Loading)
```
App → Check cache → HIT? → Return cached
                  → MISS? → Query DB → Write to cache → Return
```
- **Best for**: Read-heavy workloads, data that doesn't change often
- **Invalidation**: Delete cache key on write, let next read repopulate
- **Risk**: Cache stampede (many concurrent misses) — use locking or pre-warming

### Write-Through
```
App → Write to cache AND DB simultaneously → Return
```
- **Best for**: Data that is read immediately after write
- **Tradeoff**: Higher write latency, but cache always consistent

### Write-Behind (Write-Back)
```
App → Write to cache → Return immediately
      Background job → Flush to DB periodically
```
- **Best for**: High write throughput, eventual consistency acceptable
- **Risk**: Data loss if cache crashes before flush

### Cache Invalidation Patterns
| Pattern | When |
|---------|------|
| TTL-based | Set expiry, accept stale data window |
| Event-driven | Publish event on write → subscriber invalidates |
| Version-based | Include version in cache key, bump on update |

---

## Message Queue Patterns

### When to Use Queues
- Decouple producer from consumer (different processing speeds)
- Handle spikes (buffer during bursts)
- Guarantee processing (at-least-once delivery)
- Enable retry with backoff

### Common Patterns

**Work Queue** — distribute tasks across workers:
```
Producer → Queue → Worker 1, Worker 2, Worker 3
```
Use for: scoring submissions, sending emails, generating PDFs

**Pub/Sub** — broadcast to multiple subscribers:
```
Producer → Topic → Subscriber A (email), Subscriber B (analytics), Subscriber C (cache invalidation)
```
Use for: event-driven architecture, real-time updates

**Dead Letter Queue (DLQ)** — capture failed messages:
```
Queue → Worker → Failed 3x → DLQ → Alert + manual review
```
Always configure DLQ for production queues.

### Technology Selection
| Need | Tool |
|------|------|
| Simple, in-memory | Redis Streams (already in stack) |
| Durable, feature-rich | RabbitMQ |
| Cloud-managed, massive scale | AWS SQS / GCP Pub/Sub |
| Event streaming, replay | Apache Kafka |

---

## CQRS (Command Query Responsibility Segregation)

Separate read and write models when read patterns differ significantly from write patterns.

```
Commands (writes) → Write Model → Primary DB (PostgreSQL)
                                  ↓ (events)
Queries (reads)   → Read Model  → Materialized View / Redis / Elasticsearch
```

### When to Use
- Read and write patterns are very different
- Need to optimize reads independently (denormalized views)
- Event sourcing is desired

### When NOT to Use
- Simple CRUD apps (overkill)
- Team is small and doesn't need the complexity
- Data model is simple and read/write patterns are similar

---

## Event-Driven Architecture

### Event Types
| Type | Purpose | Example |
|------|---------|---------|
| Domain event | Something happened in business logic | `SubmissionScored` |
| Integration event | Cross-service communication | `UserCreated` (notify email service) |
| Command event | Request to do something | `ScoreSubmission` |

### Implementation in NestJS
```typescript
// Emit
this.eventEmitter.emit('submission.scored', { submissionId, score, bandScore });

// Listen
@OnEvent('submission.scored')
async handleScored(payload: SubmissionScoredEvent) {
  await this.notificationService.notifyUser(payload);
  await this.analyticsService.recordScore(payload);
}
```

### Event Design Rules
- Events are **immutable facts** — past tense naming (`UserCreated`, not `CreateUser`)
- Include **all necessary data** — consumers shouldn't need to query back
- Include **timestamp** and **correlation ID**
- Events are **fire-and-forget** — producer doesn't wait for consumer

---

## Load Balancing Patterns

| Strategy | When |
|----------|------|
| Round robin | Equal server capacity, stateless requests |
| Least connections | Varying request complexity |
| IP hash | Need session affinity (avoid if possible) |
| Weighted | Servers with different capacities |

### Health Checks
- **Liveness**: Is the process running? (`/health/live`)
- **Readiness**: Can it handle requests? DB connected? (`/health/ready`)
- Configure load balancer to check readiness, orchestrator to check liveness

---

## Rate Limiting

### Strategies
| Algorithm | Behavior |
|-----------|----------|
| Fixed window | N requests per minute, resets on boundary |
| Sliding window | Smoother, tracks request timestamps |
| Token bucket | Bursty-friendly, refills at fixed rate |
| Leaky bucket | Smooths output rate, queues excess |

### NestJS Implementation
```typescript
// @nestjs/throttler
ThrottlerModule.forRoot({
  ttl: 60,       // 60 second window
  limit: 100,    // 100 requests per window
});

// Per-endpoint override
@Throttle(5, 60)  // 5 requests per 60 seconds
@Post('login')
async login() { ... }
```

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1640000000
Retry-After: 30  (on 429 response)
```

---

## Circuit Breaker

Protect against cascading failures when calling external services.

```
States: CLOSED → OPEN → HALF-OPEN → CLOSED

CLOSED:  Normal operation, count failures
         If failures > threshold → switch to OPEN
OPEN:    Reject all requests immediately (fail fast)
         After timeout → switch to HALF-OPEN
HALF-OPEN: Allow 1 test request
           Success → CLOSED
           Failure → OPEN
```

### Configuration
```
Failure threshold: 5 failures in 60 seconds
Open duration: 30 seconds
Half-open max attempts: 3
```

Use with external API calls (AI scoring, email, payment) — never for internal DB calls.

---

## Database Patterns

### Connection Pooling
```
App instances × pool_size ≤ max_connections
Example: 3 instances × 10 pool = 30 ≤ 100 max_connections

For high concurrency: use PgBouncer as connection pooler
  App → PgBouncer (pool) → PostgreSQL
```

### Read Replicas
```
Writes → Primary DB
Reads  → Read Replica(s)

Prisma: use $extends() or middleware to route read queries
Caveat: replication lag (usually <100ms, but plan for it)
```

### Migration Strategy
- One migration per feature branch
- Forward-only (never edit pushed migrations)
- Backwards-compatible: add new columns as nullable, backfill, then enforce
- Large table changes: create new table → dual-write → migrate → swap
