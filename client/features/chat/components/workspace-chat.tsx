"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Download,
    PanelLeftOpen,
    ShieldCheck,
    Trash2,
} from "lucide-react";
import {
    MessageScroller,
    MessageScrollerButton,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerProvider,
    MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Skeleton } from "@/components/ui/skeleton";
import {
    buildCitationMap,
    chatKeys,
    useConversationMessages,
    useConversations,
    useDeleteConversation,
} from "../hooks/use-conversations";
import { ChatMessageBody } from "./chat-message-body";
import { CitationSources } from "./citation-sources";
import { ChatComposer } from "./chat-composer";
import { TailgridsSidebar } from "./tailgrids-sidebar";
import { TailgridsWelcome } from "./tailgrids-welcome";
import { ModeToggle } from "@/components/ui/mode-toggle";
import type { ChatCitation } from "../lib/types";
import { workspaceRoutes } from "@/features/workspaces/lib/routes";
import {
    useChatPreferences,
    type ChatJurisdiction,
} from "../stores/chat-preferences";
import {
    downloadMarkdown,
    exportConversationMarkdown,
} from "../lib/export-chat";

type WorkspaceChatProps = {
    workspaceId: string;
    defaultModel?: string;
};

function getMessageText(message: UIMessage) {
    return message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("");
}

export function WorkspaceChat({
    workspaceId,
    defaultModel,
}: WorkspaceChatProps) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const askPrompt = searchParams.get("ask");
    const handledAskPrompt = useRef<string | null>(null);

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isOptimisticActive, setIsOptimisticActive] = useState(false);
    const [citationsByMessageId, setCitationsByMessageId] = useState<
        Record<string, ChatCitation[]>
    >({});

    // Reactive store selectors
    const model = useChatPreferences(
        (s) => s.byWorkspace[workspaceId]?.model ?? "gpt-4o-mini",
    );
    const webSearch = useChatPreferences(
        (s) => s.byWorkspace[workspaceId]?.webSearch ?? false,
    );
    const jurisdiction = useChatPreferences(
        (s) => s.byWorkspace[workspaceId]?.jurisdiction ?? "BOTH",
    );
    const setJurisdiction = useChatPreferences((s) => s.setJurisdiction);

    const { data: conversations = [], isLoading: conversationsLoading } =
        useConversations(workspaceId);
    const { data: storedMessages, isLoading: messagesLoading } =
        useConversationMessages(workspaceId, conversationId);
    const deleteConversation = useDeleteConversation(workspaceId);

    const activeConversation = conversations.find(
        (conversation) => conversation.id === conversationId,
    );

    const handleConversationId = useCallback(
        (id: string) => {
            setConversationId(id);
            void queryClient.invalidateQueries({
                queryKey: chatKeys(workspaceId).conversations(),
            });
        },
        [queryClient, workspaceId],
    );

    const transport = useMemo(
        () =>
            new DefaultChatTransport({
                api: `/api/workspaces/${workspaceId}/chat`,
                credentials: "include",
                body: {
                    ...(conversationId ? { conversationId } : {}),
                    model,
                    webSearch,
                    jurisdiction,
                },
                fetch: async (url, init) => {
                    const response = await fetch(url, {
                        ...init,
                        credentials: "include",
                    });

                    const newConversationId =
                        response.headers.get("X-Conversation-Id");
                    if (newConversationId) {
                        handleConversationId(newConversationId);
                    }

                    return response;
                },
            }),
        [
            workspaceId,
            conversationId,
            handleConversationId,
            model,
            webSearch,
            jurisdiction,
        ],
    );

    const { messages, sendMessage, setMessages, status, error } = useChat({
        transport,
    });

    const isStreaming = status === "streaming" || status === "submitted";

    useEffect(() => {
        if (!conversationId) {
            setMessages([]);
            setCitationsByMessageId({});
            setIsOptimisticActive(false);
            return;
        }

        if (!storedMessages || isStreaming) {
            return;
        }

        setMessages(
            storedMessages.map((message) => ({
                id: message.id,
                role: message.role === "USER" ? "user" : "assistant",
                parts: [{ type: "text" as const, text: message.content }],
            })),
        );
        setCitationsByMessageId(buildCitationMap(storedMessages));
    }, [conversationId, storedMessages, setMessages, isStreaming]);

    useEffect(() => {
        if (status !== "ready" || !conversationId) {
            return;
        }

        setIsOptimisticActive(false);
        void queryClient.invalidateQueries({
            queryKey: chatKeys(workspaceId).messages(conversationId),
        });
    }, [status, conversationId, queryClient, workspaceId]);

    useEffect(() => {
        if (!storedMessages || status === "streaming") {
            return;
        }

        setCitationsByMessageId(buildCitationMap(storedMessages));
    }, [storedMessages, status]);

    useEffect(() => {
        if (
            !askPrompt ||
            status !== "ready" ||
            conversationId ||
            messages.length > 0 ||
            handledAskPrompt.current === askPrompt
        ) {
            return;
        }

        handledAskPrompt.current = askPrompt;
        setIsOptimisticActive(true);
        void sendMessage({ text: askPrompt });
        router.replace(workspaceRoutes.detail(workspaceId));
    }, [
        askPrompt,
        status,
        conversationId,
        messages.length,
        sendMessage,
        router,
        workspaceId,
    ]);

    function handleNewChat() {
        setConversationId(null);
        setMessages([]);
        setCitationsByMessageId({});
        setIsOptimisticActive(false);
    }

    async function handleDeleteActiveConversation() {
        if (!conversationId) return;
        await deleteConversation.mutateAsync(conversationId);
        handleNewChat();
    }

    function handleExportChat() {
        if (messages.length === 0) return;

        const markdown = exportConversationMarkdown({
            conversation: activeConversation ?? null,
            messages,
            citationsByMessageId,
        });
        const slug =
            activeConversation?.title
                ?.replace(/[^\w-]+/g, "-")
                .toLowerCase() ?? "ip-sakti-consultation";
        downloadMarkdown(markdown, `${slug}-${Date.now()}.md`);
    }

    function handleDispatchMessage(text: string, jur?: ChatJurisdiction) {
        if (jur) {
            setJurisdiction(workspaceId, jur);
        }
        // Immediately transition view with zero delay
        setIsOptimisticActive(true);
        void sendMessage({ text });
    }

    // Whether to display welcome hero screen
    const showWelcome =
        messages.length === 0 &&
        !isOptimisticActive &&
        !isStreaming &&
        !conversationsLoading &&
        !messagesLoading;

    return (
        <div className="flex h-screen w-full bg-[#FAF8F5] dark:bg-[#0B0F12] text-neutral-900 dark:text-[#FBF9F5] overflow-hidden font-sans">
            {/* 1. Left Sidebar */}
            <TailgridsSidebar
                workspaceId={workspaceId}
                activeConversationId={conversationId}
                onSelectConversation={(id) => setConversationId(id)}
                onNewChat={handleNewChat}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() =>
                    setIsSidebarCollapsed(!isSidebarCollapsed)
                }
            />

            {/* 2. Main Workspace Canvas */}
            <div className="flex-1 flex flex-col h-full min-w-0 bg-[#FAF8F5] dark:bg-[#0B0F12] relative overflow-hidden">
                {/* Top Control Bar */}
                <div className="h-14 border-b-2 border-neutral-900/10 dark:border-white/[0.06] flex items-center justify-between px-4 shrink-0 bg-[#FAF8F5]/80 dark:bg-[#0E1216]/60 backdrop-blur-md z-10">
                    <div className="flex items-center gap-3 min-w-0">
                        {isSidebarCollapsed && (
                            <button
                                type="button"
                                onClick={() => setIsSidebarCollapsed(false)}
                                title="Expand sidebar"
                                className="p-1.5 rounded-lg text-neutral-700 dark:text-[#9EA8B3] hover:text-neutral-900 dark:hover:text-[#FBF9F5] hover:bg-neutral-200/60 dark:hover:bg-white/[0.06] transition-colors border border-neutral-900/10 dark:border-white/10"
                            >
                                <PanelLeftOpen className="size-4" />
                            </button>
                        )}

                        {activeConversation?.title ? (
                            <h2 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#FBF9F5] truncate max-w-md font-heading">
                                {activeConversation.title}
                            </h2>
                        ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Theme Toggle Button */}
                        <ModeToggle />

                        {messages.length > 0 && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleExportChat}
                                    title="Export consultation as Markdown"
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-neutral-700 dark:text-[#9EA8B3] hover:text-neutral-900 dark:hover:text-[#FBF9F5] hover:bg-neutral-200/60 dark:hover:bg-white/[0.06] border-2 border-neutral-900/20 dark:border-white/[0.06] transition-colors"
                                >
                                    <Download className="size-3.5" />
                                    <span className="hidden sm:inline">
                                        Export
                                    </span>
                                </button>

                                {conversationId && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            void handleDeleteActiveConversation()
                                        }
                                        disabled={deleteConversation.isPending}
                                        title="Delete chat"
                                        className="p-1.5 rounded-lg text-neutral-600 dark:text-[#9EA8B3] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-h-0 relative z-10">
                    {showWelcome ? (
                        <TailgridsWelcome
                            workspaceId={workspaceId}
                            onSendMessage={handleDispatchMessage}
                            isSubmitting={isStreaming}
                        />
                    ) : (
                        <>
                            <MessageScrollerProvider>
                                <MessageScroller className="min-h-0 flex-1">
                                    <MessageScrollerViewport>
                                        <MessageScrollerContent className="mx-auto w-full max-w-3xl px-4 py-6">
                                            {messagesLoading ? (
                                                <div className="space-y-4">
                                                    <Skeleton className="h-16 w-2/3 rounded-2xl bg-neutral-200/80 dark:bg-white/[0.04]" />
                                                    <Skeleton className="ml-auto h-16 w-1/2 rounded-2xl bg-neutral-200/80 dark:bg-white/[0.04]" />
                                                </div>
                                            ) : (
                                                <div className="space-y-6 w-full">
                                                    {messages.map(
                                                        (
                                                            message,
                                                            messageIndex,
                                                        ) => {
                                                            const isUser =
                                                                message.role ===
                                                                "user";
                                                            const citations =
                                                                citationsByMessageId[
                                                                    message.id
                                                                ];
                                                            const isLastMessage =
                                                                messageIndex ===
                                                                messages.length -
                                                                    1;
                                                            const isAnimatingMessage =
                                                                !isUser &&
                                                                isStreaming &&
                                                                isLastMessage;

                                                            return (
                                                                <MessageScrollerItem
                                                                    key={
                                                                        message.id
                                                                    }
                                                                    scrollAnchor
                                                                >
                                                                    {isUser ? (
                                                                        /* Clean User Bubble (Aligned Right) */
                                                                        <div className="flex w-full justify-end">
                                                                            <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-neutral-900 text-white dark:bg-[#1D232A] dark:text-[#FBF9F5] border border-neutral-900 dark:border-white/10 px-4 py-3 text-sm leading-relaxed shadow-sm font-sans">
                                                                                {getMessageText(
                                                                                    message,
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        /* Clean Assistant Card (Avatar at TOP, Clean Rounded Surface) */
                                                                        <div className="flex w-full items-start gap-3">
                                                                            <div className="size-8 rounded-lg bg-lime-300 border border-neutral-900 dark:border-white/20 flex items-center justify-center shrink-0 mt-0.5 text-neutral-900 font-bold shadow-sm">
                                                                                <ShieldCheck className="size-4 text-neutral-900" />
                                                                            </div>
                                                                            <div className="flex-1 min-w-0 bg-white dark:bg-[#161B20] text-neutral-900 dark:text-[#FBF9F5] border border-neutral-900/10 dark:border-white/10 rounded-2xl p-4 sm:p-5 text-sm leading-relaxed shadow-sm font-sans">
                                                                                <ChatMessageBody
                                                                                    text={getMessageText(
                                                                                        message,
                                                                                    )}
                                                                                    citations={
                                                                                        citations
                                                                                    }
                                                                                    workspaceId={
                                                                                        workspaceId
                                                                                    }
                                                                                    isAnimating={
                                                                                        isAnimatingMessage
                                                                                    }
                                                                                />

                                                                                {citations?.length ? (
                                                                                    <div className="mt-4 pt-3 border-t border-neutral-900/10 dark:border-white/10">
                                                                                        <CitationSources
                                                                                            workspaceId={
                                                                                                workspaceId
                                                                                            }
                                                                                            citations={
                                                                                                citations
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                ) : null}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </MessageScrollerItem>
                                                            );
                                                        },
                                                    )}

                                                    {/* Instant Assistant Thinking Shimmer when user has submitted and assistant chunk hasn't arrived */}
                                                    {isStreaming &&
                                                        messages.length > 0 &&
                                                        messages[
                                                            messages.length - 1
                                                        ]?.role === "user" && (
                                                            <MessageScrollerItem scrollAnchor>
                                                                <div className="flex w-full items-start gap-3">
                                                                    <div className="size-8 rounded-lg bg-lime-300 border border-neutral-900 dark:border-white/20 flex items-center justify-center shrink-0 mt-0.5 text-neutral-900 font-bold shadow-sm">
                                                                        <ShieldCheck className="size-4 text-neutral-900" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0 bg-white dark:bg-[#161B20] text-neutral-900 dark:text-[#FBF9F5] border border-neutral-900/10 dark:border-white/10 rounded-2xl p-4 sm:p-5 text-sm leading-relaxed shadow-sm font-sans">
                                                                        <ChatMessageBody
                                                                            text=""
                                                                            workspaceId={
                                                                                workspaceId
                                                                            }
                                                                            isAnimating={
                                                                                true
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </MessageScrollerItem>
                                                        )}
                                                </div>
                                            )}
                                        </MessageScrollerContent>
                                    </MessageScrollerViewport>
                                    <MessageScrollerButton direction="end" />
                                </MessageScroller>
                            </MessageScrollerProvider>

                            {error ? (
                                <div className="border-t-2 border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-600 dark:text-red-300 font-semibold">
                                    {error.message}
                                </div>
                            ) : null}

                            <ChatComposer
                                workspaceId={workspaceId}
                                disabled={false}
                                isStreaming={isStreaming}
                                onSubmit={handleDispatchMessage}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
