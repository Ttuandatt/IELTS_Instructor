'use client';

import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';

export default function DashboardPage() {
  const { t } = useI18n();

  return (
    <div>
      <h1 className="page-title">{t.dashboard.title}</h1>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: t.dashboard.reading_progress, value: '—', icon: '📖' },
          { label: t.dashboard.writing_progress, value: '—', icon: '✍️' },
          { label: t.dashboard.avg_score, value: '—', icon: '🏆' },
          { label: t.dashboard.total_attempts, value: '0', icon: '📊' },
        ].map((card) => (
          <div key={card.label} className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{card.icon}</div>
            <div className="stat-card-label">{card.label}</div>
            <div className="stat-card-value">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="stats-grid">
        <Link href="/reading" className="stat-card" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '2rem' }}>📖</span>
          <div className="stat-card-label" style={{ marginTop: '0.5rem' }}>
            {t.nav.reading}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {t.reading.start_practice}
          </div>
        </Link>
        <Link href="/writing" className="stat-card" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '2rem' }}>✍️</span>
          <div className="stat-card-label" style={{ marginTop: '0.5rem' }}>
            {t.nav.writing}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {t.writing.submit_essay}
          </div>
        </Link>
      </div>
    </div>
  );
}
