'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import TrendChart from '@/components/TrendChart';
import {
  BookOpen,
  PenLine,
  Trophy,
  BarChart3,
  School,
  Plus,
  Users,
  ClipboardList,
  FileText,
  GraduationCap,
  ArrowRight,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

/* ───────────── minimal stat icon ───────────── */
function StatIcon({ Icon }: { Icon: LucideIcon }) {
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 12,
      background: 'linear-gradient(135deg, var(--color-primary-light), rgba(95,75,139,0.04))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={20} style={{ color: 'var(--color-primary)' }} strokeWidth={1.8} />
    </div>
  );
}

/* ───────────── Welcome banner ───────────── */
function WelcomeBanner({ name, subtitle }: { name: string; subtitle: string }) {
  const { t } = useI18n();

  function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return t.greeting.morning;
    if (hour < 18) return t.greeting.afternoon;
    return t.greeting.evening;
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{
        fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.25rem',
        color: 'var(--color-text-primary)',
        letterSpacing: '-0.03em',
      }}>
        {getGreeting()}, {name}
      </h1>
      <p style={{
        fontSize: '0.9rem', margin: 0,
        color: 'var(--color-text-muted)',
      }}>
        {subtitle}
      </p>
    </div>
  );
}

/* ───────────── Quick action card ───────────── */
function QuickAction({ href, Icon, label, desc }: {
  href: string; Icon: LucideIcon; label: string; desc: string;
}) {
  return (
    <Link href={href} className="quick-action-card" style={{ textDecoration: 'none' }}>
      <StatIcon Icon={Icon} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
          {label}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 1 }}>
          {desc}
        </div>
      </div>
      <ArrowRight size={16} className="quick-action-arrow" style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
    </Link>
  );
}

/* ───────────── Writing criteria mini-bars ───────────── */
function CriteriaBar({ label, value, max = 9 }: { label: string; value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
      <span style={{ width: 30, fontWeight: 600, color: 'var(--color-text-secondary)' }}>{label}</span>
      <div style={{
        flex: 1, height: 6, borderRadius: 3,
        background: 'var(--color-bg-tertiary)',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 3,
          background: pct > 66 ? '#10b981' : pct > 33 ? '#e69a8d' : '#ef4444',
          transition: 'width 0.3s ease',
        }} />
      </div>
      <span style={{ width: 28, textAlign: 'right', color: 'var(--color-text-muted)' }}>{value.toFixed(1)}</span>
    </div>
  );
}

/* ═══════════════════════ LEARNER ═══════════════════════ */
function LearnerDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [trendPeriod, setTrendPeriod] = useState<'4w' | '3m'>('4w');

  const { data: progress, isLoading } = useQuery({
    queryKey: ['dashboard-progress'],
    queryFn: () => apiClient.get('/dashboard/progress').then(r => r.data),
  });

  const { data: trends } = useQuery({
    queryKey: ['dashboard-trends', trendPeriod],
    queryFn: () => apiClient.get(`/dashboard/progress/trends?period=${trendPeriod}`).then(r => r.data),
  });

  const isEmpty = !isLoading
    && (progress?.reading?.total_attempts ?? 0) === 0
    && (progress?.writing?.total_submissions ?? 0) === 0;

  if (isEmpty) {
    return (
      <div>
        <WelcomeBanner
          name={user?.display_name || 'Learner'}
          subtitle="Boost your IELTS skills to shine in your life."
        />
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 0.5rem' }}>
            {t.dashboard.welcome}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>
            {t.dashboard.start_first_practice}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link href="/reading" className="btn-primary" style={{ textDecoration: 'none' }}>
              {t.dashboard.practice_reading}
            </Link>
            <Link href="/writing" className="btn-secondary" style={{ textDecoration: 'none' }}>
              {t.dashboard.practice_writing}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statCards: { label: string; value: string; Icon: LucideIcon }[] = [
    { label: t.dashboard.reading_progress, value: isLoading ? '—' : `${progress?.reading?.total_attempts ?? 0}`, Icon: BookOpen },
    { label: t.dashboard.reading_avg, value: isLoading ? '—' : `${progress?.reading?.avg_score_pct?.toFixed(1) ?? '—'}%`, Icon: Trophy },
    { label: t.dashboard.writing_progress, value: isLoading ? '—' : `${progress?.writing?.total_submissions ?? 0}`, Icon: PenLine },
    { label: t.dashboard.writing_avg, value: isLoading ? '—' : `${progress?.writing?.avg_scores?.overall?.toFixed(1) ?? '—'}`, Icon: TrendingUp },
  ];

  return (
    <div>
      <WelcomeBanner
        name={user?.display_name || 'Learner'}
        subtitle="Boost your IELTS skills to shine in your life."
      />

      {/* Stat cards */}
      <div className="stats-grid">
        {statCards.map((c) => (
          <div key={c.label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <StatIcon Icon={c.Icon} />
            <div>
              <div className="stat-card-label">{c.label}</div>
              <div className="stat-card-value">{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Writing criteria breakdown + Trend chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        {/* Writing criteria */}
        <div className="stat-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.75rem', color: 'var(--color-text-primary)' }}>
            {t.dashboard.writing_criteria}
          </h3>
          {progress?.writing?.avg_scores ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <CriteriaBar label="TR" value={progress.writing.avg_scores.TR ?? 0} />
              <CriteriaBar label="CC" value={progress.writing.avg_scores.CC ?? 0} />
              <CriteriaBar label="LR" value={progress.writing.avg_scores.LR ?? 0} />
              <CriteriaBar label="GRA" value={progress.writing.avg_scores.GRA ?? 0} />
            </div>
          ) : (
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{t.dashboard.no_data_yet}</div>
          )}
        </div>

        {/* Trend chart */}
        {trends?.weeks && (
          <TrendChart weeks={trends.weeks} period={trendPeriod} onPeriodChange={setTrendPeriod} />
        )}
      </div>

      {/* Recent submissions */}
      {progress?.recent_submissions?.length > 0 && (
        <>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '2rem 0 0.75rem', color: 'var(--color-text-secondary)' }}>
            {t.dashboard.recent_submissions}
          </h2>
          <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
            {progress.recent_submissions.map((sub: any, i: number) => (
              <Link
                key={sub.id}
                href={sub.type === 'reading' ? `/reading/${sub.id}/result` : `/writing/${sub.id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem', textDecoration: 'none',
                  borderBottom: i < progress.recent_submissions.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <StatIcon Icon={sub.type === 'reading' ? BookOpen : PenLine} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.85rem', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sub.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {new Date(sub.date).toLocaleDateString()}
                  </div>
                </div>
                <div style={{
                  fontWeight: 600, fontSize: '0.85rem',
                  color: 'var(--color-primary)',
                  background: 'var(--color-primary-light)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                }}>
                  {sub.type === 'reading' ? `${sub.score}%` : `${sub.score}/9`}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Quick Actions */}
      <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '2rem 0 0.75rem', color: 'var(--color-text-secondary)' }}>
        Quick Actions
      </h2>
      <div className="stats-grid">
        <QuickAction href="/reading" Icon={BookOpen} label={t.nav.reading} desc={t.reading.start_practice} />
        <QuickAction href="/writing" Icon={PenLine} label={t.nav.writing} desc={t.writing.submit_essay} />
        <QuickAction href="/classrooms" Icon={School} label={t.nav.classrooms} desc="Xem lớp đã tham gia" />
      </div>
    </div>
  );
}

/* ═══════════════════════ INSTRUCTOR ═══════════════════════ */
function InstructorDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['instructor-stats'],
    queryFn: () => apiClient.get('/dashboard/instructor-stats').then(r => r.data),
  });

  const statCards: { label: string; value: string; Icon: LucideIcon }[] = [
    { label: 'Lớp đang dạy', value: isLoading ? '—' : `${stats?.total_classrooms ?? 0}`, Icon: School },
    { label: t.instructor.my_learners, value: isLoading ? '—' : `${stats?.total_students ?? 0}`, Icon: Users },
    { label: 'Bài Writing đã nộp', value: isLoading ? '—' : `${stats?.pending_writing_reviews ?? 0}`, Icon: PenLine },
    { label: 'Bài Reading đã nộp', value: isLoading ? '—' : `${stats?.pending_reading_reviews ?? 0}`, Icon: BookOpen },
  ];

  return (
    <div>
      <WelcomeBanner
        name={user?.display_name || 'Instructor'}
        subtitle="Manage your classrooms and track student progress."
      />
      <div className="stats-grid">
        {statCards.map((c) => (
          <div key={c.label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <StatIcon Icon={c.Icon} />
            <div>
              <div className="stat-card-label">{c.label}</div>
              <div className="stat-card-value">{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '2rem 0 0.75rem', color: 'var(--color-text-secondary)' }}>
        Quick Actions
      </h2>
      <div className="stats-grid">
        <QuickAction href="/classrooms" Icon={School} label={t.nav.classrooms} desc="Quản lý lớp học của bạn" />
        <QuickAction href="/classrooms/new" Icon={Plus} label="Tạo lớp mới" desc="Bắt đầu lớp học mới" />
        <QuickAction href="/instructor/learners" Icon={Users} label={t.instructor.my_learners} desc="Xem danh sách học viên" />
        <QuickAction href="/instructor/submissions" Icon={ClipboardList} label={t.instructor.all_submissions} desc="Xem bài nộp của học viên" />
      </div>
    </div>
  );
}

/* ═══════════════════════ ADMIN ═══════════════════════ */
function AdminDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiClient.get('/admin/stats').then(r => r.data),
  });

  const statCards: { label: string; value: string; Icon: LucideIcon }[] = [
    { label: t.admin.total_users, value: isLoading ? '—' : `${stats?.users?.total ?? 0}`, Icon: Users },
    { label: t.admin.total_passages, value: isLoading ? '—' : `${stats?.passages?.total ?? 0}`, Icon: BookOpen },
    { label: t.admin.total_prompts, value: isLoading ? '—' : `${stats?.prompts?.total ?? 0}`, Icon: FileText },
    { label: t.admin.total_learners, value: isLoading ? '—' : `${stats?.users?.by_role?.learner ?? 0}`, Icon: GraduationCap },
  ];

  return (
    <div>
      <WelcomeBanner
        name={user?.display_name || 'Admin'}
        subtitle="Platform overview and content management."
      />
      <div className="stats-grid">
        {statCards.map((c) => (
          <div key={c.label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <StatIcon Icon={c.Icon} />
            <div>
              <div className="stat-card-label">{c.label}</div>
              <div className="stat-card-value">{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '2rem 0 0.75rem', color: 'var(--color-text-secondary)' }}>
        Management
      </h2>
      <div className="stats-grid">
        <QuickAction href="/admin/passages" Icon={BookOpen} label={t.admin.manage_passages} desc="Create & edit reading passages" />
        <QuickAction href="/admin/prompts" Icon={FileText} label={t.admin.manage_prompts} desc="Create & edit writing prompts" />
        <QuickAction href="/admin/users" Icon={Users} label={t.admin.manage_users} desc="User roles & permissions" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'instructor') return <InstructorDashboard />;
  return <LearnerDashboard />;
}
