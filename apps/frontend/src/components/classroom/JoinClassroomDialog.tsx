"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { X, Loader2, UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface JoinClassroomDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function JoinClassroomDialog({ isOpen, onClose }: JoinClassroomDialogProps) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [code, setCode] = useState("");

    const { mutate: joinClass, isPending } = useMutation({
        mutationFn: () => apiClient.post("/classrooms/join", { invite_code: code.trim() }).then(r => r.data),
        onSuccess: (data) => {
            toast.success(`Joined "${data.classroom_name}" successfully!`);
            queryClient.invalidateQueries({ queryKey: ["classrooms"] });
            onClose();
            setCode("");
            if (data.classroom_id) {
                router.push(`/classrooms/${data.classroom_id}`);
            }
        },
        onError: (err: any) => {
            const msg = err.response?.data?.message;
            if (err.response?.status === 404) {
                toast.error("Class code not found. Please check and try again.");
            } else if (err.response?.status === 409) {
                toast.error("You are already a member of this class.");
            } else if (err.response?.status === 403) {
                toast.error("This class is full.");
            } else {
                toast.error(msg || "Failed to join class.");
            }
        },
    });

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 50,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "1rem",
                background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "var(--color-bg-card)",
                    borderRadius: "var(--radius-xl)",
                    boxShadow: "var(--shadow-xl)",
                    width: "100%", maxWidth: 440,
                    overflow: "hidden",
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "1.25rem 1.5rem",
                    borderBottom: "1px solid var(--color-border)",
                }}>
                    <h2 style={{
                        fontSize: "1.15rem", fontWeight: 700,
                        color: "var(--color-text-primary)", margin: 0,
                    }}>
                        Join Classroom
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "var(--color-text-muted)", padding: 4,
                            borderRadius: "var(--radius-md)",
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: "1.5rem" }}>
                    {/* Class code section */}
                    <div style={{
                        background: "var(--color-bg-tertiary)",
                        borderRadius: "var(--radius-lg)",
                        padding: "1.25rem",
                        marginBottom: "1.25rem",
                    }}>
                        <label style={{
                            display: "block", fontSize: "0.875rem", fontWeight: 600,
                            color: "var(--color-text-primary)", marginBottom: "0.5rem",
                        }}>
                            Class Code
                        </label>
                        <p style={{
                            fontSize: "0.8rem", color: "var(--color-text-muted)",
                            margin: "0 0 0.75rem",
                        }}>
                            Ask your teacher for the class code, then enter it here.
                        </p>
                        <input
                            value={code}
                            onChange={e => setCode(e.target.value.toUpperCase())}
                            placeholder="e.g. ABC12345"
                            maxLength={8}
                            autoFocus
                            style={{
                                width: "100%", padding: "0.65rem 0.85rem",
                                fontSize: "1rem", fontWeight: 500, letterSpacing: "0.1em",
                                border: "2px solid var(--color-border)",
                                borderRadius: "var(--radius-md)",
                                background: "var(--color-bg-card)",
                                color: "var(--color-text-primary)",
                                outline: "none",
                                transition: "border-color 0.2s",
                                boxSizing: "border-box" as any,
                            }}
                            onFocus={e => e.target.style.borderColor = "var(--color-primary)"}
                            onBlur={e => e.target.style.borderColor = "var(--color-border)"}
                        />
                    </div>

                    {/* Hint */}
                    <div style={{
                        fontSize: "0.75rem", color: "var(--color-text-muted)",
                        lineHeight: 1.5,
                    }}>
                        <p style={{ margin: "0 0 0.25rem", fontWeight: 600 }}>How to join with a class code:</p>
                        <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                            <li>Use the code of 5-8 characters, no spaces or symbols</li>
                            <li>You can also join via QR code or invite link from your teacher</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    display: "flex", justifyContent: "flex-end", gap: "0.5rem",
                    padding: "1rem 1.5rem",
                    borderTop: "1px solid var(--color-border)",
                }}>
                    <button
                        onClick={() => { onClose(); setCode(""); }}
                        disabled={isPending}
                        style={{
                            padding: "0.5rem 1rem",
                            background: "transparent",
                            border: "1px solid var(--color-border)",
                            borderRadius: "var(--radius-md)",
                            color: "var(--color-text-primary)",
                            fontWeight: 500, fontSize: "0.875rem",
                            cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => joinClass()}
                        disabled={code.trim().length < 5 || isPending}
                        style={{
                            display: "flex", alignItems: "center", gap: "0.5rem",
                            padding: "0.5rem 1.25rem",
                            background: code.trim().length >= 5 ? "var(--color-primary)" : "var(--color-border)",
                            color: code.trim().length >= 5 ? "#fff" : "var(--color-text-muted)",
                            border: "none",
                            borderRadius: "var(--radius-md)",
                            fontWeight: 600, fontSize: "0.875rem",
                            cursor: code.trim().length >= 5 ? "pointer" : "not-allowed",
                            transition: "all 0.2s",
                        }}
                    >
                        {isPending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                        Join
                    </button>
                </div>
            </div>
        </div>
    );
}
