'use client';

import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

function LearnerDashboard() {
  const { t } = useI18n();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.get('/dashboard/stats').then(r => r.data),
  });

  return (
    <div>
      <h1 className="page-title">{t.dashboard.title}</h1>

      <div className="stats-grid">
        {[
          { label: t.dashboard.reading_progress, value: isLoading ? '...' : `${stats?.reading?.total ?? 0}`, icon: '📖' },
          { label: t.dashboard.writing_progress, value: isLoading ? '...' : `${stats?.writing?.total ?? 0}`, icon: '✍️' },
          { label: t.dashboard.avg_score, value: isLoading ? '...' : `${stats?.reading?.avg_score?.toFixed(1) ?? '—'}%`, icon: '🏆' },
          { label: t.dashboard.total_attempts, value: isLoading ? '...' : `${stats?.total_attempts ?? 0}`, icon: '📊' },
        ].map((card) => (
          <div key={card.label} className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{card.icon}</div>
            <div className="stat-card-label">{card.label}</div>
            <div className="stat-card-value">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="stats-grid">
        <Link href="/reading" className="stat-card" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '2rem' }}>📖</span>
          <div className="stat-card-label" style={{ marginTop: '0.5rem' }}>{t.nav.reading}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{t.reading.start_practice}</div>
        </Link>
        <Link href="/writing" className="stat-card" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '2rem' }}>✍️</span>
          <div className="stat-card-label" style={{ marginTop: '0.5rem' }}>{t.nav.writing}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{t.writing.submit_essay}</div>
        </Link>
      </div>
    </div>
  );
}

function InstructorDashboard() {
  const { t } = useI18n();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['instructor-stats'],
    queryFn: () => apiClient.get('/instructor/stats').then(r => r.data),
  });

  return (
    <div>
      <h1 className="page-title">{t.instructor.title}</h1>
      <div className="stats-grid">
        {[
          { label: t.instructor.my_learners, value: isLoading ? '...' : `${stats?.total_learners ?? 0}`, icon: '👥' },
          { label: t.instructor.writing_submissions, value: isLoading ? '...' : `${stats?.total_writing ?? 0}`, icon: '✍️' },
          { label: t.instructor.reading_submissions, value: isLoading ? '...' : `${stats?.total_reading ?? 0}`, icon: '📖' },
          { label: t.instructor.pending_review, value: isLoading ? '...' : `${stats?.pending_writing ?? 0}`, icon: '⏳' },
        ].map((card) => (
          <div key={card.label} className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{card.icon}</div>
            <div className="stat-card-label">{card.label}</div>
            <div className="stat-card-value">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="stats-grid">
        <Link href="/instructor/learners" className="stat-card" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '2rem' }}>👥</span>
          <div className="stat-card-label" style={{ marginTop: '0.5rem' }}>{t.instructor.my_learners}</div>
        </Link>
        <Link href="/instructor/submissions" className="stat-card" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '2rem' }}>📝</span>
          <div className="stat-card-label" style={{ marginTop: '0.5rem' }}>{t.instructor.all_submissions}</div>
        </Link>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { t } = useI18n();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiClient.get('/admin/stats').then(r => r.data),
  });

  return (
    <div>
      <h1 className="page-title">{t.admin.title}</h1>
      <div className="stats-grid">
        {[
          { label: t.admin.total_users, value: isLoading ? '...' : `${stats?.users?.total ?? 0}`, icon: '👥' },
          { label: t.admin.total_passages, value: isLoading ? '...' : `${stats?.passages?.total ?? 0}`, icon: '📖' },
          { label: t.admin.total_prompts, value: isLoading ? '...' : `${stats?.prompts?.total ?? 0}`, icon: '✍️' },
          { label: t.admin.total_learners, value: isLoading ? '...' : `${stats?.users?.by_role?.learner ?? 0}`, icon: '🎓' },
        ].map((card) => (
          <div key={card.label} className="stat-card">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{card.icon}</div>
            <div className="stat-card-label">{card.label}</div>
            <div className="stat-card-value">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="stats-grid">
        <Link href="/admin/passages" className="stat-card" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '2rem' }}>📖</span>
          <div className="stat-card-label" style={{ marginTop: '0.5rem' }}>{t.admin.manage_passages}</div>
        </Link>
        <Link href="/admin/prompts" className="stat-card" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '2rem' }}>✍️</span>
          <div className="stat-card-label" style={{ marginTop: '0.5rem' }}>{t.admin.manage_prompts}</div>
        </Link>
        <Link href="/admin/users" className="stat-card" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '2rem' }}>👥</span>
          <div className="stat-card-label" style={{ marginTop: '0.5rem' }}>{t.admin.manage_users}</div>
        </Link>
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
