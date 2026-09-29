"use client";

import { useEffect, useMemo, useState } from "react";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import {
    CheckCircle2,
    Database,
    FileSearch,
    Scale,
    Sparkles,
} from "lucide-react";
import { getCitationByIndex } from "../lib/citations";
import type { ChatCitation } from "../lib/types";
import { CitationMarker } from "./citation-marker";

type ChatMessageBodyProps = {
    text: string;
    citations?: ChatCitation[];
    workspaceId: string;
    isAnimating?: boolean;
};

function injectCitationTags(text: string) {
    return text
        .replace(/\[W(\d+)\]/g, '<cite web="$1">W$1</cite>')
        .replace(/\[(\d+)\]/g, '<cite index="$1">$1</cite>');
}

export function ChatMessageBody({
    text,
    citations = [],
    workspaceId,
    isAnimating = false,
}: ChatMessageBodyProps) {
    const [thinkingPhase, setThinkingPhase] = useState(0);

    // Multi-stage status progression while backend vector search and reasoning run
    useEffect(() => {
        if (!isAnimating || text.trim().length > 0) return;

        const timer1 = setTimeout(() => setThinkingPhase(1), 800);
        const timer2 = setTimeout(() => setThinkingPhase(2), 2000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [isAnimating, text]);

    const markdown = useMemo(() => injectCitationTags(text), [text]);
    const plugins = useMemo(() => ({ code }), []);

    const components = useMemo(
        () => ({
            cite: ({
                index,
                web,
                children,
            }: {
                index?: string;
                web?: string;
                children?: React.ReactNode;
            }) => {
                if (web) {
                    const webIndex = Number(web ?? children);
                    const webCitations = citations.filter(
                        (citation) => citation.sourceType === "WEB",
                    );
                    const citation = webCitations[webIndex - 1];

                    if (!citation) {
                        return (
                            <span className="font-medium text-primary">
                                [W{webIndex}]
                            </span>
                        );
                    }

                    return (
                        <CitationMarker
                            index={webIndex}
                            citation={citation}
                            workspaceId={workspaceId}
                            prefix="W"
                        />
                    );
                }

                const citationIndex = Number(index ?? children);
                const citation = getCitationByIndex(citations, citationIndex);

                if (!citation) {
                    return (
                        <span className="font-medium text-primary">
                            [{citationIndex}]
                        </span>
                    );
                }

                return (
                    <CitationMarker
                        index={citationIndex}
                        citation={citation}
                        workspaceId={workspaceId}
                    />
                );
            },
        }),
        [citations, workspaceId],
    );

    // Instant Responsive Thinking Pipeline while awaiting backend vector retrieval and tokens
    if (!text.trim() && isAnimating) {
        const steps = [
            {
                title: "Querying Traditional Knowledge Digital Library (TKDL)",
                desc: "Scanning classical formulations, AYUSH references & Gazette prior art...",
                icon: Database,
            },
            {
                title: "Cross-referencing Patents Act § 3(p) & Biodiversity Act",
                desc: "Evaluating Section 3(e) synergistic combinations and NBA clearance rules...",
                icon: Scale,
            },
            {
                title: "Synthesizing Statutory Compliance Assessment",
                desc: "Formulating IP strategy, non-patentability exceptions & guidance...",
                icon: FileSearch,
            },
        ];

        return (
            <div className="flex flex-col gap-3 py-1 min-w-[280px] sm:min-w-[380px]">
                {/* Active Diagnostic Phase Card */}
                <div className="rounded-xl border border-neutral-900/10 dark:border-white/10 bg-neutral-50/70 dark:bg-[#12161A] p-3 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-neutral-500 dark:text-[#9EA8B3]">
                        <span className="flex items-center gap-1.5 text-neutral-900 dark:text-lime-300 font-bold">
                            <span className="relative flex size-2 items-center justify-center">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime-400 opacity-75" />
                                <span className="relative inline-flex size-1.5 rounded-full bg-lime-500" />
                            </span>
                            STATUTORY DIAGNOSTIC PIPELINE
                        </span>
                        <span>Stage {Math.min(thinkingPhase + 1, 3)} of 3</span>
                    </div>

                    <div className="space-y-2">
                        {steps.map((step, idx) => {
                            const isCurrent = thinkingPhase === idx;
                            const isDone = thinkingPhase > idx;

                            return (
                                <div
                                    key={idx}
                                    className={`flex items-start gap-2.5 text-xs transition-opacity duration-300 ${
                                        isCurrent
                                            ? "opacity-100"
                                            : isDone
                                              ? "opacity-60"
                                              : "opacity-35"
                                    }`}
                                >
                                    <div className="mt-0.5 shrink-0">
                                        {isDone ? (
                                            <CheckCircle2 className="size-3.5 text-lime-600 dark:text-lime-400" />
                                        ) : isCurrent ? (
                                            <div className="size-3.5 rounded-full border-2 border-lime-500 border-t-transparent animate-spin" />
                                        ) : (
                                            <div className="size-3.5 rounded-full border border-neutral-300 dark:border-neutral-700" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p
                                            className={`font-medium leading-tight ${
                                                isCurrent
                                                    ? "text-neutral-900 dark:text-[#FBF9F5] font-semibold"
                                                    : "text-neutral-600 dark:text-[#9EA8B3]"
                                            }`}
                                        >
                                            {step.title}
                                        </p>
                                        {isCurrent && (
                                            <p className="text-[11px] text-neutral-500 dark:text-[#88929D] mt-0.5 animate-pulse">
                                                {step.desc}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Shimmer Skeleton Paragraph Simulation */}
                <div className="space-y-2 w-full pt-1">
                    <div className="h-3 w-[92%] rounded-md bg-neutral-200/80 dark:bg-white/[0.08] animate-pulse" />
                    <div className="h-3 w-[82%] rounded-md bg-neutral-200/70 dark:bg-white/[0.06] animate-pulse" />
                    <div className="h-3 w-[88%] rounded-md bg-neutral-200/60 dark:bg-white/[0.05] animate-pulse" />
                    <div className="h-3 w-[60%] rounded-md bg-neutral-200/50 dark:bg-white/[0.04] animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <Streamdown
            mode={isAnimating ? "streaming" : "static"}
            isAnimating={isAnimating}
            plugins={plugins}
            allowedTags={{ cite: ["index", "web"] }}
            literalTagContent={["cite"]}
            components={components}
            className="min-w-0 text-sm leading-relaxed"
        >
            {markdown}
        </Streamdown>
    );
}
