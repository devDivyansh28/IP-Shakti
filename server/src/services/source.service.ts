import type { Prisma, SourceScope } from "../generated/prisma/client.js";
import { uploadPdfToCloudinary } from "../lib/cloudinary.js";
import { extractPdfFromBuffer } from "../lib/pdf.js";
import { scrapeWebsite } from "../lib/firecrawl.js";
import { enqueueSourceProcessing } from "../lib/source-events.js";
import { fetchYoutubeTranscript } from "../lib/youtube.js";
import {
    createSourceRecord,
    deleteSourceRecord,
    deleteSourcesBySourceIds,
    findGlobalSources,
    findSourceById,
    findSourceByIdAndUserId,
    findSourceByIdAndWorkspaceId,
    findSourcesByUserId,
    findSourcesByWorkspaceId,
    updateSourceRecord,
    type SourceRecord,
} from "../repositories/source.repository.js";
import { getWorkspaceByIdForUser } from "./workspace.service.js";
import { NotFoundError, UnauthorizedError } from "../types/app-error.js";
import type {
    CreateSourceInput,
    ImportDatabaseInput,
    ImportWebsiteInput,
    ImportWebSearchInput,
    ImportYoutubeInput,
    ListSourcesQuery,
    ReprocessSourcesInput,
} from "../validators/source.validator.js";
import { listChunksForSource, removeSourceFromIndex } from "./source-processing.service.js";

/**
 * Persists a source row and enqueues the Inngest processing pipeline.
 */
async function createAndProcessSource(
    data: Parameters<typeof createSourceRecord>[0],
) {
    const source = await createSourceRecord(data);

    await enqueueSourceProcessing({
        sourceId: source.id,
        workspaceId: source.workspaceId ?? undefined,
    });

    return source;
}

/**
 * Lists Central / Global sources (admin-managed authoritative knowledge base).
 */
export async function listCentralSources(filters: ListSourcesQuery = {}) {
    return findGlobalSources(filters);
}

/**
 * Lists sources in a workspace or a user's normal private library.
 */
export async function listSourcesForUser(
    userId: string,
    workspaceId?: string | null,
    filters: ListSourcesQuery = {},
) {
    if (workspaceId) {
        await getWorkspaceByIdForUser(workspaceId, userId);
        return findSourcesByWorkspaceId(workspaceId, filters);
    }
    return findSourcesByUserId(userId, filters);
}

/**
 * Alias for workspace-scoped source listing
 */
export const listSourcesForWorkspace = (
    workspaceId: string,
    userId: string,
    filters: ListSourcesQuery = {},
) => listSourcesForUser(userId, workspaceId, filters);

/**
 * Loads a single source after verifying ownership or global access.
 */
export async function getSourceForUser(
    sourceId: string,
    userId: string,
    workspaceId?: string | null,
): Promise<SourceRecord> {
    const source = await findSourceById(sourceId);

    if (!source) {
        throw new NotFoundError("Source not found");
    }

    if (source.scope === "GLOBAL") {
        return source;
    }

    if (workspaceId && source.workspaceId === workspaceId) {
        await getWorkspaceByIdForUser(workspaceId, userId);
        return source;
    }

    if (source.userId === userId) {
        return source;
    }

    throw new NotFoundError("Source not found");
}

export const getSourceForWorkspace = (
    workspaceId: string,
    sourceId: string,
    userId: string,
) => getSourceForUser(sourceId, userId, workspaceId);

/**
 * Creates a plain-text or markdown source (Central Global or User Private).
 */
export async function createTextOrMarkdownSource(
    userId: string,
    input: CreateSourceInput,
    options?: {
        workspaceId?: string | null;
        scope?: SourceScope;
    },
) {
    if (options?.workspaceId) {
        await getWorkspaceByIdForUser(options.workspaceId, userId);
    }

    return createAndProcessSource({
        workspaceId: options?.workspaceId ?? null,
        userId,
        scope: options?.scope ?? (options?.workspaceId ? "PRIVATE" : "GLOBAL"),
        jurisdiction: input.jurisdiction ?? "INDIA",
        tags: input.tags ?? [],
        type: input.type,
        title: input.title,
        content: input.content,
        status: "PENDING",
    });
}

/**
 * Uploads a PDF to Cloudinary and queues processing.
 */
export async function uploadPdfSource(
    userId: string,
    file: Express.Multer.File,
    options?: {
        workspaceId?: string | null;
        scope?: SourceScope;
        title?: string;
        jurisdiction?: string;
        tags?: string[];
    },
) {
    if (options?.workspaceId) {
        await getWorkspaceByIdForUser(options.workspaceId, userId);
    }

    const upload = await uploadPdfToCloudinary(
        file.buffer,
        file.originalname,
    );

    let content: string | null = null;
    let pageCount: number | undefined;

    try {
        const extracted = await extractPdfFromBuffer(file.buffer);
        content = extracted.text;
        pageCount = extracted.pageCount;
    } catch {
        // Inngest will retry extraction from Cloudinary if upload-time parse fails.
    }

    return createAndProcessSource({
        workspaceId: options?.workspaceId ?? null,
        userId,
        scope: options?.scope ?? (options?.workspaceId ? "PRIVATE" : "GLOBAL"),
        jurisdiction: options?.jurisdiction ?? "INDIA",
        tags: options?.tags ?? [],
        type: "PDF",
        title: options?.title?.trim() || file.originalname.replace(/\.pdf$/i, ""),
        content,
        status: "PENDING",
        metadata: {
            fileUrl: upload.secureUrl,
            fileName: upload.originalFilename,
            fileSize: upload.bytes,
            publicId: upload.publicId,
            resourceType: upload.resourceType,
            pageCount,
        },
    });
}

/**
 * Scrapes a website via Firecrawl and creates a source.
 */
export async function importWebsiteSource(
    userId: string,
    input: ImportWebsiteInput,
    options?: {
        workspaceId?: string | null;
        scope?: SourceScope;
    },
) {
    if (options?.workspaceId) {
        await getWorkspaceByIdForUser(options.workspaceId, userId);
    }

    const scraped = await scrapeWebsite(input.url);

    return createAndProcessSource({
        workspaceId: options?.workspaceId ?? null,
        userId,
        scope: options?.scope ?? (options?.workspaceId ? "PRIVATE" : "GLOBAL"),
        jurisdiction: input.jurisdiction ?? "INDIA",
        tags: input.tags ?? [],
        type: "WEBSITE",
        title: input.title || scraped.title || input.url,
        content: scraped.markdown,
        url: scraped.sourceUrl,
        status: "PENDING",
        metadata: {
            importedFrom: scraped.sourceUrl,
        },
    });
}

/**
 * Fetches a YouTube transcript and creates a source.
 */
export async function importYoutubeSource(
    userId: string,
    input: ImportYoutubeInput,
    options?: {
        workspaceId?: string | null;
        scope?: SourceScope;
    },
) {
    if (options?.workspaceId) {
        await getWorkspaceByIdForUser(options.workspaceId, userId);
    }

    const transcript = await fetchYoutubeTranscript(input.url);

    return createAndProcessSource({
        workspaceId: options?.workspaceId ?? null,
        userId,
        scope: options?.scope ?? (options?.workspaceId ? "PRIVATE" : "GLOBAL"),
        jurisdiction: input.jurisdiction ?? "INDIA",
        tags: input.tags ?? [],
        type: "YOUTUBE",
        title: input.title || `YouTube: ${transcript.videoId}`,
        content: transcript.content,
        url: input.url,
        status: "PENDING",
        metadata: {
            videoId: transcript.videoId,
        },
    });
}

/**
 * Ingests structured database / TKDL records and queues processing.
 */
export async function importDatabaseSource(
    userId: string,
    input: ImportDatabaseInput,
    options?: {
        workspaceId?: string | null;
        scope?: SourceScope;
    },
) {
    if (options?.workspaceId) {
        await getWorkspaceByIdForUser(options.workspaceId, userId);
    }

    const combinedContent = input.records
        .map((record, index) => {
            const header = `=== RECORD ${index + 1}: ${record.title} ===`;
            return `${header}\n${record.content}`;
        })
        .join("\n\n---\n\n");

    return createAndProcessSource({
        workspaceId: options?.workspaceId ?? null,
        userId,
        scope: options?.scope ?? "GLOBAL",
        jurisdiction: input.jurisdiction ?? "INDIA",
        tags: input.tags ?? ["TKDL", "DATABASE"],
        type: "DATABASE",
        title: input.title,
        content: combinedContent,
        status: "PENDING",
        metadata: {
            totalRecords: input.records.length,
            importedAt: new Date().toISOString(),
        },
    });
}

/**
 * Deletes a source, its vectors, and its chunks.
 */
export async function deleteSourceForUser(
    sourceId: string,
    userId: string,
    workspaceId?: string | null,
    isAdmin = false,
) {
    const source = await findSourceById(sourceId);
    if (!source) {
        throw new NotFoundError("Source not found");
    }

    if (!isAdmin && source.scope === "GLOBAL") {
        throw new UnauthorizedError("Cannot delete central knowledge base sources");
    }

    if (!isAdmin && source.userId && source.userId !== userId) {
        throw new UnauthorizedError("You do not own this source");
    }

    await removeSourceFromIndex(sourceId, workspaceId ?? source.workspaceId);
    await deleteSourceRecord(sourceId);
}

export const deleteSourceForWorkspace = (
    workspaceId: string,
    sourceId: string,
    userId: string,
) => deleteSourceForUser(sourceId, userId, workspaceId);

/**
 * Returns indexed chunks for a source.
 */
export async function getSourceChunksForUser(
    sourceId: string,
    userId: string,
    workspaceId?: string | null,
) {
    await getSourceForUser(sourceId, userId, workspaceId);
    return listChunksForSource(sourceId);
}

export const getSourceChunksForWorkspace = (
    workspaceId: string,
    sourceId: string,
    userId: string,
) => getSourceChunksForUser(sourceId, userId, workspaceId);

/**
 * Bulk deletes sources.
 */
export async function bulkDeleteSourcesForWorkspace(
    workspaceId: string,
    userId: string,
    sourceIds: string[],
) {
    await getWorkspaceByIdForUser(workspaceId, userId);

    for (const sourceId of sourceIds) {
        await removeSourceFromIndex(sourceId, workspaceId);
    }

    await deleteSourcesBySourceIds(sourceIds);
}

/**
 * Reprocesses sources.
 */
export async function reprocessSourcesForWorkspace(
    workspaceId: string,
    userId: string,
    input: ReprocessSourcesInput = {},
) {
    await getWorkspaceByIdForUser(workspaceId, userId);

    const sources = await findSourcesByWorkspaceId(workspaceId, {
        status: "FAILED",
    });

    const targets = input.sourceIds?.length
        ? sources.filter((source) => input.sourceIds?.includes(source.id))
        : sources;

    for (const source of targets) {
        await reprocessSourceForWorkspace(workspaceId, source.id, userId);
    }

    return { reprocessed: targets.length };
}

/**
 * Clears vectors/chunks and re-queues a single source for full re-indexing.
 */
export async function reprocessSourceForWorkspace(
    workspaceId: string,
    sourceId: string,
    userId: string,
) {
    const source = await getSourceForWorkspace(workspaceId, sourceId, userId);

    await removeSourceFromIndex(sourceId, workspaceId);

    const metadata =
        source.metadata &&
        typeof source.metadata === "object" &&
        !Array.isArray(source.metadata)
            ? { ...(source.metadata as Record<string, unknown>) }
            : {};

    delete (metadata as Record<string, unknown>).processingError;

    await updateSourceRecord(sourceId, {
        status: "PENDING",
        metadata: metadata as Prisma.InputJsonValue,
    });

    await enqueueSourceProcessing({ sourceId, workspaceId });
}

/**
 * Saves web search results as a WEBSITE source.
 */
export async function importWebSearchSource(
    userId: string,
    input: ImportWebSearchInput,
    options?: {
        workspaceId?: string | null;
        scope?: SourceScope;
    },
) {
    if (options?.workspaceId) {
        await getWorkspaceByIdForUser(options.workspaceId, userId);
    }

    return createAndProcessSource({
        workspaceId: options?.workspaceId ?? null,
        userId,
        scope: options?.scope ?? (options?.workspaceId ? "PRIVATE" : "GLOBAL"),
        jurisdiction: input.jurisdiction ?? "INDIA",
        tags: input.tags ?? ["web-search"],
        type: "WEBSITE",
        title: input.title,
        content: input.content,
        url: input.url,
        status: "PENDING",
        metadata: {
            importedFrom: "web-search",
            sourceUrl: input.url,
        },
    });
}
