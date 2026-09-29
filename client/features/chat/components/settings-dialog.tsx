"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Sparkles, Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
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
    const { theme, setTheme } = useTheme();

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
            <DialogContent className="bg-[#FAF8F5] dark:bg-[#161B20] border-2 border-neutral-900 dark:border-white/20 text-neutral-900 dark:text-[#FBF9F5] sm:max-w-md p-6 rounded-[24px] shadow-[4px_4px_0px_0px_#121212] dark:shadow-none">
                <DialogHeader className="space-y-1 text-left">
                    <DialogTitle className="text-lg font-heading font-extrabold tracking-tight text-neutral-900 dark:text-[#FBF9F5] flex items-center gap-2">
                        <div className="size-6 rounded-md bg-lime-300 border border-neutral-900 flex items-center justify-center">
                            <Sparkles className="size-3.5 text-neutral-900" />
                        </div>
                        <span>Account & Workspace Settings</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-neutral-600 dark:text-[#9EA8B3]">
                        Manage your researcher profile and app appearance.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* User Profile Card */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#1D232A] border-2 border-neutral-900 dark:border-white/[0.08] flex items-center justify-between shadow-[2px_2px_0px_0px_#121212] dark:shadow-none">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-lime-300 border border-neutral-900 flex items-center justify-center text-sm font-bold text-neutral-900">
                                {userProfile?.name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase() ?? "U"}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-neutral-900 dark:text-[#FBF9F5]">
                                    {userProfile?.name ?? "Researcher"}
                                </p>
                                <p className="text-xs text-neutral-600 dark:text-[#9EA8B3]">
                                    {userProfile?.email ?? "user@ipsakti.in"}
                                </p>
                            </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wide uppercase bg-lime-300 text-neutral-900 border border-neutral-900">
                            {userProfile?.role === "ADMIN" ? "Admin" : "Scholar"}
                        </span>
                    </div>

                    {/* Theme Mode Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-mono font-bold text-neutral-600 dark:text-[#9EA8B3] uppercase tracking-wider block">
                            Appearance Theme
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: "light", label: "Light", icon: Sun },
                                { id: "dark", label: "Dark", icon: Moon },
                                { id: "system", label: "System", icon: Laptop },
                            ].map((t) => {
                                const isSelected = theme === t.id;
                                const IconComp = t.icon;
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setTheme(t.id)}
                                        className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 transition-all ${
                                            isSelected
                                                ? "bg-neutral-900 text-lime-300 border-neutral-900 shadow-[2px_2px_0px_0px_#121212] font-bold"
                                                : "bg-white dark:bg-[#111417] text-neutral-700 dark:text-[#9EA8B3] border-neutral-900/20 dark:border-white/10 hover:border-neutral-900/50"
                                        }`}
                                    >
                                        <IconComp className="size-3.5" />
                                        <span className="text-xs">{t.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sign Out Action */}
                    <div className="pt-2 border-t border-neutral-900/10 dark:border-white/[0.06]">
                        <button
                            type="button"
                            onClick={() => void handleSignOut()}
                            disabled={isSigningOut}
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-bold transition-colors"
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
