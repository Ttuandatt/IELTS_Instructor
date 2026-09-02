# US-COMP-07 — As a learner with disabilities, I want the platform to be ac

| Field | Value |
|-------|-------|
| **Feature** | Accessibility (WCAG 2.1 AA) |
| **Domain** | Compliance & Security |

> As a learner with disabilities, I want the platform to be accessible via screen reader and keyboard, so that I can practice IELTS without barriers.

## Acceptance Criteria

- AC1: **Keyboard navigation:** all interactive elements reachable via Tab (forward) and Shift+Tab (backward). Focus order matches visual reading order. No keyboard traps (user can always Tab out of any component). Reading test: Tab cycles through questions, Enter selects MCQ answer, Space toggles T/F/NG, arrow keys navigate within radio groups
- AC2: **Focus indicators:** visible focus ring on all interactive elements (minimum 2px, contrast ratio ≥ 3:1 against adjacent colors). Never `outline: none` without replacement. Custom focus styles match design system (e.g., indigo ring consistent with `--primary`)
- AC3: **ARIA attributes:**
- AC4: **Color contrast:** all text meets WCAG AA contrast ratios: 4.5:1 for normal text (< 18pt), 3:1 for large text (≥ 18pt or ≥ 14pt bold). Verified using design token values against backgrounds. Interactive element boundaries: 3:1 against adjacent colors
- AC5: **Color independence:** information never conveyed by color alone. Score badges (green/yellow/red) include text labels. Chart data series differentiated by pattern/shape in addition to color. Error states use icon (❌) + text + color
- AC6: **Text scaling:** UI remains functional at 200% browser zoom. No horizontal scrolling at 320px equivalent width (WCAG 1.4.10 Reflow). Text resizable without loss of content
- AC7: **Screen reader support:** tested with NVDA (Windows, free — primary) and VoiceOver (macOS/iOS). Key flows tested: registration, login, taking a reading test, submitting a writing essay, viewing scores. Screen reader announces: page changes (via document title update), loading states ("Đang tải…"), form errors inline
- AC8: **Dyslexia-friendly mode:** toggle in `/settings/accessibility`: "Phông chữ cho người khó đọc". When enabled: body font switches to OpenDyslexic (bundled as WOFF2 asset, not CDN), increased line-height (1.8), increased letter-spacing (0.05em), max paragraph width 60ch. Setting persisted in user profile
- AC9: **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables: CSS transitions > 100ms, CSS animations, auto-playing animations, parallax effects. Timer still updates (functional, not decorative). Also available as manual toggle in settings for users who can't set OS preference
- AC10: **Skip links:** "Chuyển đến nội dung chính" skip link as first focusable element on every page. Visible on focus. Links to `<main>` element
- AC11: **Error identification:** form errors announced to screen readers via `aria-describedby` linking to error messages. Error messages identify the field and describe the error. Auto-focus first error field on form submit failure
- AC12: **Time limits:** reading simulation timer: option to extend time (1.5x or 2x) in accessibility settings "Gia hạn thời gian thi thử" (WCAG 2.2.1). Default: standard time. Setting does not affect real IELTS — clearly labeled as "accommodation for practice"
- AC13: **Testing cadence:** accessibility audit before each major release. Automated: axe-core in CI (catches ~30% of issues). Manual: keyboard + screen reader walkthrough of key flows. Issues logged as bugs with severity
- AC14: Depends on: all frontend components (cross-cutting concern)
