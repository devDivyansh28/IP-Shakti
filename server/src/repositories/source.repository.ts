import type { Prisma, SourceScope } from "../generated/prisma/client.js";
import prisma from "../lib/db.js";
import type { ListSourcesQuery } from "../validators/source.validator.js";

export const sourceSelect = {
    id: true,
    workspaceId: true,
    userId: true,
    scope: true,
    jurisdiction: true,
    type: true,
    title: true,
    content: true,
    url: true,
    status: true,
    tags: true,
    metadata: true,
    createdAt: true,
    updatedAt: true,
} as const;

export type SourceRecord = Prisma.SourceGetPayload<{
    select: typeof sourceSelect;
}>;

export type CreateSourceData = {
    workspaceId?: string | null;
    userId?: string | null;
    scope?: SourceScope;
    jurisdiction?: string | null;
    type: SourceRecord["type"];
    title: string;
    content?: string | null;
    url?: string | null;
    status?: SourceRecord["status"];
    tags?: string[];
    metadata?: Prisma.InputJsonValue;
};

export function findSourcesByWorkspaceId(
    workspaceId: string,
    filters: ListSourcesQuery = {},
) {
    const where: Prisma.SourceWhereInput = { workspaceId };

    if (filters.type) {
        where.type = filters.type;
    }

    if (filters.status) {
        where.status = filters.status;
    }

    if (filters.q) {
        where.OR = [
            { title: { contains: filters.q, mode: "insensitive" } },
            { content: { contains: filters.q, mode: "insensitive" } },
        ];
    }

    return prisma.source.findMany({
        where,
        select: sourceSelect,
        orderBy: { createdAt: "desc" },
    });
}

export function findSourcesByUserId(
    userId: string,
    filters: ListSourcesQuery = {},
) {
    const where: Prisma.SourceWhereInput = { userId, scope: "PRIVATE" };

    if (filters.type) {
        where.type = filters.type;
    }

    if (filters.status) {
        where.status = filters.status;
    }

    if (filters.q) {
        where.OR = [
            { title: { contains: filters.q, mode: "insensitive" } },
            { content: { contains: filters.q, mode: "insensitive" } },
        ];
    }

    return prisma.source.findMany({
        where,
        select: sourceSelect,
        orderBy: { createdAt: "desc" },
    });
}

export function findGlobalSources(filters: ListSourcesQuery = {}) {
    const where: Prisma.SourceWhereInput = { scope: "GLOBAL" };

    if (filters.type) {
        where.type = filters.type;
    }

    if (filters.status) {
        where.status = filters.status;
    }

    if (filters.jurisdiction) {
        where.jurisdiction = filters.jurisdiction;
    }

    if (filters.q) {
        where.OR = [
            { title: { contains: filters.q, mode: "insensitive" } },
            { content: { contains: filters.q, mode: "insensitive" } },
        ];
    }

    return prisma.source.findMany({
        where,
        select: sourceSelect,
        orderBy: { createdAt: "desc" },
    });
}

export function findSourceByIdAndWorkspaceId(
    sourceId: string,
    workspaceId: string,
) {
    return prisma.source.findFirst({
        where: { id: sourceId, workspaceId },
        select: sourceSelect,
    });
}

export function findSourceByIdAndUserId(
    sourceId: string,
    userId: string,
) {
    return prisma.source.findFirst({
        where: { id: sourceId, userId },
        select: sourceSelect,
    });
}

export function createSourceRecord(data: CreateSourceData) {
    return prisma.source.create({
        data: {
            workspaceId: data.workspaceId ?? null,
            userId: data.userId ?? null,
            scope: data.scope ?? (data.workspaceId ? "PRIVATE" : "GLOBAL"),
            jurisdiction: data.jurisdiction ?? "INDIA",
            type: data.type,
            title: data.title,
            content: data.content ?? null,
            url: data.url ?? null,
            status: data.status ?? "PENDING",
            tags: data.tags ?? [],
            metadata: data.metadata,
        },
        select: sourceSelect,
    });
}

export function findSourceById(sourceId: string) {
    return prisma.source.findUnique({
        where: { id: sourceId },
        select: sourceSelect,
    });
}

export function updateSourceRecord(
    sourceId: string,
    data: {
        content?: string | null;
        status?: SourceRecord["status"];
        tags?: string[];
        jurisdiction?: string | null;
        metadata?: Prisma.InputJsonValue;
    },
) {
    return prisma.source.update({
        where: { id: sourceId },
        data,
        select: sourceSelect,
    });
}

export function deleteSourceRecord(sourceId: string) {
    return prisma.source.delete({
        where: { id: sourceId },
    });
}

export function deleteSourcesBySourceIds(sourceIds: string[]) {
    return prisma.source.deleteMany({
        where: { id: { in: sourceIds } },
    });
}
