import { z } from "zod";
import { CHAT_MODELS } from "../lib/ai-config.js";

export const conversationIdParamSchema = z.object({
    workspaceId: z.string().trim().optional(),
    conversationId: z.string().trim().min(1, "Conversation id is required"),
});

export const chatBodySchema = z.object({
    conversationId: z.string().trim().min(1).optional(),
    messages: z.array(z.record(z.string(), z.unknown())).min(1),
    model: z.enum(CHAT_MODELS).optional(),
    webSearch: z.boolean().optional(),
    jurisdiction: z.enum(["INDIA", "INTERNATIONAL", "BOTH"]).optional().default("BOTH"),
});

export type ChatBody = z.infer<typeof chatBodySchema>;

export const createConversationSchema = z.object({
    title: z.string().trim().min(1).max(120).optional(),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
