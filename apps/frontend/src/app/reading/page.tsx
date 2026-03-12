'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/providers/I18nProvider';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { BookOpen, Clock, FileText } from 'lucide-react';

export default function ReadingPassagesPage() {
  const { t } = useI18n();
  const [page, setPage] = useState(1);
  const [levelFill, setLevelFill] = useState('all');
  const [tagsFill, setTagsFill] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['reading-passages', page, levelFill, tagsFill],
    queryFn: () => {
      let url = `/reading/passages?page=${page}&limit=12`;
      if (levelFill !== 'all') url += `&level=${levelFill}`;
      if (tagsFill) url += `&topic=${encodeURIComponent(tagsFill)}`;
      return apiClient.get(url).then(r => r.data);
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          Reading Practice
        </h1>
        <p className="mt-2 text-gray-600">Choose a passage below to start practicing your IELTS Reading skills.</p>
      </div>

      <div className="flex gap-4 mb-6">
        <select 
          className="px-4 py-2 border rounded-lg bg-white"
          value={levelFill}
          onChange={(e) => {
            setLevelFill(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All Levels</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
          <option value="B2">B2</option>
          <option value="C1">C1</option>
          <option value="C2">C2</option>
        </select>
        <input 
          type="text" 
          placeholder="Filter by topic..." 
          className="px-4 py-2 border rounded-lg flex-1 max-w-sm"
          value={tagsFill}
          onChange={(e) => {
            setTagsFill(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : !data?.data?.length ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Passages Found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your filters to find more passages.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((p: any) => (
              <Link 
                href={`/reading/${p.id}`} 
                key={p.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      p.level === 'C1' || p.level === 'C2' ? 'bg-purple-100 text-purple-700' :
                      p.level === 'B2' ? 'bg-blue-100 text-blue-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {p.level}
                    </span>
                    <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
                      {p._count?.questions ?? 0} {t.reading.questions}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {p.title}
                  </h3>
                  
                  {p.topic_tags && p.topic_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {p.topic_tags.map((tag: string, i: number) => (
                        <span key={i} className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <div className="flex items-center text-sm text-gray-600 gap-4">
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 20 mins</span>
                    <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {p.topic_tags?.[0] || 'General'}</span>
                  </div>
                  <span className="text-blue-600 font-medium text-sm">Practice →</span>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 flex justify-center items-center gap-4">
            <button 
              disabled={page <= 1} 
              onClick={() => setPage(p => p - 1)} 
              className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {Math.ceil((data.total || 1) / 12)}
            </span>
            <button 
              disabled={page * 12 >= (data.total || 0)} 
              onClick={() => setPage(p => p + 1)} 
              className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
