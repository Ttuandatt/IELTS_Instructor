'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { toast } from 'react-hot-toast';
import { UploadCloud, FileText, Loader2, Save, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import TestRunner from '@/components/reading/TestRunner';
import type { HybridParseResult } from '@/types/hybrid-parser';

function confidenceClass(confidence: number): string {
    if (confidence >= 0.8) return 'bg-emerald-100 text-emerald-700';
    if (confidence >= 0.6) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
}

export default function UploadPassagePage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<HybridParseResult | null>(null);

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
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (!file) return;
        parseMut.mutate(file);
    };

    const handleSave = () => {
        if (!parsedData) return;
        const payload = {
            title: parsedData.passage.title || file?.name.replace(/\.(docx|pdf)$/i, '') || 'Imported Passage',
            level: parsedData.passage.suggested_level ?? 'B2',
            status: 'draft',
            passage: parsedData.passage,
            questions: parsedData.questions,
            parser_used: parsedData.parser_used,
            confidence: parsedData.confidence,
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

            {parsedData ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[80vh]">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                                <CheckCircle2 className="w-5 h-5" />
                                Parsed via <span className="uppercase">{parsedData.parser_used}</span>
                            </div>
                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${confidenceClass(parsedData.confidence)}`}>
                                Confidence {(parsedData.confidence * 100).toFixed(0)}%
                            </span>
                            <span className="text-xs text-gray-500">
                                {parsedData.questions.length} questions · {parsedData.parse_duration_ms}ms
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setParsedData(null)}
                                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2"
                            >
                                Re-upload
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saveMut.isPending}
                                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50"
                            >
                                {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save to Database
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <TestRunner data={parsedData} reviewMode titleOverride="Parser preview (review mode)" />
                    </div>
                </div>
            ) : (
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
            )}
        </div>
    );
}
