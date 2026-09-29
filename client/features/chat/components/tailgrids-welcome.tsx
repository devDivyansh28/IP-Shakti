"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowUp, Globe, Paperclip, Sparkles } from "lucide-react";
import { useUserProfile } from "@/features/auth/hooks/use-user-profile";
import {
    useChatPreferences,
    type ChatJurisdiction,
} from "../stores/chat-preferences";

type TailgridsWelcomeProps = {
    workspaceId: string;
    onSendMessage: (text: string) => void;
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
    const getPrefs = useChatPreferences((state) => state.getPrefs);
    const setWebSearch = useChatPreferences((state) => state.setWebSearch);
    const setJurisdiction = useChatPreferences((state) => state.setJurisdiction);

    const chatPrefs = getPrefs(workspaceId);
    const currentJurisdiction = chatPrefs.jurisdiction ?? "BOTH";
    const isWebSearchActive = chatPrefs.webSearch ?? false;

    // Personalized first name
    const firstName = useMemo(() => {
        if (!userProfile?.name) return "there";
        return userProfile.name.trim().split(" ")[0];
    }, [userProfile]);

    function handleSubmit(e?: React.FormEvent) {
        if (e) e.preventDefault();
        const trimmed = promptText.trim();
        if (!trimmed || isSubmitting) return;

        onSendMessage(trimmed);
        setPromptText("");
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    function handleJurisdictionChange(jur: ChatJurisdiction) {
        setJurisdiction(workspaceId, jur);
    }

    function toggleWebSearch() {
        setWebSearch(workspaceId, !isWebSearchActive);
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full text-center">
            {/* 1. Centered Welcome Hero */}
            <div className="space-y-3 mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#FBF9F5] font-sans">
                    Hey {firstName}, where shall we begin?
                </h1>
                <p className="text-sm sm:text-base text-[#9EA8B3] max-w-xl mx-auto font-normal">
                    Check novelty, verify prior art, and navigate compliance in seconds.
                </p>
            </div>

            {/* 2. Floating Prompt Card (TailGrids Specification) */}
            <div className="w-full max-w-2xl bg-[#1D232A] border border-white/[0.08] rounded-2xl p-4 shadow-2xl shadow-black/40 focus-within:border-[#D4F843]/50 focus-within:ring-1 focus-within:ring-[#D4F843]/30 transition-all text-left">
                {/* Textarea */}
                <textarea
                    rows={3}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything or type a prompt..."
                    disabled={isSubmitting}
                    className="w-full bg-transparent text-[#FBF9F5] placeholder-[#6C7684] text-sm sm:text-base resize-none focus:outline-none scrollbar-none font-sans"
                />

                {/* Integrated Bottom Toolbar */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] mt-2">
                    {/* Left Controls: Attach + Web + Jurisdiction */}
                    <div className="flex items-center gap-2">
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={() => {
                                // Upload feedback placeholder
                            }}
                        />

                        {/* Attach button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            title="Attach documents"
                            className="p-2 rounded-lg text-[#9EA8B3] hover:text-[#FBF9F5] hover:bg-white/[0.06] transition-colors"
                        >
                            <Paperclip className="size-4" />
                        </button>

                        {/* Web search toggle */}
                        <button
                            type="button"
                            onClick={toggleWebSearch}
                            title={isWebSearchActive ? "Web search enabled" : "Enable web search"}
                            className={`p-2 rounded-lg transition-colors ${
                                isWebSearchActive
                                    ? "text-[#D4F843] bg-[#D4F843]/10 border border-[#D4F843]/30"
                                    : "text-[#9EA8B3] hover:text-[#FBF9F5] hover:bg-white/[0.06]"
                            }`}
                        >
                            <Globe className="size-4" />
                        </button>

                        {/* 3-State Jurisdiction Toggle */}
                        <div className="inline-flex items-center rounded-lg bg-[#111417] p-0.5 border border-white/[0.08]">
                            {(
                                [
                                    { id: "INDIA", label: "India" },
                                    { id: "INTERNATIONAL", label: "International" },
                                    { id: "BOTH", label: "Both" },
                                ] as const
                            ).map((opt) => {
                                const isActive = currentJurisdiction === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => handleJurisdictionChange(opt.id)}
                                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                                            isActive
                                                ? "bg-[#28313B] text-[#D4F843] shadow-sm font-semibold"
                                                : "text-[#9EA8B3] hover:text-[#FBF9F5]"
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Control: Circular Send Button */}
                    <button
                        type="button"
                        onClick={() => handleSubmit()}
                        disabled={!promptText.trim() || isSubmitting}
                        className={`size-9 rounded-full flex items-center justify-center transition-all ${
                            promptText.trim() && !isSubmitting
                                ? "bg-[#D4F843] text-black shadow-md shadow-[#D4F843]/20 hover:scale-105"
                                : "bg-[#28313B] text-[#6C7684] cursor-not-allowed"
                        }`}
                        title="Send consultation prompt"
                    >
                        <ArrowUp className="size-4 stroke-[2.5]" />
                    </button>
                </div>
            </div>
        </div>
    );
}
