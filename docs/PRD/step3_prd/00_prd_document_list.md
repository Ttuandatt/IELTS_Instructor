# Danh sách tài liệu PRD — Langy
> **Dự án:** Langy — Nền tảng giao bài, chấm bài AI cho giáo viên IELTS tự do
> **Tham chiếu cấu trúc:** GPS Tours Seminar (step1 → step4)
> **Ngày tạo:** 06/07/2026

---

## Cấu trúc thư mục đề xuất

```
docs/
├── step1_business_analysis/
│   ├── 00_requirements_intake.md          ← BA 6 vòng elicitation (ĐÃ CÓ: langy-business-analysis.md)
│   └── 00_prd_document_list.md            ← File này
│
├── step2_lowcode/
│   ├── business_rules.md                  ← Luật nghiệp vụ chi tiết
│   ├── data_fields.md                     ← Danh sách trường dữ liệu
│   ├── screens.md                         ← Danh sách màn hình
│   └── user_flows.md                      ← Luồng người dùng chi tiết
│
├── step3_prd/
│   ├── 01_executive_summary.md            ← Tóm tắt điều hành
│   ├── 02_scope_definition.md             ← Phạm vi MVP + non-goals
│   ├── 03_user_personas_roles.md          ← 3 personas + RBAC
│   ├── 04_user_stories.md                 ← User stories 6 Epic
│   ├── 05_functional_requirements.md      ← FR chi tiết theo module
│   ├── 06_acceptance_criteria.md          ← AC dạng Given-When-Then
│   ├── 07_non_functional_requirements.md  ← Performance, security, privacy
│   ├── 08_data_requirements.md            ← ERD + schema migration M1
│   ├── 09_api_specifications.md           ← REST endpoints
│   ├── 10_ui_ux_specifications.md         ← Design system, responsive
│   ├── 11_business_rules.md               ← Luật nghiệp vụ IELTS-specific
│   ├── 12_technical_constraints.md        ← Stack, LLM integration (D10)
│   ├── 13_dependencies_risks.md           ← Risk register + assumptions
│   ├── 14_usecase_diagram.md              ← Use case + đặc tả (Mermaid)
│   ├── 15_sequence_diagrams.md            ← Sequence diagrams (Mermaid)
│   ├── 16_activity_diagrams.md            ← Activity diagrams (Mermaid)
│   └── 17_component_diagram.md            ← Component architecture (Mermaid)
│
└── step4_implementation_plan/
    ├── implementation_plan.md             ← Timeline 17 tuần + milestones
    ├── m1_schema_migration_spec.md        ← Spec M1 (ĐÃ CÓ)
    └── dev_onboarding_guide.md            ← Setup guide cho cộng tác viên
```

---

## Ánh xạ nguyên liệu đã có → tài liệu cần viết

| # | Tài liệu | Nguyên liệu sẵn có | Công việc |
|---|-----------|---------------------|-----------|
| **Step 1** |
| 00 | Requirements Intake | BA v1.0 (6 vòng, 15 mục) | Reformat thành cấu trúc chuẩn |
| **Step 2** |
| — | Business Rules | BA Mục 6, PRD Epic 2 (state machine) | Viết mới — trích xuất từ BA+PRD |
| — | Data Fields | Schema Prisma hiện có + diff M1 | Viết mới — bóc từ schema |
| — | Screens | Post-handoff notes (Batch 1–9) | Viết mới — liệt kê tất cả màn hình |
| — | User Flows | PRD Mục 4 (state machine), sequence diagram đã vẽ | Viết mới — mở rộng từ sequence |
| **Step 3** |
| 01 | Executive Summary | BA Mục 1 (tóm tắt điều hành) | Reformat |
| 02 | Scope Definition | PRD Mục 1 (goals/non-goals), Mục 7 | Reformat + bổ sung bảng module |
| 03 | User Personas & Roles | BA Mục 4, PRD Mục 3 (3 personas) | Mở rộng: thêm RBAC matrix, demographics |
| 04 | User Stories | PRD Mục 5 (15 US, 6 Epic) | Reformat — đã có đầy đủ |
| 05 | Functional Requirements | PRD Mục 5 (AC trong US) | Viết mới — tách FR riêng theo module |
| 06 | Acceptance Criteria | PRD Mục 5 (AC gộp trong US) | Tách ra — chuyển sang Given-When-Then |
| 07 | Non-Functional Req. | PRD Mục 6, BA Mục 13 (privacy) | Mở rộng: thêm chi phí, SLA, accessibility |
| 08 | Data Requirements | Schema Prisma + M1 diff + ERD | Viết mới — ERD Mermaid + field specs |
| 09 | API Specifications | Repo (controllers) + M1 Mục 6 | Viết mới — bóc từ code + spec |
| 10 | UI/UX Specifications | Post-handoff notes (component list) | Viết mới — design tokens, responsive rules |
| 11 | Business Rules | BA positioning, state machine, IELTS scoring rules | Viết mới — IELTS domain-specific |
| 12 | Technical Constraints | BA Mục 8, PRD D10, M1 Mục 8 | Tổng hợp — stack, LLM, SDK, paid tier |
| 13 | Dependencies & Risks | BA Mục 11–12 (risk register + assumptions) | Reformat + merge |
| 14 | Use Case Diagram | PRD 6 Epic → use cases | Viết mới — Mermaid |
| 15 | Sequence Diagrams | 1 đã vẽ (Writing scoring) | Viết mới — cần thêm 5–7 diagrams |
| 16 | Activity Diagrams | State machine đã vẽ | Viết mới — Mermaid flowchart |
| 17 | Component Diagram | Repo structure (NestJS modules) | Viết mới — Mermaid |
| **Step 4** |
| — | Implementation Plan | PRD Mục 8 (timeline 17 tuần) | Reformat + chi tiết hóa |
| — | M1 Spec | M1 v1.1 (ĐÃ CÓ) | Đã có |
| — | Dev Onboarding | Repo README + env setup | Viết mới |

---

## Ưu tiên viết

### Đợt 1 — Cốt lõi (cần để bắt đầu code)
1. `01_executive_summary.md` — reformat từ BA, nhanh
2. `02_scope_definition.md` — reformat từ PRD, nhanh
3. `03_user_personas_roles.md` — mở rộng từ BA+PRD
4. `04_user_stories.md` — reformat từ PRD
5. `08_data_requirements.md` — ERD + schema, cần cho M1
6. `12_technical_constraints.md` — stack + LLM decisions

### Đợt 2 — Chi tiết hóa requirements
7. `05_functional_requirements.md`
8. `06_acceptance_criteria.md`
9. `07_non_functional_requirements.md`
10. `11_business_rules.md`
11. `09_api_specifications.md`
12. `13_dependencies_risks.md`

### Đợt 3 — Diagrams + UI
13. `14_usecase_diagram.md`
14. `15_sequence_diagrams.md`
15. `16_activity_diagrams.md`
16. `17_component_diagram.md`
17. `10_ui_ux_specifications.md`

### Đợt 4 — Step 2 & 4
18. Step 2: business_rules, data_fields, screens, user_flows
19. Step 4: implementation_plan, dev_onboarding_guide

---

## Ước tính effort

Tổng: ~22 file. Với nguyên liệu đã có từ BA + PRD + spec M1 + repo:
- Đợt 1 (6 file): ~2–3h — phần lớn là reformat
- Đợt 2 (6 file): ~4–5h — viết mới, chi tiết
- Đợt 3 (5 file): ~3–4h — diagrams Mermaid
- Đợt 4 (5 file): ~2–3h — tổng hợp

**Tổng: ~12–15h** nếu Claude viết, founder review.
