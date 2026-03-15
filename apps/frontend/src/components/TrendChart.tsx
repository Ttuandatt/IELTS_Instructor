'use client';

import { useI18n } from '@/providers/I18nProvider';

interface WeekData {
  week_start: string;
  reading_avg_score: number | null;
  writing_avg_overall: number | null;
  submission_count: number;
}

interface TrendChartProps {
  weeks: WeekData[];
  period: '4w' | '3m';
  onPeriodChange: (p: '4w' | '3m') => void;
}

export default function TrendChart({ weeks, period, onPeriodChange }: TrendChartProps) {
  const { t } = useI18n();

  // Find max values for scaling
  const maxReading = Math.max(100, ...weeks.map(w => w.reading_avg_score ?? 0));
  const maxWriting = Math.max(9, ...weeks.map(w => w.writing_avg_overall ?? 0));

  const formatWeekLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  const hasData = weeks.some(w => w.submission_count > 0);

  return (
    <div className="stat-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
          {t.dashboard.trend_title}
        </h3>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {(['4w', '3m'] as const).map(p => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: period === p ? 600 : 400,
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                background: period === p ? 'var(--color-primary)' : 'transparent',
                color: period === p ? '#fff' : 'var(--color-text-muted)',
                cursor: 'pointer',
              }}
            >
              {p === '4w' ? t.dashboard.period_4w : t.dashboard.period_3m}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          {t.dashboard.no_data_yet}
        </div>
      ) : (
        <div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#3b82f6', display: 'inline-block' }} />
              {t.dashboard.reading_avg} (%)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#10b981', display: 'inline-block' }} />
              {t.dashboard.writing_avg} (/9)
            </span>
          </div>

          {/* Bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.35rem', height: 120 }}>
            {weeks.map((w, i) => {
              const readingH = w.reading_avg_score != null ? (w.reading_avg_score / maxReading) * 100 : 0;
              const writingH = w.writing_avg_overall != null ? (w.writing_avg_overall / maxWriting) * 100 : 0;

              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 100, width: '100%' }}>
                    <div
                      style={{
                        flex: 1, borderRadius: '3px 3px 0 0',
                        background: readingH > 0 ? '#3b82f6' : 'var(--color-bg-tertiary)',
                        height: `${Math.max(readingH, 2)}%`,
                        minHeight: 2,
                        transition: 'height 0.3s ease',
                      }}
                      title={`Reading: ${w.reading_avg_score?.toFixed(1) ?? '—'}%`}
                    />
                    <div
                      style={{
                        flex: 1, borderRadius: '3px 3px 0 0',
                        background: writingH > 0 ? '#10b981' : 'var(--color-bg-tertiary)',
                        height: `${Math.max(writingH, 2)}%`,
                        minHeight: 2,
                        transition: 'height 0.3s ease',
                      }}
                      title={`Writing: ${w.writing_avg_overall?.toFixed(1) ?? '—'}/9`}
                    />
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                    {formatWeekLabel(w.week_start)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
