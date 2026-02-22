# Architecture Patterns Reference

Detailed folder structures, rules, and implementation guidance for each backend architecture pattern.

## Pattern 1: NestJS Standard

Simplest approach. Follow NestJS conventions directly. Best for solo devs, prototypes, simple CRUD.

### Folder Structure

```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   └── guards/
│       ├── jwt-auth.guard.ts
│       └── roles.guard.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
│       ├── create-user.dto.ts
│       └── update-user.dto.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── interceptors/
│   │   └── logging.interceptor.ts
│   └── pipes/
│       └── validation.pipe.ts
└── app.module.ts
```

### Rules

- **Controller** → validates input (via DTOs + ValidationPipe), calls Service, returns response
- **Service** → contains business logic, calls Prisma/external APIs
- **DTOs** → `class-validator` decorators for input validation
- **Guards** → handle authentication/authorization
- **No direct Prisma calls in controllers** — always go through service layer
- Module boundaries are informal — services can import other services via standard NestJS DI

### When to Graduate

Move to Modular Monolith when:
- You have 5+ modules with cross-dependencies
- Business logic starts leaking between services
- You need clearer boundaries for team members

---

## Pattern 2: Modular Monolith

Each module is self-contained with internal layers. Communicates via well-defined interfaces. Can be extracted to microservice later.

### Folder Structure

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── api/                    # Input/output boundary
│   │   │   ├── auth.controller.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   ├── application/            # Business logic
│   │   │   ├── auth.service.ts
│   │   │   └── token.service.ts
│   │   ├── infrastructure/         # External dependencies
│   │   │   ├── auth.repository.ts
│   │   │   └── redis-session.store.ts
│   │   └── index.ts                # Public API exports
│   ├── reading/
│   │   ├── reading.module.ts
│   │   ├── api/
│   │   │   ├── reading.controller.ts
│   │   │   └── dto/
│   │   ├── application/
│   │   │   ├── reading.service.ts
│   │   │   └── scoring.service.ts
│   │   ├── infrastructure/
│   │   │   └── reading.repository.ts
│   │   └── index.ts
│   └── writing/
│       ├── writing.module.ts
│       ├── api/
│       ├── application/
│       ├── infrastructure/
│       └── index.ts
├── shared/                         # Cross-cutting concerns ONLY
│   ├── database/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── cache/
│   │   └── redis.module.ts
│   ├── common/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── decorators/
│   └── events/
│       └── event-bus.module.ts
└── app.module.ts
```

### Rules

1. **Modules NEVER import each other's internal classes directly**
   ```typescript
   // ❌ Bad
   import { AuthRepository } from '../auth/infrastructure/auth.repository';
   
   // ✅ Good — import from public API
   import { AuthService } from '../auth';
   ```

2. **Each module's `index.ts` exports ONLY its public API**
   ```typescript
   // auth/index.ts
   export { AuthService } from './application/auth.service';
   export { JwtAuthGuard } from './api/guards/jwt-auth.guard';
   // Infrastructure details are NOT exported
   ```

3. **Cross-module communication options:**
   - Exported services via standard DI (simple, synchronous)
   - `EventEmitter2` for fire-and-forget (decoupled, async)
   - Message queue for eventual consistency (when scaling to microservices)

4. **Shared folder** for truly cross-cutting concerns only (guards, filters, DB config)

### Module Extraction Checklist

When ready to extract a module to microservice:
- [ ] Module communicates only via its `index.ts` exports
- [ ] No shared mutable state with other modules
- [ ] Database tables can be isolated
- [ ] Events replace synchronous cross-module calls

---

## Pattern 3: Clean Architecture

Dependency rule: inner layers NEVER depend on outer layers. All dependencies point inward.

### Folder Structure

```
src/
├── domain/                          # Layer 0: Pure business rules
│   ├── entities/
│   │   ├── user.entity.ts           # Plain TS class, NO decorators
│   │   ├── passage.entity.ts
│   │   └── submission.entity.ts
│   ├── value-objects/
│   │   ├── email.vo.ts
│   │   ├── score.vo.ts
│   │   └── band-score.vo.ts
│   ├── errors/
│   │   ├── domain-error.ts          # Base class
│   │   ├── passage-not-found.error.ts
│   │   └── submission-limit.error.ts
│   └── interfaces/                  # Repository contracts (ports)
│       ├── user.repository.ts       # Interface only
│       ├── passage.repository.ts
│       └── submission.repository.ts
├── application/                     # Layer 1: Use cases
│   ├── use-cases/
│   │   ├── create-user.use-case.ts
│   │   ├── submit-reading.use-case.ts
│   │   └── score-writing.use-case.ts
│   ├── dto/
│   │   ├── create-user.input.ts
│   │   └── submit-reading.output.ts
│   └── interfaces/
│       ├── scoring.service.ts       # External service interface
│       └── cache.service.ts
├── infrastructure/                  # Layer 2: Implementations
│   ├── persistence/
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   ├── prisma-user.repository.ts
│   │   │   ├── prisma-passage.repository.ts
│   │   │   └── mappers/
│   │   │       ├── user.mapper.ts   # Prisma model ↔ Domain entity
│   │   │       └── passage.mapper.ts
│   │   └── redis/
│   │       └── redis-cache.service.ts
│   ├── external/
│   │   └── ai-scoring.service.ts    # Implements scoring interface
│   └── config/
│       └── config.module.ts
├── presentation/                    # Layer 3: Framework layer
│   ├── http/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── reading.controller.ts
│   │   │   └── writing.controller.ts
│   │   └── dto/
│   │       ├── login.request.ts     # Validation decorators HERE
│   │       └── login.response.ts
│   ├── websocket/
│   │   └── scoring.gateway.ts
│   └── graphql/
│       ├── resolvers/
│       └── types/
└── app.module.ts                    # Wires everything with DI
```

### Rules

1. **Domain layer has ZERO imports** from NestJS, Prisma, or any framework
2. **Use cases accept/return plain DTOs**, never Prisma models or HTTP request objects
3. **Repository interfaces** defined in domain, implemented in infrastructure
4. **Dependency injection** wires implementations to interfaces at module level
5. **Explicit mapping** between layers:
   ```
   HTTP Request DTO → Use Case Input DTO → Domain Entity → Prisma Model (and back)
   ```

### Mapper Example

```typescript
// infrastructure/persistence/prisma/mappers/user.mapper.ts
export class UserMapper {
  static toDomain(prismaUser: PrismaUser): UserEntity {
    return new UserEntity({
      id: prismaUser.id,
      email: new Email(prismaUser.email),
      role: prismaUser.role,
    });
  }

  static toPersistence(entity: UserEntity): Prisma.UserCreateInput {
    return {
      email: entity.email.value,
      role: entity.role,
    };
  }
}
```

---

## Pattern 4: Hexagonal (Ports & Adapters)

Core business logic at center, ALL I/O through port interfaces. Most testable, most ceremony.

### Folder Structure

```
src/
├── core/                            # Framework-agnostic business logic
│   ├── domain/
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   ├── passage.model.ts
│   │   │   └── submission.model.ts
│   │   └── services/
│   │       ├── scoring.domain-service.ts
│   │       └── submission.domain-service.ts
│   └── ports/
│       ├── inbound/                 # What the app OFFERS (driving)
│       │   ├── create-user.port.ts
│       │   ├── submit-reading.port.ts
│       │   └── score-writing.port.ts
│       └── outbound/               # What the app NEEDS (driven)
│           ├── user-repository.port.ts
│           ├── passage-repository.port.ts
│           ├── cache.port.ts
│           └── email-sender.port.ts
├── adapters/
│   ├── inbound/                     # Driving adapters (trigger use cases)
│   │   ├── http/
│   │   │   ├── controllers/
│   │   │   └── dto/
│   │   ├── graphql/
│   │   │   ├── resolvers/
│   │   │   └── types/
│   │   └── cli/
│   │       └── seed.command.ts
│   └── outbound/                    # Driven adapters (implement ports)
│       ├── persistence/
│       │   ├── prisma-user.repository.ts
│       │   └── prisma-passage.repository.ts
│       ├── cache/
│       │   └── redis-cache.adapter.ts
│       └── email/
│           └── sendgrid-email.adapter.ts
└── config/
    ├── app.module.ts
    └── di-bindings.ts               # Port → Adapter wiring
```

### Rules

1. **Core has ZERO external dependencies** — no NestJS, no Prisma, no Redis imports
2. **Every I/O operation** goes through a port interface
3. **Adapters are swappable**: swap Prisma → TypeORM, Redis → Memcached, SendGrid → SES
4. **Test core by mocking ports** — no DB, no network, pure unit tests

### DI Binding Example

```typescript
// config/di-bindings.ts
export const DI_BINDINGS = [
  { provide: 'UserRepositoryPort', useClass: PrismaUserRepository },
  { provide: 'CachePort', useClass: RedisCacheAdapter },
  { provide: 'EmailSenderPort', useClass: SendGridEmailAdapter },
];
```

---

## Pattern Comparison Summary

| Aspect | Standard | Modular Monolith | Clean | Hexagonal |
|--------|----------|-----------------|-------|-----------|
| Complexity | Low | Medium | High | High |
| Testability | Good | Better | Best | Best |
| Framework coupling | High | Medium | Low | Lowest |
| Refactor cost | Low | Medium | High | High |
| Learning curve | Easy | Moderate | Steep | Steep |
| Suitable team | Solo/small | Small-medium | Medium-large | Medium-large |
| Boilerplate | Minimal | Moderate | Heavy | Heavy |
