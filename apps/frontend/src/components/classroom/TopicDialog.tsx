"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Loader2, X } from "lucide-react";
import { toast } from "react-hot-toast";

interface TopicDialogProps {
    isOpen: boolean;
    onClose: () => void;
    classroomId: string;
    topic?: any;
}

export function TopicDialog({ isOpen, onClose, classroomId, topic }: TopicDialogProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({ title: '', description: '' });

    useEffect(() => {
        if (topic) {
            setFormData({ title: topic.title, description: topic.description || '' });
        } else {
            setFormData({ title: '', description: '' });
        }
    }, [topic, isOpen]);

    const { mutate, isPending } = useMutation({
        mutationFn: (data: typeof formData) => {
            if (topic) return apiClient.patch(`/topics/${topic.id}`, data);
            return apiClient.post(`/classrooms/${classroomId}/topics`, data);
        },
        onSuccess: () => {
            toast.success(topic ? 'Topic updated' : 'Topic created');
            queryClient.invalidateQueries({ queryKey: ['classroom', classroomId] });
            onClose();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to save topic');
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold">{topic ? 'Edit Topic' : 'Add New Topic'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Topic Title *</label>
                        <input
                            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Week 1: Introduction to IELTS"
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                            className="w-full border rounded-md px-3 py-2 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="What will students learn in this topic?"
                        />
                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                    <button
                        className="px-4 py-2 border bg-white rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors font-medium"
                        onClick={() => mutate(formData)}
                        disabled={!formData.title.trim() || isPending}
                    >
                        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Topic
                    </button>
                </div>
            </div>
        </div>
    );
}
