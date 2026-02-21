# Context Snapshot — 2026-02-21

## Project
- Name: IELTS Helper (Reading & Writing first; Listening/Speaking later)
- Stack: Frontend (Next.js/React + TS), Backend (NestJS/Node + Postgres), Redis cache, JWT auth.
- Dev mode: local; share via VS Code Dev Tunnels/Port Forward when needed.
- Content source: NotebookLM notebook https://notebooklm.google.com/notebook/2009469b-462e-4014-87f5-46f5842fb6db

## Goals (MVP)
- Reading practice with question bank, auto-grade + explanations.
- Writing practice with rubric scoring (TR/CC/LR/GRA) via model + lightweight rule checks; fast feedback.
- Progress dashboard; admin CMS to import/sync content from NotebookLM.
- Dark/Light UI, vi/en.

## KPIs (chosen for MVP)
- Reading completion rate: >=70% bài được nộp (>=80% câu trả lời).
- Writing rubric score (avg TR/CC/LR/GRA): target 5.5–6.0 for new users.
- 7-day retention: >=20% quay lại luyện trong 7 ngày.
- Writing feedback turnaround: <5 phút cho 90% bài.
- p95 API latency: <500ms; lỗi submit <1%.

## Writing Scoring Approach
- Default: Hybrid (rule-based checks + LLM scoring/feedback). Model tier default cheap (GPT-4o-mini/o3-mini/Gemini Flash); optional premium (GPT-4o/Claude 3.5 Sonnet) for high-precision mode.
- Rule-based: word count, task relevance keywords, grammar baseline (LanguageTool), plagiarism flag optional.
- LLM scoring: prompt rubric 0–9 each criterion, JSON output; retry + guardrails; rate limit submissions.

## Next Steps
- Draft Step1 intake, then Step2 screens/flows/rules/data, then PRD set (01–10 first).
- Document NotebookLM sync rules and mapping into data/API specs.
