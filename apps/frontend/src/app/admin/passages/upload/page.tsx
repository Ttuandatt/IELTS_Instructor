'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { toast } from 'react-hot-toast';
import { UploadCloud, FileText, Loader2, Save, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function UploadPassagePage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<any>(null);

    const parseMut = useMutation({
        mutationFn: async (f: File) => {
            const formData = new FormData();
            formData.append('file', f);
            const res = await apiClient.post('/reading/parse-docx', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data;
        },
        onSuccess: (data) => {
            toast.success('Document parsed successfully!');
            setParsedData(data);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to parse document');
        }
    });

    const saveMut = useMutation({
        mutationFn: async (data: any) => {
            // We will create a new endpoint or use existing to save the whole structure
            // For now, let's just log or send to a placeholder endpoint
            return apiClient.post('/admin/passages/import', data);
        },
        onSuccess: () => {
            toast.success('Saved to database!');
            router.push('/admin/passages');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to save passage');
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (!file) return;
        parseMut.mutate(file);
    };

    const handleSave = () => {
        if (!parsedData) return;
        // In actual implementation, we'll send title, level, etc.
        const payload = {
            title: file?.name.replace(/\.(docx|pdf)$/i, '') || 'Imported Passage',
            level: 'B2',
            status: 'draft',
            passage: parsedData.passage,
            question_groups: parsedData.question_groups,
        };
        saveMut.mutate(payload);
    };

    return (
        <div className={`mx-auto p-6 ${parsedData ? 'max-w-[100rem]' : 'max-w-4xl'}`}>
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/passages" className="text-gray-500 hover:text-gray-900">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Import Reading Lesson</h1>
                    <p className="text-gray-500 text-sm">Upload a .docx or .pdf file containing IELTS reading passage and questions.</p>
                </div>
            </div>

            {!parsedData ? (
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-2xl">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center">
                        <UploadCloud className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                        <p className="text-gray-700 font-medium mb-2">Select a DOCX or PDF file to parse</p>
                        <p className="text-sm text-gray-500 mb-6">File should be specifically formatted for IELTS reading tests.</p>
                        <input
                            type="file"
                            accept=".docx,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="px-6 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors inline-block"
                        >
                            {file ? file.name : "Browse Files"}
                        </label>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleUpload}
                            disabled={!file || parseMut.isPending}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-blue-700 transition"
                        >
                            {parseMut.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                            {parseMut.isPending ? 'AI is Parsing...' : 'Parse Document'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[75vh]">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                            <CheckCircle2 className="w-5 h-5" />
                            Document Parsed Successfully
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saveMut.isPending}
                            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50"
                        >
                            {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save to Database
                        </button>
                    </div>

                    {/* 2-Column Preview */}
                    <div className="flex flex-1 overflow-hidden">
                        {/* Left: Passage Preview */}
                        <div className="w-1/2 p-6 overflow-y-auto border-r border-gray-200">
                            <h3 className="font-bold text-lg mb-4 text-gray-800">Passage Preview</h3>
                            <div
                                className="prose prose-sm max-w-none text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-lg border border-gray-100"
                                dangerouslySetInnerHTML={{ __html: parsedData.passage }}
                            />
                        </div>

                        {/* Right: Questions Preview */}
                        <div className="w-1/2 p-6 overflow-y-auto bg-gray-50/50">
                            <h3 className="font-bold text-lg mb-4 text-gray-800">Parsed Questions ({parsedData.question_groups?.length || 0} groups)</h3>

                            <div className="space-y-6">
                                {parsedData.question_groups?.map((group: any, gIdx: number) => (
                                    <div key={gIdx} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative">
                                        <div className="absolute top-4 right-4 text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded uppercase">
                                            {group.type}
                                        </div>
                                        <div className="font-semibold text-gray-800 pr-20 mb-3">{group.instruction}</div>

                                        <div className="space-y-4">
                                            {group.questions?.map((q: any, qIdx: number) => (
                                                <div key={qIdx} className="pl-4 border-l-2 border-blue-100 text-sm">
                                                    <div className="flex gap-2 text-gray-800">
                                                        <span className="font-bold shrink-0">{q.order_index}.</span>
                                                        <span>{q.prompt}</span>
                                                    </div>

                                                    {q.options && q.options.length > 0 && (
                                                        <div className="mt-2 ml-6 text-gray-600">
                                                            <p className="font-medium text-xs mb-1 text-gray-400 uppercase">Options:</p>
                                                            <ul className="list-disc pl-4 space-y-0.5">
                                                                {q.options.map((opt: string, i: number) => (
                                                                    <li key={i}>{opt}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    <div className="mt-2 ml-6">
                                                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                                            Key: {Array.isArray(q.answer_key) ? q.answer_key.join(', ') : q.answer_key || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
