# Skills Development Context Snapshot

## Date: February 22, 2026

### Project: IELTS_Instructor

#### Skills Imported:
- 7 Anthropic official skills (copied from anthropics/skills)

#### Custom Skills Created:
- backend-design
  - Purpose: Backend system design for NestJS/Prisma/Postgres/Redis stack
  - Structure: SKILL.md (progressive disclosure, triggers, workflow), references/api-design.md, references/architecture-patterns.md
  - Best Practices: Modular monolith, clean architecture, API design, security, performance, cloud-native
- solution-architect
  - Purpose: Solution architecture guidance, ADR workflow, system design framework
  - Structure: SKILL.md (progressive disclosure, triggers, workflow), references/system-design-patterns.md, security-checklist.md, performance-guide.md, cloud-and-devops.md
  - Best Practices: ADRs, architecture patterns, NFR checklist, cloud/devops

#### Skill Structure:
- Each skill: SKILL.md (concise, triggers, workflow), references/ (deep guidance)
- Anthropic compliance: Progressive disclosure, modular, clear triggers, deep references

#### Workflow:
- Skills copied to both fork and main project
- All files committed and pushed
- Ready for further custom skill development or integration

#### Technologies:
- Backend: NestJS 10, Prisma 6, PostgreSQL 15, Redis 7
- Skills system: Anthropic standards
- Environment: Windows, PowerShell, GitHub CLI

#### Key Files:
- skills/backend-design/SKILL.md
- skills/backend-design/references/api-design.md
- skills/backend-design/references/architecture-patterns.md
- skills/solution-architect/SKILL.md
- skills/solution-architect/references/system-design-patterns.md
- skills/solution-architect/references/security-checklist.md
- skills/solution-architect/references/performance-guide.md
- skills/solution-architect/references/cloud-and-devops.md

#### Status:
- All requested skills and operations are complete
- Anthropic-compliant, modular, best-practice skills
- Đã phân tích giao diện và chức năng của ieltsonlinetests.com, xác định các gap và feature cần bổ sung:
  - Exam Library UI: filter/tabs (Academic/General, kỹ năng), card grid responsive, social proof (số lượt thi)
  - Test Mode Selection: modal chọn Practice/Simulation, lưu test_mode
  - Timer System: countdown chuẩn IELTS, auto-submit, đổi màu khi gần hết giờ
  - Score Display UI: band score tổng + breakdown, progress bars, strengths/improvements
  - Feedback Detail: personalized improvement plan
  - Social Proof: số lượt thi, partner logos, testimonial slider
  - Progress Tracking & Analytics: dashboard trend, weaknesses, question type analysis
  - Placement Test: test đầu vào xác định level, auto-suggest CEFR
  - Tips/Blog Section: bài viết theo skill, grammar, news
  - UI Patterns: card grid, tab navigation, modal, accordion FAQ, mega menu, hero slider
  - Design Tokens: màu sắc, typography, card style
- Đã lên kế hoạch update docs (user stories, functional requirements, UI spec) để bổ sung các chức năng và UI patterns trên.
- Ưu tiên Sprint 3-4: AI Writing Scoring, Score Display UI, Practice/Simulation Mode, Timer, Question Explanations, Social Proof.

---
This snapshot can be used in other sessions to provide a clear, separated context for skills development work, including structure, workflow, best practices, và các gap/feature cần bổ sung từ phân tích đối thủ.