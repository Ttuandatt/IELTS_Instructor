"use client";

import { useState, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Loader2, ArrowLeft, UserPlus, Link as LinkIcon, Users, Trash2, Mail, Copy, RefreshCw, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function ClassroomMembersPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const queryClient = useQueryClient();
    const [emailInput, setEmailInput] = useState('');
    const [inviteModalOpen, setInviteModalOpen] = useState(false);

    // Fetch Classroom detail (for teacher checks & basic info)
    const { data: classroom, isLoading: isLoadingClassroom } = useQuery({
        queryKey: ['classroom', id],
        queryFn: () => apiClient.get(`/classrooms/${id}`).then(r => r.data),
    });

    // Fetch Members list
    const { data: members, isLoading: isLoadingMembers } = useQuery({
        queryKey: ['classroom-members', id],
        queryFn: () => apiClient.get(`/classrooms/${id}/members`).then(r => r.data),
    });

    // Fetch Invite details (QR code, link)
    const { data: inviteData, refetch: refetchInviteData } = useQuery({
        queryKey: ['classroom-invite', id],
        queryFn: () => apiClient.get(`/classrooms/${id}/invite`).then(r => r.data),
        enabled: !!classroom && classroom.role === 'teacher',
    });

    // Mutations
    const { mutate: addMember, isPending: isAddingMember } = useMutation({
        mutationFn: (email: string) => apiClient.post(`/classrooms/${id}/members`, { email }).then(r => r.data),
        onSuccess: () => {
            toast.success('Member added successfully!');
            setEmailInput('');
            queryClient.invalidateQueries({ queryKey: ['classroom-members', id] });
            queryClient.invalidateQueries({ queryKey: ['classroom', id] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to add member. Make sure they have a registered account.');
        }
    });

    const { mutate: removeMember, isPending: isRemovingMember } = useMutation({
        mutationFn: (userId: string) => apiClient.delete(`/classrooms/${id}/members/${userId}`),
        onSuccess: () => {
            toast.success('Member removed.');
            queryClient.invalidateQueries({ queryKey: ['classroom-members', id] });
            queryClient.invalidateQueries({ queryKey: ['classroom', id] });
        }
    });

    const { mutate: regenerateInvite, isPending: isRegenerating } = useMutation({
        mutationFn: () => apiClient.post(`/classrooms/${id}/invite/regenerate`),
        onSuccess: () => {
            toast.success('Invite link reset.');
            refetchInviteData();
        }
    });

    if (isLoadingClassroom || isLoadingMembers) {
        return <div className="flex pt-20 justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    }

    if (!classroom) return <div className="text-center pt-20 text-red-500">Classroom not found</div>;

    const isTeacher = classroom.role === 'teacher';

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Link href={`/classrooms/${id}`} className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors text-sm">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Classroom
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" /> People
                    </h1>
                    <p className="text-gray-500 mt-1">Manage instructors and students in {classroom.name}</p>
                </div>

                {isTeacher && (
                    <div className="flex gap-3">
                        {inviteData && (
                            <button
                                className="border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 font-medium py-2 px-4 rounded-md flex items-center transition-colors shadow-sm"
                                onClick={() => setInviteModalOpen(true)}
                            >
                                <LinkIcon className="w-4 h-4 mr-2" /> Share Invite Link
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Members List */}
                    <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
                        <div className="p-6 border-b bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">Classroom Members ({members?.length || 0} / {classroom.max_members})</h2>
                            <p className="text-sm text-gray-500 mt-1">Everyone currently enrolled in the class.</p>
                        </div>
                        <div className="p-0">
                            <div className="divide-y">
                                {members?.map((member: any) => (
                                    <div key={member.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            {/* Avatar placeholder */}
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 uppercase">
                                                {member.user.email.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                                    {member.user.email}
                                                    {member.role === 'teacher' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 uppercase">Teacher</span>}
                                                </div>
                                                <div className="text-sm text-gray-500">Joined {new Date(member.joined_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>

                                        {isTeacher && member.role !== 'teacher' && (
                                            <button
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-md transition-colors"
                                                onClick={() => {
                                                    if (confirm(`Remove ${member.user.email} from this classroom?`)) {
                                                        removeMember(member.user_id);
                                                    }
                                                }}
                                                disabled={isRemovingMember}
                                                title="Remove student"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {members?.length === 0 && (
                                    <div className="p-8 text-center text-gray-500">No members found.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {isTeacher && (
                    <div className="space-y-6">
                        {/* Direct Add Card */}
                        <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
                            <div className="p-6 border-b bg-gray-50">
                                <h3 className="text-lg font-bold">Add Student</h3>
                                <p className="text-xs text-gray-500 mt-1">Directly enroll a user if they already have an account on the platform.</p>
                            </div>
                            <div className="p-6">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (emailInput.trim()) addMember(emailInput);
                                    }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Student Email Address</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                                <input
                                                    type="email"
                                                    placeholder="learner@example.com"
                                                    value={emailInput}
                                                    onChange={(e) => setEmailInput(e.target.value)}
                                                    className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium text-sm disabled:opacity-50 flex items-center justify-center transition-colors"
                                        disabled={!emailInput.trim() || isAddingMember}
                                    >
                                        {isAddingMember ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                                        Add Student
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Invite Modal Overlay */}
            {inviteModalOpen && inviteData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold">Share Invitation</h2>
                            <button
                                onClick={() => setInviteModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <p className="text-sm text-gray-600">
                                Anyone with this link or QR code can join your classroom directly without needing manual approval.
                            </p>

                            <div className="flex flex-col items-center justify-center space-y-3 bg-gray-50 border border-gray-100 p-6 rounded-xl">
                                {inviteData.qr_code_base64 && (
                                    <img src={inviteData.qr_code_base64} alt="Classroom QR Code" className="w-48 h-48 border bg-white p-2 rounded-lg shadow-sm" />
                                )}
                                <div className="bg-blue-50 text-blue-700 font-mono text-xl tracking-widest px-4 py-2 rounded-md font-bold mt-2 border border-blue-100">
                                    {inviteData.invite_code}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Invite URL</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        readOnly
                                        value={inviteData.invite_url}
                                        className="flex-1 bg-gray-100 border border-gray-200 text-gray-600 text-sm px-3 py-2 rounded-md outline-none"
                                    />
                                    <button
                                        className="border border-gray-300 hover:bg-gray-50 p-2 rounded-md transition-colors"
                                        onClick={() => {
                                            navigator.clipboard.writeText(inviteData.invite_url);
                                            toast.success('Link copied to clipboard');
                                        }}
                                        title="Copy Link"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 border-t mt-4 flex justify-between items-center">
                                <p className="text-xs text-gray-500 max-w-[200px]">Link leaked? Regenerate it to invalidate the old one.</p>
                                <button
                                    className="text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 text-sm font-medium py-1.5 px-3 rounded flex items-center transition-colors"
                                    onClick={() => {
                                        if (confirm('Are you sure? All previous QR codes and links will stop working immediately.')) {
                                            regenerateInvite();
                                        }
                                    }}
                                    disabled={isRegenerating}
                                >
                                    <RefreshCw className={`w-4 h-4 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
                                    Reset Code
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
