'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/providers/AuthProvider';
import { useI18n } from '@/providers/I18nProvider';
import { BookOpen, PenLine, Calendar, Play, AlertCircle, RefreshCw } from 'lucide-react';
import Sparkline from './charts/Sparkline';
import BarChart, { type WeekRow } from './charts/BarChart';
import RadarChart from './charts/RadarChart';

type ProgressData = {
  reading: { avg_score_pct: number; completion_rate: number; total_attempts: number };
  writing: {
    avg_scores: { TR?: number; CC?: number; LR?: number; GRA?: number; overall?: number };
    total_submissions: number;
  };
  recent_submissions: Array<{
    type: 'reading' | 'writing';
    id: string;
    title: string;
    score: number;
    date: string;
  }>;
};

type TrendsData = { period: string; weeks: WeekRow[] };

const CRITERION_KEYS = ['TR', 'CC', 'LR', 'GRA'] as const;
const CRITERION_LABELS: Record<string, string> = {
  TR: 'Task Response',
  CC: 'Coherence & Cohesion',
  LR: 'Lexical Resource',
  GRA: 'Grammatical Range',
};

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const h = Math.round(diff / 3_600_000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function LearnerDashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [period, setPeriod] = useState<'4w' | '3m'>('4w');

  const progressQuery = useQuery<ProgressData>({
    queryKey: ['dashboard', 'progress'],
    queryFn: () => apiClient.get('/dashboard/progress').then(r => r.data),
  });

  const trendsQuery = useQuery<TrendsData>({
    queryKey: ['dashboard', 'trends', period],
    queryFn: () => apiClient.get(`/dashboard/progress/trends?period=${period}`).then(r => r.data),
  });

  const isLoading = progressQuery.isLoading || trendsQuery.isLoading;
  const isError = progressQuery.isError || trendsQuery.isError;
  const progress = progressQuery.data;
  const trends = trendsQuery.data;

  const sparklines = useMemo(() => {
    const weeks = trends?.weeks ?? [];
    const reading = weeks.map(w => w.reading_avg_score ?? 0);
    const writing = weeks.map(w => w.writing_avg_overall ?? 0);
    return { reading, writing };
  }, [trends]);

  const periodDelta = (vals: number[]) => {
    if (vals.length < 2) return null;
    const half = Math.floor(vals.length / 2);
    const a = vals.slice(0, half).filter(v => v > 0);
    const b = vals.slice(half).filter(v => v > 0);
    if (!a.length || !b.length) return null;
    const avgA = a.reduce((s, v) => s + v, 0) / a.length;
    const avgB = b.reduce((s, v) => s + v, 0) / b.length;
    return avgB - avgA;
  };

  const radarScores = CRITERION_KEYS.map(k => progress?.writing.avg_scores?.[k] ?? 0);
  const lowestIdx = radarScores.indexOf(Math.min(...radarScores.filter(v => v > 0)));
  const lowestKey = lowestIdx >= 0 && radarScores[lowestIdx] > 0 ? CRITERION_KEYS[lowestIdx] : null;

  const display_name = user?.display_name ?? '—';
  const today = formatDate(new Date());

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="card card-pad" style={{ textAlign: 'center', padding: 48 }}>
        <AlertCircle size={28} style={{ color: 'var(--danger)', marginBottom: 12 }} />
        <p style={{ marginBottom: 16, color: 'var(--ink-2)' }}>{t.common.error}</p>
        <button
          className="btn btn-primary"
          onClick={() => { progressQuery.refetch(); trendsQuery.refetch(); }}
        >
          <RefreshCw size={13} /> {t.common.retry}
        </button>
      </div>
    );
  }

  const hasData = (progress?.reading.total_attempts ?? 0) + (progress?.writing.total_submissions ?? 0) > 0;
  if (!hasData) return <LearnerEmpty name={display_name} />;

  return (
    <div className="fade-in">
      <div className="page-head row-between">
        <div>
          <div className="eyebrow">— {today}</div>
          <h1 className="page-title">
            {t.dashboard.welcome_back ?? 'Welcome back'}, <em>{display_name}.</em>
          </h1>
          <p className="page-subtitle">
            {t.dashboard.subtitle_generic ?? 'Your study desk is open. Pick up where you left off.'}
          </p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn" disabled title="Coming soon">
            <Calendar size={13} /> {t.dashboard.study_plan ?? 'Study plan'}
          </button>
          <Link href="/reading" className="btn btn-primary">
            <Play size={12} /> {t.dashboard.start_session ?? "Start today's session"}
          </Link>
        </div>
      </div>

      {/* Top stat band — 6 stats */}
      <div className="card" style={{ padding: 0, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <StatCell
            label={t.dashboard.reading_avg ?? 'Reading'}
            value={`${(progress?.reading.avg_score_pct ?? 0).toFixed(0)}`}
            unit="%"
            delta={fmtDelta(periodDelta(sparklines.reading), 1)}
            sparkline={sparklines.reading}
            borderRight
          />
          <StatCell
            label={t.dashboard.writing_avg ?? 'Writing band'}
            value={`${(progress?.writing.avg_scores?.overall ?? 0).toFixed(1)}`}
            unit="/9"
            delta={fmtDelta(periodDelta(sparklines.writing), 1)}
            sparkline={sparklines.writing}
            borderRight
          />
          <StatCell
            label={t.reading.passages ?? 'Passages done'}
            value={`${progress?.reading.total_attempts ?? 0}`}
            unit=""
            delta={null}
            sparkline={[]}
            borderRight
          />
          <StatCell
            label={t.writing.prompts ?? 'Essays scored'}
            value={`${progress?.writing.total_submissions ?? 0}`}
            unit=""
            delta={null}
            sparkline={[]}
            borderRight
          />
          {/* TODO: backend cần thêm field study_streak_days trên /dashboard/stats */}
          <StatCell
            label={t.dashboard.day_streak ?? 'Day streak'}
            value="—"
            unit=""
            delta={null}
            sparkline={[]}
            borderRight
          />
          {/* TODO: backend cần thêm field new_passages_this_week */}
          <StatCell
            label={t.dashboard.new_this_week ?? 'New this week'}
            value="—"
            unit=""
            delta={null}
            sparkline={[]}
          />
        </div>
      </div>

      <div className="grid g-16" style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)' }}>
        {/* Bar chart */}
        <div className="card card-pad">
          <div className="row-between" style={{ marginBottom: 16 }}>
            <div>
              <div className="section-label">— {t.dashboard.trend_title ?? 'Progress'}</div>
              <div className="section-title">{t.dashboard.bands_title ?? 'Reading & Writing bands'}</div>
            </div>
            <div className="segmented" style={{ fontSize: 11 }}>
              <button className={period === '4w' ? 'is-active' : ''} onClick={() => setPeriod('4w')}>
                {t.dashboard.period_4w}
              </button>
              <button className={period === '3m' ? 'is-active' : ''} onClick={() => setPeriod('3m')}>
                {t.dashboard.period_3m}
              </button>
            </div>
          </div>
          <BarChart data={trends?.weeks ?? []} emptyLabel={t.dashboard.no_data_yet} />
          <div className="row" style={{ gap: 16, marginTop: 12, fontSize: 11, color: 'var(--ink-3)' }}>
            <div className="row" style={{ gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--primary)' }} /> Reading %
            </div>
            <div className="row" style={{ gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--primary)', opacity: 0.35 }} /> Writing × 10
            </div>
          </div>
        </div>

        {/* Radar */}
        <div className="card card-pad">
          <div className="section-label">— {t.dashboard.writing_criteria ?? 'Writing criteria'}</div>
          <div className="section-title" style={{ marginBottom: 8 }}>
            {t.dashboard.where_to_focus ?? 'Where to focus'}
          </div>
          <div style={{ display: 'grid', placeItems: 'center', padding: '8px 0' }}>
            <RadarChart scores={radarScores} />
          </div>
          {lowestKey && (
            <div
              className="card card-tight"
              style={{
                background: 'var(--primary-softer)',
                border: '1px solid var(--primary-soft)',
                marginTop: 6,
              }}
            >
              <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                <div className="italic-serif" style={{ fontSize: 11, color: 'var(--primary)', marginTop: 2 }}>
                  Tip
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                  Your <b>{CRITERION_LABELS[lowestKey]}</b> is your softest band. Focus practice here.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="card" style={{ padding: 0, marginTop: 16 }}>
        <div
          className="row-between"
          style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}
        >
          <div className="section-title" style={{ fontSize: 16 }}>
            {t.dashboard.recent_activity ?? 'Recent activity'}
          </div>
          <Link href="/reading/history" style={{ fontSize: 12, color: 'var(--primary)' }}>
            {t.common.view ?? 'View all'} →
          </Link>
        </div>
        {(progress?.recent_submissions ?? []).slice(0, 5).map((r, i, arr) => (
          <Link
            key={r.id}
            href={r.type === 'reading' ? `/reading/history` : `/writing/history`}
            className="row"
            style={{
              padding: '10px 18px', gap: 12,
              borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 0,
              textDecoration: 'none', color: 'inherit',
            }}
          >
            <div className="avatar" style={{ background: 'var(--bg-sunk)', color: 'var(--ink-3)' }}>
              {r.type === 'reading' ? <BookOpen size={13} /> : <PenLine size={13} />}
            </div>
            <div className="flex-1">
              <div style={{ fontFamily: 'var(--ff-display)', fontSize: 14, color: 'var(--ink)' }}>
                {r.title}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                {r.type === 'reading' ? 'Reading' : 'Writing'} · {relativeTime(r.date)}
              </div>
            </div>
            <div className="mono" style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>
              {r.type === 'reading' ? `${r.score}%` : r.score.toFixed(1)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCell({
  label, value, unit, delta, sparkline, borderRight,
}: {
  label: string;
  value: string;
  unit: string;
  delta: { text: string; up: boolean } | null;
  sparkline: number[];
  borderRight?: boolean;
}) {
  return (
    <div style={{ padding: '18px 20px', borderRight: borderRight ? '1px solid var(--border)' : undefined }}>
      <div className="stat-label">— {label}</div>
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 6, alignItems: 'flex-end' }}>
        <div>
          <span className="stat-value">{value}</span>
          {unit && <span className="stat-unit">{unit}</span>}
          {delta && (
            <div className={`stat-delta ${delta.up ? 'delta-up' : 'delta-down'}`} style={{ marginTop: 4 }}>
              {delta.up ? '↑' : '↓'} {delta.text}
            </div>
          )}
        </div>
        {sparkline.length > 0 && <Sparkline values={sparkline} width={80} height={28} />}
      </div>
    </div>
  );
}

function fmtDelta(n: number | null, digits = 1): { text: string; up: boolean } | null {
  if (n == null || !isFinite(n)) return null;
  if (Math.abs(n) < 0.01) return null;
  return { text: Math.abs(n).toFixed(digits), up: n >= 0 };
}

function LearnerEmpty({ name }: { name: string }) {
  return (
    <div className="fade-in">
      <div className="page-head">
        <div className="eyebrow">— A study companion</div>
        <h1 className="page-title">
          Welcome, <em>{name}.</em>
        </h1>
        <p className="page-subtitle">
          Your dashboard fills up after your first reading or writing attempt.
        </p>
      </div>
      <div className="card card-pad" style={{ textAlign: 'center', padding: 48 }}>
        <div className="grid g-16" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', maxWidth: 540, margin: '0 auto' }}>
          <Link href="/reading" className="btn btn-lg btn-primary" style={{ justifyContent: 'center' }}>
            <BookOpen size={14} /> Start a reading test
          </Link>
          <Link href="/writing" className="btn btn-lg" style={{ justifyContent: 'center' }}>
            <PenLine size={14} /> Try a writing prompt
          </Link>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="fade-in">
      <div className="page-head">
        <div className="ph" style={{ height: 16, width: 160, marginBottom: 8 }} />
        <div className="ph" style={{ height: 36, width: 320, marginBottom: 8 }} />
        <div className="ph" style={{ height: 14, width: '60%' }} />
      </div>
      <div className="ph" style={{ height: 96, marginBottom: 16 }} />
      <div className="grid g-16" style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)' }}>
        <div className="ph" style={{ height: 280 }} />
        <div className="ph" style={{ height: 280 }} />
      </div>
    </div>
  );
}