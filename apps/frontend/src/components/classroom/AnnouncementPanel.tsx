"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Loader2, Send, Trash2, Megaphone } from "lucide-react";
import { toast } from "react-hot-toast";

interface AnnouncementPanelProps {
    classroomId: string;
    isTeacher: boolean;
}

export function AnnouncementPanel({ classroomId, isTeacher }: AnnouncementPanelProps) {
    const queryClient = useQueryClient();
    const [message, setMessage] = useState('');

    const { data: announcements = [], isLoading } = useQuery({
        queryKey: ['announcements', classroomId],
        queryFn: () => apiClient.get(`/classrooms/${classroomId}/announcements`).then(r => r.data),
    });

    const { mutate: send, isPending: isSending } = useMutation({
        mutationFn: (msg: string) => apiClient.post(`/classrooms/${classroomId}/announcements`, { message: msg }),
        onSuccess: () => {
            toast.success('Announcement sent!');
            setMessage('');
            queryClient.invalidateQueries({ queryKey: ['announcements', classroomId] });
        },
        onError: () => toast.error('Failed to send announcement'),
    });

    const { mutate: deleteAnn } = useMutation({
        mutationFn: (annId: string) => apiClient.delete(`/classrooms/${classroomId}/announcements/${annId}`),
        onSuccess: () => {
            toast.success('Deleted');
            queryClient.invalidateQueries({ queryKey: ['announcements', classroomId] });
        },
        onError: () => toast.error('Failed to delete'),
    });

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 p-4 border-b font-semibold text-gray-800">
                <Megaphone className="w-4 h-4 text-orange-500" />
                Announcements
            </div>

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoading ? (
                    <div className="flex justify-center pt-8"><Loader2 className="w-5 h-5 animate-spin text-blue-400" /></div>
                ) : announcements.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm pt-8">
                        <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>No announcements yet.</p>
                        {isTeacher && <p className="mt-1 text-xs">Type a message below to notify students.</p>}
                    </div>
                ) : (
                    announcements.map((ann: any) => (
                        <div key={ann.id} className="group relative bg-orange-50 border border-orange-100 rounded-lg p-3">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-sm text-gray-800 leading-relaxed">{ann.message}</p>
                                    <p className="text-xs text-gray-400 mt-1.5">
                                        {ann.author?.display_name} · {new Date(ann.created_at).toLocaleDateString('vi-VN')}{' '}
                                        {new Date(ann.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                {isTeacher && (
                                    <button
                                        onClick={() => { if (confirm('Delete this announcement?')) deleteAnn(ann.id); }}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all rounded"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Compose area (teacher only) */}
            {isTeacher && (
                <div className="p-3 border-t bg-gray-50">
                    <div className="flex gap-2">
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey && message.trim()) send(message.trim()); }}
                            placeholder="Write an announcement... (⌘+Enter to send)"
                            className="flex-1 border rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-orange-400 outline-none min-h-[60px]"
                            rows={2}
                        />
                        <button
                            onClick={() => { if (message.trim()) send(message.trim()); }}
                            disabled={!message.trim() || isSending}
                            className="self-end px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                        >
                            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
