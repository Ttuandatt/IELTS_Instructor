'use client';

import { useI18n } from '@/providers/I18nProvider';
import { useTheme } from '@/providers/ThemeProvider';

export default function DashboardPage() {
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--color-bg-primary)' }}>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1
            className="text-3xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t.dashboard.title}
          </h1>
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              style={{
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
              }}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
              className="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              style={{
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
              }}
            >
              {lang === 'vi' ? '🇬🇧 EN' : '🇻🇳 VI'}
            </button>
          </div>
        </div>

        {/* Stats cards placeholder */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { label: t.dashboard.reading_progress, value: '—', icon: '📖' },
            { label: t.dashboard.writing_progress, value: '—', icon: '✍️' },
            { label: t.dashboard.total_attempts, value: '0', icon: '📊' },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl p-6 transition-shadow hover:shadow-lg"
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div className="mb-2 text-2xl">{card.icon}</div>
              <div
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {card.label}
              </div>
              <div
                className="mt-1 text-2xl font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation placeholder */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <a
            href="/reading"
            className="flex items-center gap-4 rounded-xl p-6 transition-shadow hover:shadow-md"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span className="text-3xl">📖</span>
            <div>
              <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {t.nav.reading}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {t.reading.start_practice}
              </div>
            </div>
          </a>
          <a
            href="/writing"
            className="flex items-center gap-4 rounded-xl p-6 transition-shadow hover:shadow-md"
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span className="text-3xl">✍️</span>
            <div>
              <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {t.nav.writing}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {t.writing.submit_essay}
              </div>
            </div>
          </a>
        </div>

        {/* Footer status */}
        <div
          className="mt-8 rounded-lg p-4 text-center text-sm"
          style={{
            background: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-muted)',
          }}
        >
          IELTS Helper MVP — Sprint 0 ✅ | {t.app_name}
        </div>
      </div>
    </div>
  );
}
