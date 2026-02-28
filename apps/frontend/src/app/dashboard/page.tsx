'use client';

import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
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
  type LucideIcon,
} from 'lucide-react';

/* ───────────── minimal stat icon ───────────── */
function StatIcon({ Icon }: { Icon: LucideIcon }) {
  return (
    <div style={{
      width: 42, height: 42, borderRadius: 12,
      background: 'var(--color-bg-tertiary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon size={20} style={{ color: 'var(--color-primary)' }} strokeWidth={1.8} />
    </div>
  );
}

/* ───────────── Welcome banner ───────────── */
function WelcomeBanner({ name, subtitle }: { name: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{
        fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.25rem',
        color: 'var(--color-text-primary)',
        letterSpacing: '-0.02em',
      }}>
        Welcome back, {name}
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
    <Link href={href} className="stat-card" style={{
      textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.85rem',
    }}>
      <StatIcon Icon={Icon} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
          {label}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 1 }}>
          {desc}
        </div>
      </div>
      <ArrowRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
    </Link>
  );
}

/* ═══════════════════════ LEARNER ═══════════════════════ */
function LearnerDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.get('/dashboard/stats').then(r => r.data),
  });

  const statCards: { label: string; value: string; Icon: LucideIcon }[] = [
    { label: t.dashboard.reading_progress, value: isLoading ? '—' : `${stats?.reading?.total ?? 0}`, Icon: BookOpen },
    { label: t.dashboard.writing_progress, value: isLoading ? '—' : `${stats?.writing?.total ?? 0}`, Icon: PenLine },
    { label: t.dashboard.avg_score, value: isLoading ? '—' : `${stats?.reading?.avg_score?.toFixed(1) ?? '—'}%`, Icon: Trophy },
    { label: t.dashboard.total_attempts, value: isLoading ? '—' : `${stats?.total_attempts ?? 0}`, Icon: BarChart3 },
  ];

  return (
    <div>
      <WelcomeBanner
        name={user?.display_name || 'Learner'}
        subtitle="Boost your IELTS skills to shine in your life."
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
