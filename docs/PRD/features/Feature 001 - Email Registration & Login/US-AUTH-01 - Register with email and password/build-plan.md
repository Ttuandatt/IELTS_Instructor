# Build Plan — US-AUTH-01: Register with email and password

**Target:** Spring Boot 3.4 · Java 21 · PostgreSQL 16 · Redis 7

## Prerequisites

- `users` table already exists (V2026.08.23.02)
- `UserRole` enum already exists (`LEARNER`, `INSTRUCTOR`, `ADMIN`)
- JWT config already in `application-dev.yml` under `teachy.jwt.*`
- No auth/security Java code exists yet

## Tasks

### T1: Flyway migration — add missing columns

The existing `users` table lacks fields needed by auth ACs. Add a new migration:

**File:** `src/main/resources/db/migration/V2026.09.02.01__alter_users_auth_fields.sql`

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
```

**Covers:** groundwork for US-AUTH-02 AC9, US-AUTH-04, US-AUTH-09

---

### T2: User entity

**File:** `src/main/java/com/teachy/backend/user/User.java`

- JPA `@Entity` mapped to `users` table
- Fields: `id` (UUID), `email`, `passwordHash`, `displayName`, `role` (UserRole enum), `language`, `theme`, `avatarUrl`, `emailVerified`, `status`, `lastLoginAt`, `createdAt`, `updatedAt`
- `@PrePersist`: lowercase + trim email
- `passwordHash` excluded from any JSON serialization (`@JsonIgnore`)

**Covers:** AC2 (lowercase), AC4 (never expose password)

---

### T3: UserRepository

**File:** `src/main/java/com/teachy/backend/user/UserRepository.java`

```java
Optional<User> findByEmailIgnoreCase(String email);
boolean existsByEmailIgnoreCase(String email);
```

**Covers:** AC2 (case-insensitive uniqueness check)

---

### T4: RegisterRequest DTO with Jakarta validation

**File:** `src/main/java/com/teachy/backend/auth/dto/RegisterRequest.java`

| Field | Validation | Vietnamese error message |
|-------|-----------|------------------------|
| `email` | `@NotBlank`, `@Size(max=255)`, `@Pattern(^[^\s@]+@[^\s@]+\.[^\s@]+$)` | "Email không hợp lệ" |
| `password` | `@NotBlank`, `@Size(min=8, max=72)`, `@Pattern(.*[A-Z].*) + [a-z] + [0-9]` | "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số" |
| `displayName` | `@NotBlank`, `@Size(min=2, max=50)` | "Tên hiển thị phải từ 2 đến 50 ký tự" |
| `role` | `@NotNull`, enum `LEARNER \| INSTRUCTOR` | — |

Custom `@StrongPassword` annotation or use `@Pattern` with combined regex.

**Covers:** AC1, AC3, AC5, AC6

---

### T5: AuthResponse DTO

**File:** `src/main/java/com/teachy/backend/auth/dto/AuthResponse.java`

```java
record AuthResponse(String accessToken, String refreshToken, UserDto user) {}
record UserDto(UUID id, String email, String displayName, String role) {}
```

**Covers:** AC8 (JWT pair in response)

---

### T6: InputSanitizer utility

**File:** `src/main/java/com/teachy/backend/common/InputSanitizer.java`

- Static method `stripHtml(String input)` — regex `<[^>]*>` or use Jsoup
- Called in AuthService before persisting `displayName`

**Covers:** AC11

---

### T7: JwtService

**File:** `src/main/java/com/teachy/backend/auth/JwtService.java`

- `generateAccessToken(User)` → HS256, 15min, payload `{ sub, email, role }`
- `generateRefreshToken(User)` → HS256, 7d
- `parseToken(String token)` → claims or throw
- Reads secret/expiry from `teachy.jwt.*` config properties

**Covers:** AC8

---

### T8: AuthService

**File:** `src/main/java/com/teachy/backend/auth/AuthService.java`

```
register(RegisterRequest):
  1. Sanitize displayName (T6)
  2. Check email uniqueness via UserRepository (T3)
     → throw ConflictException("Email này đã được đăng ký")
  3. Hash password with BCrypt cost 10
  4. Create User entity, save
  5. Generate JWT pair (T7)
  6. Return AuthResponse
```

**Covers:** AC1–AC6, AC8, AC11

---

### T9: AuthController

**File:** `src/main/java/com/teachy/backend/auth/AuthController.java`

```java
@PostMapping("/api/auth/register")
@ResponseStatus(HttpStatus.CREATED)  // AC8: HTTP 201
public AuthResponse register(@Valid @RequestBody RegisterRequest request)
```

- `@Valid` triggers Jakarta validation → automatic 400 with field errors
- Global exception handler translates `MethodArgumentNotValidException` → Vietnamese messages

**Covers:** AC1, AC3, AC6, AC8

---

### T10: GlobalExceptionHandler

**File:** `src/main/java/com/teachy/backend/common/GlobalExceptionHandler.java`

- `@ExceptionHandler(MethodArgumentNotValidException)` → 400 with field-level Vietnamese messages from DTO annotations
- `@ExceptionHandler(ConflictException)` → 409 with `"Email này đã được đăng ký"`
- `@ExceptionHandler(Exception)` → 500 with `"Đã có lỗi xảy ra, vui lòng thử lại"`

**Covers:** AC9 (server error message)

---

### T11: Rate limiting

**Approach:** Bucket4j + Redis (or Spring `@RateLimiter` with Resilience4j)

**File:** `src/main/java/com/teachy/backend/common/RateLimitFilter.java`

- Filter on `POST /api/auth/register`
- Key: client IP (`X-Forwarded-For` or `remoteAddr`)
- Limit: 5 requests / 15 minutes per IP
- Exceeded → HTTP 429 with `"Bạn đã thử quá nhiều lần, vui lòng đợi 15 phút"`

**Covers:** AC10

---

### T12: Frontend — Register page (React 18 + Vite)

**File:** `apps/frontend/src/pages/auth/RegisterPage.tsx`

- Form fields: email, password, displayName, role (radio: Learner / Instructor)
- Client-side validation mirrors backend rules (instant feedback)
- Submit button disabled while invalid or in-flight (spinner)
- On 201: store tokens, redirect by role (`/dashboard` or `/instructor/dashboard`)
- On 5xx: show error toast, keep form values
- On 429: show rate limit message

**Covers:** AC5, AC7, AC8, AC9, AC10

---

## Build Sequence

```
T1 (migration) → T2 (entity) → T3 (repo)
                                    ↓
T4 (DTO) → T7 (JWT) → T8 (service) → T9 (controller)
T6 (sanitizer) ↗          ↑
T10 (exception handler) ──┘
T11 (rate limit) — independent, wire last
T12 (frontend) — after backend API is testable
```

## AC Traceability

| AC | Tasks |
|----|-------|
| AC1 (email validation) | T4, T12 |
| AC2 (email uniqueness) | T2, T3, T8 |
| AC3 (password validation) | T4, T12 |
| AC4 (bcrypt cost 10) | T8 |
| AC5 (role selector) | T4, T12 |
| AC6 (display name validation) | T4, T12 |
| AC7 (submit button UX) | T12 |
| AC8 (HTTP 201 + JWT + redirect) | T5, T7, T8, T9, T12 |
| AC9 (server error handling) | T10, T12 |
| AC10 (rate limiting) | T11, T12 |
| AC11 (XSS sanitization) | T6, T8 |
