'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import {
  Search, Clock, Headphones, BookOpen, PenLine, Mic,
  type LucideIcon,
} from 'lucide-react';

type Skill = 'reading' | 'writing' | 'listening' | 'speaking';
type SortKey = 'newest' | 'popular' | 'high_ranking';
const PAGE_SIZE = 24;

type SkillTab = { key: Skill; labelKey: keyof ReturnType<typeof useI18n>['t']['library']; Icon: LucideIcon; enabled: boolean };

const SKILL_TABS: SkillTab[] = [
  { key: 'listening', labelKey: 'skill_listening', Icon: Headphones, enabled: false },
  { key: 'reading',   labelKey: 'skill_reading',   Icon: BookOpen,   enabled: true  },
  { key: 'writing',   labelKey: 'skill_writing',   Icon: PenLine,    enabled: true  },
  { key: 'speaking',  labelKey: 'skill_speaking',  Icon: Mic,        enabled: false },
];

type Passage = {
  id: string;
  title: string;
  level?: string;
  collection_id?: string | null;
  collection?: { id: string; name?: string } | string | null;
  _count?: { questions?: number };
};

type Prompt = {
  id: string;
  title: string;
  task_type?: string;
  collection_id?: string | null;
  collection?: { id: string; name?: string } | string | null;
  min_words?: number;
};

type CollectionBlock = {
  key: string;
  title: string;
  subtitle?: string;
  items: Array<{
    id: string;
    label: string;
    metaTop?: string;
    metaBottom: string;
    href: string;
  }>;
};

function collectionGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `linear-gradient(135deg, oklch(0.78 0.12 ${hue}) 0%, oklch(0.62 0.16 ${(hue + 40) % 360}) 100%)`;
}

function readCollection(item: { collection?: any; collection_id?: string | null }): { id: string | null; name: string | null } {
  const c = item.collection;
  if (typeof c === 'string' && c.length > 0) return { id: c, name: c };
  if (c && typeof c === 'object') return { id: c.id ?? null, name: c.name ?? c.id ?? null };
  if (item.collection_id) return { id: item.collection_id, name: item.collection_id };
  return { id: null, name: null };
}

function taskLabel(t?: string) {
  if (t === 'task1' || t === 'Task 1') return 'Task 1';
  if (t === 'task2' || t === 'Task 2') return 'Task 2';
  return t || '';
}

function sortItems(items: any[], sort: SortKey): any[] {
  const arr = [...items];
  if (sort === 'newest') {
    arr.sort((a, b) => String(b.created_at ?? '').localeCompare(String(a.created_at ?? '')));
  } else if (sort === 'popular' || sort === 'high_ranking') {
    arr.sort((a, b) => {
      const ac = a._count?.submissions ?? a._count?.questions ?? 0;
      const bc = b._count?.submissions ?? b._count?.questions ?? 0;
      return bc - ac;
    });
  }
  return arr;
}

export default function LibraryPage() {
  const { t } = useI18n();
  const [skill, setSkill] = useState<Skill>('reading');
  const [sort, setSort] = useState<SortKey>('newest');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const readingQuery = useQuery({
    queryKey: ['library-reading', page, search, sort],
    enabled: skill === 'reading',
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (search) params.set('topic', search);
      return apiClient.get(`/reading/passages?${params}`).then(r => r.data);
    },
  });

  const writingQuery = useQuery({
    queryKey: ['library-writing', page, search, sort],
    enabled: skill === 'writing',
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (search) params.set('topic', search);
      return apiClient.get(`/writing/prompts?${params}`).then(r => r.data);
    },
  });

  const activeQuery = skill === 'reading' ? readingQuery : skill === 'writing' ? writingQuery : null;
  const isLoading = activeQuery?.isLoading ?? false;
  const total: number = activeQuery?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const blocks: CollectionBlock[] = useMemo(() => {
    if (skill === 'reading') {
      const passages: Passage[] = readingQuery.data?.data ?? [];
      const sorted = sortItems(passages, sort) as Passage[];
      const groups = new Map<string, CollectionBlock>();
      for (const p of sorted) {
        const c = readCollection(p);
        const key = c.id ?? '__uncollected__';
        const title = c.name ?? t.library.standalone_passages;
        if (!groups.has(key)) groups.set(key, { key, title, items: [] });
        groups.get(key)!.items.push({
          id: p.id,
          label: p.title,
          metaTop: p.level,
          metaBottom: `${p._count?.questions ?? 0} ${t.reading.questions}`,
          href: `/reading/${p.id}`,
        });
      }
      return finalizeBlocks(groups, t.library.passages_count);
    }
    if (skill === 'writing') {
      const prompts: Prompt[] = writingQuery.data?.data ?? [];
      const sorted = sortItems(prompts, sort) as Prompt[];
      const groups = new Map<string, CollectionBlock>();
      for (const p of sorted) {
        const c = readCollection(p);
        const key = c.id ?? '__uncollected__';
        const title = c.name ?? t.library.standalone_prompts;
        if (!groups.has(key)) groups.set(key, { key, title, items: [] });
        groups.get(key)!.items.push({
          id: p.id,
          label: p.title,
          metaTop: taskLabel(p.task_type),
          metaBottom: p.min_words ? `min ${p.min_words} ${t.writing.word_count.toLowerCase()}` : '',
          href: `/writing/${p.id}`,
        });
      }
      return finalizeBlocks(groups, t.library.prompts_count);
    }
    return [];
  }, [skill, readingQuery.data, writingQuery.data, sort, t]);

  return (
    <div className="fade-in">
      <div className="page-head row-between">
        <div>
          <div className="eyebrow">— {t.library.title}</div>
          <h1 className="page-title">
            {t.library.heading_lead} <em>{t.library.heading_italic}</em>
          </h1>
          <p className="page-subtitle">{t.library.subtitle}</p>
        </div>
        <div className="cd-row" style={{ gap: 8 }}>
          <Link href="/reading/history" className="cd-btn">
            <Clock size={13} /> {t.library.history}
          </Link>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ padding: 10, marginBottom: 16 }}>
        <div className="cd-row" style={{ gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="cd-row" style={{ gap: 6, flexWrap: 'wrap' }}>
            {SKILL_TABS.map(tab => {
              const isActive = tab.key === skill && tab.enabled;
              return (
                <button
                  key={tab.key}
                  className={`library-skill-tab cd-btn ${isActive ? 'cd-btn-primary' : 'cd-btn-sm'}`}
                  data-disabled={!tab.enabled}
                  disabled={!tab.enabled}
                  onClick={() => {
                    if (!tab.enabled) return;
                    setSkill(tab.key);
                    setPage(1);
                  }}
                  type="button"
                >
                  <tab.Icon size={13} />
                  <span>{t.library[tab.labelKey]}</span>
                  {!tab.enabled && (
                    <span className="library-skill-tab-soon">{t.library.coming_soon}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

          <div className="topbar-search" style={{ maxWidth: 280, background: 'var(--bg)', flex: 1, minWidth: 200 }}>
            <Search size={13} />
            <input
              placeholder={t.library.search_placeholder}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div className="cd-row" style={{ gap: 6, marginLeft: 'auto' }}>
            <span className="section-label" style={{ marginRight: 4 }}>{t.library.sort_label}</span>
            {([
              ['newest', t.library.sort_newest],
              ['popular', t.library.sort_popular],
              ['high_ranking', t.library.sort_high_ranking],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                className={`cd-btn cd-btn-sm ${sort === key ? 'cd-btn-primary' : ''}`}
                onClick={() => { setSort(key); setPage(1); }}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="card card-pad" style={{ color: 'var(--ink-3)' }}>{t.common.loading}</div>
      ) : blocks.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: 'center', padding: 48 }}>
          <div className="italic-serif" style={{ color: 'var(--ink-3)', fontSize: 14 }}>
            — {skill === 'reading' ? t.reading.no_passages : t.writing.no_prompts}
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {blocks.map(block => (
              <CollectionRow
                key={block.key}
                block={block}
                countLabelSingular={skill === 'reading' ? t.library.passages_count : t.library.prompts_count}
                collectionLabel={t.library.collection_label}
              />
            ))}
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
                disabled={page * PAGE_SIZE >= total}
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

function finalizeBlocks(groups: Map<string, CollectionBlock>, countWord: string): CollectionBlock[] {
  const arr = Array.from(groups.values());
  for (const b of arr) {
    b.subtitle = `— ${b.items.length} ${countWord}`;
  }
  arr.sort((a, b) => {
    if (a.key === '__uncollected__') return 1;
    if (b.key === '__uncollected__') return -1;
    return a.title.localeCompare(b.title);
  });
  return arr;
}

function CollectionRow({
  block, countLabelSingular: _unused, collectionLabel,
}: {
  block: CollectionBlock;
  countLabelSingular: string;
  collectionLabel: string;
}) {
  return (
    <div
      className="card library-collection-row"
      style={{ padding: 0, overflow: 'hidden' }}
    >
      <div
        className="library-thumb"
        style={{ background: collectionGradient(block.key) }}
      >
        <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.85)' }}>
          — {collectionLabel}
        </div>
        <div>
          <div
            style={{
              fontFamily: 'var(--ff-display)',
              fontSize: 22,
              fontWeight: 500,
              lineHeight: 1.15,
              marginBottom: 4,
            }}
          >
            {block.title}
          </div>
          {block.subtitle && (
            <div className="italic-serif" style={{ fontSize: 12, opacity: 0.92 }}>
              {block.subtitle}
            </div>
          )}
        </div>
      </div>

      <div className="library-volume-grid">
        {block.items.map(item => (
          <Link
            key={item.id}
            href={item.href}
            className="card card-tight library-volume-tile"
          >
            <div className="row-between" style={{ alignItems: 'center' }}>
              {item.metaTop ? (
                <span className="cd-badge cd-badge-outline" style={{ fontSize: 10 }}>
                  {item.metaTop}
                </span>
              ) : <span />}
              <span style={{ color: 'var(--primary)', fontSize: 11 }}>→</span>
            </div>
            <div
              style={{
                fontFamily: 'var(--ff-display)',
                fontSize: 14,
                fontWeight: 500,
                lineHeight: 1.25,
                color: 'var(--ink)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item.label}
            </div>
            {item.metaBottom && (
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                {item.metaBottom}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
