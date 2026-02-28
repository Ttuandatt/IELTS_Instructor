"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Loader2, X, BookOpen, PenTool, Video, FileText, Trash2, Search } from "lucide-react";
import { toast } from "react-hot-toast";

interface LessonDialogProps {
    isOpen: boolean;
    onClose: () => void;
    topicId: string;
    classroomId: string;
    lesson?: any;
}

const CONTENT_TYPES = [
    { value: 'text', label: '📄 Text / Notes', icon: FileText, desc: 'Markdown or HTML content' },
    { value: 'video', label: '▶️ Video', icon: Video, desc: 'YouTube or Vimeo embed URL' },
    { value: 'passage', label: '📖 Reading Test', icon: BookOpen, desc: 'Link a passage from library' },
    { value: 'prompt', label: '✍️ Writing Test', icon: PenTool, desc: 'Link a writing prompt from library' },
];

export function LessonDialog({ isOpen, onClose, topicId, classroomId, lesson }: LessonDialogProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        content_type: 'text',
        linked_entity_id: '',
        attachment_url: '',
        status: 'draft',
    });
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (lesson) {
            setFormData({
                title: lesson.title,
                content: lesson.content || '',
                content_type: lesson.content_type || 'text',
                linked_entity_id: lesson.linked_entity_id || '',
                attachment_url: lesson.attachment_url || '',
                status: lesson.status || 'draft',
            });
        } else {
            setFormData({ title: '', content: '', content_type: 'text', linked_entity_id: '', attachment_url: '', status: 'draft' });
        }
        setSearch('');
    }, [lesson, isOpen]);

    // Fetch passage library when content_type === 'passage'
    const { data: passages, isLoading: passagesLoading } = useQuery({
        queryKey: ['library-passages'],
        queryFn: () => apiClient.get('/classrooms/library/passages').then(r => r.data),
        enabled: isOpen && formData.content_type === 'passage',
        staleTime: 5 * 60 * 1000,
    });

    // Fetch prompt library when content_type === 'prompt'
    const { data: prompts, isLoading: promptsLoading } = useQuery({
        queryKey: ['library-prompts'],
        queryFn: () => apiClient.get('/classrooms/library/prompts').then(r => r.data),
        enabled: isOpen && formData.content_type === 'prompt',
        staleTime: 5 * 60 * 1000,
    });

    const { mutate: save, isPending } = useMutation({
        mutationFn: (data: typeof formData) => {
            const payload: any = { ...data };
            if (!payload.linked_entity_id) delete payload.linked_entity_id;
            if (!payload.attachment_url) delete payload.attachment_url;
            if (lesson) return apiClient.patch(`/lessons/${lesson.id}`, payload).then(r => r.data);
            return apiClient.post(`/topics/${topicId}/lessons`, payload).then(r => r.data);
        },
        onSuccess: () => {
            toast.success(lesson ? 'Lesson updated!' : 'Lesson created!');
            queryClient.invalidateQueries({ queryKey: ['classroom', classroomId] });
            onClose();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to save lesson');
        },
    });

    const { mutate: deleteLesson, isPending: isDeleting } = useMutation({
        mutationFn: () => apiClient.delete(`/lessons/${lesson?.id}`),
        onSuccess: () => {
            toast.success('Lesson deleted');
            queryClient.invalidateQueries({ queryKey: ['classroom', classroomId] });
            onClose();
        },
        onError: () => toast.error('Failed to delete lesson'),
    });

    if (!isOpen) return null;

    const isLinkType = formData.content_type === 'passage' || formData.content_type === 'prompt';
    const libraryItems = formData.content_type === 'passage' ? passages : prompts;
    const libraryLoading = formData.content_type === 'passage' ? passagesLoading : promptsLoading;
    const filteredLibrary = (libraryItems || []).filter((item: any) =>
        item.title.toLowerCase().includes(search.toLowerCase())
    );
    const selectedItem = (libraryItems || []).find((item: any) => item.id === formData.linked_entity_id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b">
                    <h2 className="text-xl font-bold">{lesson ? 'Edit Lesson' : 'Add New Lesson'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto flex-1 space-y-5">
                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Lesson Title *</label>
                        <input
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Understanding Academic Graphs"
                            autoFocus
                        />
                    </div>

                    {/* Content Type Selection */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Content Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {CONTENT_TYPES.map(ct => (
                                <button
                                    key={ct.value}
                                    type="button"
                                    onClick={() => { setFormData({ ...formData, content_type: ct.value, linked_entity_id: '' }); setSearch(''); }}
                                    className={`flex items-start gap-2 p-3 rounded-lg border text-left transition-all ${formData.content_type === ct.value
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <ct.icon className="w-4 h-4 mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-sm font-medium">{ct.label.replace(/^[^\w]*/, '')}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{ct.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Library picker for passage / prompt */}
                    {isLinkType && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">
                                Select {formData.content_type === 'passage' ? 'Passage' : 'Writing Prompt'} from Library
                            </label>

                            {selectedItem && (
                                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm">
                                    <span className="font-medium text-blue-800 truncate">✓ {selectedItem.title}</span>
                                    <button
                                        onClick={() => setFormData({ ...formData, linked_entity_id: '' })}
                                        className="text-blue-500 hover:text-blue-700 ml-2 shrink-0"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}

                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                                <input
                                    className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder={`Search ${formData.content_type === 'passage' ? 'passages' : 'prompts'}...`}
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                                {libraryLoading ? (
                                    <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /></div>
                                ) : filteredLibrary.length === 0 ? (
                                    <div className="text-center py-6 text-gray-400 text-sm">
                                        {search ? 'No results found.' : `No published ${formData.content_type === 'passage' ? 'passages' : 'prompts'} in library.`}
                                    </div>
                                ) : (
                                    filteredLibrary.map((item: any) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, linked_entity_id: item.id })}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 border-b last:border-b-0 text-left transition-colors text-sm ${formData.linked_entity_id === item.id
                                                ? 'bg-blue-50 text-blue-800 font-medium'
                                                : 'hover:bg-gray-50 text-gray-700'
                                                }`}
                                        >
                                            <span className="truncate">{item.title}</span>
                                            <span className="ml-2 text-xs text-gray-400 shrink-0 uppercase">{item.level || item.task_type}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Video URL */}
                    {formData.content_type === 'video' && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Video URL</label>
                            <input
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                placeholder="https://youtube.com/watch?v=..."
                            />
                        </div>
                    )}

                    {/* Text content */}
                    {formData.content_type === 'text' && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Content <span className="font-normal text-gray-400">(HTML supported)</span></label>
                            <textarea
                                className="w-full border rounded-lg px-3 py-2 min-h-[140px] font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50"
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Write your lesson notes here... HTML is supported."
                            />
                        </div>
                    )}

                    {/* Attachment URL */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Attachment (Optional) <span className="font-normal text-gray-400">URL to PDF, Docs, etc.</span></label>
                        <input
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={formData.attachment_url}
                            onChange={e => setFormData({ ...formData, attachment_url: e.target.value })}
                            placeholder="https://drive.google.com/..."
                        />
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-semibold text-gray-700">Status:</label>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, status: formData.status === 'published' ? 'draft' : 'published' })}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${formData.status === 'published'
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                }`}
                        >
                            {formData.status === 'published' ? '✓ Published' : '○ Draft'}
                        </button>
                        <span className="text-xs text-gray-400">
                            {formData.status === 'draft' ? 'Only visible to you' : 'Visible to all students'}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t bg-gray-50 flex items-center gap-3">
                    {lesson && (
                        <button
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors border border-transparent hover:border-red-200"
                            onClick={() => {
                                if (confirm('Delete this lesson?')) deleteLesson();
                            }}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Delete
                        </button>
                    )}
                    <div className="ml-auto flex gap-2">
                        <button
                            className="px-4 py-2 border bg-white rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium text-sm"
                            onClick={onClose}
                            disabled={isPending}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors font-medium text-sm"
                            onClick={() => save(formData)}
                            disabled={!formData.title.trim() || isPending || (isLinkType && !formData.linked_entity_id)}
                        >
                            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Lesson
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
