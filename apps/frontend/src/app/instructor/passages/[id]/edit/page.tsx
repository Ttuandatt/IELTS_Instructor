'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft, UploadCloud, FileText, ChevronDown, ChevronRight, Plus, Trash2, Save, X } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

const QUESTION_TYPES = [
  'matching_headings', 'true_false_notgiven', 'yes_no_notgiven', 'mcq',
  'matching_information', 'matching_features', 'matching_sentence_endings',
  'sentence_completion', 'summary_completion', 'table_completion',
  'flowchart_completion', 'diagram_label_completion', 'short',
] as const;

const TYPES_WITH_OPTIONS = new Set(['mcq', 'matching_headings', 'matching_information', 'matching_features', 'matching_sentence_endings']);

interface QuestionForm {
  type: string;
  prompt: string;
  options: string[];
  answer_key: string;
  explanation: string;
  order_index: number;
}

export default function EditPassagePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<'edit' | 'replace'>('edit');

  // ── Data fetching ──
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['passage', id],
    queryFn: () => apiClient.get(`/instructor/passages/${id}`).then(r => r.data),
  });

  // ── Passage form state ──
  const [form, setForm] = useState({
    title: '', passage: '', level: 'B1', status: 'draft', topic_tags: '',
  });

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title || '',
        passage: data.body || '',
        level: data.level || 'B1',
        status: data.status || 'draft',
        topic_tags: data.topic_tags?.join(', ') || '',
      });
    }
  }, [data]);

  // ── Passage update mutation ──
  const updateMut = useMutation({
    mutationFn: (payload: any) => apiClient.patch(`/instructor/passages/${id}`, payload),
    onSuccess: () => {
      toast.success('Passage updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-passages'] });
      queryClient.invalidateQueries({ queryKey: ['passage', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update passage');
    },
  });

  const handlePassageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMut.mutate({
      ...form,
      topic_tags: form.topic_tags.split(',').map(s => s.trim()).filter(Boolean),
    });
  };

  // ── Questions state ──
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [editingQ, setEditingQ] = useState<Record<string, QuestionForm>>({});
  const [newQuestion, setNewQuestion] = useState<QuestionForm | null>(null);

  const startEditQ = (q: any) => {
    setEditingQ(prev => ({
      ...prev,
      [q.id]: {
        type: q.type,
        prompt: q.prompt || '',
        options: q.options || [],
        answer_key: Array.isArray(q.answer_key) ? q.answer_key.join(', ') : (q.answer_key || ''),
        explanation: q.explanation || '',
        order_index: q.order_index || 0,
      },
    }));
    setExpandedQ(q.id);
  };

  const cancelEditQ = (qId: string) => {
    setEditingQ(prev => { const n = { ...prev }; delete n[qId]; return n; });
    setExpandedQ(null);
  };

  // ── Question mutations ──
  const updateQMut = useMutation({
    mutationFn: ({ qId, data }: { qId: string; data: any }) => apiClient.patch(`/instructor/questions/${qId}`, data),
    onSuccess: (_res, variables) => { toast.success('Question updated'); cancelEditQ(variables.qId); refetch(); },
    onError: () => toast.error('Failed to update question'),
  });

  const createQMut = useMutation({
    mutationFn: (data: any) => apiClient.post(`/instructor/passages/${id}/questions`, data),
    onSuccess: () => { toast.success('Question created'); setNewQuestion(null); refetch(); },
    onError: () => toast.error('Failed to create question'),
  });

  const deleteQMut = useMutation({
    mutationFn: (qId: string) => apiClient.delete(`/instructor/questions/${qId}`),
    onSuccess: () => { toast.success('Question deleted'); refetch(); },
    onError: () => toast.error('Failed to delete question'),
  });

  const handleSaveQ = (qId: string) => {
    const qForm = editingQ[qId];
    if (!qForm) return;
    const { type, ...updateData } = qForm;
    updateQMut.mutate({ qId, data: updateData });
  };

  const handleCreateQ = () => {
    if (!newQuestion) return;
    createQMut.mutate(newQuestion);
  };

  const handleDeleteQ = (qId: string) => {
    if (!confirm('Delete this question?')) return;
    deleteQMut.mutate(qId);
  };

  // ── Replace via File state ──
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);

  const parseMut = useMutation({
    mutationFn: async (f: File) => {
      const formData = new FormData();
      formData.append('file', f);
      const res = await apiClient.post('/reading/parse-docx', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: (d) => { toast.success('Document parsed successfully!'); setParsedData(d); },
    onError: (err: any) => { toast.error(err.response?.data?.message || 'Failed to parse document'); },
  });

  const [replacing, setReplacing] = useState(false);

  const handleReplaceAll = async () => {
    if (!confirm('This will replace the passage content AND all existing questions. This cannot be undone. Continue?')) return;
    setReplacing(true);
    try {
      // 1. Delete existing questions
      for (const q of (data?.questions || [])) {
        await apiClient.delete(`/instructor/questions/${q.id}`);
      }
      // 2. Update passage body
      await apiClient.patch(`/instructor/passages/${id}`, { passage: parsedData.passage });
      // 3. Create new questions from parsed data
      let orderIdx = 0;
      for (const group of (parsedData.question_groups || [])) {
        for (let i = 0; i < (group.questions?.length || 0); i++) {
          const q = group.questions[i];
          let formattedPrompt = q.prompt;
          if (i === 0) {
            let prefix = '';
            if (group.instruction) {
              prefix += `<div class="mb-3 text-gray-800 font-semibold italic border-l-4 border-blue-400 pl-3 text-sm">${group.instruction}</div>`;
            }
            if (group.group_options && Array.isArray(group.group_options) && group.group_options.length > 0) {
              prefix += `<div class="mb-4 p-4 border border-gray-300 rounded-lg bg-white shadow-sm font-medium text-gray-800"><ul class="list-none space-y-1">${group.group_options.map((opt: string) => `<li>${opt}</li>`).join('')}</ul></div>`;
            }
            if (prefix) formattedPrompt = prefix + formattedPrompt;
          }
          orderIdx++;
          await apiClient.post(`/instructor/passages/${id}/questions`, {
            type: group.type,
            prompt: formattedPrompt,
            options: q.options || undefined,
            answer_key: q.answer_key || '',
            order_index: q.order_index || orderIdx,
          });
        }
      }
      toast.success('Passage replaced successfully!');
      queryClient.invalidateQueries({ queryKey: ['passage', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-passages'] });
      setParsedData(null);
      setFile(null);
      setActiveTab('edit');
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Replace failed. Please retry.');
    } finally {
      setReplacing(false);
    }
  };

  // ── Render helpers ──
  const renderQuestionForm = (qForm: QuestionForm, onChange: (f: QuestionForm) => void, isNew: boolean) => (
    <div className="space-y-3 mt-3">
      {isNew ? (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
          <select className="w-full px-3 py-1.5 border rounded-lg text-sm" value={qForm.type} onChange={e => onChange({ ...qForm, type: e.target.value })}>
            {QUESTION_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
          <div className="px-3 py-1.5 bg-gray-100 border rounded-lg text-sm text-gray-600">{qForm.type.replace(/_/g, ' ')}</div>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Prompt</label>
        <input type="text" className="w-full px-3 py-1.5 border rounded-lg text-sm" value={qForm.prompt} onChange={e => onChange({ ...qForm, prompt: e.target.value })} />
      </div>
      {TYPES_WITH_OPTIONS.has(qForm.type) && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Options</label>
          {qForm.options.map((opt, i) => (
            <div key={i} className="flex gap-2 mb-1">
              <input type="text" className="flex-1 px-3 py-1.5 border rounded-lg text-sm" value={opt} onChange={e => { const newOpts = [...qForm.options]; newOpts[i] = e.target.value; onChange({ ...qForm, options: newOpts }); }} />
              <button type="button" className="text-red-400 hover:text-red-600 text-sm" onClick={() => { const newOpts = qForm.options.filter((_, idx) => idx !== i); onChange({ ...qForm, options: newOpts }); }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button type="button" className="text-blue-600 text-xs hover:underline mt-1" onClick={() => onChange({ ...qForm, options: [...qForm.options, ''] })}>+ Add option</button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Answer Key</label>
          <input type="text" className="w-full px-3 py-1.5 border rounded-lg text-sm" value={qForm.answer_key} onChange={e => onChange({ ...qForm, answer_key: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Order Index</label>
          <input type="number" className="w-full px-3 py-1.5 border rounded-lg text-sm" value={qForm.order_index} onChange={e => onChange({ ...qForm, order_index: +e.target.value })} />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Explanation (optional)</label>
        <textarea rows={2} className="w-full px-3 py-1.5 border rounded-lg text-sm" value={qForm.explanation} onChange={e => onChange({ ...qForm, explanation: e.target.value })} />
      </div>
    </div>
  );

  if (isLoading) return <div className="p-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load passage details</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/instructor/passages" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Passage</h1>
          <p className="text-gray-500 text-sm">Update passage content, questions, or replace via file upload</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === 'edit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('edit')}
        >
          Manual Edit
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${activeTab === 'replace' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('replace')}
        >
          Replace via File
        </button>
      </div>

      {/* ── TAB 1: Manual Edit ── */}
      {activeTab === 'edit' && (
        <div className="space-y-8">
          {/* Passage form */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Passage Content</h2>
            <form onSubmit={handlePassageSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passage Content (HTML)</label>
                <textarea rows={12} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" value={form.passage} onChange={e => setForm(f => ({ ...f, passage: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <select className="w-full px-4 py-2 border rounded-lg" value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
                    {['A2', 'B1', 'B2', 'C1'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full px-4 py-2 border rounded-lg" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic Tags</label>
                  <input type="text" placeholder="science, history" className="w-full px-4 py-2 border rounded-lg" value={form.topic_tags} onChange={e => setForm(f => ({ ...f, topic_tags: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50" disabled={updateMut.isPending}>
                  {updateMut.isPending ? 'Saving...' : 'Save Passage'}
                </button>
              </div>
            </form>
          </div>

          {/* Questions section */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Questions ({data?.questions?.length || 0})</h2>
              <button
                type="button"
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                onClick={() => setNewQuestion({ type: 'mcq', prompt: '', options: [], answer_key: '', explanation: '', order_index: (data?.questions?.length || 0) + 1 })}
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
            </div>

            <div className="space-y-3">
              {(data?.questions || []).map((q: any) => (
                <div key={q.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Collapsed header */}
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition"
                    onClick={() => { if (expandedQ === q.id) { cancelEditQ(q.id); } else { startEditQ(q); } }}
                  >
                    {expandedQ === q.id ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
                    <span className="font-bold text-gray-700 shrink-0">{q.order_index}.</span>
                    <span className="text-sm text-gray-700 truncate flex-1" dangerouslySetInnerHTML={{ __html: q.prompt }} />
                    <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-600 rounded shrink-0">{q.type.replace(/_/g, ' ')}</span>
                    <span className="text-xs font-medium px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded shrink-0">Key: {Array.isArray(q.answer_key) ? q.answer_key.join(', ') : q.answer_key || '\u2014'}</span>
                  </button>

                  {/* Expanded edit form */}
                  {expandedQ === q.id && editingQ[q.id] && (
                    <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/50">
                      {renderQuestionForm(editingQ[q.id], (updated) => setEditingQ(prev => ({ ...prev, [q.id]: updated })), false)}
                      <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                        <button type="button" className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm" onClick={() => handleDeleteQ(q.id)}>
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                        <div className="flex gap-2">
                          <button type="button" className="px-4 py-1.5 border rounded-lg text-sm text-gray-600 hover:bg-gray-50" onClick={() => cancelEditQ(q.id)}>Cancel</button>
                          <button type="button" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700" onClick={() => handleSaveQ(q.id)}>
                            <Save className="w-3.5 h-3.5 inline mr-1" />Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* New question form */}
              {newQuestion && (
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50/30">
                  <h3 className="text-sm font-semibold text-blue-700 mb-2">New Question</h3>
                  {renderQuestionForm(newQuestion, setNewQuestion, true)}
                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-blue-200">
                    <button type="button" className="px-4 py-1.5 border rounded-lg text-sm text-gray-600 hover:bg-gray-50" onClick={() => setNewQuestion(null)}>Cancel</button>
                    <button type="button" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700" onClick={handleCreateQ}>Create</button>
                  </div>
                </div>
              )}

              {!data?.questions?.length && !newQuestion && (
                <p className="text-gray-400 text-sm text-center py-6">No questions yet. Click &quot;Add Question&quot; to create one.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: Replace via File ── */}
      {activeTab === 'replace' && (
        <div>
          {!parsedData ? (
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-2xl">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center">
                <UploadCloud className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <p className="text-gray-700 font-medium mb-2">Upload a new DOCX or PDF to replace this passage</p>
                <p className="text-sm text-gray-500 mb-6">This will replace both the passage content and all questions.</p>
                <input type="file" accept=".docx,.pdf" onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} className="hidden" id="replace-file-upload" />
                <label htmlFor="replace-file-upload" className="px-6 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors inline-block">
                  {file ? file.name : 'Browse Files'}
                </label>
              </div>
              <div className="mt-8 flex justify-end">
                <button onClick={() => { if (file) parseMut.mutate(file); }} disabled={!file || parseMut.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700">
                  {parseMut.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                  {parseMut.isPending ? 'AI is Parsing...' : 'Parse Document'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Preview: Current vs New</h3>
                <div className="flex gap-3">
                  <button onClick={() => { setParsedData(null); setFile(null); }} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button onClick={handleReplaceAll} disabled={replacing} className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                    {replacing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {replacing ? 'Replacing...' : 'Replace All'}
                  </button>
                </div>
              </div>

              {/* 2-column comparison */}
              <div className="flex h-[65vh]">
                {/* Left: Current */}
                <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
                  <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-sm font-medium text-amber-700">Current Passage</div>
                  <div className="p-4">
                    <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg border" dangerouslySetInnerHTML={{ __html: data?.body || '<em>No content</em>' }} />
                    <h4 className="font-semibold text-gray-700 mt-4 mb-2">Questions ({data?.questions?.length || 0})</h4>
                    {(data?.questions || []).map((q: any) => (
                      <div key={q.id} className="text-sm py-1 border-b border-gray-100">
                        <span className="font-bold">{q.order_index}.</span> <span dangerouslySetInnerHTML={{ __html: q.prompt }} /> <span className="text-emerald-600 text-xs ml-2">[{q.answer_key}]</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Right: New */}
                <div className="w-1/2 overflow-y-auto">
                  <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-sm font-medium text-emerald-700">New from File</div>
                  <div className="p-4">
                    <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg border" dangerouslySetInnerHTML={{ __html: parsedData.passage }} />
                    <h4 className="font-semibold text-gray-700 mt-4 mb-2">Questions ({parsedData.question_groups?.reduce((sum: number, g: any) => sum + (g.questions?.length || 0), 0) || 0})</h4>
                    {parsedData.question_groups?.map((group: any, gIdx: number) => (
                      <div key={gIdx} className="mb-3">
                        <div className="text-xs font-bold text-blue-600 uppercase mb-1">{group.type.replace(/_/g, ' ')}</div>
                        {group.instruction && <div className="text-xs text-gray-500 italic mb-1">{group.instruction}</div>}
                        {group.questions?.map((q: any, qIdx: number) => (
                          <div key={qIdx} className="text-sm py-1 border-b border-gray-100">
                            <span className="font-bold">{q.order_index}.</span> {q.prompt} <span className="text-emerald-600 text-xs ml-2">[{q.answer_key || 'N/A'}]</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
