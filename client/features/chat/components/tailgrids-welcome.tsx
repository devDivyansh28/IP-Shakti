"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Globe, Paperclip, Sparkles } from "lucide-react";
import { useUserProfile } from "@/features/auth/hooks/use-user-profile";
import {
    useChatPreferences,
    type ChatJurisdiction,
} from "../stores/chat-preferences";

type TailgridsWelcomeProps = {
    workspaceId: string;
    onSendMessage: (text: string, jurisdiction?: ChatJurisdiction) => void;
    isSubmitting?: boolean;
};

export function TailgridsWelcome({
    workspaceId,
    onSendMessage,
    isSubmitting = false,
}: TailgridsWelcomeProps) {
    const [promptText, setPromptText] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { user: userProfile } = useUserProfile();
    const storedJurisdiction = useChatPreferences(
        (s) => s.byWorkspace[workspaceId]?.jurisdiction ?? "BOTH",
    );
    const setJurisdiction = useChatPreferences((s) => s.setJurisdiction);
    const isWebSearchActive = useChatPreferences(
        (s) => s.byWorkspace[workspaceId]?.webSearch ?? false,
    );
    const setWebSearch = useChatPreferences((s) => s.setWebSearch);

    // Instant local state for immediate 0ms UI reactivity
    const [selectedJurisdiction, setSelectedJurisdiction] =
        useState<ChatJurisdiction>(storedJurisdiction);

    useEffect(() => {
        setSelectedJurisdiction(storedJurisdiction);
    }, [storedJurisdiction]);

    // Personalized first name
    const firstName = useMemo(() => {
        if (!userProfile?.name) return "there";
        return userProfile.name.trim().split(" ")[0];
    }, [userProfile]);

    function handleSubmit(e?: React.FormEvent) {
        if (e) e.preventDefault();
        const trimmed = promptText.trim();
        if (!trimmed || isSubmitting) return;

        onSendMessage(trimmed, selectedJurisdiction);
        setPromptText("");
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    function handleJurisdictionClick(jur: ChatJurisdiction) {
        setSelectedJurisdiction(jur);
        setJurisdiction(workspaceId, jur);
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full text-center relative z-10 font-sans">
            {/* 1. Centered Greeting (Landing Page Figtree Typography) */}
            <div className="space-y-3 mb-8">
                <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-neutral-900 dark:text-[#FBF9F5]">
                    Hey {firstName}, How Can I Assist?
                </h1>
                <p className="font-sans text-sm sm:text-base text-neutral-600 dark:text-[#9EA8B3] max-w-lg mx-auto font-normal leading-relaxed">
                    Check novelty, verify prior art, and navigate compliance in seconds.
                </p>
            </div>

            {/* 2. Floating Tactile Card (Exact Landing Page Brutalist Pattern) */}
            <div className="relative w-full max-w-2xl bg-[#FAF8F5] dark:bg-[#161B20] border-2 border-neutral-900 dark:border-white/20 rounded-[24px] p-5 shadow-[4px_4px_0px_0px_#121212] dark:shadow-[4px_4px_0px_0px_#D4F843]/30 transition-all text-left overflow-hidden">
                {/* Folded Paper Corner Notch (Top-Right Dog-Ear from Landing Page) */}
                <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none z-20">
                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[48px] border-t-[#F7F4EE] dark:border-t-[#111417] border-l-[48px] border-l-transparent drop-shadow-[-1px_1px_1px_rgba(0,0,0,0.15)]" />
                    <div className="absolute top-0 right-0 w-12 h-12 border-b border-l border-neutral-900/30 dark:border-white/20" />
                    <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-[2px] bg-lime-300 border border-neutral-900" />
                </div>

                {/* Textarea */}
                <textarea
                    rows={3}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything..."
                    disabled={isSubmitting}
                    className="w-full bg-transparent text-neutral-900 dark:text-[#FBF9F5] placeholder-neutral-500 dark:placeholder-[#6C7684] text-sm sm:text-base resize-none focus:outline-none scrollbar-none font-sans"
                />

                {/* Integrated Bottom Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-900/10 dark:border-white/[0.08] mt-2">
                    {/* Left Controls: Attach + Self-Explanatory Web Search + Reactive Jurisdiction */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                        />

                        {/* Attach button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            title="Attach lab notes or formulation draft"
                            className="p-1.5 rounded-lg text-neutral-700 dark:text-[#9EA8B3] hover:text-neutral-900 dark:hover:text-[#FBF9F5] hover:bg-neutral-200/60 dark:hover:bg-white/[0.06] border border-neutral-900/10 dark:border-white/10 transition-colors"
                        >
                            <Paperclip className="size-4" />
                        </button>

                        {/* Self-Explanatory Web Search Pill Button */}
                        <button
                            type="button"
                            onClick={() =>
                                setWebSearch(workspaceId, !isWebSearchActive)
                            }
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                                isWebSearchActive
                                    ? "bg-lime-300 border-neutral-900 text-neutral-900 font-bold shadow-[2px_2px_0px_0px_#121212] dark:shadow-none"
                                    : "bg-white dark:bg-[#111417] text-neutral-700 dark:text-[#9EA8B3] border-neutral-900/20 dark:border-white/10 hover:border-neutral-900/50"
                            }`}
                        >
                            <Globe className="size-3.5" />
                            <span>
                                {isWebSearchActive ? "Web Search: ON" : "Web Search: OFF"}
                            </span>
                        </button>

                        {/* 3-State Jurisdiction Toggle (Brutalist Tactile Styling) */}
                        <div className="inline-flex items-center rounded-lg bg-neutral-200/60 dark:bg-[#0E1216] p-0.5 border border-neutral-900/20 dark:border-white/10">
                            {(
                                [
                                    { id: "INDIA", label: "India" },
                                    {
                                        id: "INTERNATIONAL",
                                        label: "International",
                                    },
                                    { id: "BOTH", label: "Both" },
                                ] as const
                            ).map((opt) => {
                                const isActive =
                                    selectedJurisdiction === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() =>
                                            handleJurisdictionClick(opt.id)
                                        }
                                        className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${
                                            isActive
                                                ? "bg-neutral-900 text-lime-300 dark:bg-[#28313B] dark:text-[#D4F843] font-bold shadow-sm"
                                                : "text-neutral-700 dark:text-[#9EA8B3] hover:text-neutral-900 dark:hover:text-[#FBF9F5]"
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Control: Circular Send Button with Tactile Ink Border */}
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            type="button"
                            onClick={() => handleSubmit()}
                            disabled={!promptText.trim() || isSubmitting}
                            className={`size-9 rounded-full flex items-center justify-center border-2 border-neutral-900 dark:border-white/20 transition-all ${
                                promptText.trim() && !isSubmitting
                                    ? "bg-lime-300 text-neutral-900 shadow-[2px_2px_0px_0px_#121212] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
                                    : "bg-neutral-200 dark:bg-[#28313B] text-neutral-400 dark:text-[#6C7684] cursor-not-allowed"
                            }`}
                            title="Send prompt"
                        >
                            <ArrowUp className="size-4 stroke-[2.5]" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
