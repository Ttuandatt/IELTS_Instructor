'use client';

import { useState } from 'react';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export default function InstructorSubmissionsPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<'writing' | 'reading'>('writing');
  const [page, setPage] = useState(1);

  const { data: writingData, isLoading: wLoading } = useQuery({
    queryKey: ['instructor-writing-subs', page],
    queryFn: () => apiClient.get(`/instructor/writing-submissions?page=${page}&limit=20`).then(r => r.data),
    enabled: tab === 'writing',
  });

  const { data: readingData, isLoading: rLoading } = useQuery({
    queryKey: ['instructor-reading-subs', page],
    queryFn: () => apiClient.get(`/instructor/reading-submissions?page=${page}&limit=20`).then(r => r.data),
    enabled: tab === 'reading',
  });

  const data = tab === 'writing' ? writingData : readingData;
  const isLoading = tab === 'writing' ? wLoading : rLoading;

  return (
    <div>
      <h1 className="page-title">{t.instructor.all_submissions}</h1>

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'writing' ? 'tab-btn--active' : ''}`} onClick={() => { setTab('writing'); setPage(1); }}>
          ✍️ {t.instructor.writing_submissions}
        </button>
        <button className={`tab-btn ${tab === 'reading' ? 'tab-btn--active' : ''}`} onClick={() => { setTab('reading'); setPage(1); }}>
          📖 {t.instructor.reading_submissions}
        </button>
      </div>

      {isLoading ? (
        <p>{t.common.loading}</p>
      ) : !data?.data?.length ? (
        <div className="empty-state">{t.common.no_data}</div>
      ) : tab === 'writing' ? (
        <>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.instructor.learner_name}</th>
                  <th>{t.instructor.prompt_title}</th>
                  <th>{t.writing.word_count}</th>
                  <th>{t.common.status}</th>
                  <th>{t.instructor.submission_date}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((s: any) => (
                  <tr key={s.id}>
                    <td>{s.user?.display_name ?? '—'}</td>
                    <td>{s.prompt?.title ?? '—'}</td>
                    <td>{s.word_count}</td>
                    <td><span className={`badge badge-${s.processing_status}`}>{s.processing_status}</span></td>
                    <td>{new Date(s.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn btn-sm">{t.common.previous}</button>
            <span>Page {page} / {Math.ceil((data.total || 1) / 20)}</span>
            <button disabled={page * 20 >= (data.total || 0)} onClick={() => setPage(p => p + 1)} className="btn btn-sm">{t.common.next}</button>
          </div>
        </>
      ) : (
        <>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.instructor.learner_name}</th>
                  <th>{t.instructor.passage_title}</th>
                  <th>{t.reading.score}</th>
                  <th>{t.reading.correct}/{t.common.total}</th>
                  <th>{t.common.date}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((s: any) => (
                  <tr key={s.id}>
                    <td>{s.user?.display_name ?? '—'}</td>
                    <td>{s.passage?.title ?? '—'}</td>
                    <td>{s.score_pct?.toFixed(1)}%</td>
                    <td>{s.correct_count}/{s.total_questions}</td>
                    <td>{new Date(s.completed_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn btn-sm">{t.common.previous}</button>
            <span>Page {page} / {Math.ceil((data.total || 1) / 20)}</span>
            <button disabled={page * 20 >= (data.total || 0)} onClick={() => setPage(p => p + 1)} className="btn btn-sm">{t.common.next}</button>
          </div>
        </>
      )}
    </div>
  );
}
