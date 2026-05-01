'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Clock, PenLine, Search, AlertCircle, RefreshCw } from 'lucide-react';

const LEVELS = ['all', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const TASKS = ['all', 'task1', 'task2'] as const;

type Prompt = {
  id: string;
  title: string;
  level: string;
  task_type: string;
  min_words: number;
  collection?: string | null;
  topic_tags?: string[];
  tags?: { name: string }[];
};

function promptTags(p: Prompt): string[] {
  if (p.tags?.length) return p.tags.map(t => t.name);
  if (p.topic_tags?.length) return p.topic_tags;
  return [];
}

function taskLabel(t: string) {
  if (t === 'task1' || t === 'Task 1') return 'Task 1';
  if (t === 'task2' || t === 'Task 2') return 'Task 2';
  return t;
}

export default function WritingPage() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState<typeof LEVELS[number]>('all');
  const [task, setTask] = useState<typeof TASKS[number]>('all');
  const [topic, setTopic] = useState('');

  const query = useQuery({
    queryKey: ['writing-prompts', page, level, task, topic],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (level !== 'all') params.set('level', level);
      if (task !== 'all') params.set('task_type', task);
      if (topic) params.set('topic', topic);
      return apiClient.get(`/writing/prompts?${params}`).then(r => r.data);
    },
  });

  const prompts: Prompt[] = query.data?.data ?? [];

  const groups = useMemo(() => {
    const out: Record<string, Prompt[]> = {};
    for (const p of prompts) {
      const key = p.collection || 'Standalone prompts';
      (out[key] ||= []).push(p);
    }
    return out;
  }, [prompts]);

  const totalPages = Math.max(1, Math.ceil((query.data?.total || 1) / 12));

  return (
    <div className="fade-in">
      <div className="page-head row-between">
        <div>
          <div className="eyebrow">— {t.writing.title}</div>
          <h1 className="page-title">
            Writing <em>prompts</em>
          </h1>
          <p className="page-subtitle">
            Essays and chart descriptions for real IELTS practice. AI feedback lands in minutes; your instructor can override if they&apos;re watching.
          </p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <Link href="/writing/history" className="btn">
            <Clock size={13} /> {t.writing.history}
          </Link>
          <Link
            href={prompts[0] ? `/writing/${prompts[0].id}` : '/writing'}
            className="btn btn-primary"
            aria-disabled={!prompts[0]}
          >
            <PenLine size={12} /> {prompts[0] ? 'Continue draft' : 'Start a prompt'}
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 10, marginBottom: 16 }}>
        <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
          <div className="row" style={{ gap: 6 }}>
            <span className="section-label" style={{ marginRight: 4 }}>Task</span>
            {TASKS.map(tk => (
              <button
                key={tk}
                className={`btn btn-sm ${task === tk ? 'btn-primary' : ''}`}
                onClick={() => { setTask(tk); setPage(1); }}
              >
                {tk === 'all' ? 'All' : taskLabel(tk)}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

          <div className="row" style={{ gap: 6 }}>
            <span className="section-label" style={{ marginRight: 4 }}>{t.common.level}</span>
            {LEVELS.map(lvl => (
              <button
                key={lvl}
                className={`btn btn-sm ${level === lvl ? 'btn-primary' : ''}`}
                onClick={() => { setLevel(lvl); setPage(1); }}
              >
                {lvl === 'all' ? 'All' : lvl}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

          <div className="topbar-search" style={{ maxWidth: 240, background: 'var(--bg)', flex: 1, minWidth: 180 }}>
            <Search size={13} />
            <input
              placeholder="Filter by topic…"
              value={topic}
              onChange={e => { setTopic(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      {query.isLoading ? (
        <div className="card card-pad" style={{ color: 'var(--ink-3)' }}>{t.common.loading}</div>
      ) : query.isError ? (
        <div className="card card-pad" style={{ textAlign: 'center', padding: 48 }}>
          <AlertCircle size={28} style={{ color: 'var(--danger)', marginBottom: 12 }} />
          <p style={{ marginBottom: 16, color: 'var(--ink-2)' }}>{t.common.error}</p>
          <button className="btn btn-primary" onClick={() => query.refetch()}>
            <RefreshCw size={13} /> {t.common.retry}
          </button>
        </div>
      ) : prompts.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: 'center', padding: 48 }}>
          <div className="italic-serif" style={{ color: 'var(--ink-3)', fontSize: 14 }}>
            — {t.writing.no_prompts}
          </div>
        </div>
      ) : (
        <>
          {Object.entries(groups).map(([coll, items]) => (
            <div key={coll} style={{ marginBottom: 28 }}>
              <div className="row-between" style={{ marginBottom: 10 }}>
                <div className="row" style={{ gap: 10, alignItems: 'baseline' }}>
                  <h2 className="section-title">{coll}</h2>
                  <span className="italic-serif" style={{ color: 'var(--ink-3)', fontSize: 12 }}>
                    — {items.length} prompt{items.length === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                {items.map(p => {
                  const tags = promptTags(p);
                  return (
                    <Link
                      key={p.id}
                      href={`/writing/${p.id}`}
                      className="card"
                      style={{ padding: 0, overflow: 'hidden', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                    >
                      <div style={{ padding: '14px 16px' }}>
                        <div className="row-between" style={{ marginBottom: 8 }}>
                          <span className={`badge ${p.task_type === 'task1' ? 'badge-outline' : 'badge-primary'}`}>
                            {taskLabel(p.task_type)}
                          </span>
                          <span className={`badge level-${p.level}`}>
                            <span className={`level-dot level-${p.level}`} />
                            {p.level}
                          </span>
                        </div>
                        <h3
                          style={{
                            fontFamily: 'var(--ff-display)', fontSize: 17, fontWeight: 500,
                            lineHeight: 1.25, marginBottom: 8, color: 'var(--ink)',
                          }}
                        >
                          {p.title}
                        </h3>
                        {tags.length > 0 && (
                          <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                            {tags.slice(0, 4).map(name => (
                              <span key={name} className="tag">{name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div
                        className="row-between"
                        style={{
                          padding: '10px 16px', background: 'var(--bg-sunk)',
                          borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--ink-3)',
                        }}
                      >
                        <span>
                          min <span className="mono" style={{ color: 'var(--ink-2)' }}>{p.min_words}</span> {t.writing.word_count.toLowerCase()}
                        </span>
                        <span style={{ color: 'var(--primary)' }}>Write →</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginTop: 16, fontSize: 12, color: 'var(--ink-3)',
            }}
          >
            <span className="italic-serif">Page {page} of {totalPages}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="btn btn-sm"
              >
                {t.common.previous}
              </button>
              <button
                disabled={page * 12 >= (query.data?.total || 0)}
                onClick={() => setPage(p => p + 1)}
                className="btn btn-sm"
              >
                {t.common.next}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
