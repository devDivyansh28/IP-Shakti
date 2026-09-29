import type { Request, Response } from "express";
import type { UIMessage } from "ai";
import {
    createConversationForUser,
    deleteConversationForUser,
    getConversationMessagesForUser,
    listConversationsForUser,
    streamSahayakChat,
} from "../services/chat.service.js";
import {
    chatBodySchema,
    conversationIdParamSchema,
    createConversationSchema,
} from "../validators/chat.validator.js";

function getWorkspaceId(req: Request): string | undefined {
    const raw = req.params.workspaceId;
    return typeof raw === "string" && raw.length > 0 ? raw : undefined;
}

export async function listConversations(req: Request, res: Response) {
    const workspaceId = getWorkspaceId(req);
    const conversations = await listConversationsForUser(
        req.session.user.id,
        workspaceId,
    );
    res.json(conversations);
}

export async function createConversation(req: Request, res: Response) {
    const workspaceId = getWorkspaceId(req);
    const input = createConversationSchema.parse(req.body ?? {});
    const conversation = await createConversationForUser(
        req.session.user.id,
        workspaceId,
        input.title,
    );
    res.status(201).json(conversation);
}

export async function listConversationMessages(req: Request, res: Response) {
    const { conversationId } = conversationIdParamSchema.parse(req.params);
    const workspaceId = getWorkspaceId(req);
    const messages = await getConversationMessagesForUser(
        conversationId,
        req.session.user.id,
        workspaceId,
    );
    res.json(messages);
}

export async function deleteConversation(req: Request, res: Response) {
    const { conversationId } = conversationIdParamSchema.parse(req.params);
    const workspaceId = getWorkspaceId(req);
    await deleteConversationForUser(
        conversationId,
        req.session.user.id,
        workspaceId,
    );
    res.status(204).send();
}

export async function streamChat(req: Request, res: Response) {
    const workspaceId = getWorkspaceId(req);
    const body = chatBodySchema.parse(req.body);

    await streamSahayakChat(
        res,
        req.session.user.id,
        {
            conversationId: body.conversationId,
            messages: body.messages as unknown as UIMessage[],
            model: body.model,
            webSearch: body.webSearch,
            jurisdiction: body.jurisdiction,
        },
        workspaceId,
    );
}
