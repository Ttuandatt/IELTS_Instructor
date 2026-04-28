'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { FileText, Plus, Search, Filter, Eye, Edit, Trash2, AlertTriangle } from 'lucide-react';
import Sparkline from './charts/Sparkline';

/**
 * AdminDashboard — DEMO MODE.
 *
 * Backend endpoints currently MISSING for admin stats:
 *  - GET /dashboard/admin-stats     → totals (learners, instructors, classrooms, passages, prompts) + monthly deltas
 *  - GET /dashboard/admin-activity  → daily submissions sparkline (last 14d)
 *  - GET /admin/content-queue       → drafts/reviews/changes content items
 *  - GET /admin/passages?recent=    → recent passages list with status (Published/Draft/Review)
 *
 * Numbers below are mock. Replace with real fetches once endpoints exist.
 */

const MOCK_STATS = [
  { label: 'Learners', value: '—', delta: '—' },
  { label: 'Instructors', value: '—', delta: '—' },
  { label: 'Classrooms', value: '—', delta: '—' },
  { label: 'Passages', value: '—', delta: '—' },
  { label: 'Prompts', value: '—', delta: '—' },
];

// 14 mock points for sparkline shape only — flat zero in real demo
const MOCK_DAILY: number[] = Array.from({ length: 14 }, () => 0);

const MOCK_QUEUE = [
  { title: '—', author: '—', state: 'review' as const },
  { title: '—', author: '—', state: 'pending' as const },
  { title: '—', author: '—', state: 'changes' as const },
];

const MOCK_PASSAGES = [
  { title: '—', level: 'B2', words: '—', qs: '—', status: 'Draft', author: '—', updated: '—' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const display_name = user?.display_name ?? 'Admin';

  return (
    <div className="fade-in">
      {/* Demo data banner */}
      <div
        className="card card-tight"
        style={{
          marginBottom: 16,
          background: 'var(--warn-soft)',
          border: '1px solid var(--warn)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <AlertTriangle size={16} style={{ color: 'var(--warn)' }} />
        <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-2)' }}>
          <strong>Demo data</strong> — admin endpoints not implemented yet. Numbers below are placeholders.
          See TODO comments in <code className="mono">AdminDashboard.tsx</code> for required endpoints.
        </div>
      </div>

      <div className="page-head row-between">
        <div>
          <div className="eyebrow">— Platform overview</div>
          <h1 className="page-title">
            Admin <em>console</em>
          </h1>
          <p className="page-subtitle">
            Welcome, {display_name}. Once admin endpoints land, real platform metrics will replace the placeholders below.
          </p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn" disabled title="Coming soon">
            <FileText size={13} /> Export report
          </button>
          <Link href="/admin/passages/new" className="btn btn-primary">
            <Plus size={13} /> New passage
          </Link>
        </div>
      </div>

      {/* 5-stat band — mock */}
      <div className="card" style={{ padding: 0, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          {MOCK_STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: '14px 18px',
                borderRight: i < MOCK_STATS.length - 1 ? '1px solid var(--border)' : 0,
              }}
            >
              <div className="stat-label">— {s.label}</div>
              <div className="stat-value" style={{ fontSize: 24, marginTop: 4 }}>
                {s.value}
              </div>
              <div className="mono delta-up" style={{ fontSize: 11, marginTop: 4, color: 'var(--ink-4)' }}>
                {s.delta}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid g-16" style={{ gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)' }}>
        {/* Daily submissions */}
        <div className="card card-pad">
          <div className="row-between" style={{ marginBottom: 12 }}>
            <div>
              <div className="section-label">— Daily submissions</div>
              <div className="section-title">Platform activity · last 14 days</div>
            </div>
            <div className="segmented" style={{ fontSize: 11 }}>
              <button>7d</button>
              <button className="is-active">14d</button>
              <button>30d</button>
            </div>
          </div>
          <Sparkline values={MOCK_DAILY} width={600} height={140} />
          <div className="grid g-12" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginTop: 12 }}>
            {[
              ['Reading submissions', '—', '—'],
              ['Writing submissions', '—', '—'],
              ['AI scoring queue', '—', '—'],
            ].map(([l, v, d]) => (
              <div key={l}>
                <div className="section-label">— {l}</div>
                <div className="row" style={{ alignItems: 'baseline', gap: 6 }}>
                  <span className="stat-value" style={{ fontSize: 22 }}>{v}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{d}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content queue */}
        <div className="card" style={{ padding: 0 }}>
          <div className="row-between" style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <div className="section-title" style={{ fontSize: 15 }}>Content queue</div>
            <Link href="/admin/passages" style={{ fontSize: 12, color: 'var(--primary)' }}>
              Manage →
            </Link>
          </div>
          {MOCK_QUEUE.map((n, i) => (
            <div
              key={i}
              className="row"
              style={{
                padding: '10px 18px', gap: 10,
                borderBottom: i < MOCK_QUEUE.length - 1 ? '1px solid var(--border)' : 0,
              }}
            >
              <FileText size={14} />
              <div className="flex-1">
                <div style={{ fontSize: 13 }}>{n.title}</div>
                <div className="italic-serif" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                  — by {n.author}
                </div>
              </div>
              {n.state === 'review' && <span className="badge badge-primary">In review</span>}
              {n.state === 'pending' && <span className="badge badge-warn">Pending</span>}
              {n.state === 'changes' && <span className="badge badge-danger">Changes</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Passages library — mock */}
      <div className="card" style={{ padding: 0, marginTop: 16 }}>
        <div className="row-between" style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div className="section-label">— Content library</div>
            <div className="section-title">Passages</div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <div className="topbar-search" style={{ maxWidth: 200, background: 'var(--bg-sunk)' }}>
              <Search size={13} />
              <input placeholder="Search…" />
            </div>
            <button className="btn btn-sm" disabled>
              <Filter size={12} /> Filter
            </button>
            <Link href="/admin/passages/new" className="btn btn-sm btn-primary">
              <Plus size={12} /> New
            </Link>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 18 }}>Title</th>
              <th>Level</th>
              <th>Words</th>
              <th>Qs</th>
              <th>Status</th>
              <th>Author</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PASSAGES.map((r, i) => (
              <tr key={i}>
                <td style={{ paddingLeft: 18, fontFamily: 'var(--ff-display)', fontSize: 14, color: 'var(--ink-3)' }}>
                  {r.title}
                </td>
                <td>
                  <span className={`badge level-${r.level}`}>
                    <span className={`level-dot level-${r.level}`}></span>
                    {r.level}
                  </span>
                </td>
                <td className="mono">{r.words}</td>
                <td className="mono">{r.qs}</td>
                <td>
                  {r.status === 'Published' ? (
                    <span className="badge badge-success">{r.status}</span>
                  ) : r.status === 'Draft' ? (
                    <span className="badge">{r.status}</span>
                  ) : (
                    <span className="badge badge-warn">{r.status}</span>
                  )}
                </td>
                <td className="italic-serif" style={{ color: 'var(--ink-3)' }}>— {r.author}</td>
                <td className="mono" style={{ color: 'var(--ink-3)', fontSize: 12 }}>{r.updated}</td>
                <td style={{ textAlign: 'right' }}>
                  <div className="row" style={{ gap: 2, justifyContent: 'flex-end' }}>
                    <button className="icon-btn" disabled><Eye size={13} /></button>
                    <button className="icon-btn" disabled><Edit size={13} /></button>
                    <button className="icon-btn" disabled><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}