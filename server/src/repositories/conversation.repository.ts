import type { Prisma } from "../generated/prisma/client.js";
import prisma from "../lib/db.js";

export const conversationSelect = {
    id: true,
    userId: true,
    workspaceId: true,
    title: true,
    summary: true,
    summaryMessageCount: true,
    summarizedAt: true,
    createdAt: true,
    updatedAt: true,
} as const;

export type ConversationRecord = Prisma.ConversationGetPayload<{
    select: typeof conversationSelect;
}>;

export function findConversationsByWorkspaceId(workspaceId: string) {
    return prisma.conversation.findMany({
        where: { workspaceId },
        select: conversationSelect,
        orderBy: { updatedAt: "desc" },
    });
}

export function findConversationsByUserId(
    userId: string,
    workspaceId?: string | null,
) {
    const where: Prisma.ConversationWhereInput = {
        userId,
        workspaceId: workspaceId ?? null,
    };

    return prisma.conversation.findMany({
        where,
        select: conversationSelect,
        orderBy: { updatedAt: "desc" },
    });
}

export function findConversationById(conversationId: string) {
    return prisma.conversation.findUnique({
        where: { id: conversationId },
        select: conversationSelect,
    });
}

export function findConversationByIdAndWorkspaceId(
    conversationId: string,
    workspaceId: string,
) {
    return prisma.conversation.findFirst({
        where: { id: conversationId, workspaceId },
        select: conversationSelect,
    });
}

export function findConversationByIdAndUser(
    conversationId: string,
    userId: string,
    workspaceId?: string | null,
) {
    return prisma.conversation.findFirst({
        where: {
            id: conversationId,
            OR: [
                { userId },
                ...(workspaceId ? [{ workspaceId }] : []),
            ],
        },
        select: conversationSelect,
    });
}

export function createConversationRecord(
    workspaceIdOrOptions: string | null | {
        userId: string;
        workspaceId?: string | null;
        title?: string | null;
    },
    title?: string,
) {
    if (typeof workspaceIdOrOptions === "object" && workspaceIdOrOptions !== null) {
        return prisma.conversation.create({
            data: {
                userId: workspaceIdOrOptions.userId,
                workspaceId: workspaceIdOrOptions.workspaceId ?? null,
                title: workspaceIdOrOptions.title ?? null,
            },
            select: conversationSelect,
        });
    }

    return prisma.conversation.create({
        data: {
            workspaceId: workspaceIdOrOptions,
            title: title ?? null,
        },
        select: conversationSelect,
    });
}

export function updateConversationSummary(
    conversationId: string,
    data: {
        summary: string;
        summaryMessageCount: number;
    },
) {
    return prisma.conversation.update({
        where: { id: conversationId },
        data: {
            summary: data.summary,
            summaryMessageCount: data.summaryMessageCount,
            summarizedAt: new Date(),
        },
        select: conversationSelect,
    });
}

export function updateConversationRecord(
    conversationId: string,
    data: { title?: string | null },
) {
    return prisma.conversation.update({
        where: { id: conversationId },
        data,
        select: conversationSelect,
    });
}

export function touchConversation(conversationId: string) {
    return prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
        select: conversationSelect,
    });
}

export async function deleteConversationRecord(conversationId: string) {
    await prisma.conversation.delete({
        where: { id: conversationId },
    });
}
