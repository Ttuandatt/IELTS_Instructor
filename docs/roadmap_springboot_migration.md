# 🗺️ Roadmap: Chuyển đổi Backend từ NestJS sang Java Spring Boot

> **Dự án:** IELTS Instructor  
> **Ngày tạo:** 2026-03-13  
> **Đối tượng:** Developer đã thành thạo NestJS/TypeScript, muốn migrate sang Java/Spring Boot  
> **Thời gian ước tính:** 6–8 tuần (học song song với làm dự án)

---

## Tổng quan Lộ trình

```
Phase 1 (Tuần 1-2)     Phase 2 (Tuần 3-4)      Phase 3 (Tuần 5-6)      Phase 4 (Tuần 7-8)
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Java Core +    │    │  Database Layer │    │  Security &     │    │  Queue, AI &    │
│  Spring Boot    │───►│  JPA + Flyway   │───►│  Integration    │───►│  Deployment     │
│  Fundamentals   │    │  + Repository   │    │  + Testing      │    │  + Migration    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Phase 1: Java Core + Spring Boot Fundamentals (Tuần 1–2)

### 1.1 Java Language Essentials

> 💡 *Bạn đã biết TypeScript → Java syntax sẽ quen nhanh. Tập trung vào những điểm KHÁC BIỆT.*

| Chủ đề | Chi tiết cần học | NestJS tương đương |
|--------|-----------------|-------------------|
| **Syntax cơ bản** | Types (int, String, boolean), Classes, Interfaces, Access modifiers (`public`/`private`/`protected`) | TypeScript types |
| **Collections Framework** | `List<T>`, `Map<K,V>`, `Set<T>`, `ArrayList`, `HashMap` | Array, Map, Set |
| **Generics** | `<T>`, bounded types `<T extends Comparable>`, wildcards `<?>` | TypeScript Generics `<T>` |
| **Lambda & Stream API** | `.stream().filter().map().collect()`, `Optional<T>` | Arrow functions, `.filter().map()` |
| **Exception Handling** | Checked vs Unchecked, `try-catch-finally`, custom exceptions | `throw new HttpException()` |
| **Annotations** | `@Override`, `@Deprecated`, custom annotations | Decorators `@Get()`, `@Injectable()` |
| **Records (Java 17+)** | `record UserDto(String name, String email) {}` | DTO classes |
| **Sealed Classes** | `sealed interface Shape permits Circle, Square {}` | Union types |

**Bài tập thực hành:**
- [ ] Viết lại file `src/scoring/scoring.producer.ts` (interface `ScoringJobData`) bằng Java Record
- [ ] Viết lại enum `QuestionType` từ `schema.prisma` bằng Java Enum

---

### 1.2 Maven / Gradle Build Tools

| Chủ đề | Chi tiết | NestJS tương đương |
|--------|---------|-------------------|
| **`pom.xml`** (Maven) | Khai báo dependencies, plugins, profiles | `package.json` |
| **`mvn clean install`** | Build + test + package thành `.jar` | `npm run build` |
| **Dependency management** | `<dependency>` blocks, version management | `dependencies` trong package.json |
| **Spring Boot Starter** | `spring-boot-starter-web`, `starter-data-jpa`... | `@nestjs/platform-express`, `@nestjs/typeorm`... |

**Bài tập thực hành:**
- [ ] Tạo project Spring Boot mới bằng [start.spring.io](https://start.spring.io) với các starter: Web, Data JPA, Validation, Security
- [ ] Chạy `mvn spring-boot:run` thành công

---

### 1.3 Spring Boot Core Concepts

| NestJS Concept | Spring Boot Equivalent | Ví dụ từ dự án IELTS |
|---------------|----------------------|---------------------|
| `main.ts` + `NestFactory.create()` | `@SpringBootApplication` + `main()` | Entry point |
| `@Module({ imports, providers })` | `@Configuration` + `@ComponentScan` | `app.module.ts` → Auto-scan |
| `@Controller('reading')` | `@RestController` + `@RequestMapping("/reading")` | `reading.controller.ts` |
| `@Get(':id')` | `@GetMapping("/{id}")` | Route mapping |
| `@Body() dto` | `@RequestBody @Valid dto` | Request body parsing |
| `@Param('id')` | `@PathVariable("id")` | URL parameters |
| `@Query('page')` | `@RequestParam("page")` | Query string |
| `@Injectable()` | `@Service` / `@Component` | Service layer |
| `@Inject()` constructor | `@Autowired` hoặc Constructor injection | DI |
| `@UseGuards()` | `@PreAuthorize()` hoặc Security Filters | Auth guards |
| `@UseInterceptors()` | `HandlerInterceptor` | Logging, transform |

**Kiến thức trọng tâm:**
- [ ] **Dependency Injection**: Constructor injection (khuyên dùng), `@Autowired`
- [ ] **Bean Lifecycle**: `@PostConstruct`, `@PreDestroy` (tương đương `onModuleInit`, `onModuleDestroy`)
- [ ] **Configuration**: `application.yml`, `@Value("${key}")`, `@ConfigurationProperties`
- [ ] **Profiles**: `application-dev.yml`, `application-prod.yml` (tương đương `.env.development`, `.env.production`)
- [ ] **Exception Handling**: `@ControllerAdvice` + `@ExceptionHandler` (tương đương Exception Filters)

**Bài tập thực hành:**
- [ ] Viết lại `ReadingController` + `ReadingService` của IELTS bằng Spring Boot
- [ ] Tạo một `GlobalExceptionHandler` bằng `@ControllerAdvice`

---

## Phase 2: Database Layer — JPA + Flyway (Tuần 3–4)

### 2.1 Spring Data JPA + Hibernate

| Prisma Concept | JPA Equivalent | Ví dụ |
|---------------|---------------|-------|
| `model User { ... }` trong schema.prisma | `@Entity` class | `@Entity @Table(name = "users") public class User { }` |
| `@id @default(uuid())` | `@Id @GeneratedValue(strategy = UUID)` | Primary key |
| Field types (`String`, `Int`, `DateTime`) | `String`, `Integer`, `LocalDateTime` | Column types |
| `@relation` | `@OneToMany`, `@ManyToOne`, `@ManyToMany` | Relationships |
| `@@map("users")` | `@Table(name = "users")` | Table name mapping |
| `prisma.user.findMany()` | `userRepository.findAll()` | Query all |
| `prisma.user.findUnique({ where: { id } })` | `userRepository.findById(id)` | Query by ID |
| `prisma.user.create({ data })` | `userRepository.save(entity)` | Insert |
| `prisma.$transaction([...])` | `@Transactional` | Transaction |
| Include/Select | `@EntityGraph` hoặc `JOIN FETCH` | Eager loading |

**Kiến thức trọng tâm:**
- [ ] **Entity classes**: `@Entity`, `@Table`, `@Column`, `@Enumerated`
- [ ] **Relationships**: `@OneToMany(mappedBy)`, `@ManyToOne`, `@JoinColumn`, cascade types
- [ ] **Repository pattern**: `extends JpaRepository<User, UUID>`
- [ ] **Custom queries**: Derived queries (`findByEmailAndRole`), `@Query` (JPQL / Native SQL)
- [ ] **Pagination**: `Pageable`, `Page<T>`, `PageRequest.of(page, size, sort)`
- [ ] **Auditing**: `@CreatedDate`, `@LastModifiedDate`, `@EnableJpaAuditing`

**Bài tập thực hành:**
- [ ] Viết lại toàn bộ Prisma models (`User`, `Passage`, `Question`, `WritingSubmission`) thành JPA Entities
- [ ] Viết `PassageRepository` với method `findByLevelAndStatus(level, status, pageable)`

---

### 2.2 Flyway Database Migration

| Prisma Migrate | Flyway |
|---------------|--------|
| `npx prisma migrate dev` | `mvn flyway:migrate` (tự chạy khi app start) |
| `prisma/migrations/` | `src/main/resources/db/migration/` |
| Migration file name | `V1__create_users_table.sql`, `V2__add_passages.sql` |

**Kiến thức trọng tâm:**
- [ ] Versioned migrations: `V{version}__{description}.sql`
- [ ] Repeatable migrations: `R__views.sql`
- [ ] Baseline cho DB đã có data
- [ ] Rollback strategies

---

## Phase 3: Security, Integration & Testing (Tuần 5–6)

### 3.1 Spring Security + JWT

> ⚠️ *Đây là phần PHỨC TẠP NHẤT khi chuyển từ NestJS sang Spring Boot*

| NestJS Auth | Spring Security |
|------------|----------------|
| `passport-jwt` strategy | `SecurityFilterChain` + custom `JwtAuthFilter` |
| `JwtAuthGuard` | `OncePerRequestFilter` |
| `@UseGuards(JwtAuthGuard)` | `@PreAuthorize("isAuthenticated()")` |
| `@Roles('admin')` | `@PreAuthorize("hasRole('ADMIN')")` |
| `req.user` | `SecurityContextHolder.getContext().getAuthentication()` |
| `JwtService.sign()` | `jjwt` library: `Jwts.builder().signWith().compact()` |

**Kiến thức trọng tâm:**
- [ ] `SecurityFilterChain` bean configuration
- [ ] Custom `JwtAuthenticationFilter extends OncePerRequestFilter`
- [ ] `UserDetailsService` implementation
- [ ] Method-level security: `@PreAuthorize`, `@Secured`
- [ ] CORS configuration trong Spring Security
- [ ] Password encoding: `BCryptPasswordEncoder`

**Bài tập thực hành:**
- [ ] Implement đầy đủ luồng Register + Login + JWT refresh token
- [ ] Tạo 3 role (LEARNER, INSTRUCTOR, ADMIN) với `@PreAuthorize`

---

### 3.2 Validation

| class-validator (NestJS) | Jakarta Validation (Spring) |
|-------------------------|---------------------------|
| `@IsEmail()` | `@Email` |
| `@IsNotEmpty()` | `@NotBlank` |
| `@MinLength(8)` | `@Size(min = 8)` |
| `@IsEnum(Role)` | `@Pattern` hoặc custom validator |
| `@IsOptional()` | Field nullable (không dùng annotation) |
| `ValidationPipe` (global) | `@Valid` trên từng endpoint hoặc `@Validated` trên class |

---

### 3.3 Testing

| Jest (NestJS) | JUnit 5 + Mockito (Spring) |
|--------------|---------------------------|
| `describe()` / `it()` | `@Test` method |
| `jest.mock()` | `@Mock` + `@InjectMocks` (Mockito) |
| `beforeEach()` | `@BeforeEach` |
| `expect().toBe()` | `assertThat().isEqualTo()` (AssertJ) |
| `Test.createTestingModule()` | `@SpringBootTest` + `@AutoConfigureMockMvc` |
| Supertest `request(app)` | `MockMvc.perform(get("/api/..."))` |

**Kiến thức trọng tâm:**
- [ ] **Unit test**: `@ExtendWith(MockitoExtension.class)`, `@Mock`, `when().thenReturn()`
- [ ] **Integration test**: `@SpringBootTest`, `@AutoConfigureMockMvc`, `MockMvc`
- [ ] **Testcontainers**: `@Testcontainers`, `@Container PostgreSQLContainer`
- [ ] **Test slices**: `@WebMvcTest` (chỉ test Controller), `@DataJpaTest` (chỉ test Repository)

---

## Phase 4: Queue, AI Integration & Deployment (Tuần 7–8)

### 4.1 Message Queue

| BullMQ (NestJS) | Spring Boot Options |
|----------------|-------------------|
| `@InjectQueue()` | `RabbitTemplate` (RabbitMQ) hoặc `StringRedisTemplate` (Redis Streams) |
| `@Processor()` consumer | `@RabbitListener` hoặc `StreamListener` |
| Queue priority | RabbitMQ Priority Queue |
| Retry + backoff | `@Retryable` (Spring Retry) |
| BullMQ Dashboard | RabbitMQ Management UI (built-in) |

**Hai lựa chọn phổ biến:**
1. **RabbitMQ** (Khuyên dùng) — Hệ sinh thái Java rất mạnh, có Management UI sẵn
2. **Redis Streams** + Redisson — Nếu muốn tiếp tục dùng Redis

**Bài tập thực hành:**
- [ ] Setup RabbitMQ (Docker), tạo queue "writing-scoring"
- [ ] Viết lại `ScoringProducer` và `ScoringConsumer` bằng `@RabbitListener`

---

### 4.2 AI / LLM Integration

| NestJS (hiện tại) | Spring Boot |
|-------------------|-------------|
| `LlmClientService` gọi API thủ công | **Spring AI** (chính thức từ Spring team) |
| `fetch()` / `axios` gọi OpenAI/Gemini | `ChatClient.call(prompt)` |
| Manual JSON parsing | `OutputParser` tự parse structured output |

**Spring AI hỗ trợ sẵn:**
- OpenAI, Anthropic (Claude), Google Gemini, Ollama (local)
- Structured output parsing (JSON schema)
- Retry + fallback giữa các providers
- RAG (Retrieval Augmented Generation)

---

### 4.3 Server-Sent Events

| NestJS | Spring Boot |
|--------|-------------|
| `@Sse()` decorator | `SseEmitter` class |
| `Observable<MessageEvent>` | `SseEmitter.send()` |

```java
@GetMapping("/submissions/{id}/events")
public SseEmitter subscribeToScoring(@PathVariable String id) {
    SseEmitter emitter = new SseEmitter(5 * 60 * 1000L); // 5 min timeout
    // Subscribe to Redis pub/sub...
    return emitter;
}
```

---

### 4.4 File Upload & DOCX Parsing

| NestJS | Spring Boot |
|--------|-------------|
| Multer (`@UploadedFile()`) | `@RequestParam MultipartFile file` |
| mammoth (DOCX → HTML) | **Apache POI** (DOCX → Text/HTML) |

---

### 4.5 Deployment

| Chủ đề | Chi tiết |
|--------|---------|
| **Docker** | `Dockerfile` multi-stage build: Maven build → JRE runtime |
| **Docker Compose** | App + Postgres + Redis + RabbitMQ |
| **Health checks** | Spring Boot Actuator (`/actuator/health`) |
| **Monitoring** | Micrometer + Prometheus + Grafana |

---

## 📖 Tài liệu & Khóa học Đề xuất

### Sách
| Tên | Mô tả |
|-----|-------|
| **Spring in Action** (Craig Walls) | "Bible" của Spring Boot, cập nhật Spring Boot 3 |
| **Java: The Complete Reference** (Herbert Schildt) | Tra cứu Java syntax |

### Khóa học Online
| Platform | Khóa |
|----------|------|
| **Baeldung.com** | Trang web #1 về Spring Boot tutorials (MIỄN PHÍ) |
| **Spring.io/guides** | Official guides từ Spring team (MIỄN PHÍ) |
| **Udemy** | "Spring Boot 3 & Spring 6" by Chad Darby |

### Tools
| Tool | Mục đích |
|------|---------|
| **IntelliJ IDEA** (Community/Ultimate) | IDE tốt nhất cho Java |
| **start.spring.io** | Khởi tạo project Spring Boot |
| **HTTPie / Postman** | Test API |
| **DBeaver** | Database GUI |

---

## ✅ Checklist Tổng Kết

- [ ] Viết được REST API CRUD cơ bản bằng Spring Boot
- [ ] Kết nối PostgreSQL bằng JPA + Flyway migration
- [ ] Implement JWT Authentication + Role-based Authorization
- [ ] Viết Unit test + Integration test đạt >80% coverage
- [ ] Setup Message Queue (RabbitMQ) cho async processing
- [ ] Tích hợp AI scoring bằng Spring AI
- [ ] Dockerize ứng dụng hoàn chỉnh
- [ ] **Migrate thành công 1 module đầu tiên** (Reading hoặc Auth) từ NestJS sang Spring Boot
