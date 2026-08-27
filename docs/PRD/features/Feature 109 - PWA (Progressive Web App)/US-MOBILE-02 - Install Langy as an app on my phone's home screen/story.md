# US-MOBILE-02 — Install Langy as an app on my phone's home screen

| Field | Value |
|-------|-------|
| **Feature** | PWA (Progressive Web App) |
| **Domain** | Mobile & PWA |

> As a learner, I want to install Langy as an app on my phone's home screen, so that it feels like a native app.

## Acceptance Criteria

- `manifest.json` (Web App Manifest) at `/manifest.json`:
- Service worker registration: `next-pwa` or custom service worker in `public/sw.js`. Registered on first page load for authenticated users
- Service worker caching strategy:
- Install prompt: browser's native "Add to Home Screen" prompt appears when PWA criteria met (manifest + service worker + HTTPS). No custom install banner in v1 (browser handles it)
- Splash screen: auto-generated from manifest (background_color + icon + name). Displays during app load (standalone mode)
- Standalone mode behavior: URL bar hidden, status bar shows `theme_color`, back/forward navigation via in-app controls (no browser buttons). Deep links work: shared URLs open within the PWA
- Push notifications (via service worker):
- Offline indicator: when device goes offline (detected via `navigator.onLine` event), show subtle banner at top: "Bạn đang ngoại tuyến. Một số tính năng có thể không khả dụng" (yellow banner, dismissible)
- Update handling: when new service worker version detected, show toast: "Phiên bản mới khả dụng" with "Cập nhật" button → triggers `skipWaiting()` + page reload
- Testing: test on Android Chrome (primary PWA platform for Vietnamese market) and iOS Safari (limited PWA support — no push notifications on iOS < 16.4)
- Depends on: F-MOBILE-01 (responsive design — PWA must be mobile-friendly), F-NOTIF-01 (notification events for push)
