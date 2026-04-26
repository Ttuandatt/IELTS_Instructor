'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Clock, Play, Search } from 'lucide-react';

const LEVELS = ['all', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
type Level = typeof LEVELS[number];

type Passage = {
  id: string;
  title: string;
  level: string;
  _count?: { questions?: number };
  tags?: { name: string }[];
  topic_tags?: string[];
  collection_id?: string | null;
};

function passageTags(p: Passage): string[] {
  if (p.tags?.length) return p.tags.map(t => t.name);
  if (p.topic_tags?.length) return p.topic_tags;
  return [];
}

export default function ReadingPassagesPage() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState<Level>('all');
  const [topic, setTopic] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['reading-passages', page, level, topic],
    queryFn: () => {
      let url = `/reading/passages?page=${page}&limit=12`;
      if (level !== 'all') url += `&level=${level}`;
      if (topic) url += `&topic=${encodeURIComponent(topic)}`;
      return apiClient.get(url).then(r => r.data);
    },
  });

  const passages: Passage[] = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total || 1) / 12));

  return (
    <div className="fade-in">
      <div className="page-head row-between">
        <div>
          <div className="eyebrow">— {t.reading.title}</div>
          <h1 className="page-title">
            Reading <em>passages</em>
          </h1>
          <p className="page-subtitle">
            Full-length passages for real IELTS practice. Pick a level, pick a desk — the timer starts when you do.
          </p>
        </div>
        <div className="cd-row" style={{ gap: 8 }}>
          <Link href="/reading/history" className="cd-btn">
            <Clock size={13} /> {t.reading.history}
          </Link>
          <Link
            href={passages[0] ? `/reading/${passages[0].id}` : '/reading'}
            className="cd-btn cd-btn-primary"
            aria-disabled={!passages[0]}
          >
            <Play size={12} /> Random passage
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 10, marginBottom: 16 }}>
        <div className="cd-row" style={{ gap: 12, flexWrap: 'wrap' }}>
          <div className="cd-row" style={{ gap: 6 }}>
            <span className="section-label" style={{ marginRight: 4 }}>{t.common.level}</span>
            {LEVELS.map(lvl => (
              <button
                key={lvl}
                className={`cd-btn cd-btn-sm ${level === lvl ? 'cd-btn-primary' : ''}`}
                onClick={() => { setLevel(lvl); setPage(1); }}
              >
                {lvl === 'all' ? 'All' : lvl}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

          <div className="topbar-search" style={{ maxWidth: 260, background: 'var(--bg)', flex: 1, minWidth: 200 }}>
            <Search size={13} />
            <input
              placeholder="Filter by topic — e.g. science, history…"
              value={topic}
              onChange={e => { setTopic(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="card card-pad" style={{ color: 'var(--ink-3)' }}>{t.common.loading}</div>
      ) : passages.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: 'center', padding: 48 }}>
          <div className="italic-serif" style={{ color: 'var(--ink-3)', fontSize: 14 }}>
            — {t.reading.no_passages}
          </div>
        </div>
      ) : (
        <>
          <div className="cd-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {passages.map(p => {
              const tags = passageTags(p);
              const qCount = p._count?.questions ?? 0;
              return (
                <Link
                  key={p.id}
                  href={`/reading/${p.id}`}
                  className="card"
                  style={{
                    padding: 0, overflow: 'hidden',
                    textDecoration: 'none', color: 'inherit', cursor: 'pointer',
                  }}
                >
                  <div style={{ padding: '14px 16px' }}>
                    <div className="row-between" style={{ marginBottom: 8 }}>
                      <span className={`cd-badge cd-badge-primary level-${p.level}`}>
                        <span className={`level-dot level-${p.level}`} />
                        {p.level}
                      </span>
                      <span className="cd-badge cd-badge-outline">
                        {qCount} {t.reading.questions}
                      </span>
                    </div>
                    <h3
                      style={{
                        fontFamily: 'var(--ff-display)', fontSize: 17, fontWeight: 500,
                        lineHeight: 1.2, color: 'var(--ink)', marginBottom: 8,
                      }}
                    >
                      {p.title}
                    </h3>
                    {tags.length > 0 && (
                      <div className="cd-row" style={{ gap: 6, flexWrap: 'wrap' }}>
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
                    <div className="cd-row" style={{ gap: 12 }}>
                      <span className="cd-row" style={{ gap: 4 }}>
                        <Clock size={12} /> 20 min
                      </span>
                    </div>
                    <span style={{ color: 'var(--primary)', fontSize: 12 }}>{t.reading.start_practice} →</span>
                  </div>
                </Link>
              );
            })}
          </div>

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
                className="cd-btn cd-btn-sm"
              >
                {t.common.previous}
              </button>
              <button
                disabled={page * 12 >= (data?.total || 0)}
                onClick={() => setPage(p => p + 1)}
                className="cd-btn cd-btn-sm"
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
