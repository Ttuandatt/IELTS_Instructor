'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/providers/AuthProvider';
import { useI18n } from '@/providers/I18nProvider';
import { Calendar, ArrowRight, AlertCircle, RefreshCw, School } from 'lucide-react';

type InstructorStats = {
  total_classrooms: number;
  total_students: number;
  pending_writing_reviews: number;
  pending_reading_reviews: number;
  classrooms: Array<{ id: string; name: string; status: string; members_count: number }>;
};

export default function InstructorDashboard() {
  const { user } = useAuth();
  const { t } = useI18n();

  const query = useQuery<InstructorStats>({
    queryKey: ['dashboard', 'instructor-stats'],
    queryFn: () => apiClient.get('/dashboard/instructor-stats').then(r => r.data),
  });

  const display_name = user?.display_name ?? '—';

  if (query.isLoading) return <InstructorSkeleton />;

  if (query.isError) {
    return (
      <div className="card card-pad" style={{ textAlign: 'center', padding: 48 }}>
        <AlertCircle size={28} style={{ color: 'var(--danger)', marginBottom: 12 }} />
        <p style={{ marginBottom: 16, color: 'var(--ink-2)' }}>{t.common.error}</p>
        <button className="btn btn-primary" onClick={() => query.refetch()}>
          <RefreshCw size={13} /> {t.common.retry}
        </button>
      </div>
    );
  }

  const data = query.data;
  const totalPending = (data?.pending_writing_reviews ?? 0) + (data?.pending_reading_reviews ?? 0);

  return (
    <div className="fade-in">
      <div className="page-head row-between">
        <div>
          <div className="eyebrow">— {new Date().toLocaleDateString(undefined, { weekday: 'long' })}</div>
          <h1 className="page-title">
            {t.dashboard.welcome_back ?? 'Welcome back'}, <em>{display_name}.</em>
          </h1>
          <p className="page-subtitle">
            {totalPending > 0
              ? `${totalPending} submission${totalPending === 1 ? '' : 's'} waiting for your review.`
              : 'Your queue is clear.'}
          </p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn" disabled title="Coming soon">
            <Calendar size={13} /> Schedule
          </button>
          <Link href="/instructor/submissions" className="btn btn-primary">
            Open review queue <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Top stat band */}
      <div className="card" style={{ padding: 0, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <StatCellSimple
            label="Pending reviews"
            value={`${totalPending}`}
            unit={totalPending === 1 ? 'submission' : 'submissions'}
            note={totalPending > 0 ? { text: 'awaiting review', danger: true } : null}
            borderRight
          />
          <StatCellSimple
            label="Classrooms"
            value={`${data?.total_classrooms ?? 0}`}
            unit="active"
            note={{ text: `${data?.total_students ?? 0} learners`, danger: false }}
            borderRight
          />
          {/* TODO: backend cần thêm field avg_ai_agreement_pct trên /dashboard/instructor-stats */}
          <StatCellSimple
            label="Avg. AI agreement"
            value="—"
            unit="%"
            note={null}
            borderRight
          />
          {/* TODO: backend cần thêm field avg_turnaround_hours */}
          <StatCellSimple
            label="Avg. turnaround"
            value="—"
            unit="h"
            note={null}
          />
        </div>
      </div>

      <div className="grid g-16" style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)' }}>
        {/* Review queue CTA — replace design's table */}
        <div className="card" style={{ padding: 0 }}>
          <div className="row-between" style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div className="section-label">— Review queue</div>
              <div className="section-title">Writing submissions</div>
            </div>
            <Link href="/instructor/submissions" className="btn btn-sm btn-primary">
              Open submissions list <ArrowRight size={12} />
            </Link>
          </div>
          <div className="card-pad" style={{ textAlign: 'center', padding: 48 }}>
            <div className="italic-serif" style={{ color: 'var(--ink-3)', fontSize: 13, marginBottom: 12 }}>
              {totalPending > 0
                ? `${totalPending} submission${totalPending === 1 ? '' : 's'} waiting`
                : 'No pending submissions'}
            </div>
            {/* TODO: backend cần endpoint /instructor/submissions/preview?limit=6 trả 6 đầu để render inline */}
            <Link href="/instructor/submissions" className="btn">
              View full queue
            </Link>
          </div>
        </div>

        {/* Your classrooms — replace design's "Learners needing a look" */}
        <div className="card">
          <div className="section-label" style={{ marginBottom: 8 }}>— Your classrooms</div>
          {(data?.classrooms ?? []).length === 0 ? (
            <div className="italic-serif" style={{ color: 'var(--ink-3)', fontSize: 12, padding: '8px 0' }}>
              No classrooms yet.
              <Link href="/classrooms/new" style={{ color: 'var(--primary)', marginLeft: 6 }}>
                Create one →
              </Link>
            </div>
          ) : (
            (data?.classrooms ?? []).slice(0, 5).map((c, i, arr) => (
              <Link
                key={c.id}
                href={`/classrooms/${c.id}`}
                className="row"
                style={{
                  padding: '8px 0', gap: 10,
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 0,
                  textDecoration: 'none', color: 'inherit',
                }}
              >
                <div className="avatar"><School size={14} /></div>
                <div className="flex-1">
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{c.name}</div>
                  <div className="italic-serif" style={{ color: 'var(--ink-3)', fontSize: 11 }}>
                    — {c.members_count} member{c.members_count === 1 ? '' : 's'}
                    {c.status !== 'active' && ` · ${c.status}`}
                  </div>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--ink-4)' }} />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCellSimple({
  label, value, unit, note, borderRight,
}: {
  label: string;
  value: string;
  unit: string;
  note: { text: string; danger: boolean } | null;
  borderRight?: boolean;
}) {
  return (
    <div style={{ padding: '16px 20px', borderRight: borderRight ? '1px solid var(--border)' : undefined }}>
      <div className="stat-label">— {label}</div>
      <div className="row" style={{ alignItems: 'baseline', marginTop: 4 }}>
        <span className="stat-value">{value}</span>
        <span className="stat-unit">{unit}</span>
      </div>
      {note && (
        <div
          className="mono"
          style={{
            fontSize: 11, marginTop: 4,
            color: note.danger ? 'var(--danger)' : 'var(--success)',
          }}
        >
          {note.danger ? '● ' : '↑ '}{note.text}
        </div>
      )}
    </div>
  );
}

function InstructorSkeleton() {
  return (
    <div className="fade-in">
      <div className="page-head">
        <div className="ph" style={{ height: 16, width: 140, marginBottom: 8 }} />
        <div className="ph" style={{ height: 36, width: 280, marginBottom: 8 }} />
        <div className="ph" style={{ height: 14, width: '50%' }} />
      </div>
      <div className="ph" style={{ height: 92, marginBottom: 16 }} />
      <div className="grid g-16" style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)' }}>
        <div className="ph" style={{ height: 240 }} />
        <div className="ph" style={{ height: 240 }} />
      </div>
    </div>
  );
}