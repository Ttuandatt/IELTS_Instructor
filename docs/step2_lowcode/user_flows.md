# 🔄 User Flows — IELTS Helper (MVP)

> **Mã tài liệu:** STEP2-FLOWS  
> **Phiên bản:** 1.0  
> **Ngày tạo:** 2025-02-21  
> **Trạng thái:** Draft  
> **Framework:** Vibe Coding v2.0 — Step 2: Low-Code Prototype

---

## 1. Flow Summary

| # | Flow | Actor | Happy Path Steps | Key Decisions |
|---|------|-------|-----------------|---------------|
| F01 | Registration & Login | All | 4 | Email validation, password policy |
| F02 | Reading Practice | Learner | 8 | Timer optional, ≥80% threshold, auto-grade |
| F03 | Writing Practice | Learner | 7 | Word count check, model tier, async scoring |
| F04 | Dashboard Review | Learner | 3 | Period selection for trends |
| F05 | Admin Content CRUD | Admin | 6 | Draft/publish toggle, question management |
| F06 | Admin Import | Admin | 5 | Cache check, sanitize, attach snippets |
| F07 | Profile Settings | All | 2 | Language + theme toggle |
| F08 | Mode Selection | Learner | 3 | Practice vs Simulation, timer config |
| F09 | Instructor Review | Instructor | 4 | View AI score, comment, override |

---

## 2. F01 — Registration & Login

**Actor:** Any user  
**Goal:** Create account or sign in to access the application  
**Precondition:** User has internet access and a browser

| Step | Action | System Response | Screen |
|------|--------|----------------|--------|
| 1 | User navigates to app | Show login page (default) | S01 |
| 2a | User clicks "Register" link | Navigate to register page | S02 |
| 2b | User fills email, password, name, language | Client-side validation | S02 |
| 3 | User clicks "Register" | POST /auth/register → create account → return JWT | S02 |
| 4 | — | Store tokens; redirect to Dashboard | S03 |

**Alternative: Login**

| Step | Action | System Response |
|------|--------|----------------|
| 2 | User fills email + password | Client-side validation |
| 3 | User clicks "Login" | POST /auth/login → validate → return JWT |
| 4 | — | Store tokens; redirect to Dashboard |

**Error Paths:**
- Invalid email format → inline error: "Please enter a valid email"
- Duplicate email (register) → "Email already registered"
- Wrong credentials (login) → "Invalid email or password"
- Rate limited → "Too many attempts. Try again in X minutes."

---

## 3. F02 — Reading Practice

**Actor:** Learner  
**Goal:** Complete a Reading passage and see score  
**Precondition:** Authenticated; ≥1 published passage exists

| Step | Action | System Response | Screen | Rules |
|------|--------|----------------|--------|-------|
| 1 | Navigate to /reading | GET /reading/passages → show catalog | S04 | ADM-001 |
| 2 | Apply filters (level, topic) | Re-fetch with filters | S04 | — |
| 3 | Click passage card | Show Mode Selector modal (Practice vs Simulation) | S22 | — |
| 3a | **Practice mode:** Choose parts, no timer, start | Load passage + questions (no timer) | S05 | — |
| 3b | **Simulation mode:** Full test, 60 min timer, start | Load passage + questions + start countdown | S05 | — |
| 4 | Read passage, answer questions | Live progress counter "X/Y answered" | S05 | — |
| 5a | Click Submit (≥80% answered) | POST /submit → auto-grade → show results | S06/S24 | RD-001, RD-002 |
| 5b | Timer expires (Simulation mode, any % answered) | Auto-submit with timed_out=true → auto-grade | S06/S24 | RD-003 |
| 6 | Review results | Score header + per-question breakdown with explanations | S24 | RD-004 |
| 7 | Click "Retry" or "Back" | Re-attempt or return to catalog | S05/S04 | — |

**Error Paths:**
- < 80% answered + manual submit → "Please answer at least X questions"
- Passage not found → 404 page
- Network error → toast + retry

---

## 4. F03 — Writing Practice

**Actor:** Learner  
**Goal:** Write an essay and receive AI-powered feedback  
**Precondition:** Authenticated; ≥1 published prompt; within daily rate limit

| Step | Action | System Response | Screen | Rules |
|------|--------|----------------|--------|-------|
| 1 | Navigate to /writing | GET /writing/prompts → show catalog | S08 | ADM-001 |
| 2 | Select prompt | GET prompt detail → show editor | S09 | — |
| 3 | Write essay | Live word count; green/red indicator | S09 | WR-001 |
| 4 | Select model tier (Standard/Premium) | Default: Standard | S09 | WR-003 |
| 5 | Click Submit | POST /writing/submit → 202 Accepted | S10 | WR-003 |
| 6 | Wait for scoring | Poll every 3s; show progress indicator | S10 | WR-004 |
| 7a | Status = done | Display scores + feedback | S11 | WR-002, WR-005 |
| 7b | Status = failed | Show error + "Retry" button | S11 | WR-004 |

**Error Paths:**
- Empty essay → "Please write your essay before submitting"
- Rate limit exceeded → "Daily limit reached (X/Y). Try again tomorrow." (429)
- Scoring timeout (>5 min) → "Taking longer than usual. We'll keep trying."
- Scoring failed → "Scoring failed. Please try again." + retry button

---

## 5. F04 — Dashboard Review

**Actor:** Learner  
**Goal:** View progress and identify areas for improvement  
**Precondition:** Authenticated; has ≥1 submission

| Step | Action | System Response | Screen |
|------|--------|----------------|--------|
| 1 | Navigate to /dashboard | GET /me/progress → load stats | S03 |
| 2 | View stat cards (Reading avg, Writing avg) | Display numbers + mini trend | S03 |
| 3 | Change trend period (4w / 3m) | GET /me/progress/trends → update chart | S03 |

**Empty State:** New user with no submissions → "Welcome! Start your first practice →" with CTA buttons.

---

## 6. F05 — Admin Content CRUD

**Actor:** Admin  
**Goal:** Create, edit, publish, or delete content  
**Precondition:** Authenticated as admin

| Step | Action | System Response | Screen |
|------|--------|----------------|--------|
| 1 | Navigate to /admin/passages or /admin/prompts | GET admin endpoint → show table with all content (drafts + published) | S14/S16 |
| 2 | Click "Create New" | Navigate to form | S15/S17 |
| 3 | Fill form (title, body/prompt, level, tags) | Client-side validation | S15/S17 |
| 4 | Add questions (passages only) | Inline question editor | S15 |
| 5 | Click "Save" | POST → create as draft → redirect to list | S14 |
| 6 | Click "Publish" on item | POST /publish → status=published → badge updates | S14 |

**Variations:**
- Edit: Click item → load form with existing data → PATCH → save
- Delete: Click delete → confirm dialog → DELETE → remove from list
- Unpublish: Click "Unpublish" → status=draft → badge updates

---

## 7. F06 — Admin Import from NotebookLM

**Actor:** Admin  
**Goal:** Import content from NotebookLM and attach to passages/prompts  
**Precondition:** Authenticated as admin; NotebookLM URL available

| Step | Action | System Response | Screen |
|------|--------|----------------|--------|
| 1 | Click "Import from NotebookLM" | Show import modal | S19 |
| 2 | Enter URL, title, level, tags | Client-side validation | S19 |
| 3 | Click "Import" | POST /admin/sources/import → fetch + sanitize + cache → create source + snippets | S19 |
| 4 | Review imported snippets | Show snippet text previews in modal | S19 |
| 5 | Select snippets → attach to content | POST /admin/content/:type/:id/sources | S19 |

---

## 8. F07 — Profile Settings

**Actor:** Any authenticated user  
**Goal:** Update profile preferences  

| Step | Action | System Response | Screen |
|------|--------|----------------|--------|
| 1 | Navigate to /settings | Load current profile | S13 |
| 2 | Toggle language (vi↔en) / theme (dark↔light) / edit name | PATCH /me → update → immediate UI change | S13 |

---

> **Tham chiếu:** [04_user_stories](../step3_prd/04_user_stories.md) | [16_activity_diagrams](../step3_prd/16_activity_diagrams.md)

---

## 9. F08 — Mode Selection (New)

> Inspired by ieltsonlinetests.com's Practice/Simulation mode.

**Actor:** Learner  
**Goal:** Choose test mode before starting a Reading or Writing practice  
**Precondition:** Authenticated; passage/prompt selected

| Step | Action | System Response | Screen |
|------|--------|----------------|--------|
| 1 | Click passage/prompt card | Show Mode Selector modal | S22 |
| 2a | Select **Practice mode** | Configure: no timer, select parts (optional) | S22 |
| 2b | Select **Simulation mode** | Configure: 60 min timer, full test, no pause | S22 |
| 3 | Click "Start" | Navigate to practice page with selected config | S05/S09 |

**Key Differences:**

| Feature | Practice Mode | Simulation Mode |
|---------|-------------|----------------|
| Timer | None (or custom) | 60 min (Reading) / 60 min (Writing) |
| Parts | Choose specific parts | Full test required |
| Pause | Allow pause/resume | No pause |
| Auto-submit | No | Yes, on timer expiry |
| `test_mode` flag | `practice` | `simulation` |

---

## 10. F09 — Instructor Writing Review (New)

**Actor:** Instructor  
**Goal:** Review AI-scored essay, add comment, optionally override score  
**Precondition:** Authenticated as instructor; has accessible student submissions

| Step | Action | System Response | Screen |
|------|--------|----------------|--------|
| 1 | Navigate to /instructor/writing-submissions | GET submissions list (with student name, prompt, AI score) | Instructor list |
| 2 | Click a submission | Load essay + AI scores + feedback | S23 |
| 3 | (Optional) Enter override score (0–9) | Update score fields | S23 |
| 4 | (Optional) Add comment | Text area for instructor feedback | S23 |
| 5 | Click "Save" | PATCH submission with instructor_comment + override_score | S23 |
