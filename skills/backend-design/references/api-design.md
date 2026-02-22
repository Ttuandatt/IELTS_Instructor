# API Design Reference

Complete patterns for REST, GraphQL, and WebSocket API design.

## REST API

### URL Conventions

```
Base:       /api/v1/
Resources:  plural nouns, kebab-case
Nesting:    max 2 levels deep

Examples:
  GET    /api/v1/reading-passages           # List
  GET    /api/v1/reading-passages/:id       # Detail
  POST   /api/v1/reading-passages           # Create
  PATCH  /api/v1/reading-passages/:id       # Partial update
  DELETE /api/v1/reading-passages/:id       # Delete
  GET    /api/v1/reading-passages/:id/questions  # Nested (max 2 levels)
  POST   /api/v1/reading-submissions        # Action as resource

Avoid:
  ❌ /api/v1/getPassages         (verb in URL)
  ❌ /api/v1/reading_passages    (underscore)
  ❌ /api/v1/ReadingPassages     (camelCase)
  ❌ /api/v1/passage             (singular)
```

### HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Token valid but no permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., email exists) |
| 422 | Unprocessable | Business rule violation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

### Response Envelope

```json
// Success (single)
{
  "data": { "id": "abc", "email": "user@example.com", "role": "learner" }
}

// Success (list with pagination)
{
  "data": [{ ... }, { ... }],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "hasNext": true,
    "hasPrev": false
  }
}

// Error
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Email is required",
    "details": [
      { "field": "email", "message": "should not be empty" }
    ]
  }
}
```

### Pagination

**Cursor-based** (preferred for large/real-time datasets):
```
GET /api/v1/reading-passages?cursor=eyJpZCI6MTAwfQ&limit=20

Response meta:
{
  "nextCursor": "eyJpZCI6MTIwfQ",
  "hasNext": true,
  "limit": 20
}
```

**Offset-based** (simpler, good for admin panels):
```
GET /api/v1/reading-passages?page=2&limit=20

Response meta:
{
  "total": 100, "page": 2, "limit": 20, "hasNext": true
}
```

### Filtering, Sorting, Field Selection

```
Filtering:   ?status=active&role=learner&difficulty=hard
Range:       ?createdAfter=2025-01-01&scoreLte=6.5
Sorting:     ?sort=-createdAt,title      (prefix - for DESC)
Fields:      ?fields=id,title,difficulty  (sparse fieldsets)
Includes:    ?include=author,questions    (eager load relations)
Search:      ?q=environment+topic         (full-text search)
```

### Idempotency

For POST/PATCH operations that must not be duplicated:
```
Client sends: Idempotency-Key: <uuid>
Server: check if key exists → return cached response OR process + cache
TTL: 24 hours
```

---

## GraphQL

Use as **complement** to REST, not replacement. Best for:
- Dashboard pages needing data from multiple entities
- Mobile clients wanting minimal payload
- Complex nested queries (passage → questions → answers)

### Schema Design

```graphql
# Schema-first approach
type Query {
  passages(filter: PassageFilter, pagination: PaginationInput): PassageConnection!
  passage(id: ID!): Passage
}

type Mutation {
  submitReading(input: SubmitReadingInput!): SubmitReadingResult!
}

type Subscription {
  scoringComplete(submissionId: ID!): ScoringUpdate!
}

# Relay cursor connection for pagination
type PassageConnection {
  edges: [PassageEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type PassageEdge {
  node: Passage!
  cursor: String!
}

# Union for mutation results
union SubmitReadingResult = SubmitReadingSuccess | ValidationError | NotFoundError
```

### NestJS Integration

```typescript
// Code-first with @nestjs/graphql
@Resolver(() => Passage)
export class PassageResolver {
  @Query(() => PassageConnection)
  async passages(@Args() args: PassageArgs) { ... }

  @ResolveField(() => [Question])
  async questions(@Parent() passage: Passage) { ... }  // DataLoader here
}
```

### Anti-N+1: DataLoader

```typescript
// Always use DataLoader for @ResolveField
@Injectable({ scope: Scope.REQUEST })
export class QuestionLoader {
  private loader = new DataLoader<string, Question[]>(
    async (passageIds) => {
      const questions = await this.prisma.question.findMany({
        where: { passageId: { in: [...passageIds] } },
      });
      return passageIds.map(id => questions.filter(q => q.passageId === id));
    }
  );
  load(passageId: string) { return this.loader.load(passageId); }
}
```

### Security

- **Complexity limiting**: max depth 5, max cost 1000 per query
- **Rate limiting**: per-query cost-based, not just per-request
- **Persisted queries** in production (disable arbitrary queries)

---

## WebSocket (NestJS Gateway)

Use for real-time features: live scoring, notifications, collaborative editing.

### Gateway Setup

```typescript
@WebSocketGateway({
  namespace: '/scoring',
  cors: { origin: process.env.FRONTEND_URL },
})
export class ScoringGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  // JWT auth at handshake (not per-message)
  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    const user = await this.authService.verifyToken(token);
    if (!user) { client.disconnect(); return; }
    client.data.userId = user.id;
    client.join(`user:${user.id}`);  // Room per user
  }

  @SubscribeMessage('submit-answer')
  async handleSubmit(client: Socket, payload: SubmitDto) {
    const result = await this.scoringService.score(payload);
    // Emit to user's room only
    this.server.to(`user:${client.data.userId}`).emit('score-update', result);
    return { event: 'ack', data: { received: true } };
  }
}
```

### Patterns

| Pattern | Use case |
|---------|----------|
| Room-based | Scope events per user/session/exam |
| Acknowledge | Client confirms receipt of critical events |
| Heartbeat | Server pings client every 25s, disconnect after 3 missed pongs |
| Reconnect | Client auto-reconnects with exponential backoff (1s, 2s, 4s, max 30s) |
| Throttle | Max 10 messages/second per client |

---

## Error Handling Patterns

### Prisma Error Mapping

```typescript
// Map Prisma errors → HTTP status codes in a global filter or service base class
const PRISMA_ERROR_MAP: Record<string, { status: number; code: string }> = {
  P2002: { status: 409, code: 'DUPLICATE_ENTRY' },     // Unique constraint
  P2003: { status: 400, code: 'FOREIGN_KEY_VIOLATION' },
  P2025: { status: 404, code: 'NOT_FOUND' },           // Record not found
  P2024: { status: 504, code: 'QUERY_TIMEOUT' },
};
```

### Global Exception Filter

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const { status, body } = this.resolveError(exception);

    this.logger.error({
      requestId: request.headers['x-request-id'],
      method: request.method,
      path: request.url,
      status,
      error: body.error.code,
    });

    response.status(status).json(body);
  }
}
```

---

## Validation Patterns

### DTO with class-validator

```typescript
export class CreatePassageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(100)
  content: string;

  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];
}
```

### Custom Validator

```typescript
@ValidatorConstraint({ async: true })
export class IsUniqueEmail implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) {}

  async validate(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return !user;
  }

  defaultMessage() { return 'Email already exists'; }
}
```

---

## Testing Patterns

### Unit Test (Service)

```typescript
describe('ReadingService', () => {
  let service: ReadingService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReadingService,
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
      ],
    }).compile();

    service = module.get(ReadingService);
    prisma = module.get(PrismaService);
  });

  it('should return passage by id', async () => {
    prisma.passage.findUnique.mockResolvedValue(mockPassage);
    const result = await service.findById('passage-1');
    expect(result).toEqual(mockPassage);
  });
});
```

### Integration Test (Controller)

```typescript
describe('ReadingController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(() => app.close());

  it('POST /reading-passages → 201', () =>
    request(app.getHttpServer())
      .post('/api/v1/reading-passages')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Test', content: 'Long content...', difficulty: 'MEDIUM' })
      .expect(201)
      .expect(res => expect(res.body.data.title).toBe('Test'))
  );
});
```
