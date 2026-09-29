"use client";

import { useEffect, useMemo, useState } from "react";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { Sparkles } from "lucide-react";
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

    // Multi-stage status messages while backend vector search and reasoning run
    useEffect(() => {
        if (!isAnimating || text.trim().length > 0) return;

        const timer1 = setTimeout(() => setThinkingPhase(1), 1200);
        const timer2 = setTimeout(() => setThinkingPhase(2), 2600);

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

    // Instant Responsive Thinking Shimmer while awaiting backend tokens
    if (!text.trim() && isAnimating) {
        const statusMessages = [
            "Querying TKDL Prior Art & AYUSH Gazette database...",
            "Cross-referencing Patents Act § 3(p) & Biodiversity rules...",
            "Synthesizing statutory diagnostic assessment...",
        ];

        return (
            <div className="flex flex-col gap-3 py-1 min-w-[280px]">
                <div className="flex items-center gap-2.5 text-xs font-mono font-medium text-neutral-700 dark:text-[#D4F843]">
                    <div className="relative flex size-2.5 items-center justify-center">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime-400 opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-lime-500" />
                    </div>
                    <span className="animate-pulse">
                        {statusMessages[thinkingPhase] ?? statusMessages[0]}
                    </span>
                </div>
                <div className="space-y-2 w-full">
                    <div className="h-3 w-4/5 rounded-md bg-neutral-200/80 dark:bg-white/[0.08] animate-pulse" />
                    <div className="h-3 w-3/5 rounded-md bg-neutral-200/60 dark:bg-white/[0.05] animate-pulse" />
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
