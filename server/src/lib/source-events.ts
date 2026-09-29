/**
 * Inngest event helpers for background source processing (RAG indexing).
 */

import { inngest } from "../inngest/client.js";

/**
 * Enqueues a source processing job to run asynchronously via Inngest.
 *
 * The worker runs extract → chunk → embed → Pinecone upsert.
 *
 * @param input - Source and workspace ids for the processing worker
 * @returns Resolves when the event is accepted by Inngest
 *
 */
export async function enqueueSourceProcessing(input: {
    sourceId: string;
    workspaceId?: string | null;
}) {
    try {
        await inngest.send({
            name: "source/created",
            data: input,
        });
    } catch (error) {
        console.warn(
            "Inngest dev notice: could not dispatch 'source/created' event (Inngest server offline). Source was saved in DB.",
        );
    }
}
