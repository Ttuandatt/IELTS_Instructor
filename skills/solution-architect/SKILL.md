---
name: solution-architect
description: "Provide solution architecture guidance for software systems — from tech stack selection to deployment strategy. Use this skill when: making architecture decisions (ADRs), designing system components and their interactions, evaluating trade-offs between technologies, planning for scalability/reliability/security, discussing cloud infrastructure (AWS/GCP/Azure), setting up CI/CD pipelines, reviewing system design, or creating architecture diagrams. Also trigger on: 'architect', 'system design', 'tech stack', 'trade-off', 'ADR', 'infrastructure', 'deploy', 'scale', 'performance', 'security review', 'cloud', 'monitoring'. Covers system design patterns, security, performance, cloud-native, and observability."
---

# Solution Architect

Think like a solution architect: evaluate context, identify constraints, analyze trade-offs, recommend with rationale, and document decisions.

## Workflow

```
1. Understand context    → What are we building? Constraints? Goals?
2. Identify options      → What patterns/technologies fit?
3. Analyze trade-offs    → Pros/cons/risks for each option
4. Recommend + justify   → Pick one, explain WHY (not just what)
5. Document (ADR)        → Record the decision for future reference
6. Validate              → Does it meet NFRs? (performance, security, cost)
```

## Architecture Decision Record (ADR)

For every significant decision, produce an ADR:

```markdown
# ADR-{NNN}: {Title}

**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-{NNN}
**Date:** YYYY-MM-DD
**Context:** What is the problem? What are the constraints?
**Decision:** What did we decide?
**Options Considered:**
  1. Option A — pros / cons
  2. Option B — pros / cons
  3. Option C — pros / cons
**Consequences:** What are the implications? Trade-offs accepted?
**Review Date:** When should we revisit this decision?
```

Store ADRs in `docs/adr/` with filenames like `001-use-prisma-over-typeorm.md`.

## System Design Quick Framework

When asked to design a system or component, follow this structure:

### 1. Requirements Clarification
- **Functional**: What does the system DO? (Use cases, user stories)
- **Non-functional (NFRs)**: Performance, availability, scalability, security, cost
- **Constraints**: Team size, timeline, existing tech, compliance

### 2. High-Level Design
- Component diagram: major services and their interactions
- Data flow: request → processing → storage → response
- Integration points: external APIs, third-party services

### 3. Deep Dive on Components
For each critical component:
- Responsibility (single responsibility)
- API contract (input/output)
- Data model
- Error handling strategy
- Scaling strategy

### 4. Non-Functional Requirements Check
| NFR | Question | Target |
|-----|----------|--------|
| Latency | p50, p99 response time? | API: p99 < 500ms |
| Throughput | Requests/second? | Start: 100 RPS, plan for 1K |
| Availability | Uptime target? | 99.9% (8.7h downtime/year) |
| Data durability | Can we lose data? | Zero data loss for submissions |
| Security | Auth model? Data sensitivity? | JWT + RBAC + encryption at rest |
| Cost | Budget constraints? | Optimize for small-team budget |

## Key Principles

1. **YAGNI** — Don't over-engineer. Build for current needs + 1 step ahead, not 10
2. **Reversibility** — Prefer decisions that are easy to change later
3. **Boring technology** — Default to proven tools unless novel tech provides clear advantage
4. **Separation of concerns** — Each component has one clear responsibility
5. **Design for failure** — Assume everything will fail; plan graceful degradation
6. **Observe everything** — If you can't measure it, you can't improve it

## Domain: Decision Patterns

### Tech Stack Selection
Before recommending a technology, evaluate:

| Factor | Weight | Questions |
|--------|--------|-----------|
| Team expertise | High | Does the team know this? Learning curve? |
| Community & ecosystem | High | Mature? Active? Good docs? |
| Operational cost | Medium | Hosting, maintenance, monitoring burden |
| Performance fit | Medium | Does it meet NFRs for this use case? |
| Hiring pool | Medium | Can we hire for this? |
| Vendor lock-in | Low-Medium | How hard to switch? |

### Scaling Decisions
```
Read-heavy?  → Caching (Redis) + Read replicas + CDN
Write-heavy? → Write-ahead log + Async processing (queue) + Sharding
Both?        → CQRS (separate read/write models)
Bursty?      → Auto-scaling + Queue buffering
Global?      → Multi-region + CDN + Edge computing
```

### Data Storage Selection
```
Relational data + ACID?       → PostgreSQL
Document/flexible schema?     → MongoDB
Time-series/metrics?          → TimescaleDB / InfluxDB
Full-text search?             → Elasticsearch / Meilisearch
Cache/session?                → Redis
File/blob storage?            → S3 / GCS / MinIO
Message queue?                → Redis Streams / RabbitMQ / SQS
```

## Reference Files

For detailed patterns and implementation guidance:
- `references/system-design-patterns.md` — Caching, queuing, load balancing, CQRS, event-driven
- `references/security-checklist.md` — OWASP top 10, auth patterns, encryption, compliance
- `references/performance-guide.md` — Profiling, optimization, database tuning, CDN
- `references/cloud-and-devops.md` — AWS/GCP patterns, Docker, CI/CD, IaC, monitoring
