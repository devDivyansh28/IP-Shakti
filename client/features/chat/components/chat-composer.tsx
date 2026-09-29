"use client";

import { useRef, useState } from "react";
import { ArrowUp, Globe, Loader2, Paperclip } from "lucide-react";
import {
    useChatPreferences,
    type ChatJurisdiction,
} from "../stores/chat-preferences";

type ChatComposerProps = {
    workspaceId: string;
    onSubmit: (text: string) => void;
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

    const getPrefs = useChatPreferences((state) => state.getPrefs);
    const setWebSearch = useChatPreferences((state) => state.setWebSearch);
    const setJurisdiction = useChatPreferences((state) => state.setJurisdiction);

    const chatPrefs = getPrefs(workspaceId);
    const currentJurisdiction = chatPrefs.jurisdiction ?? "BOTH";
    const isWebSearchActive = chatPrefs.webSearch ?? false;

    function handleSubmit(e?: React.FormEvent) {
        if (e) e.preventDefault();
        const text = input.trim();
        if (!text || disabled || isStreaming) return;

        onSubmit(text);
        setInput("");
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    return (
        <div className="border-t border-white/[0.06] bg-[#111417]/80 backdrop-blur-md p-4">
            <div className="mx-auto max-w-3xl">
                <div className="w-full bg-[#1D232A] border border-white/[0.08] rounded-2xl p-3 shadow-xl focus-within:border-[#D4F843]/50 focus-within:ring-1 focus-within:ring-[#D4F843]/30 transition-all text-left">
                    {/* Textarea */}
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything or type a prompt..."
                        rows={1}
                        disabled={disabled || isStreaming}
                        className="w-full bg-transparent text-[#FBF9F5] placeholder-[#6C7684] text-sm resize-none focus:outline-none scrollbar-none font-sans min-h-[40px] max-h-32"
                    />

                    {/* Integrated Bottom Toolbar */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] mt-1">
                        {/* Left Controls: Attach + Web + Jurisdiction */}
                        <div className="flex items-center gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                title="Attach documents"
                                className="p-1.5 rounded-lg text-[#9EA8B3] hover:text-[#FBF9F5] hover:bg-white/[0.06] transition-colors"
                            >
                                <Paperclip className="size-4" />
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setWebSearch(
                                        workspaceId,
                                        !isWebSearchActive,
                                    )
                                }
                                title={
                                    isWebSearchActive
                                        ? "Web search enabled"
                                        : "Enable web search"
                                }
                                className={`p-1.5 rounded-lg transition-colors ${
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
                                        {
                                            id: "INTERNATIONAL",
                                            label: "International",
                                        },
                                        { id: "BOTH", label: "Both" },
                                    ] as const
                                ).map((opt) => {
                                    const isActive =
                                        currentJurisdiction === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() =>
                                                setJurisdiction(
                                                    workspaceId,
                                                    opt.id,
                                                )
                                            }
                                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
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
                            disabled={!input.trim() || disabled || isStreaming}
                            className={`size-8 rounded-full flex items-center justify-center transition-all ${
                                input.trim() && !disabled && !isStreaming
                                    ? "bg-[#D4F843] text-black shadow-md shadow-[#D4F843]/20 hover:scale-105"
                                    : "bg-[#28313B] text-[#6C7684] cursor-not-allowed"
                            }`}
                            title="Send prompt"
                        >
                            {isStreaming ? (
                                <Loader2 className="size-4 animate-spin text-black" />
                            ) : (
                                <ArrowUp className="size-4 stroke-[2.5]" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
