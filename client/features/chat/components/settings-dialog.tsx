"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Shield, User, Bot, Sparkles, Check } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useUserProfile } from "@/features/auth/hooks/use-user-profile";
import { signOut } from "@/features/auth/lib/auth-client";
import { authRoutes } from "@/features/auth/lib/auth-routes";
import { useChatPreferences } from "../stores/chat-preferences";

type SettingsDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string;
};

export function SettingsDialog({
    open,
    onOpenChange,
    workspaceId,
}: SettingsDialogProps) {
    const router = useRouter();
    const [isSigningOut, setIsSigningOut] = useState(false);
    const { user: userProfile } = useUserProfile();

    const getPrefs = useChatPreferences((s) => s.getPrefs);
    const setModel = useChatPreferences((s) => s.setModel);
    const chatPrefs = getPrefs(workspaceId);

    async function handleSignOut() {
        setIsSigningOut(true);
        try {
            await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push(authRoutes.login);
                        router.refresh();
                    },
                },
            });
        } finally {
            setIsSigningOut(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#161B20] border border-white/10 text-[#FBF9F5] sm:max-w-md p-6 rounded-2xl shadow-2xl">
                <DialogHeader className="space-y-1 text-left">
                    <DialogTitle className="text-lg font-semibold tracking-tight text-[#FBF9F5] flex items-center gap-2">
                        <Sparkles className="size-4 text-[#D4F843]" />
                        <span>Account & Workspace Settings</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-[#9EA8B3]">
                        Manage your researcher profile and AI diagnostic preferences.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* User Profile Card */}
                    <div className="p-3.5 rounded-xl bg-[#1D232A] border border-white/[0.08] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-gradient-to-br from-[#28313B] to-[#12161A] border border-[#D4F843]/30 flex items-center justify-center text-sm font-semibold text-[#D4F843]">
                                {userProfile?.name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase() ?? "U"}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[#FBF9F5]">
                                    {userProfile?.name ?? "Researcher"}
                                </p>
                                <p className="text-xs text-[#9EA8B3]">
                                    {userProfile?.email ?? "user@ipsakti.in"}
                                </p>
                            </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium tracking-wide uppercase bg-[#D4F843]/10 text-[#D4F843] border border-[#D4F843]/20">
                            {userProfile?.role === "ADMIN" ? "Admin" : "Researcher"}
                        </span>
                    </div>

                    {/* AI Model Preference */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-[#9EA8B3] uppercase tracking-wider block">
                            Diagnostic Model
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: "gpt-4o-mini", label: "GPT-4o Mini", desc: "Fast & Precise" },
                                { id: "gpt-4o", label: "GPT-4o", desc: "Complex Reasoning" },
                            ].map((m) => {
                                const isSelected = chatPrefs.model === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => setModel(workspaceId, m.id as any)}
                                        className={`p-2.5 rounded-xl text-left border transition-all ${
                                            isSelected
                                                ? "bg-[#1D232A] border-[#D4F843]/60 shadow-sm shadow-[#D4F843]/10"
                                                : "bg-[#111417]/60 border-white/[0.06] hover:bg-white/[0.04]"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-[#FBF9F5]">
                                                {m.label}
                                            </span>
                                            {isSelected && (
                                                <Check className="size-3.5 text-[#D4F843]" />
                                            )}
                                        </div>
                                        <span className="text-[10px] text-[#9EA8B3] block mt-0.5">
                                            {m.desc}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sign Out Action */}
                    <div className="pt-2 border-t border-white/[0.06]">
                        <button
                            type="button"
                            onClick={() => void handleSignOut()}
                            disabled={isSigningOut}
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium transition-colors"
                        >
                            <LogOut className="size-3.5" />
                            <span>{isSigningOut ? "Signing out..." : "Sign Out of IP-SAKTI"}</span>
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
