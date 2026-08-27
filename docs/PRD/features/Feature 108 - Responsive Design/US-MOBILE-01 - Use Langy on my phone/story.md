# US-MOBILE-01 — Use Langy on my phone

| Field | Value |
|-------|-------|
| **Feature** | Responsive Design |
| **Domain** | Mobile & PWA |

> As a learner, I want to use Langy on my phone, so that I can practice on the go.

## Acceptance Criteria

- Breakpoints (CSS media queries):
- **Navigation:**
- **Reading test (F-READ-01):**
- **Writing editor:**
- **Touch targets:** all interactive elements minimum 44×44px (Apple HIG / WCAG 2.5.8). Buttons, links, checkboxes, radio buttons, tab items. Spacing between adjacent targets: minimum 8px gap
- **Typography scaling:** base font size 16px (prevents iOS auto-zoom on input focus). Body text: 16px mobile, 15px desktop. Headings scale proportionally. Line-height: 1.6 for body text on all sizes
- **Tables:** responsive tables use horizontal scroll wrapper (`overflow-x: auto`) on mobile. Or restructured as stacked cards for small tables (< 5 columns)
- **Images:** `max-width: 100%`, `height: auto`. PDF viewer (iframe): fills container width on mobile
- **Forms:** inputs full-width on mobile. Labels above inputs (not beside). Submit buttons full-width
- **Modals:** mobile modals → full-screen bottom sheets (slide up from bottom, swipe down to dismiss). Desktop: centered modal with backdrop
- Testing: manual testing on: iPhone SE (375px), iPhone 14 (390px), Samsung Galaxy S21 (360px), iPad (768px). Use browser DevTools responsive mode for quick checks
- Depends on: all frontend components (cross-cutting concern)
