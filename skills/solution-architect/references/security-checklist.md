# Security Checklist

Comprehensive security patterns for backend applications. Reference during architecture reviews and security audits.

## OWASP Top 10 Mapping

| # | Risk | Mitigation |
|---|------|-----------|
| A01 | Broken Access Control | RBAC + resource ownership checks + default deny |
| A02 | Cryptographic Failures | TLS everywhere, bcrypt passwords, encrypt PII at rest |
| A03 | Injection | Parameterized queries (Prisma does this), input validation |
| A04 | Insecure Design | Threat modeling, abuse case testing, rate limiting |
| A05 | Security Misconfiguration | Helmet headers, disable debug in prod, least privilege |
| A06 | Vulnerable Components | `npm audit`, Dependabot, pin versions |
| A07 | Auth Failures | JWT best practices (below), MFA, account lockout |
| A08 | Data Integrity Failures | Signed deployments, CSP headers, SRI for scripts |
| A09 | Logging Failures | Structured logging, audit trail, NO secrets in logs |
| A10 | SSRF | Allowlist outbound URLs, validate user-supplied URLs |

---

## Authentication Patterns

### JWT Best Practices

```
Access Token:
  - Algorithm: RS256 (asymmetric) for multi-service, HS256 for single service
  - Expiry: 15 minutes
  - Storage: In-memory on client (NOT localStorage)
  - Transport: Authorization: Bearer <token>
  - Payload: { sub, role, iat, exp } — MINIMAL claims
  - Never store: passwords, PII, sensitive data

Refresh Token:
  - Expiry: 7-30 days
  - Storage: httpOnly, Secure, SameSite=Strict cookie
  - Rotation: Issue new refresh token on each use, invalidate old
  - Family tracking: If old refresh token reused → revoke entire family (breach detection)
  - Store hash in DB: Track active sessions, enable logout
```

### Session Management

```
Login:  → Issue access + refresh pair → Store refresh hash in DB
Use:    → Access token in Authorization header → Verify signature + expiry
Refresh:→ Send refresh cookie → Verify → Rotate → Issue new pair
Logout: → Delete refresh token from DB → Clear cookie → Blacklist access token (optional)
```

### Password Security

```
Hashing:    bcrypt with cost factor ≥ 12 (or Argon2id)
Rules:      Minimum 8 chars, check against breached password list (HaveIBeenPwned API)
Reset:      Time-limited token (1 hour), single-use, sent to verified email
Lockout:    5 failed attempts → lock 15 min → exponential backoff
```

---

## Authorization (RBAC)

### NestJS Implementation

```typescript
// Decorator
@SetMetadata('roles', ['admin', 'instructor'])
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Guard
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}

// Resource ownership (in service layer)
async findSubmission(id: string, userId: string, role: string) {
  const submission = await this.prisma.submission.findUnique({ where: { id } });
  if (!submission) throw new NotFoundException();
  if (role !== 'admin' && submission.userId !== userId) throw new ForbiddenException();
  return submission;
}
```

### Permission Matrix Template

| Resource | Learner | Instructor | Admin |
|----------|---------|------------|-------|
| View own submissions | ✅ | ✅ | ✅ |
| View all submissions | ❌ | Own students | ✅ |
| Create passages | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| View analytics | Own only | Class only | All |

---

## HTTP Security Headers

```typescript
// Helmet.js (use in main.ts)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));
```

| Header | Purpose |
|--------|---------|
| `Strict-Transport-Security` | Force HTTPS |
| `Content-Security-Policy` | Prevent XSS, injection |
| `X-Content-Type-Options: nosniff` | Prevent MIME sniffing |
| `X-Frame-Options: DENY` | Prevent clickjacking |
| `Referrer-Policy: strict-origin` | Limit referrer leakage |

---

## CORS Configuration

```typescript
app.enableCors({
  origin: [process.env.FRONTEND_URL],      // Never '*' in production
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,                        // For cookies
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,                           // Preflight cache 24h
});
```

---

## Input Validation & Sanitization

```
Layer 1: Transport  → class-validator (type, format, length)
Layer 2: Business   → Service-level rules (uniqueness, state machine)
Layer 3: Storage    → Prisma schema constraints (unique, relation)

Anti-injection:
  ✅ Prisma parameterized queries (default safe)
  ✅ Validate URLs before fetching (SSRF prevention)
  ✅ Sanitize HTML output (DOMPurify for user content)
  ❌ Never concatenate user input into queries
  ❌ Never eval() or new Function() with user input
```

---

## Secrets Management

```
Development:  .env file (NEVER commit)
Production:   Environment variables from secret manager
              AWS: Secrets Manager / SSM Parameter Store
              GCP: Secret Manager
              Self-hosted: HashiCorp Vault

Rules:
  - .env in .gitignore (always)
  - Rotate secrets on schedule (90 days)
  - Different secrets per environment
  - Audit access to secrets
  - Never log secrets (redact in error messages)
```

---

## Security Audit Checklist

Before each release, verify:

```
Authentication:
  □ JWT tokens expire properly
  □ Refresh token rotation works
  □ Password hashing uses bcrypt ≥12 rounds
  □ Account lockout after failed attempts

Authorization:
  □ Every endpoint has auth guard
  □ Resource ownership verified in service layer
  □ Admin routes not accessible by learners
  □ API rate limiting configured

Data:
  □ No secrets in codebase or logs
  □ PII encrypted at rest
  □ HTTPS enforced (HSTS header)
  □ Input validation on all endpoints

Infrastructure:
  □ Dependencies audited (npm audit)
  □ Helmet security headers enabled
  □ CORS restricted to known origins
  □ Error messages don't leak internals
```
