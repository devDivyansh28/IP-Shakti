import "dotenv/config";
import prisma from "../src/lib/db.js";
import { embedTexts } from "../src/lib/openai.js";
import { upsertNamespaceVectors, type VectorMetadata } from "../src/lib/pinecone.js";
import type { PineconeRecord } from "@pinecone-database/pinecone";

async function main() {
    console.log("=== IP-SAKTI Sahayak: Seed Corpus Sync to Global Namespace ===");

    const seedSources = await prisma.source.findMany({
        where: {
            workspaceId: "cmtukzatv00007o7nz7wcicx2",
        },
        include: {
            chunks: {
                orderBy: { index: "asc" },
            },
        },
    });

    console.log(`Found ${seedSources.length} seed sources to synchronize.`);

    let totalVectorsUpserted = 0;

    for (const source of seedSources) {
        const jurisdiction =
            source.jurisdiction === "IN" ? "INDIA" : (source.jurisdiction ?? "INDIA");

        // Update DB source record to GLOBAL scope and standardized jurisdiction
        await prisma.source.update({
            where: { id: source.id },
            data: {
                scope: "GLOBAL",
                jurisdiction,
            },
        });

        console.log(`Updated DB source: "${source.title}" -> scope: GLOBAL, jurisdiction: ${jurisdiction}`);

        const chunks = source.chunks;
        if (chunks.length === 0) {
            console.log(`  No chunks found for source ${source.id}`);
            continue;
        }

        console.log(`  Embedding and syncing ${chunks.length} chunks to Pinecone 'global' namespace...`);

        const batchSize = 20;
        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);
            const texts = batch.map((c) => c.content);
            const embeddings = await embedTexts(texts);

            const records: PineconeRecord<VectorMetadata>[] = [];
            for (let j = 0; j < batch.length; j++) {
                const chunk = batch[j]!;
                const embedding = embeddings[j]!;
                const chunkMeta =
                    chunk.metadata && typeof chunk.metadata === "object" && !Array.isArray(chunk.metadata)
                        ? (chunk.metadata as Record<string, unknown>)
                        : {};

                records.push({
                    id: chunk.id,
                    values: embedding,
                    metadata: {
                        sourceId: source.id,
                        chunkId: chunk.id,
                        chunkIndex: chunk.index,
                        sourceTitle: source.title,
                        sourceType: source.type,
                        scope: "GLOBAL",
                        jurisdiction,
                        tags: source.tags ?? [],
                        text: chunk.content.slice(0, 35000),
                        ...(typeof chunkMeta.page === "number" ? { page: chunkMeta.page } : {}),
                    },
                });
            }

            await upsertNamespaceVectors("global", records);
            totalVectorsUpserted += records.length;
        }
    }

    console.log(`\nSuccessfully synced ${totalVectorsUpserted} vector chunks into 'global' namespace.`);
    await prisma.$disconnect();
    process.exit(0);
}

main().catch((err) => {
    console.error("Sync error:", err);
    process.exit(1);
});
