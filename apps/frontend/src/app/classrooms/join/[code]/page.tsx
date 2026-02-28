"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function JoinClassroomPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const code = params.code as string;

    const { data: classroom, isLoading, isError } = useQuery({
        queryKey: ['classroom-join', code],
        queryFn: () => apiClient.get(`/classrooms/invite/${code}`).then(r => r.data),
        retry: false
    });

    const { mutate: joinClassroom, isPending } = useMutation({
        mutationFn: () => apiClient.post(`/classrooms/join`, { invite_code: code }).then(r => r.data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['classrooms'] });
            router.push(`/classrooms/${data.classroom_id}`);
        },
        onError: (err: any) => {
            // Could be already joined or error
            if (err.response?.status === 409) {
                router.push(`/classrooms`);
            }
        }
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500">Looking up invitation...</p>
            </div>
        );
    }

    if (isError || !classroom) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Invalid Invitation</h1>
                <p className="text-gray-500 mb-6">
                    This invite link is invalid or has expired. Please ask your instructor for a new link.
                </p>
                <Link href="/classrooms">
                    <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors">Return to My Classrooms</button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
            <div className="w-full max-w-md border shadow-lg rounded-xl bg-white overflow-hidden text-center">
                {classroom.cover_image_url ? (
                    <div className="h-40 w-full overflow-hidden">
                        <img src={classroom.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="h-40 w-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                        <CheckCircle2 className="w-16 h-16 text-white/50" />
                    </div>
                )}

                <div className="p-8">
                    <h2 className="text-2xl font-bold mb-2">{classroom.name}</h2>
                    <p className="text-gray-500 mb-6 line-clamp-3">
                        {classroom.description || "You've been invited to join this classroom."}
                    </p>

                    <button
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                        onClick={() => joinClassroom()}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <span className="flex items-center justify-center">
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Joining...
                            </span>
                        ) : "Accept Invitation"}
                    </button>

                    <div className="mt-4">
                        <Link href="/classrooms" className="text-sm text-gray-500 hover:text-gray-800">
                            Skip for now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
