/**
 * IP-SAKTI Sahayak: Chat & Conversational RAG pipeline.
 *
 * Supports:
 * - Normal Chat (universal, zero-project required)
 * - Project Chat (scoped to specific workspace)
 * - Dual-Tier RAG retrieval across Central Knowledge Base & User Documents
 * - Explicit Jurisdiction Switching (INDIA, INTERNATIONAL, BOTH)
 * - Real-time AI SDK streaming with rich source citations and optional web search
 */

import { openai } from "@ai-sdk/openai";
import type { Response } from "express";
import { z } from "zod";
import {
    convertToModelMessages,
    createUIMessageStream,
    isStepCount,
    pipeUIMessageStreamToResponse,
    streamText,
    toUIMessageStream,
    tool,
    type UIMessage,
} from "ai";
import {
    CHAT_MODEL,
    CHAT_MODELS,
    CONVERSATION_SUMMARY_INTERVAL,
    RECENT_MESSAGE_WINDOW,
} from "../lib/ai-config.js";
import { enqueueConversationSummarize } from "../lib/conversation-events.js";
import {
    buildChatSystemPrompt,
    retrieveDualTierContext,
    type JurisdictionMode,
} from "../lib/rag/retrieve.js";
import {
    createConversationRecord,
    findConversationByIdAndUser,
    findConversationsByUserId,
    findConversationsByWorkspaceId,
    touchConversation,
    updateConversationRecord,
    deleteConversationRecord,
} from "../repositories/conversation.repository.js";
import {
    createMessageRecord,
    countMessagesByConversationId,
    findMessagesByConversationId,
} from "../repositories/message.repository.js";
import { addMemoriesFromMessages, searchUserMemories } from "../lib/mem0.js";
import {
    formatTavilyResultsForPrompt,
    searchWeb,
    type TavilySearchResponse,
} from "../lib/tavily.js";
import { NotFoundError, ValidationError } from "../types/app-error.js";
import {
    buildConversationTitle,
    getLastUserMessageText,
    getTextFromUIMessage,
} from "../utils/chat-message.js";
import { getWorkspaceByIdForUser } from "./workspace.service.js";

/**
 * Lists conversations for a user (either general or project-scoped).
 */
export async function listConversationsForUser(
    userId: string,
    workspaceId?: string | null,
) {
    if (workspaceId) {
        await getWorkspaceByIdForUser(workspaceId, userId);
        return findConversationsByWorkspaceId(workspaceId);
    }
    return findConversationsByUserId(userId, null);
}

export const listConversationsForWorkspace = (
    workspaceId: string,
    userId: string,
) => listConversationsForUser(userId, workspaceId);

/**
 * Creates an empty conversation thread.
 */
export async function createConversationForUser(
    userId: string,
    workspaceId?: string | null,
    title?: string,
) {
    if (workspaceId) {
        await getWorkspaceByIdForUser(workspaceId, userId);
    }
    return createConversationRecord({ userId, workspaceId, title });
}

export const createConversationForWorkspace = (
    workspaceId: string,
    userId: string,
    title?: string,
) => createConversationForUser(userId, workspaceId, title);

/**
 * Loads messages for a conversation.
 */
export async function getConversationMessagesForUser(
    conversationId: string,
    userId: string,
    workspaceId?: string | null,
) {
    const conversation = await findConversationByIdAndUser(
        conversationId,
        userId,
        workspaceId,
    );

    if (!conversation) {
        throw new NotFoundError("Conversation not found");
    }

    return findMessagesByConversationId(conversationId);
}

export const getConversationMessagesForWorkspace = (
    workspaceId: string,
    conversationId: string,
    userId: string,
) => getConversationMessagesForUser(conversationId, userId, workspaceId);

/**
 * Deletes a conversation and its messages.
 */
export async function deleteConversationForUser(
    conversationId: string,
    userId: string,
    workspaceId?: string | null,
) {
    const conversation = await findConversationByIdAndUser(
        conversationId,
        userId,
        workspaceId,
    );

    if (!conversation) {
        throw new NotFoundError("Conversation not found");
    }

    await deleteConversationRecord(conversationId);
}

export const deleteConversationForWorkspace = (
    workspaceId: string,
    conversationId: string,
    userId: string,
) => deleteConversationForUser(conversationId, userId, workspaceId);

/**
 * Finds an existing conversation or creates one on first message.
 */
async function resolveConversation(
    userId: string,
    workspaceId: string | null | undefined,
    conversationId: string | undefined,
    firstMessage: string,
) {
    if (conversationId) {
        const existing = await findConversationByIdAndUser(
            conversationId,
            userId,
            workspaceId,
        );

        if (!existing) {
            throw new NotFoundError("Conversation not found");
        }

        return existing;
    }

    return createConversationRecord({
        userId,
        workspaceId: workspaceId ?? null,
        title: buildConversationTitle(firstMessage),
    });
}

/**
 * Main IP-SAKTI Sahayak RAG streaming chat handler.
 */
export async function streamSahayakChat(
    res: Response,
    userId: string,
    input: {
        conversationId?: string;
        messages: UIMessage[];
        model?: string;
        webSearch?: boolean;
        jurisdiction?: JurisdictionMode;
    },
    workspaceId?: string | null,
) {
    let defaultModel = CHAT_MODEL;

    if (workspaceId) {
        const workspace = await getWorkspaceByIdForUser(workspaceId, userId);
        defaultModel = workspace.defaultModel;
    }

    const requestedModel = input.model ?? defaultModel;
    const chatModel =
        CHAT_MODELS.find((model) => model === requestedModel) ?? CHAT_MODEL;
    const webSearchEnabled =
        input.webSearch === true && !!process.env.TAVILY_API_KEY?.trim();

    const userText = getLastUserMessageText(input.messages);
    if (!userText) {
        throw new ValidationError("A user message is required");
    }

    const conversation = await resolveConversation(
        userId,
        workspaceId,
        input.conversationId,
        userText,
    );

    await createMessageRecord({
        conversationId: conversation.id,
        role: "USER",
        content: userText,
    });

    const [retrievedChunks, userMemories] = await Promise.all([
        retrieveDualTierContext({
            userId,
            workspaceId,
            query: userText,
            jurisdiction: input.jurisdiction ?? "BOTH",
        }),
        searchUserMemories(userId, userText),
    ]);

    const citations = retrievedChunks.map((chunk) => ({
        sourceId: chunk.sourceId,
        sourceTitle: chunk.sourceTitle,
        sourceType: chunk.sourceType,
        scope: chunk.scope,
        jurisdiction: chunk.jurisdiction,
        tags: chunk.tags,
        chunkId: chunk.chunkId,
        chunkIndex: chunk.chunkIndex,
        page: chunk.page,
        excerpt: chunk.text.slice(0, 280),
        score: chunk.score,
    }));

    const systemPrompt = buildChatSystemPrompt({
        chunks: retrievedChunks,
        conversationSummary: conversation.summary,
        userMemories: userMemories.map((memory) => memory.memory),
        webSearchEnabled,
        jurisdiction: input.jurisdiction ?? "BOTH",
    });

    const contextMessages =
        conversation.summary &&
        input.messages.length > RECENT_MESSAGE_WINDOW
            ? input.messages.slice(-RECENT_MESSAGE_WINDOW)
            : input.messages;

    let webSearchResults: TavilySearchResponse | null = null;

    const stream = createUIMessageStream({
        originalMessages: input.messages,
        execute: async ({ writer }) => {
            const tools =
                webSearchEnabled
                    ? {
                          web_search: tool({
                              description:
                                  "Search the web for up-to-date patent gazettes, AYUSH notifications, and legal updates outside the knowledge base.",
                              inputSchema: z.object({
                                  query: z
                                      .string()
                                      .describe(
                                          "The search query for statutory or regulatory web information",
                                      ),
                              }),
                              execute: async ({ query }) => {
                                  const results = await searchWeb(query);
                                  webSearchResults = results;
                                  return formatTavilyResultsForPrompt(results);
                              },
                          }),
                      }
                    : undefined;

            const result = streamText({
                model: openai(chatModel),
                system: systemPrompt,
                messages: await convertToModelMessages(contextMessages),
                tools,
                stopWhen: webSearchEnabled ? isStepCount(3) : undefined,
            });

            writer.merge(toUIMessageStream({ stream: result.stream }));
        },
        onFinish: async ({ responseMessage, isAborted }) => {
            if (isAborted) {
                return;
            }

            const assistantText = getTextFromUIMessage(responseMessage).trim();
            if (!assistantText) {
                return;
            }

            const webCitations = webSearchResults
                ? webSearchResults.results.map((result) => ({
                      sourceType: "WEB" as const,
                      sourceTitle: result.title,
                      url: result.url,
                      excerpt: result.content.slice(0, 280),
                  }))
                : [];
            const allCitations = [...citations, ...webCitations];

            await createMessageRecord({
                conversationId: conversation.id,
                role: "ASSISTANT",
                content: assistantText,
                citations: allCitations,
            });

            await touchConversation(conversation.id);

            if (!conversation.title) {
                await updateConversationRecord(conversation.id, {
                    title: buildConversationTitle(userText),
                });
            }

            const messageCount = await countMessagesByConversationId(
                conversation.id,
            );

            if (messageCount % CONVERSATION_SUMMARY_INTERVAL === 0) {
                await enqueueConversationSummarize({
                    conversationId: conversation.id,
                    userId,
                });
            }

            void addMemoriesFromMessages(
                userId,
                [
                    { role: "user", content: userText },
                    { role: "assistant", content: assistantText },
                ],
                {
                    source: "learned",
                    conversationId: conversation.id,
                },
            ).catch((error) => {
                console.error("Mem0 add failed:", error);
            });
        },
    });

    await pipeUIMessageStreamToResponse({
        response: res,
        stream,
        headers: {
            "X-Conversation-Id": conversation.id,
        },
    });
}

/** Backward compatibility alias */
export const streamWorkspaceChat = (
    res: Response,
    workspaceId: string,
    userId: string,
    input: Parameters<typeof streamSahayakChat>[2],
) => streamSahayakChat(res, userId, input, workspaceId);
