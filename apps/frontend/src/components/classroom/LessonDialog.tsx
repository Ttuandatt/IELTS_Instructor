"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Loader2, X, BookOpen, PenTool, Video, FileText, Trash2, Search, Library, Upload, Link2, File } from "lucide-react";
import { toast } from "react-hot-toast";

interface LessonDialogProps {
    isOpen: boolean;
    onClose: () => void;
    topicId: string;
    classroomId: string;
    lesson?: any;
}

const CONTENT_TYPES = [
    { value: 'text', label: 'Text / Notes', icon: FileText, desc: 'Markdown or HTML content' },
    { value: 'video', label: 'Video', icon: Video, desc: 'YouTube or Vimeo URL' },
    { value: 'passage', label: 'Reading Test', icon: BookOpen, desc: 'Link a passage' },
    { value: 'prompt', label: 'Writing Test', icon: PenTool, desc: 'Link a writing prompt' },
];

type LinkMode = 'library' | 'upload' | null;
type UploadMethod = 'file' | 'url';

export function LessonDialog({ isOpen, onClose, topicId, classroomId, lesson }: LessonDialogProps) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        content_type: 'text',
        linked_entity_id: '',
        attachment_url: '',
        status: 'draft',
    });
    const [search, setSearch] = useState('');
    const [linkMode, setLinkMode] = useState<LinkMode>(null);
    const [uploadMethod, setUploadMethod] = useState<UploadMethod>('file');
    const [uploadedFileName, setUploadedFileName] = useState('');
    const [isUploading, setIsUploading] = useState(false);

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
            const isLinkType = lesson.content_type === 'passage' || lesson.content_type === 'prompt';
            if (isLinkType) {
                if (lesson.linked_entity_id) {
                    setLinkMode('library');
                } else if (lesson.attachment_url) {
                    setLinkMode('upload');
                    setUploadMethod('url');
                } else {
                    setLinkMode(null);
                }
            } else {
                setLinkMode(null);
            }
        } else {
            setFormData({ title: '', content: '', content_type: 'text', linked_entity_id: '', attachment_url: '', status: 'draft' });
            setLinkMode(null);
            setUploadedFileName('');
        }
        setSearch('');
    }, [lesson, isOpen]);

    // Fetch passage library
    const { data: passages, isLoading: passagesLoading } = useQuery({
        queryKey: ['library-passages'],
        queryFn: () => apiClient.get('/classrooms/library/passages').then(r => r.data),
        enabled: isOpen && formData.content_type === 'passage' && linkMode === 'library',
        staleTime: 5 * 60 * 1000,
    });

    // Fetch prompt library
    const { data: prompts, isLoading: promptsLoading } = useQuery({
        queryKey: ['library-prompts'],
        queryFn: () => apiClient.get('/classrooms/library/prompts').then(r => r.data),
        enabled: isOpen && formData.content_type === 'prompt' && linkMode === 'library',
        staleTime: 5 * 60 * 1000,
    });

    const handleFileUpload = async (file: globalThis.File) => {
        setIsUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await apiClient.post('/uploads', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const baseUrl = backendUrl.replace(/\/api$/, '');
            setFormData(prev => ({
                ...prev,
                attachment_url: `${baseUrl}${res.data.url}`,
                // Auto-fill content with extracted HTML from uploaded file
                content: res.data.extractedHtml || prev.content,
            }));
            setUploadedFileName(res.data.originalName);
            if (res.data.extractedHtml) {
                toast.success('File uploaded & content extracted!');
            } else {
                toast.success('File uploaded!');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const { mutate: save, isPending } = useMutation({
        mutationFn: (data: typeof formData) => {
            const payload: any = { ...data };
            if (linkMode === 'upload') {
                delete payload.linked_entity_id;
            }
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
    const contentLabel = formData.content_type === 'passage' ? 'Passage' : 'Writing Prompt';

    const isLinkValid = !isLinkType || (
        (linkMode === 'library' && formData.linked_entity_id) ||
        (linkMode === 'upload' && formData.attachment_url.trim())
    );

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

                    {/* Content Type */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Content Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {CONTENT_TYPES.map(ct => (
                                <button
                                    key={ct.value}
                                    type="button"
                                    onClick={() => {
                                        setFormData({ ...formData, content_type: ct.value, linked_entity_id: '', attachment_url: '' });
                                        setLinkMode(null);
                                        setSearch('');
                                        setUploadedFileName('');
                                    }}
                                    className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${formData.content_type === ct.value
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <ct.icon className={`w-4 h-4 shrink-0 ${formData.content_type === ct.value ? 'text-blue-500' : 'text-gray-400'}`} />
                                    <div>
                                        <div className="text-sm font-medium">{ct.label}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{ct.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Link Mode Selector (passage/prompt) */}
                    {isLinkType && (
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-700">
                                How would you like to add the {contentLabel}?
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLinkMode('library');
                                        setFormData(prev => ({ ...prev, attachment_url: '' }));
                                        setUploadedFileName('');
                                    }}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${linkMode === 'library'
                                        ? 'border-blue-500 bg-blue-50/50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                        }`}
                                >
                                    <Library className={`w-5 h-5 ${linkMode === 'library' ? 'text-blue-500' : 'text-gray-400'}`} />
                                    <div className="text-center">
                                        <div className="text-sm font-semibold">Choose from Library</div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            Browse existing {formData.content_type === 'passage' ? 'passages' : 'prompts'}
                                        </div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setLinkMode('upload');
                                        setFormData(prev => ({ ...prev, linked_entity_id: '' }));
                                    }}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${linkMode === 'upload'
                                        ? 'border-blue-500 bg-blue-50/50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                        }`}
                                >
                                    <Upload className={`w-5 h-5 ${linkMode === 'upload' ? 'text-blue-500' : 'text-gray-400'}`} />
                                    <div className="text-center">
                                        <div className="text-sm font-semibold">Upload File</div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            From device or paste URL
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Library Picker */}
                    {isLinkType && linkMode === 'library' && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">
                                Select {contentLabel} from Library
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

                    {/* Upload File */}
                    {isLinkType && linkMode === 'upload' && (
                        <div className="space-y-4">
                            {/* Upload method tabs */}
                            <div className="flex border-b">
                                <button
                                    type="button"
                                    onClick={() => setUploadMethod('file')}
                                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${uploadMethod === 'file'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <File className="w-3.5 h-3.5" />
                                    From Device
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUploadMethod('url')}
                                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${uploadMethod === 'url'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Link2 className="w-3.5 h-3.5" />
                                    Paste URL
                                </button>
                            </div>

                            {/* File picker */}
                            {uploadMethod === 'file' && (
                                <div className="space-y-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp"
                                        className="hidden"
                                        onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileUpload(file);
                                        }}
                                    />
                                    {formData.attachment_url && uploadedFileName ? (
                                        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2.5 text-sm">
                                            <div className="flex items-center gap-2 text-green-800 truncate">
                                                <File className="w-4 h-4 shrink-0" />
                                                <span className="font-medium truncate">{uploadedFileName}</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, attachment_url: '' }));
                                                    setUploadedFileName('');
                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                }}
                                                className="text-green-600 hover:text-green-800 ml-2 shrink-0"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-8 flex flex-col items-center gap-2 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
                                        >
                                            {isUploading ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : (
                                                <Upload className="w-6 h-6" />
                                            )}
                                            <span className="text-sm font-medium">
                                                {isUploading ? 'Uploading...' : 'Click to choose file'}
                                            </span>
                                            <span className="text-xs text-gray-400">PDF, DOC, DOCX, TXT, images — Max 10MB</span>
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* URL input */}
                            {uploadMethod === 'url' && (
                                <div className="space-y-1.5">
                                    <input
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={formData.attachment_url}
                                        onChange={e => setFormData({ ...formData, attachment_url: e.target.value })}
                                        placeholder="https://drive.google.com/... or any accessible URL"
                                    />
                                    <p className="text-xs text-gray-400">Google Docs, PDF link, or any URL students can access</p>
                                </div>
                            )}

                            {/* Instructions */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">
                                    Instructions <span className="font-normal text-gray-400">(Optional)</span>
                                </label>
                                <textarea
                                    className="w-full border rounded-lg px-3 py-2 min-h-[80px] text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50"
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Write instructions or description for this exercise..."
                                />
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

                    {/* Attachment URL for non-link types */}
                    {!isLinkType && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Attachment <span className="font-normal text-gray-400">(Optional)</span></label>
                            <input
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.attachment_url}
                                onChange={e => setFormData({ ...formData, attachment_url: e.target.value })}
                                placeholder="URL to PDF, Docs, etc."
                            />
                        </div>
                    )}

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
                            disabled={!formData.title.trim() || isPending || !isLinkValid || isUploading}
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
