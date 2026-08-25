# Java & Spring Boot Convention Guide — Teachy Project

Complete reference for writing Java 21 + Spring Boot 3 code in the Teachy project.
Covers class archetypes, Java 21 language features, design patterns, and abstraction rules.

---

# Part 1 — Java 21 Language Conventions

## Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Package | lowercase, no underscores | `com.teachy.backend.reading.passage` |
| Class / Interface / Enum / Record | PascalCase | `ReadingSubmission`, `Scorable` |
| Method / Variable | camelCase | `findByEmail`, `totalQuestions` |
| Constant (`static final`) | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_PAGE_SIZE` |
| Enum constant (DB-mapped) | lowercase to match DB value | `learner`, `ai_scored` |
| Enum constant (app-only) | UPPER_SNAKE_CASE | `INVALID_INPUT`, `NOT_FOUND` |
| Type parameter | Single uppercase letter | `<T>`, `<E>`, `<K, V>` |
| Boolean variable/method | `is`/`has`/`can`/`should` prefix | `isRead`, `hasExpired()` |

**Package naming rule:** flatten when a module has few classes. Don't create
`model/`, `repository/`, `service/` sub-packages for a module with only 2-3 classes — put
them all directly in the module package. Split when it grows past ~8 files.

## `var` — Local Variable Type Inference

Use `var` when the type is obvious from the right side. Never use when it obscures the type.

```java
// Good — type is obvious
var user = userRepository.findById(id);       // clearly Optional<User>
var scores = new HashMap<String, Double>();    // clearly HashMap
var now = Instant.now();                       // clearly Instant

// Bad — type not obvious
var result = service.process(data);            // what type is result?
var x = calculate(a, b, c);                   // meaningless name + unclear type
```

**Rules:**
- Only for local variables — never on fields, method parameters, or return types.
- Always pair `var` with a descriptive variable name.
- Never `var` with diamond + complex generics: `var map = new HashMap<>();` loses type info.

## Records

Records are the default for immutable value objects. They auto-generate `equals()`,
`hashCode()`, `toString()`, and accessor methods.

### When to use record vs class

| Use record | Use class |
|---|---|
| Simple data carrier, all fields set at construction | Need `@Builder.Default` for optional fields |
| No inheritance needed | Need to extend a class |
| No mutable state | Framework requires setters (JPA entity) |
| ≤ 8 components | Many fields → builder is more readable |

### Compact constructor — validation

```java
public record CreatePassageRequest(
    @NotBlank String title,
    @NotBlank String body,
    @NotNull CefrLevel level
) {
    // Compact constructor — no parameter list, validates before assignment
    public CreatePassageRequest {
        title = title.strip();
        body = body.strip();
    }
}
```

### Record as mapper return

```java
public record PassageSummary(String id, String title, CefrLevel level) {

    public static PassageSummary from(Passage entity) {
        return new PassageSummary(entity.getId(), entity.getTitle(), entity.getLevel());
    }
}
```

### Generic records

```java
public record PageResponse<T>(
    List<T> content,
    int page,
    int size,
    long totalElements,
    int totalPages
) {}
```

## Sealed Classes & Interfaces

Use sealed types when you have a **closed set of subtypes** that must be exhaustive —
the compiler enforces that all cases are handled.

### When to use

| Situation | Use sealed? |
|---|---|
| Fixed set of result types (success/error/partial) | Yes |
| Event types within a domain | Yes |
| Open extension point (plugins, strategies from config) | No — use interface |
| Only one implementation exists today | No — don't seal prematurely |

### Example — API result type

```java
public sealed interface ApiResult<T> permits Success, Failure {
    record Success<T>(T data) implements ApiResult<T> {}
    record Failure<T>(String code, String message) implements ApiResult<T> {}
}
```

Usage with pattern matching:

```java
return switch (result) {
    case ApiResult.Success<User> s -> ResponseEntity.ok(s.data());
    case ApiResult.Failure<User> f -> ResponseEntity.badRequest().body(f.message());
};
```

### Subtype rules

Every permitted subtype must be one of:
- `final` — no further extension
- `sealed` — defines its own permitted subtypes
- `non-sealed` — open for extension (escape hatch)

## Switch Expressions & Pattern Matching

Prefer switch expressions over if-else chains when branching on type or enum.

### Enum switch

```java
String label = switch (state) {
    case draft -> "Draft";
    case submitted -> "Submitted";
    case ai_scored, released_ai -> "AI Scored";
    case ai_failed -> "Failed";
    case pending_review -> "Pending Review";
    case finalized -> "Finalized";
};
```

### Pattern matching with guards

```java
return switch (submission) {
    case WritingSubmission ws when ws.getState() == finalized -> handleFinalized(ws);
    case WritingSubmission ws when ws.getState() == ai_failed -> handleRetry(ws);
    case WritingSubmission ws -> handleDefault(ws);
};
```

### `instanceof` pattern matching

```java
// Old
if (obj instanceof String) {
    String s = (String) obj;
    return s.length();
}

// Java 21
if (obj instanceof String s) {
    return s.length();
}
```

## Text Blocks

Use text blocks for multi-line strings: SQL queries, JSON templates, prompt texts.

```java
String query = """
    SELECT u.id, u.email, u.display_name
    FROM users u
    WHERE u.role = :role
    ORDER BY u.created_at DESC
    """;

String promptTemplate = """
    Score the following IELTS %s essay.
    Band descriptors: %s
    Student essay:
    %s
    """.formatted(taskType, descriptors, essay);
```

**Rules:**
- Closing `"""` position controls indentation (trailing whitespace stripped).
- Use `.formatted()` instead of `String.format()` for text blocks.
- Use `\` at line end to suppress the newline (for long single lines).

## Optional

Use `Optional` as a return type for "may not exist" queries. Never as a field, parameter,
or collection element.

```java
// Good — return type for queries
public Optional<User> findByEmail(String email) { ... }

// Good — chain operations
userRepository.findById(id)
    .map(this::toResponse)
    .orElseThrow(() -> new ResourceNotFoundException("User", id));

// Bad — Optional as field
private Optional<String> middleName;  // use @Nullable String instead

// Bad — Optional as parameter
public void process(Optional<String> name);  // use @Nullable or overload
```

**Anti-patterns to avoid:**

```java
// Never — defeats the purpose
if (optional.isPresent()) {
    return optional.get();
}

// Instead
return optional.orElseThrow(() -> ...);

// Never — Optional.of(null) throws NPE
Optional.of(possiblyNull);

// Instead
Optional.ofNullable(possiblyNull);
```

## Streams

### Common patterns in Spring Boot

```java
// Entity list → response list
List<PassageResponse> responses = passages.stream()
    .map(PassageResponse::from)
    .toList();  // Java 16+ — prefer over .collect(Collectors.toList())

// Filter + transform
List<User> instructors = users.stream()
    .filter(u -> u.getRole() == UserRole.instructor)
    .sorted(Comparator.comparing(User::getCreatedAt).reversed())
    .toList();

// Grouping
Map<SubmissionState, List<WritingSubmission>> byState = submissions.stream()
    .collect(Collectors.groupingBy(WritingSubmission::getState));

// Existence check — short-circuits
boolean hasAdmin = users.stream()
    .anyMatch(u -> u.getRole() == UserRole.admin);

// Reduce
int totalCorrect = submissions.stream()
    .mapToInt(ReadingSubmission::getCorrectCount)
    .sum();
```

**Rules:**
- Streams are single-use — never store a stream in a variable and reuse it.
- Use `.toList()` (unmodifiable) over `.collect(Collectors.toList())` (modifiable).
- Use primitive streams (`mapToInt`, `mapToDouble`) to avoid boxing.
- Keep stream pipelines short — extract complex logic into named methods.
- Never use streams for side effects (`forEach` with mutation) — use a for loop instead.

## Generics — Bounded Types & Wildcards

### When to use which

```java
// Upper bound — read from (producer)
public double averageScore(List<? extends Scorable> items) { ... }

// Lower bound — write to (consumer)
public void addAll(Collection<? super Passage> target) { ... }

// Type parameter — when the type is used in return or multiple places
public <T extends Identifiable> T findOrThrow(JpaRepository<T, UUID> repo, String id) { ... }
```

**PECS rule:** Producer Extends, Consumer Super.

### Generic service method example

```java
public <T> PageResponse<T> toPageResponse(Page<T> page) {
    return new PageResponse<>(
        page.getContent(),
        page.getNumber(),
        page.getSize(),
        page.getTotalElements(),
        page.getTotalPages()
    );
}
```

## Exception Handling

### Hierarchy in this project

```
RuntimeException
├── ResourceNotFoundException          — 404
├── DuplicateResourceException         — 409
├── InvalidStateTransitionException    — 422 (writing state machine)
├── ValidationException                — 400
├── UnauthorizedException              — 401
├── ForbiddenException                 — 403
└── ExternalServiceException           — 502 (Gemini API failures)
```

### Custom exception pattern

```java
public class InvalidStateTransitionException extends RuntimeException {

    private final SubmissionState from;
    private final SubmissionState to;

    public InvalidStateTransitionException(SubmissionState from, SubmissionState to) {
        super("Cannot transition from %s to %s".formatted(from, to));
        this.from = from;
        this.to = to;
    }
}
```

### GlobalExceptionHandler

```java
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(ResourceNotFoundException ex) {
        return new ErrorResponse(ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return new ErrorResponse(message);
    }
}
```

## Date/Time

- Use `Instant` for timestamps (DB `TIMESTAMPTZ` → Java `Instant`).
- Use `LocalDate` only for date-without-time fields.
- Use `ZonedDateTime` only when you need to display in a specific timezone.
- Never `new Date()` or `Calendar` — use `java.time` API exclusively.
- `DateTimeFormatter` is immutable and thread-safe — define as `static final`.

## Null Safety

- Prefer empty collections over null: `List.of()`, `Map.of()`, `Set.of()`.
- Use `Optional` for return types that may be absent.
- Use `@Nullable` annotation (from `jakarta.annotation`) on parameters/fields that accept null.
- Validate non-null at trust boundaries: `Objects.requireNonNull(param, "param")`.
- Never return null from a public method that returns a collection — return empty.

---

# Part 2 — Spring Boot Class Archetypes

## Immutable vs Mutable — the core decision

| The class is... | Pattern |
|---|---|
| Fully known at construction time, never mutated afterward | **Immutable** (`record`, or `@Builder @Jacksonized`) |
| Populated incrementally, or framework requires no-arg + setters | **Mutable** (`@Getter @Setter @NoArgsConstructor`) |

**Always prefer immutable.** Only use mutable when the framework or incremental construction
genuinely requires it. Never mix patterns on the same class.

### Immutable — `@Builder @Jacksonized`

```java
@Getter
@Builder
@Jacksonized
public class MyResponse {

    private final String id;
    private final String name;
    @Builder.Default
    private final List<String> items = new ArrayList<>();
}
```

- All fields `private final`.
- `@Jacksonized` wires Jackson to the builder — no `@JsonCreator` needed.
- `@Builder.Default` for non-null defaults (empty collections).
- **Never** use `setterPrefix` on `@Builder`.

### Immutable — `record`

```java
public record MyResponse(String id, String name) {}
```

Prefer records when `@Builder.Default` and inheritance are not needed.

### Mutable

```java
@Getter
@Setter
@NoArgsConstructor
public class MyMutableClass {
    private String someId;
    private LocalDate someDate;
}
```

### Serializable immutable

```java
@Getter
@Builder
@Jacksonized
public class MyPayload implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
    private final String someId;
}
```

---

## 1. Entity (JPA)

**Naming:** PascalCase singular noun — no suffix (e.g. `User`, `Passage`, `Classroom`).
**Package:** `com.teachy.backend.<module>.model`

```java
@Getter
@Setter
@Entity
@Table(name = "table_name")
@EntityListeners(AuditingEntityListener.class)
public class MyEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "business_key", length = 50, nullable = false)
    private String businessKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private Owner owner;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "myEntity")
    private Set<Child> children = new HashSet<>(0);

    @CreatedDate
    @Column(name = "created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;
}
```

**Field rules:**

- `@Column(name = "snake_case")` on every mapped column.
- FetchType must **always** be explicit. Default to **LAZY**.
- Never include LAZY-loaded properties in `hashCode()`/`equals()`.
- **Never** use `@Data` or `@EqualsAndHashCode` on entities.

### Primary key — UUID

DB uses native `UUID` columns with `DEFAULT gen_random_uuid()`. Hibernate generates the
UUID via `@GeneratedValue`:

```java
@Id
@GeneratedValue(strategy = GenerationType.UUID)
private UUID id;
```

No `@PrePersist` needed — Hibernate handles ID generation automatically.

### Enum columns

DB stores lowercase text (`'learner'`, `'ai_scored'`). Java enum constants must match exactly:

```java
public enum UserRole {
    learner, instructor, admin
}
```

On entity fields: `@Enumerated(EnumType.STRING)`.

### JSONB columns

```java
@JdbcTypeCode(SqlTypes.JSON)
@Column(name = "metadata", columnDefinition = "jsonb")
private Map<String, Object> metadata;

@JdbcTypeCode(SqlTypes.JSON)
@Column(name = "scores", columnDefinition = "jsonb")
private WritingScores scores;   // typed class for structured data
```

### ManyToMany with join tables

```java
@ManyToMany(fetch = FetchType.LAZY)
@JoinTable(
    name = "_PassageTags",
    joinColumns = @JoinColumn(name = "A"),
    inverseJoinColumns = @JoinColumn(name = "B")
)
private Set<TopicTag> tags = new HashSet<>(0);
```

### Auditing

Only add `@EntityListeners(AuditingEntityListener.class)` to entities with
`@CreatedDate` / `@LastModifiedDate`. Requires `@EnableJpaAuditing` in a config class.

---

## 2. Repository

**Naming:** `<Entity>Repository`
**Package:** `com.teachy.backend.<module>.repository`

```java
public interface MyEntityRepository extends JpaRepository<MyEntity, UUID> {
    Optional<MyEntity> findByEmail(String email);
    List<MyEntity> findByStatusOrderByCreatedAtDesc(ContentStatus status);
}
```

- Extend `JpaRepository<Entity, UUID>` — PK type is `UUID`.
- Interface only — no annotations needed.
- For complex queries, use `@Query` with JPQL or native SQL.

---

## 3. Service

**Naming:** `<Feature>Service`
**Package:** `com.teachy.backend.<module>.service`

```java
@Slf4j
@Service
@RequiredArgsConstructor
public class MyFeatureService {

    private final MyEntityRepository myEntityRepository;

    @Transactional
    public MyResult doSomething(UUID id) { ... }

    @Transactional(readOnly = true)
    public MyEntity findById(UUID id) {
        return myEntityRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("MyEntity", id));
    }
}
```

- `@Transactional` on write methods; `@Transactional(readOnly = true)` on reads.
- `@RequiredArgsConstructor` + `private final` — never `@Autowired` on fields.
- Services must never access controllers or know about HTTP concerns.

---

## 4. Controller

**Naming:** `<Entity>Controller`
**Package:** `com.teachy.backend.<module>.controller`

```java
@Slf4j
@RestController
@RequestMapping("/api/<domain>")
@RequiredArgsConstructor
public class MyEntityController {

    private final MyFeatureService myFeatureService;

    @GetMapping("/{id}")
    public MyEntityResponse getById(@PathVariable UUID id) { ... }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MyEntityResponse create(@Valid @RequestBody CreateMyEntityRequest request) { ... }
}
```

- Controllers must **never** be `@Transactional`.
- Controllers must not use repositories directly.
- URI path: lowercase, noun-based (`/passages`, `/classrooms`).
- `@Valid` on `@RequestBody` for bean validation.

---

## 5. Request DTO

**Naming:** `<Action><Target>Request` (e.g. `LoginRequest`, `CreatePassageRequest`)
**Package:** `com.teachy.backend.<module>.dto`

Always **immutable**. Prefer record for simple requests:

```java
public record LoginRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8, max = 72) String password
) {}
```

Use `@Builder @Jacksonized` when defaults are needed:

```java
@Getter
@Builder
@Jacksonized
public class CreatePassageRequest {
    @NotBlank private final String title;
    @NotBlank private final String body;
    @NotNull private final CefrLevel level;
    @Builder.Default
    private final ContentStatus status = ContentStatus.draft;
}
```

---

## 6. Response DTO

**Naming:** `<Entity>Response` or `<Feature>Response`
**Package:** `com.teachy.backend.<module>.dto`

Always **immutable**. Prefer record:

```java
public record UserResponse(
    String id,
    String email,
    String displayName,
    UserRole role,
    Instant createdAt
) {
    public static UserResponse from(User entity) {
        return new UserResponse(
            entity.getId(), entity.getEmail(),
            entity.getDisplayName(), entity.getRole(),
            entity.getCreatedAt()
        );
    }
}
```

---

## 7. Mapper

**Naming:** `<Entity>Mapper`
**Package:** `com.teachy.backend.<module>.dto` (co-located with DTOs)

For simple mappings, use a `static from()` method directly on the response record (see above).
Introduce a separate mapper class only when conversion logic is complex or needs dependencies.

```java
@Component
@RequiredArgsConstructor
public class WritingSubmissionMapper {

    private final PromptService promptService;

    public WritingSubmissionResponse toResponse(WritingSubmission entity) {
        var prompt = promptService.findById(entity.getPromptId());
        return WritingSubmissionResponse.builder()
            .id(entity.getId())
            .promptTitle(prompt.getTitle())
            .scores(entity.getScores())
            .state(entity.getState())
            .build();
    }
}
```

**When to use which:**

| Complexity | Approach |
|---|---|
| 1:1 field mapping, no dependencies | `static from()` on the record |
| Needs injected services or complex logic | `@Component` mapper class |
| Bulk mapping of collections | `stream().map(Response::from).toList()` |

---

## 8. Config

**Naming:** `<Feature>Config`
**Package:** `com.teachy.backend.config`

```java
@Configuration
public class JpaConfig {
    // Enable JPA Auditing for @CreatedDate/@LastModifiedDate
}

@Configuration
@EnableJpaAuditing
public class JpaConfig {}
```

- Classes instantiated via `@Bean` must **not** also carry `@Service`/`@Component`.
- Use `@ConfigurationProperties(prefix = "teachy.<feature>")` for typed config binding.

---

## 9. Constants

**Naming:** UPPER_SNAKE_CASE.
**Location:** co-locate with the class that uses them. Only extract to a shared constants
class when ≥ 3 unrelated classes reference the same value.

```java
// Good — constant lives where it's used
@Service
public class ScoringService {
    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final Duration SCORING_TIMEOUT = Duration.ofSeconds(30);
}

// Good — shared across modules
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class AppConstants {
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;
}
```

**Rules:**
- Never put all constants in one giant file — group by domain.
- Prefer enums over string/int constants when values form a closed set.
- Never use interface just to hold constants (anti-pattern: "constant interface").

---

## 10. Exception

**Naming:** `<Descriptor>Exception`
**Package:** `com.teachy.backend.common.exception`

```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, Object id) {
        super("%s not found: %s".formatted(resource, id));
    }
}
```

- Never throw bare `Exception` or `RuntimeException`.
- Never return null to signal an error.
- Never log and re-throw the same exception.
- Always pass the original cause when wrapping: `throw new MyException("msg", e)`.
- All exceptions are handled by `GlobalExceptionHandler` (`@RestControllerAdvice`).

---

## 11. Enum

**Naming:** PascalCase singular (`UserRole`, `QuestionType`, `SubmissionState`).
**Package:** `com.teachy.backend.common.enums`

```java
// DB-mapped — lowercase to match PostgreSQL enum values
public enum UserRole {
    learner, instructor, admin
}

// App-only enum (not in DB) — standard UPPER_SNAKE_CASE
public enum ErrorCode {
    INVALID_INPUT,
    RESOURCE_NOT_FOUND,
    STATE_TRANSITION_DENIED
}
```

### Enum with behavior

```java
public enum TaskType {
    task1(150), task2(250);

    private final int defaultMinWords;

    TaskType(int defaultMinWords) { this.defaultMinWords = defaultMinWords; }

    public int getDefaultMinWords() { return defaultMinWords; }
}
```

---

## 12. Utility Class

**Naming:** Ends with `Utils` — never `Util`.

```java
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class DateUtils {
    public static LocalDate parseDate(String value) { ... }
}
```

- `final` class, `static` methods only, private constructor.
- Prefer Spring beans over static utilities when the logic needs dependencies.

---

## 13. Event / Listener (Spring Events)

Use for decoupling cross-cutting concerns (notifications, audit logging, cache invalidation).

**Event — a record:**

```java
public record SubmissionScoredEvent(
    String submissionId,
    String userId,
    SubmissionState newState,
    Instant occurredAt
) {}
```

**Publisher — in the service:**

```java
@Service
@RequiredArgsConstructor
public class ScoringService {

    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void scoreSubmission(String id) {
        // ... scoring logic ...
        eventPublisher.publishEvent(new SubmissionScoredEvent(
            id, submission.getUserId(), ai_scored, Instant.now()
        ));
    }
}
```

**Listener — separate class:**

```java
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onSubmissionScored(SubmissionScoredEvent event) {
        notificationService.notifyUser(event.userId(), "Your essay has been scored.");
    }
}
```

**Rules:**
- Events are records (immutable data).
- Use `@TransactionalEventListener(AFTER_COMMIT)` when the listener should only fire
  if the transaction commits successfully.
- Use `@EventListener` for non-transactional processing.
- Never put business logic in listeners — delegate to services.

---

# Part 3 — Design Patterns & Abstraction Rules

## When to Introduce an Interface

**The 3-reason rule:** introduce an interface when **at least one** of these is true:

1. **Multiple implementations exist today** — e.g. `PdfParser`, `DocxParser` both implement
   `DocumentParser`.
2. **Testing requires a seam** — you need to mock an external dependency (Gemini API,
   email service) in unit tests.
3. **The contract is the API** — Spring Data repositories, SPI contracts, event listeners
   where the framework defines the shape.

**Do NOT create an interface:**
- For a service with one implementation and no mock needed (Spring proxies work on classes).
- "Just in case" a second implementation might appear. YAGNI.
- To "follow best practices" without a concrete benefit.

**Naming:**
- If the interface represents a capability: verb-adjective (`Scorable`, `Parseable`,
  `Exportable`).
- If the interface represents a contract: noun (`DocumentParser`, `ScoreCalculator`).
- Never `I`-prefix (`IUserService`) — not Java convention.
- Never `Impl` suffix on the only implementation — name it by what makes it specific:
  `GeminiScoreCalculator`, `MammothDocxParser`.

## When to Use Abstract Class vs Interface

| Use abstract class | Use interface |
|---|---|
| Share state (fields) between subclasses | Define a contract without shared state |
| Template Method pattern — shared algorithm skeleton | Strategy pattern — swappable behavior |
| Strong "is-a" relationship | "can-do" capability |
| Only one inheritance slot available (use wisely) | Multiple interfaces per class |

```java
// Abstract class — shared state + template method
public abstract class BaseGradingStrategy {

    protected final ObjectMapper objectMapper;

    protected BaseGradingStrategy(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public final GradeResult grade(Question question, Object answer) {
        var parsed = parseAnswer(answer);
        return doGrade(question, parsed);
    }

    protected abstract Object parseAnswer(Object rawAnswer);
    protected abstract GradeResult doGrade(Question question, Object parsedAnswer);
}

// Interface — pure contract
public interface DocumentParser {
    ParsedDocument parse(InputStream input);
    boolean supports(String fileExtension);
}
```

## Design Patterns in Teachy

### Strategy Pattern — Question Grading

The project has 13 IELTS question types, each with different grading logic.

```java
// Strategy interface
public interface GradingStrategy {
    QuestionType getType();
    GradeResult grade(Question question, Object studentAnswer);
}

// One implementation per question type
@Component
public class TrueFalseNotGivenStrategy implements GradingStrategy {

    @Override
    public QuestionType getType() { return QuestionType.true_false_notgiven; }

    @Override
    public GradeResult grade(Question question, Object studentAnswer) { ... }
}

// Registry — collects all strategies via Spring DI
@Component
@RequiredArgsConstructor
public class GradingStrategyRegistry {

    private final Map<QuestionType, GradingStrategy> strategies;

    // Spring auto-injects all GradingStrategy beans into a List
    public GradingStrategyRegistry(List<GradingStrategy> strategyList) {
        this.strategies = strategyList.stream()
            .collect(Collectors.toMap(GradingStrategy::getType, s -> s));
    }

    public GradingStrategy getStrategy(QuestionType type) {
        return Optional.ofNullable(strategies.get(type))
            .orElseThrow(() -> new IllegalArgumentException("No strategy for: " + type));
    }
}
```

**When to use:** when you have N variants of the same operation, selected at runtime.
Each variant is a `@Component`; Spring auto-discovers them.

### Template Method — Shared Algorithm Skeleton

```java
public abstract class AbstractImportService<T> {

    // Template — fixed sequence
    public final ImportResult importDocument(SourceDocument doc) {
        var rawData = parse(doc);
        var validated = validate(rawData);
        return save(validated);
    }

    protected abstract T parse(SourceDocument doc);
    protected abstract T validate(T rawData);
    protected abstract ImportResult save(T validatedData);
}

// Concrete implementation
@Service
public class PassageImportService extends AbstractImportService<ParsedPassage> {
    @Override protected ParsedPassage parse(SourceDocument doc) { ... }
    @Override protected ParsedPassage validate(ParsedPassage data) { ... }
    @Override protected ImportResult save(ParsedPassage data) { ... }
}
```

**When to use:** when multiple classes share the same algorithm structure but differ in
specific steps.

### Factory Method — Object Creation

```java
// Simple static factory — preferred over constructor for readability
public record ErrorResponse(String message, String code, Instant timestamp) {

    public static ErrorResponse of(String message, String code) {
        return new ErrorResponse(message, code, Instant.now());
    }

    public static ErrorResponse fromException(RuntimeException ex) {
        return new ErrorResponse(ex.getMessage(), "INTERNAL_ERROR", Instant.now());
    }
}
```

**When to use:**
- When construction needs a descriptive name (`of`, `from`, `create`).
- When you want to return a subtype or cached instance.
- Prefer static factory methods on the target class over a separate `Factory` class.

### Builder Pattern (via Lombok)

Already covered by `@Builder @Jacksonized` in immutable pattern. Use when:
- Object has > 4 constructor parameters.
- Some fields are optional with defaults.
- You want a fluent, readable construction API.

### Observer Pattern (Spring Events)

Covered in section 13 (Event / Listener). Use when:
- Multiple unrelated components need to react to the same event.
- The publisher shouldn't know about the listeners.
- Side effects (notifications, audit logs) should not block the main flow.

---

## State Machine — Writing Submission

The writing submission follows a strict state machine. Enforce transitions in the service
layer, never allow arbitrary state changes.

```java
public enum SubmissionState {
    draft, submitted, ai_scored, ai_failed, released_ai, pending_review, finalized;

    private static final Map<SubmissionState, Set<SubmissionState>> TRANSITIONS = Map.of(
        draft, Set.of(submitted),
        submitted, Set.of(ai_scored, ai_failed),
        ai_scored, Set.of(released_ai, pending_review),
        ai_failed, Set.of(submitted),
        released_ai, Set.of(pending_review, finalized),
        pending_review, Set.of(finalized),
        finalized, Set.of()
    );

    public boolean canTransitionTo(SubmissionState target) {
        return TRANSITIONS.getOrDefault(this, Set.of()).contains(target);
    }

    public SubmissionState transitionTo(SubmissionState target) {
        if (!canTransitionTo(target)) {
            throw new InvalidStateTransitionException(this, target);
        }
        return target;
    }
}
```

---

## Composition over Inheritance

**Default to composition.** Use inheritance only for genuine "is-a" relationships with
shared behavior (Template Method, sealed hierarchies).

```java
// Bad — inheritance for code reuse
public class AdminService extends UserService { ... }

// Good — composition
@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserService userService;  // delegates user-related work
}
```

**Rules:**
- Favor `private final` fields (composition) over `extends` (inheritance).
- Never inherit just to reuse a few utility methods — extract a shared service or utility.
- Inheritance depth > 2 is a code smell — flatten or switch to composition.

## SOLID Principles — Applied

| Principle | In Teachy |
|---|---|
| **S**ingle Responsibility | One service per bounded context. `ScoringService` scores, `NotificationService` notifies. |
| **O**pen/Closed | Strategy pattern for grading — add a new question type by adding a new `@Component`, not modifying existing code. |
| **L**iskov Substitution | All `GradingStrategy` implementations are interchangeable — caller doesn't know which concrete type runs. |
| **I**nterface Segregation | Separate interfaces for separate capabilities: `DocumentParser` doesn't extend `ScoreCalculator`. |
| **D**ependency Inversion | Services depend on `JpaRepository` interface, not concrete DB implementation. Controllers depend on service interfaces. |

---

# Part 4 — Quick Reference

## Package Structure

```
com.teachy.backend/
├── common/
│   ├── enums/          ← UserRole, QuestionType, etc.
│   ├── exception/      ← ResourceNotFoundException, GlobalExceptionHandler
│   ├── dto/            ← PageResponse, ErrorResponse
│   └── security/       ← JwtProvider, JwtAuthFilter, CurrentUser
├── config/             ← SecurityConfig, RedisConfig, JpaConfig
├── auth/
│   ├── controller/     ← AuthController
│   ├── service/        ← AuthService
│   └── dto/            ← LoginRequest, TokenResponse
├── user/
│   ├── model/          ← User (entity)
│   ├── repository/     ← UserRepository
│   ├── service/        ← UserService
│   ├── controller/     ← UserController
│   └── dto/            ← UserResponse
├── reading/
│   ├── passage/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── service/
│   │   ├── controller/
│   │   └── dto/
│   ├── question/
│   └── submission/
├── writing/
├── classroom/
├── notification/
├── upload/
└── content/
```

## Annotation Cheat Sheet

| Class Type | Annotations |
|---|---|
| Entity (JPA) | `@Getter @Setter @Entity @Table` + `@EntityListeners` if audited |
| Repository | `interface extends JpaRepository<E, UUID>` |
| Service | `@Slf4j @Service @RequiredArgsConstructor` + `@Transactional` on methods |
| Controller | `@Slf4j @RestController @RequestMapping @RequiredArgsConstructor` |
| Request DTO | `record` with Jakarta validation, or `@Getter @Builder @Jacksonized` |
| Response DTO | `record` with `static from()`, or `@Getter @Builder @Jacksonized` |
| Mapper | `@Component @RequiredArgsConstructor` (only if complex) |
| Config | `@Configuration` |
| Constants | `private static final` in-class, or `final class` with `PRIVATE` constructor |
| Exception | `extends RuntimeException` with specific fields |
| Enum (DB) | lowercase constants + `@Enumerated(EnumType.STRING)` on entity |
| Enum (app) | UPPER_SNAKE_CASE constants |
| Utility | `final class` + `@NoArgsConstructor(access = PRIVATE)` |
| Event | `record` — immutable event data |
| Listener | `@Component` + `@TransactionalEventListener` or `@EventListener` |
| Strategy | `interface` + multiple `@Component` implementations |

## Rules Summary

| Rule | Rationale |
|---|---|
| Prefer immutable (records or `@Builder`) | Thread-safe, predictable |
| `@RequiredArgsConstructor` + `private final` for DI | Explicit, testable |
| Never `@Autowired` on fields | Hard to test, hides dependencies |
| Never `@Data` on entities | Broken equals/hashCode for JPA proxies |
| FetchType always explicit, default LAZY | Prevents N+1 queries |
| `UUID id` + `@GeneratedValue(strategy = UUID)` | Native UUID PKs, Hibernate generates |
| Enum constants match DB lowercase values | Direct `@Enumerated(STRING)` mapping |
| Controllers never `@Transactional` | Transaction boundary in service layer |
| Controllers never use repositories | Business logic in services |
| `@Slf4j` for logging, never `System.out` | Structured, configurable |
| Throw specific exceptions, never bare RuntimeException | Proper error handling |
| Use `Optional` for return, never field/parameter | Signals possible absence |
| Interface only when 2+ impls, test seam, or framework | Avoid premature abstraction |
| Composition over inheritance | Flexible, testable, shallow hierarchy |
| State transitions enforced in enum or service | Prevent invalid business states |
| Use `var` only when type is obvious | Readability over brevity |
| `.toList()` over `.collect(toList())` | Concise, unmodifiable |
| Text blocks for multi-line strings | Readable SQL, prompts, templates |
| Events for cross-cutting side effects | Decoupled notification/audit |

## Decision Flowchart — "What class do I write?"

```
Need to persist data?
├── Yes → Entity (@Entity, mutable, @GeneratedValue UUID)
│   └── Need CRUD? → Repository (interface extends JpaRepository)
└── No
    ├── Business logic? → Service (@Service, @Transactional)
    ├── HTTP endpoint? → Controller (@RestController, delegates to service)
    ├── Data in from client? → Request DTO (record or @Builder, @Valid)
    ├── Data out to client? → Response DTO (record with static from())
    ├── Complex DTO conversion? → Mapper (@Component)
    ├── Spring bean wiring? → Config (@Configuration, @Bean)
    ├── Error signaling? → Exception (extends RuntimeException)
    ├── Fixed set of values? → Enum (lowercase if DB, UPPER if app-only)
    ├── Pure static helpers? → Utility (final class, private constructor)
    ├── Cross-cutting reaction? → Event (record) + Listener (@Component)
    ├── N variants of same operation? → Strategy (interface + N @Components)
    └── Shared algorithm skeleton? → Abstract class (Template Method)
```
