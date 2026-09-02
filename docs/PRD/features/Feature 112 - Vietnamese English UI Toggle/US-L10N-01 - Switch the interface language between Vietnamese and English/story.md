# US-L10N-01 — Switch the interface language between Vietnamese and English

| Field | Value |
|-------|-------|
| **Feature** | Vietnamese / English UI Toggle |
| **Domain** | Localization |

> As a user, I want to switch the interface language between Vietnamese and English, so that I can use the app in my preferred language.

## Acceptance Criteria

- AC1: Language toggle: globe icon (🌐) in header/navbar, visible on all pages including login/register (before authentication). Click → dropdown with two options: "Tiếng Việt" (🇻🇳 flag) / "English" (🇬🇧 flag). Current language indicated with checkmark
- AC2: i18n framework: `next-intl` or `react-i18next` integrated into Next.js 14 App Router. Translation files: `messages/vi.json` and `messages/en.json`. JSON structure: nested by feature area (e.g., `auth.login.email_label`, `reading.submit_button`, `errors.network_error`)
- AC3: Translation scope — all UI text translated:
- AC4: NOT translated (stays in English regardless of UI language):
- AC5: Language persistence:
- AC6: Page-level language: set `<html lang="vi">` or `<html lang="en">` based on current language. Important for screen readers and SEO
- AC7: URL strategy: no language prefix in URLs (no `/vi/dashboard` vs `/en/dashboard`). Single URL per page, language is user preference not content variant. Reason: simpler routing, content is the same
- AC8: Translation key management: missing translation key → falls back to Vietnamese (default language). Log warning in development mode: "Missing translation: {key} for locale {en}". Never show raw translation keys to users
- AC9: Translation file size: lazy-loaded per route (not entire translation file on page load). `next-intl` with route-based splitting
- AC10: RTL: not needed (Vietnamese and English are both LTR). No RTL support planned
- AC11: Testing: visual regression tests for both languages (button overflow, text truncation). Vietnamese text is typically longer than English equivalents — verify all UI elements accommodate
- AC12: Contribution: translation files committed to repo. No external translation management service in v1. Admin/developer updates JSON files directly
