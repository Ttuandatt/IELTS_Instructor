'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import {
  BookOpen, PenLine, School, Plus, Users, ClipboardList, FileText,
  GraduationCap, ArrowRight, Calendar, Play,
} from 'lucide-react';

/* ─────────────────────────── SVG charts ─────────────────────────── */

function Sparkline({
  values, color = 'var(--primary)', width = 80, height = 28,
}: { values: number[]; color?: string; width?: number; height?: number }) {
  if (!values.length) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / Math.max(values.length - 1, 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const area = d + ` L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} className="spark">
      <path d={area} fill={color} opacity="0.1" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type WeekRow = { week_start: string; reading_avg_score: number | null; writing_avg_overall: number | null; submission_count: number };

function BarChart({ data, height = 200 }: { data: WeekRow[]; height?: number }) {
  const width = 560;
  if (!data.length) {
    return (
      <div className="ph" style={{ height: height + 30 }}>No data yet</div>
    );
  }
  const readingVals = data.map(d => d.reading_avg_score ?? 0);
  const writingVals = data.map(d => (d.writing_avg_overall ?? 0) * 10);
  const max = Math.max(100, ...readingVals, ...writingVals);
  const step = width / data.length;
  const barW = step * 0.3;
  const gap = step * 0.1;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height + 30}`} preserveAspectRatio="xMidYMid meet">
      {[0.25, 0.5, 0.75, 1].map(t => (
        <line key={t} x1="0" x2={width} y1={height - height * t} y2={height - height * t}
          stroke="var(--border)" strokeDasharray="2 3" />
      ))}
      {[0.25, 0.5, 0.75, 1].map(t => (
        <text key={'l' + t} x="0" y={height - height * t - 4} className="axis-label">
          {Math.round(max * t)}
        </text>
      ))}
      {data.map((d, i) => {
        const x = i * step + step / 2;
        const rh = ((d.reading_avg_score ?? 0) / max) * (height - 10);
        const wh = (((d.writing_avg_overall ?? 0) * 10) / max) * (height - 10);
        const label = new Date(d.week_start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        return (
          <g key={i}>
            <rect x={x - barW - gap / 2} y={height - rh} width={barW} height={rh} fill="var(--primary)" rx="2" />
            <rect x={x + gap / 2} y={height - wh} width={barW} height={wh} fill="var(--primary)" opacity="0.35" rx="2" />
            <text x={x} y={height + 14} textAnchor="middle" className="axis-label">{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function RadarChart({ scores, size = 180 }: { scores: number[]; size?: number }) {
  const labels = ['TR', 'CC', 'LR', 'GRA'];
  const cx = size / 2, cy = size / 2, r = size / 2 - 26;
  const angle = (i: number) => (Math.PI * 2 * i) / labels.length - Math.PI / 2;
  const point = (val: number, i: number): [number, number] => [
    cx + Math.cos(angle(i)) * (r * val / 9),
    cy + Math.sin(angle(i)) * (r * val / 9),
  ];
  const poly = scores.map((v, i) => point(v, i).join(',')).join(' ');
  return (
    <svg width={size} height={size}>
      {[0.33, 0.66, 1].map(t => (
        <polygon key={t}
          points={labels.map((_, i) => [cx + Math.cos(angle(i)) * r * t, cy + Math.sin(angle(i)) * r * t].join(',')).join(' ')}
          fill="none" stroke="var(--border)" />
      ))}
      <polygon points={poly} fill="var(--primary)" fillOpacity="0.15" stroke="var(--primary)" strokeWidth="1.5" />
      {scores.map((v, i) => {
        const [x, y] = point(v, i);
        return <circle key={i} cx={x} cy={y} r="2.5" fill="var(--primary)" />;
      })}
      {labels.map((lab, i) => {
        const [x, y] = [cx + Math.cos(angle(i)) * (r + 16), cy + Math.sin(angle(i)) * (r + 16)];
        return (
          <g key={lab}>
            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
              className="axis-label" style={{ fontWeight: 600, fill: 'var(--ink-2)' }}>{lab}</text>
            <text x={x} y={y + 12} textAnchor="middle" dominantBaseline="middle" className="axis-label">
              {scores[i].toFixed(1)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────── helpers ─────────────────────────── */

function greet(t: any): string {
  const h = new Date().getHours();
  if (h < 12) return t.greeting.morning;
  if (h < 18) return t.greeting.afternoon;
  return t.greeting.evening;
}

function todayLine(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

/* ═══════════════════════════ LEARNER ═══════════════════════════ */

function LearnerDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [period, setPeriod] = useState<'4w' | '3m'>('4w');

  const { data: progress, isLoading } = useQuery({
    queryKey: ['dashboard-progress'],
    queryFn: () => apiClient.get('/dashboard/progress').then(r => r.data),
  });

  const { data: trends } = useQuery({
    queryKey: ['dashboard-trends', period],
    queryFn: () => apiClient.get(`/dashboard/progress/trends?period=${period}`).then(r => r.data),
  });

  const isEmpty = !isLoading
    && (progress?.reading?.total_attempts ?? 0) === 0
    && (progress?.writing?.total_submissions ?? 0) === 0;

  if (isEmpty) {
    return (
      <div className="fade-in">
        <div className="page-head">
          <div className="eyebrow">— {todayLine()}</div>
          <h1 className="page-title">
            {greet(t)}, <em>{user?.display_name || 'Learner'}.</em>
          </h1>
          <p className="page-subtitle">{t.dashboard.start_first_practice}</p>
        </div>
        <div className="card card-pad" style={{ textAlign: 'center', padding: 48 }}>
          <div className="italic-serif" style={{ color: 'var(--ink-3)', fontSize: 14, marginBottom: 16 }}>
            — Your desk is quiet for now.
          </div>
          <div className="cd-row" style={{ gap: 8, justifyContent: 'center' }}>
            <Link href="/reading" className="cd-btn cd-btn-primary">
              <Play size={13} /> {t.dashboard.practice_reading}
            </Link>
            <Link href="/writing" className="cd-btn">
              <PenLine size={13} /> {t.dashboard.practice_writing}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const weeks: WeekRow[] = trends?.weeks ?? [];
  const readingSpark = weeks.map(w => w.reading_avg_score ?? 0);
  const writingSpark = weeks.map(w => w.writing_avg_overall ?? 0);
  const activitySpark = weeks.map(w => w.submission_count);

  const avgScores = progress?.writing?.avg_scores ?? {};
  const radarScores = [
    avgScores.TR ?? 0,
    avgScores.CC ?? 0,
    avgScores.LR ?? 0,
    avgScores.GRA ?? 0,
  ];

  const recent: { type: 'reading' | 'writing'; id: string; title: string; score: number; date: string }[]
    = progress?.recent_submissions ?? [];

  const stats = [
    {
      label: t.dashboard.reading_avg,
      value: isLoading ? '—' : `${progress?.reading?.avg_score_pct?.toFixed(1) ?? 0}`,
      unit: '%',
      trend: readingSpark,
    },
    {
      label: t.dashboard.writing_avg,
      value: isLoading ? '—' : `${(avgScores.overall ?? 0).toFixed(1)}`,
      unit: '/9',
      trend: writingSpark,
    },
    {
      label: t.dashboard.reading_progress,
      value: isLoading ? '—' : `${progress?.reading?.total_attempts ?? 0}`,
      unit: '',
      trend: activitySpark,
    },
    {
      label: t.dashboard.writing_progress,
      value: isLoading ? '—' : `${progress?.writing?.total_submissions ?? 0}`,
      unit: '',
      trend: activitySpark,
    },
  ];

  return (
    <div className="fade-in">
      <div className="page-head row-between">
        <div>
          <div className="eyebrow">— {todayLine()}</div>
          <h1 className="page-title">
            {greet(t)}, <em>{user?.display_name || 'Learner'}.</em>
          </h1>
          <p className="page-subtitle">
            Keep the rhythm. A passage, a prompt, a quiet desk — that's all it takes today.
          </p>
        </div>
        <div className="cd-row" style={{ gap: 8 }}>
          <Link href="/reading/history" className="cd-btn">
            <Calendar size={13} /> {t.reading.history}
          </Link>
          <Link href="/reading" className="cd-btn cd-btn-primary">
            <Play size={12} /> {t.reading.start_practice}
          </Link>
        </div>
      </div>

      {/* Editorial stat band */}
      <div className="card" style={{ padding: 0, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={{ padding: '18px 20px', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}
            >
              <div className="stat-label">— {s.label}</div>
              <div className="cd-row" style={{ justifyContent: 'space-between', marginTop: 6, alignItems: 'flex-end' }}>
                <div>
                  <span className="stat-value">{s.value}</span>
                  {s.unit && <span className="stat-unit">{s.unit}</span>}
                </div>
                <Sparkline values={s.trend.length ? s.trend : [0, 0]} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="cd-grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        <div className="card card-pad">
          <div className="row-between" style={{ marginBottom: 16 }}>
            <div>
              <div className="section-label">— {t.dashboard.trend_title}</div>
              <div className="section-title">Reading & Writing over time</div>
            </div>
            <div className="segmented" style={{ fontSize: 11 }}>
              <button
                className={period === '4w' ? 'is-active' : ''}
                onClick={() => setPeriod('4w')}
              >
                {t.dashboard.period_4w}
              </button>
              <button
                className={period === '3m' ? 'is-active' : ''}
                onClick={() => setPeriod('3m')}
              >
                {t.dashboard.period_3m}
              </button>
            </div>
          </div>
          <BarChart data={weeks} />
          <div className="cd-row" style={{ gap: 16, marginTop: 12, fontSize: 11, color: 'var(--ink-3)' }}>
            <div className="cd-row" style={{ gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--primary)' }} />
              Reading %
            </div>
            <div className="cd-row" style={{ gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--primary)', opacity: 0.35 }} />
              Writing × 10
            </div>
          </div>
        </div>

        <div className="card card-pad">
          <div className="section-label">— {t.dashboard.writing_criteria}</div>
          <div className="section-title" style={{ marginBottom: 8 }}>Where to focus</div>
          <div style={{ display: 'grid', placeItems: 'center', padding: '8px 0' }}>
            <RadarChart scores={radarScores} />
          </div>
          <div
            className="card card-tight"
            style={{ background: 'var(--primary-softer)', border: '1px solid var(--primary-soft)', marginTop: 6 }}
          >
            <div className="cd-row" style={{ gap: 10, alignItems: 'flex-start' }}>
              <div className="italic-serif" style={{ fontSize: 11, color: 'var(--primary)', marginTop: 2 }}>Tip</div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                {writingLowestHint(avgScores)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity + Quick actions */}
      <div className="cd-grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="card" style={{ padding: 0 }}>
          <div className="row-between" style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <div className="section-title" style={{ fontSize: 16 }}>{t.dashboard.recent_submissions}</div>
            <Link href="/reading/history" style={{ fontSize: 12, color: 'var(--primary)' }}>
              View all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div style={{ padding: 24, color: 'var(--ink-3)', fontSize: 13 }}>{t.dashboard.no_data_yet}</div>
          ) : (
            recent.slice(0, 6).map((r, i) => (
              <Link
                key={`${r.type}-${r.id}`}
                href={r.type === 'reading' ? `/reading/${r.id}` : `/writing/${r.id}`}
                className="cd-row"
                style={{
                  padding: '10px 18px', gap: 12,
                  borderBottom: i < Math.min(recent.length, 6) - 1 ? '1px solid var(--border)' : 0,
                  textDecoration: 'none', color: 'inherit',
                }}
              >
                <div className="avatar" style={{ background: 'var(--bg-sunk)', color: 'var(--ink-3)' }}>
                  {r.type === 'reading' ? <BookOpen size={13} /> : <PenLine size={13} />}
                </div>
                <div className="flex-1">
                  <div style={{ fontFamily: 'var(--ff-display)', fontSize: 14, color: 'var(--ink)' }}>
                    {r.title || '—'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                    {r.type === 'reading' ? 'Reading' : 'Writing'} · {new Date(r.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="mono" style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>
                  {r.type === 'reading' ? `${r.score.toFixed(0)}%` : r.score.toFixed(1)}
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="card card-pad">
          <div className="section-label">— Quick actions</div>
          <div className="section-title" style={{ marginBottom: 12 }}>Where to next</div>
          <div className="stack" style={{ gap: 6 }}>
            <QuickRow href="/reading" label={t.nav.reading} sub={t.reading.start_practice} Icon={BookOpen} />
            <QuickRow href="/writing" label={t.nav.writing} sub={t.writing.submit_essay} Icon={PenLine} />
            <QuickRow href="/classrooms" label={t.nav.classrooms} sub="Your classrooms & assignments" Icon={School} />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickRow({
  href, label, sub, Icon,
}: { href: string; label: string; sub: string; Icon: any }) {
  return (
    <Link
      href={href}
      className="cd-row"
      style={{
        gap: 12, padding: '10px 12px', borderRadius: 'var(--r-md)',
        textDecoration: 'none', color: 'inherit',
        border: '1px solid transparent',
      }}
    >
      <div className="avatar" style={{ background: 'var(--bg-sunk)', color: 'var(--ink-3)' }}>
        <Icon size={14} />
      </div>
      <div className="flex-1">
        <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{sub}</div>
      </div>
      <ArrowRight size={14} style={{ color: 'var(--ink-3)' }} />
    </Link>
  );
}

function writingLowestHint(avg: Record<string, number>): React.ReactNode {
  const pairs: [string, string, number][] = [
    ['TR', 'Task Response', avg.TR ?? 0],
    ['CC', 'Coherence & Cohesion', avg.CC ?? 0],
    ['LR', 'Lexical Resource', avg.LR ?? 0],
    ['GRA', 'Grammatical Range', avg.GRA ?? 0],
  ];
  const scored = pairs.filter(([, , v]) => v > 0);
  if (scored.length === 0) {
    return <>Submit an essay to see where to focus your practice.</>;
  }
  scored.sort((a, b) => a[2] - b[2]);
  const [, name] = scored[0];
  return (
    <>
      Your <b>{name}</b> is your softest band. Try a targeted Writing drill tonight.
    </>
  );
}

/* ═══════════════════════════ INSTRUCTOR ═══════════════════════════ */

function InstructorDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['instructor-stats'],
    queryFn: () => apiClient.get('/dashboard/instructor-stats').then(r => r.data),
  });

  const band = [
    {
      label: 'Pending writing',
      value: isLoading ? '—' : `${stats?.pending_writing_reviews ?? 0}`,
      unit: 'essays',
      urgent: (stats?.pending_writing_reviews ?? 0) > 0,
    },
    {
      label: 'Pending reading',
      value: isLoading ? '—' : `${stats?.pending_reading_reviews ?? 0}`,
      unit: 'subs',
    },
    {
      label: 'Classrooms',
      value: isLoading ? '—' : `${stats?.total_classrooms ?? 0}`,
      unit: 'active',
    },
    {
      label: t.instructor.my_learners,
      value: isLoading ? '—' : `${stats?.total_students ?? 0}`,
      unit: 'learners',
    },
  ];

  const classrooms = stats?.classrooms ?? [];

  return (
    <div className="fade-in">
      <div className="page-head row-between">
        <div>
          <div className="eyebrow">— {todayLine()}</div>
          <h1 className="page-title">
            {greet(t)}, <em>{user?.display_name || 'Instructor'}.</em>
          </h1>
          <p className="page-subtitle">
            Manage your classrooms, review submissions, and keep your learners moving.
          </p>
        </div>
        <div className="cd-row" style={{ gap: 8 }}>
          <Link href="/classrooms/new" className="cd-btn">
            <Plus size={13} /> New classroom
          </Link>
          <Link href="/instructor/submissions" className="cd-btn cd-btn-primary">
            Open review queue →
          </Link>
        </div>
      </div>

      <div className="card" style={{ padding: 0, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {band.map((s, i) => (
            <div
              key={s.label}
              style={{ padding: '16px 20px', borderRight: i < 3 ? '1px solid var(--border)' : 0 }}
            >
              <div className="stat-label">— {s.label}</div>
              <div className="cd-row" style={{ alignItems: 'baseline', marginTop: 4 }}>
                <span className="stat-value">{s.value}</span>
                <span className="stat-unit">{s.unit}</span>
              </div>
              {s.urgent && (
                <div className="mono" style={{ fontSize: 11, marginTop: 4, color: 'var(--danger)' }}>● needs review</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="cd-grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        <div className="card" style={{ padding: 0 }}>
          <div className="row-between" style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div className="section-label">— {t.nav.classrooms}</div>
              <div className="section-title">Your classrooms</div>
            </div>
            <Link href="/classrooms" style={{ fontSize: 12, color: 'var(--primary)' }}>View all →</Link>
          </div>
          {classrooms.length === 0 ? (
            <div style={{ padding: 24, color: 'var(--ink-3)', fontSize: 13 }}>{t.common.no_data}</div>
          ) : (
            <table className="cd-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 18 }}>Name</th>
                  <th>{t.common.status}</th>
                  <th>Members</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {classrooms.map((c: any) => (
                  <tr key={c.id}>
                    <td style={{ paddingLeft: 18 }}>
                      <Link
                        href={`/classrooms/${c.id}`}
                        style={{ fontFamily: 'var(--ff-display)', fontSize: 14, color: 'var(--ink)' }}
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td>
                      <span className={`cd-badge ${c.status === 'active' ? 'cd-badge-success' : ''}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="mono" style={{ color: 'var(--ink-2)' }}>{c.members_count}</td>
                    <td style={{ textAlign: 'right', paddingRight: 18 }}>
                      <ArrowRight size={14} style={{ color: 'var(--ink-3)' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card card-pad">
          <div className="section-label">— Quick actions</div>
          <div className="section-title" style={{ marginBottom: 12 }}>Instructor tools</div>
          <div className="stack" style={{ gap: 6 }}>
            <QuickRow href="/instructor/submissions" label={t.instructor.all_submissions} sub="Review learner work" Icon={ClipboardList} />
            <QuickRow href="/instructor/learners" label={t.instructor.my_learners} sub="All learners in your classrooms" Icon={Users} />
            <QuickRow href="/instructor/passages" label={t.nav.passages} sub="Your reading passages" Icon={BookOpen} />
            <QuickRow href="/instructor/prompts" label={t.nav.prompts} sub="Your writing prompts" Icon={FileText} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════ ADMIN ═══════════════════════════ */

function AdminDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiClient.get('/admin/stats').then(r => r.data),
  });

  const learners = stats?.users?.by_role?.learner ?? 0;
  const instructors = stats?.users?.by_role?.instructor ?? 0;
  const admins = stats?.users?.by_role?.admin ?? 0;

  const band = [
    { label: t.admin.total_learners, value: isLoading ? '—' : learners },
    { label: t.admin.total_instructors, value: isLoading ? '—' : instructors },
    { label: t.admin.total_admins, value: isLoading ? '—' : admins },
    { label: t.admin.total_passages, value: isLoading ? '—' : (stats?.passages?.total ?? 0) },
    { label: t.admin.total_prompts, value: isLoading ? '—' : (stats?.prompts?.total ?? 0) },
  ];

  const passagesByStatus = stats?.passages?.by_status ?? {};
  const promptsByStatus = stats?.prompts?.by_status ?? {};

  return (
    <div className="fade-in">
      <div className="page-head row-between">
        <div>
          <div className="eyebrow">— Platform overview</div>
          <h1 className="page-title">
            Admin <em>console</em>
          </h1>
          <p className="page-subtitle">
            {user?.display_name ? `Signed in as ${user.display_name}. ` : ''}
            Users, content, and platform health at a glance.
          </p>
        </div>
        <div className="cd-row" style={{ gap: 8 }}>
          <Link href="/admin/passages/new" className="cd-btn">
            <Plus size={13} /> {t.admin.create_passage}
          </Link>
          <Link href="/admin/prompts/new" className="cd-btn cd-btn-primary">
            <Plus size={13} /> {t.admin.create_prompt}
          </Link>
        </div>
      </div>

      <div className="card" style={{ padding: 0, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${band.length}, 1fr)` }}>
          {band.map((s, i) => (
            <div
              key={s.label}
              style={{ padding: '14px 18px', borderRight: i < band.length - 1 ? '1px solid var(--border)' : 0 }}
            >
              <div className="stat-label">— {s.label}</div>
              <div className="stat-value" style={{ fontSize: 24, marginTop: 4 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="cd-grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        <div className="card card-pad">
          <div className="section-label">— Submissions</div>
          <div className="section-title" style={{ marginBottom: 16 }}>Platform activity</div>
          <div className="cd-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div>
              <div className="stat-label">— Reading submissions</div>
              <div className="cd-row" style={{ alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <span className="stat-value" style={{ fontSize: 28 }}>
                  {isLoading ? '—' : (stats?.submissions?.reading ?? 0)}
                </span>
              </div>
            </div>
            <div>
              <div className="stat-label">— Writing submissions</div>
              <div className="cd-row" style={{ alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <span className="stat-value" style={{ fontSize: 28 }}>
                  {isLoading ? '—' : (stats?.submissions?.writing ?? 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="hr" />

          <div className="section-label" style={{ marginBottom: 8 }}>— Content library</div>
          <div className="stack" style={{ gap: 6 }}>
            <ContentStatusRow label={t.admin.total_passages} totals={passagesByStatus} />
            <ContentStatusRow label={t.admin.total_prompts} totals={promptsByStatus} />
          </div>
        </div>

        <div className="card card-pad">
          <div className="section-label">— Management</div>
          <div className="section-title" style={{ marginBottom: 12 }}>Platform tools</div>
          <div className="stack" style={{ gap: 6 }}>
            <QuickRow href="/admin/users" label={t.admin.manage_users} sub="User roles & permissions" Icon={Users} />
            <QuickRow href="/admin/passages" label={t.admin.manage_passages} sub="Reading passages" Icon={BookOpen} />
            <QuickRow href="/admin/prompts" label={t.admin.manage_prompts} sub="Writing prompts" Icon={FileText} />
            <QuickRow href="/classrooms" label={t.nav.classrooms} sub="All classrooms" Icon={GraduationCap} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentStatusRow({ label, totals }: { label: string; totals: Record<string, number> }) {
  const entries = Object.entries(totals);
  return (
    <div className="cd-row" style={{ gap: 12 }}>
      <div className="flex-1" style={{ fontSize: 13, color: 'var(--ink-2)' }}>{label}</div>
      <div className="cd-row" style={{ gap: 6 }}>
        {entries.length === 0 && <span className="italic-serif" style={{ color: 'var(--ink-4)', fontSize: 12 }}>— none yet</span>}
        {entries.map(([status, count]) => (
          <span key={status} className="cd-badge">
            <span className="mono" style={{ color: 'var(--ink-3)' }}>{status}</span>
            <b style={{ marginLeft: 4 }}>{count}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════ ROOT ═══════════════════════════ */

export default function DashboardPage() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'instructor') return <InstructorDashboard />;
  return <LearnerDashboard />;
}
