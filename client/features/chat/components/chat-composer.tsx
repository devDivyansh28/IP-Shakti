"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Globe, Loader2, Paperclip } from "lucide-react";
import {
    useChatPreferences,
    type ChatJurisdiction,
} from "../stores/chat-preferences";

type ChatComposerProps = {
    workspaceId: string;
    onSubmit: (text: string, jurisdiction?: ChatJurisdiction) => void;
    disabled?: boolean;
    isStreaming?: boolean;
};

export function ChatComposer({
    workspaceId,
    onSubmit,
    disabled = false,
    isStreaming = false,
}: ChatComposerProps) {
    const [input, setInput] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    function handleSubmit(e?: React.FormEvent) {
        if (e) e.preventDefault();
        const text = input.trim();
        if (!text || disabled || isStreaming) return;

        onSubmit(text, selectedJurisdiction);
        setInput("");
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
        <div className="border-t-2 border-neutral-900/10 dark:border-white/10 bg-[#FAF8F5]/90 dark:bg-[#0E1216]/90 backdrop-blur-md p-4">
            <div className="mx-auto max-w-3xl">
                <div className="w-full bg-white dark:bg-[#161B20] border-2 border-neutral-900 dark:border-white/20 rounded-2xl p-3 shadow-[3px_3px_0px_0px_#121212] dark:shadow-none transition-all text-left">
                    {/* Textarea */}
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything..."
                        rows={1}
                        disabled={disabled || isStreaming}
                        className="w-full bg-transparent text-neutral-900 dark:text-[#FBF9F5] placeholder-neutral-500 dark:placeholder-[#6C7684] text-sm resize-none focus:outline-none scrollbar-none font-sans min-h-[40px] max-h-32"
                    />

                    {/* Integrated Bottom Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-900/10 dark:border-white/[0.08] mt-1">
                        {/* Left Controls: Attach + Web Search Pill + Jurisdiction */}
                        <div className="flex flex-wrap items-center gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                title="Attach documents"
                                className="p-1.5 rounded-lg text-neutral-700 dark:text-[#9EA8B3] hover:text-neutral-900 dark:hover:text-[#FBF9F5] hover:bg-neutral-200/60 dark:hover:bg-white/[0.06] border border-neutral-900/10 dark:border-white/10 transition-colors"
                            >
                                <Paperclip className="size-4" />
                            </button>

                            {/* Self-Explanatory Web Search Pill Button */}
                            <button
                                type="button"
                                onClick={() =>
                                    setWebSearch(
                                        workspaceId,
                                        !isWebSearchActive,
                                    )
                                }
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                                    isWebSearchActive
                                        ? "bg-lime-300 border-neutral-900 text-neutral-900 font-bold shadow-[2px_2px_0px_0px_#121212] dark:shadow-none"
                                        : "bg-white dark:bg-[#111417] text-neutral-700 dark:text-[#9EA8B3] border-neutral-900/20 dark:border-white/10 hover:border-neutral-900/50"
                                }`}
                            >
                                <Globe className="size-3.5" />
                                <span>
                                    {isWebSearchActive
                                        ? "Web Search: ON"
                                        : "Web Search: OFF"}
                                </span>
                            </button>

                            {/* 3-State Jurisdiction Toggle */}
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
                                            className={`px-2 py-0.5 rounded text-[10px] transition-all ${
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
                                disabled={
                                    !input.trim() || disabled || isStreaming
                                }
                                className={`size-8 rounded-full flex items-center justify-center border-2 border-neutral-900 dark:border-white/20 transition-all ${
                                    input.trim() && !disabled && !isStreaming
                                        ? "bg-lime-300 text-neutral-900 shadow-[2px_2px_0px_0px_#121212] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
                                        : "bg-neutral-200 dark:bg-[#28313B] text-neutral-400 dark:text-[#6C7684] cursor-not-allowed"
                                }`}
                                title="Send prompt"
                            >
                                {isStreaming ? (
                                    <Loader2 className="size-3.5 animate-spin text-neutral-900" />
                                ) : (
                                    <ArrowUp className="size-3.5 stroke-[2.5]" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
