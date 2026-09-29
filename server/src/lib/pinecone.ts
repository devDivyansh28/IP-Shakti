import {
    Pinecone,
    type Index,
    type PineconeRecord,
} from "@pinecone-database/pinecone";
import { EMBEDDING_DIMENSIONS } from "./openai.js";

const indexName = process.env.PINECONE_INDEX ?? "ipshakti";

let pineconeClient: Pinecone | null = null;
let indexReady = false;

/**
 * Returns a singleton Pinecone client.
 *
 * @throws When `PINECONE_API_KEY` is missing
 */
function getPineconeClient() {
    if (!process.env.PINECONE_API_KEY) {
        throw new Error("PINECONE_API_KEY is not configured");
    }

    if (!pineconeClient) {
        pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    }

    return pineconeClient;
}

/**
 * Polls until a newly created Pinecone index reports ready status.
 *
 * @param name - Index name to wait on
 * @throws When the index is not ready after 30 attempts (~60s)
 */
async function waitForIndexReady(name: string) {
    const client = getPineconeClient();

    for (let attempt = 0; attempt < 30; attempt += 1) {
        const description = await client.describeIndex(name);
        if (description.status?.ready) {
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error(`Pinecone index "${name}" did not become ready in time`);
}

/**
 * Ensures the Pinecone index exists and is ready (creates it on first run if missing).
 *
 * @returns Resolves when the index is available
 */
export async function ensurePineconeIndex() {
    if (indexReady) {
        return;
    }

    const client = getPineconeClient();
    const indexes = await client.listIndexes();
    const exists = indexes.indexes?.some((index) => index.name === indexName);

    if (!exists) {
        await client.createIndex({
            name: indexName,
            dimension: EMBEDDING_DIMENSIONS,
            metric: "cosine",
            spec: {
                serverless: {
                    cloud: "aws",
                    region: "us-east-1",
                },
            },
        });
        await waitForIndexReady(indexName);
    }

    indexReady = true;
}

/**
 * Returns the configured Pinecone index handle.
 *
 * @returns Pinecone `Index` instance
 */
export async function getPineconeIndex(): Promise<Index> {
    await ensurePineconeIndex();
    return getPineconeClient().index({ name: indexName });
}

/** Metadata stored on each Pinecone vector for IP-SAKTI RAG retrieval and citations. */
export type VectorMetadata = {
    workspaceId?: string;
    userId?: string;
    sourceId: string;
    chunkId: string;
    chunkIndex: number;
    sourceTitle: string;
    sourceType: string;
    scope: "GLOBAL" | "PRIVATE";
    jurisdiction?: string;
    tags?: string[];
    text: string;
    page?: number;
};

/**
 * Upserts source chunk vectors into a target namespace in batches of 100.
 *
 * @param namespaceKey - Pinecone namespace ('global', 'user_<id>', or 'project_<id>')
 * @param records - Vector records with embeddings and metadata
 */
export async function upsertNamespaceVectors(
    namespaceKey: string,
    records: PineconeRecord<VectorMetadata>[],
) {
    if (records.length === 0) {
        return;
    }

    const index = await getPineconeIndex();
    const namespace = index.namespace(namespaceKey);

    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
        await namespace.upsert({ records: records.slice(i, i + batchSize) });
    }
}

/** Alias for backward compatibility */
export const upsertSourceVectors = upsertNamespaceVectors;

/**
 * Deletes all vectors belonging to a source within a namespace.
 *
 * @param namespaceKey - Pinecone namespace
 * @param sourceId - Source whose vectors should be removed
 */
export async function deleteNamespaceVectors(
    namespaceKey: string,
    sourceId: string,
) {
    try {
        const index = await getPineconeIndex();
        await index.namespace(namespaceKey).deleteMany({
            filter: { sourceId: { $eq: sourceId } },
        });
    } catch (error: any) {
        if (
            error?.status === 404 ||
            error?.name === "PineconeNotFoundError" ||
            error?.message?.includes("404")
        ) {
            return;
        }
        throw error;
    }
}

/** Alias for backward compatibility */
export const deleteSourceVectors = deleteNamespaceVectors;

/**
 * Deletes an entire namespace.
 *
 * @param namespaceKey - Pinecone namespace to wipe
 */
export async function deleteNamespace(namespaceKey: string) {
    try {
        const index = await getPineconeIndex();
        await index.namespace(namespaceKey).deleteAll();
    } catch (error: any) {
        if (
            error?.status === 404 ||
            error?.name === "PineconeNotFoundError" ||
            error?.message?.includes("404")
        ) {
            return;
        }
        throw error;
    }
}

/** Alias for backward compatibility */
export const deleteWorkspaceVectors = deleteNamespace;

/**
 * Queries a namespace for the most similar vectors to a query embedding with optional filtering.
 *
 * @param namespaceKey - Pinecone namespace to search ('global', 'user_<id>', etc.)
 * @param vector - Query embedding (1536 dimensions)
 * @param topK - Maximum number of matches to return
 * @param filter - Optional metadata filter (e.g. jurisdiction or scope)
 */
export async function queryNamespaceVectors(
    namespaceKey: string,
    vector: number[],
    topK: number,
    filter?: Record<string, unknown>,
) {
    const index = await getPineconeIndex();
    const result = await index.namespace(namespaceKey).query({
        vector,
        topK,
        includeMetadata: true,
        filter: filter as Record<string, unknown> | undefined,
    });

    return result.matches ?? [];
}

/** Alias for backward compatibility */
export const queryWorkspaceVectors = (
    namespaceKey: string,
    vector: number[],
    topK: number,
) => queryNamespaceVectors(namespaceKey, vector, topK);

export { indexName as PINECONE_INDEX_NAME };
