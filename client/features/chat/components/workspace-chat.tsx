"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Download,
    PanelLeftOpen,
    ShieldAlert,
    ShieldCheck,
    Trash2,
} from "lucide-react";
import {
    Message,
    MessageAvatar,
    MessageContent,
    MessageFooter,
    MessageGroup,
} from "@/components/ui/message";
import {
    MessageScroller,
    MessageScrollerButton,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerProvider,
    MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
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
import type { ChatCitation } from "../lib/types";
import { workspaceRoutes } from "@/features/workspaces/lib/routes";
import { useChatPreferences } from "../stores/chat-preferences";
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
    const [citationsByMessageId, setCitationsByMessageId] = useState<
        Record<string, ChatCitation[]>
    >({});

    const getPrefs = useChatPreferences((state) => state.getPrefs);
    const chatPrefs = getPrefs(workspaceId, defaultModel);

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
                    model: chatPrefs.model,
                    webSearch: chatPrefs.webSearch,
                    jurisdiction: chatPrefs.jurisdiction,
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
            chatPrefs.model,
            chatPrefs.webSearch,
            chatPrefs.jurisdiction,
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

    return (
        <div className="flex h-screen w-full bg-[#111417] text-[#FBF9F5] overflow-hidden font-sans">
            {/* 1. TailGrids Left Sidebar */}
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
            <div className="flex-1 flex flex-col h-full min-w-0 bg-[#111417] relative">
                {/* Top Control Bar */}
                <div className="h-14 border-b border-white/[0.06] flex items-center justify-between px-4 shrink-0 bg-[#161B20]/40 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-3 min-w-0">
                        {isSidebarCollapsed && (
                            <button
                                type="button"
                                onClick={() => setIsSidebarCollapsed(false)}
                                title="Expand sidebar"
                                className="p-1.5 rounded-lg text-[#9EA8B3] hover:text-[#FBF9F5] hover:bg-white/[0.06] transition-colors"
                            >
                                <PanelLeftOpen className="size-4" />
                            </button>
                        )}

                        {activeConversation?.title ? (
                            <h2 className="text-xs sm:text-sm font-medium text-[#FBF9F5] truncate max-w-md">
                                {activeConversation.title}
                            </h2>
                        ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                        {messages.length > 0 && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleExportChat}
                                    title="Export consultation as Markdown"
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-[#9EA8B3] hover:text-[#FBF9F5] hover:bg-white/[0.06] border border-white/[0.06] transition-colors"
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
                                        className="p-1.5 rounded-lg text-[#9EA8B3] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-h-0 relative">
                    {messages.length === 0 && !conversationsLoading && !messagesLoading ? (
                        <TailgridsWelcome
                            workspaceId={workspaceId}
                            onSendMessage={(text) => {
                                void sendMessage({ text });
                            }}
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
                                                    <Skeleton className="h-16 w-2/3 rounded-2xl bg-white/[0.04]" />
                                                    <Skeleton className="ml-auto h-16 w-1/2 rounded-2xl bg-white/[0.04]" />
                                                </div>
                                            ) : (
                                                <MessageGroup className="gap-6">
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
                                                                    <Message
                                                                        align={
                                                                            isUser
                                                                                ? "end"
                                                                                : "start"
                                                                        }
                                                                    >
                                                                        {!isUser && (
                                                                            <MessageAvatar className="size-8 rounded-lg bg-[#D4F843] flex items-center justify-center text-black">
                                                                                <ShieldCheck className="size-4 text-black" />
                                                                            </MessageAvatar>
                                                                        )}
                                                                        <MessageContent>
                                                                            <Bubble
                                                                                align={
                                                                                    isUser
                                                                                        ? "end"
                                                                                        : "start"
                                                                                }
                                                                                variant={
                                                                                    isUser
                                                                                        ? "default"
                                                                                        : "ghost"
                                                                                }
                                                                                className={
                                                                                    isUser
                                                                                        ? "bg-[#1D232A] text-[#FBF9F5] border border-white/[0.08]"
                                                                                        : "bg-transparent text-[#FBF9F5]"
                                                                                }
                                                                            >
                                                                                <BubbleContent className="leading-relaxed">
                                                                                    {isUser ? (
                                                                                        getMessageText(
                                                                                            message,
                                                                                        )
                                                                                    ) : (
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
                                                                                    )}
                                                                                </BubbleContent>
                                                                            </Bubble>
                                                                            {!isUser &&
                                                                            citations?.length ? (
                                                                                <MessageFooter className="mt-1 w-full max-w-full flex-col items-start gap-0 px-0">
                                                                                    <CitationSources
                                                                                        workspaceId={
                                                                                            workspaceId
                                                                                        }
                                                                                        citations={
                                                                                            citations
                                                                                        }
                                                                                    />
                                                                                </MessageFooter>
                                                                            ) : null}
                                                                        </MessageContent>
                                                                    </Message>
                                                                </MessageScrollerItem>
                                                            );
                                                        },
                                                    )}
                                                </MessageGroup>
                                            )}
                                        </MessageScrollerContent>
                                    </MessageScrollerViewport>
                                    <MessageScrollerButton direction="end" />
                                </MessageScroller>
                            </MessageScrollerProvider>

                            {error ? (
                                <div className="border-t border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300">
                                    {error.message}
                                </div>
                            ) : null}

                            <ChatComposer
                                workspaceId={workspaceId}
                                disabled={false}
                                isStreaming={isStreaming}
                                onSubmit={(text) => {
                                    void sendMessage({ text });
                                }}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
