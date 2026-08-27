# US-MOBILE-04 — As a learner, I want a comfortable writing experience on my 

| Field | Value |
|-------|-------|
| **Feature** | Mobile-Optimized Writing |
| **Domain** | Mobile & PWA |

> As a learner, I want a comfortable writing experience on my phone, so that I can practice essays anywhere.

## Acceptance Criteria

- Mobile writing page: detected via viewport width (< 768px) or user preference toggle "Chế độ di động"
- **Full-screen editor mode:**
- **Word count:** always visible sticky footer bar. Shows: "{current} từ" with color indicator:
- **Prompt display:**
- **Auto-save indicator:** visible in sticky footer next to word count. States:
- **Text editing enhancements (mobile):**
- **Submission flow (mobile):**
- **Portrait/landscape:** both supported. Landscape: textarea wider, useful for typing. No layout breakage. Prompt collapsed by default in landscape (maximize typing area)
- **Performance:** mobile textarea handles 500+ word essays without lag. No rich-text editor overhead (plain `<textarea>` element)
- Depends on: F-WRIT-01 (writing prompts), F-WRIT-02 (auto-save), F-WRIT-03 (submission flow)
