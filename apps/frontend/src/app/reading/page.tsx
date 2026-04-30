'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Clock, Play, Search, LayoutGrid, List as ListIcon, AlertCircle, RefreshCw } from 'lucide-react';

const LEVELS = ['all', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
type Level = typeof LEVELS[number];
type ViewMode = 'grid' | 'list';

type Passage = {
  id: string;
  title: string;
  level: string;
  _count?: { questions?: number };
  tags?: { name: string }[];
  topic_tags?: string[];
  collection_id?: string | null;
  collection?: { id: string; name?: string } | string | null;
};

function passageTags(p: Passage): string[] {
  if (p.tags?.length) return p.tags.map(t => t.name);
  if (p.topic_tags?.length) return p.topic_tags;
  return [];
}

function collectionLabel(p: Passage): string {
  const c = p.collection;
  if (typeof c === 'string' && c) return c;
  if (c && typeof c === 'object' && c.name) return c.name;
  if (p.collection_id) return p.collection_id;
  return 'Standalone passages';
}

export default function ReadingPassagesPage() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState<Level>('all');
  const [topic, setTopic] = useState('');
  const [view, setView] = useState<ViewMode>('grid');

  const query = useQuery({
    queryKey: ['reading-passages', page, level, topic],
    queryFn: () => {
      let url = `/reading/passages?page=${page}&limit=12`;
      if (level !== 'all') url += `&level=${level}`;
      if (topic) url += `&topic=${encodeURIComponent(topic)}`;
      return apiClient.get(url).then(r => r.data);
    },
  });

  const passages: Passage[] = query.data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((query.data?.total || 1) / 12));

  const grouped = useMemo(() => {
    const map = new Map<string, Passage[]>();
    const order: string[] = [];
    for (const p of passages) {
      const key = collectionLabel(p);
      if (!map.has(key)) {
        map.set(key, []);
        order.push(key);
      }
      map.get(key)!.push(p);
    }
    // Push standalone bucket to end
    return order
      .sort((a, b) => {
        const aIsStandalone = a === 'Standalone passages';
        const bIsStandalone = b === 'Standalone passages';
        if (aIsStandalone && !bIsStandalone) return 1;
        if (!aIsStandalone && bIsStandalone) return -1;
        return 0;
      })
      .map(key => ({ key, items: map.get(key)! }));
  }, [passages]);

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
        <div className="row" style={{ gap: 8 }}>
          <Link href="/reading/history" className="btn">
            <Clock size={13} /> {t.reading.history}
          </Link>
          <Link
            href={passages[0] ? `/reading/${passages[0].id}` : '/reading'}
            className="btn btn-primary"
            aria-disabled={!passages[0]}
          >
            <Play size={12} /> Random passage
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 10, marginBottom: 16 }}>
        <div className="row" style={{ gap: 16, flexWrap: 'wrap' }}>
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

          <div className="topbar-search" style={{ maxWidth: 260, background: 'var(--bg)', flex: 1, minWidth: 200 }}>
            <Search size={13} />
            <input
              placeholder="Filter by topic — e.g. science, history…"
              value={topic}
              onChange={e => { setTopic(e.target.value); setPage(1); }}
            />
          </div>

          <div className="ml-auto row" style={{ gap: 4 }}>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setView('grid')}
              title="Grid view"
              aria-pressed={view === 'grid'}
              style={{ color: view === 'grid' ? 'var(--primary)' : 'var(--ink-3)' }}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setView('list')}
              title="List view"
              aria-pressed={view === 'list'}
              style={{ color: view === 'list' ? 'var(--primary)' : 'var(--ink-3)' }}
            >
              <ListIcon size={14} />
            </button>
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
      ) : passages.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: 'center', padding: 48 }}>
          <div className="italic-serif" style={{ color: 'var(--ink-3)', fontSize: 14 }}>
            — {t.reading.no_passages}
          </div>
        </div>
      ) : (
        <>
          {grouped.map(({ key, items }) => (
            <div key={key} style={{ marginBottom: 28 }}>
              <div className="row-between" style={{ marginBottom: 10 }}>
                <div className="row" style={{ gap: 10, alignItems: 'baseline' }}>
                  <h2 className="section-title">{key}</h2>
                  <span className="italic-serif" style={{ color: 'var(--ink-3)', fontSize: 12 }}>
                    — {items.length} passage{items.length === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
              {view === 'grid' ? (
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                  {items.map(p => (
                    <PassageCard key={p.id} passage={p} t={t} />
                  ))}
                </div>
              ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {items.map((p, i) => (
                    <PassageRow key={p.id} passage={p} t={t} divider={i < items.length - 1} />
                  ))}
                </div>
              )}
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

function PassageCard({ passage, t }: { passage: Passage; t: any }) {
  const tags = passageTags(passage);
  const qCount = passage._count?.questions ?? 0;
  return (
    <Link
      href={`/reading/${passage.id}`}
      className="card"
      style={{ padding: 0, overflow: 'hidden', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
    >
      <div style={{ padding: '14px 16px' }}>
        <div className="row-between" style={{ marginBottom: 8 }}>
          <span className={`badge badge-primary level-${passage.level}`}>
            <span className={`level-dot level-${passage.level}`} />
            {passage.level}
          </span>
          <span className="badge badge-outline">
            {qCount} {t.reading.questions}
          </span>
        </div>
        <h3
          style={{
            fontFamily: 'var(--ff-display)', fontSize: 17, fontWeight: 500,
            lineHeight: 1.2, color: 'var(--ink)', marginBottom: 8,
          }}
        >
          {passage.title}
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
        <span className="row" style={{ gap: 4 }}>
          <Clock size={12} /> 20 min
        </span>
        <span style={{ color: 'var(--primary)', fontSize: 12 }}>{t.reading.start_practice} →</span>
      </div>
    </Link>
  );
}

function PassageRow({ passage, t, divider }: { passage: Passage; t: any; divider: boolean }) {
  const tags = passageTags(passage);
  const qCount = passage._count?.questions ?? 0;
  return (
    <Link
      href={`/reading/${passage.id}`}
      className="row"
      style={{
        padding: '12px 16px', gap: 12,
        borderBottom: divider ? '1px solid var(--border)' : 0,
        textDecoration: 'none', color: 'inherit',
      }}
    >
      <span className={`badge badge-primary level-${passage.level}`}>
        <span className={`level-dot level-${passage.level}`} />
        {passage.level}
      </span>
      <div className="flex-1" style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--ff-display)', fontSize: 15, fontWeight: 500,
            color: 'var(--ink)', marginBottom: 2,
          }}
        >
          {passage.title}
        </div>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {tags.slice(0, 3).map(name => (
            <span key={name} className="tag">{name}</span>
          ))}
        </div>
      </div>
      <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
        {qCount} {t.reading.questions}
      </span>
      <span className="row" style={{ gap: 4, fontSize: 12, color: 'var(--ink-3)' }}>
        <Clock size={12} /> 20 min
      </span>
      <span style={{ color: 'var(--primary)', fontSize: 12 }}>{t.reading.start_practice} →</span>
    </Link>
  );
}