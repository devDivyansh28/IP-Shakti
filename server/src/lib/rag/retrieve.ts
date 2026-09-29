/**
 * IP-SAKTI Sahayak: Dual-Tier RAG retrieval and legal system prompt engine.
 *
 * Implements:
 * 1. Parallel retrieval across Central Knowledge Base ('global') and User Private Documents ('user_<id>' or 'project_<id>')
 * 2. Explicit Jurisdiction Switch (India vs International vs Both)
 * 3. 6-Way Formulation Regulatory Classification diagnostic flow
 * 4. Strict inline citations with origin attribution ([Central Library] vs [My Document])
 * 5. Safe abstention & standing legal disclaimer
 */

import { RAG_MIN_SCORE, RAG_TOP_K } from "../ai-config.js";
import { embedTexts } from "../openai.js";
import { queryNamespaceVectors } from "../pinecone.js";

/** A source chunk returned from Pinecone with similarity score and legal metadata. */
export type RetrievedChunk = {
    sourceId: string;
    sourceTitle: string;
    sourceType: string;
    scope: "GLOBAL" | "PRIVATE";
    jurisdiction: string;
    tags: string[];
    chunkId: string;
    chunkIndex: number;
    page?: number;
    text: string;
    score: number;
};

export type JurisdictionMode = "INDIA" | "INTERNATIONAL" | "BOTH";

/**
 * Retrieves context chunks in parallel across Central and Private namespaces.
 *
 * @param params.userId - Current user id (searches 'user_<userId>')
 * @param params.workspaceId - Optional workspace/project id (searches 'project_<workspaceId>')
 * @param params.query - Natural language user question or formulation description
 * @param params.jurisdiction - Jurisdiction filter ('INDIA', 'INTERNATIONAL', 'BOTH')
 */
export async function retrieveDualTierContext(params: {
    userId?: string;
    workspaceId?: string | null;
    query: string;
    jurisdiction?: JurisdictionMode;
}): Promise<RetrievedChunk[]> {
    const { userId, workspaceId, query, jurisdiction = "BOTH" } = params;
    const [embedding] = await embedTexts([query]);

    // Build metadata filter for Pinecone if specific jurisdiction requested
    let globalFilter: Record<string, unknown> | undefined;
    if (jurisdiction === "INDIA") {
        globalFilter = { jurisdiction: { $in: ["INDIA", "GENERAL"] } };
    } else if (jurisdiction === "INTERNATIONAL") {
        globalFilter = { jurisdiction: { $in: ["INTERNATIONAL", "GENERAL"] } };
    }

    // Determine namespaces to query
    const queries: Promise<any[]>[] = [
        // Always query Central Knowledge Base
        queryNamespaceVectors("global", embedding, RAG_TOP_K, globalFilter).catch((err) => {
            console.error("Central vector query error:", err);
            return [];
        }),
    ];

    // Query private namespace if user or project context exists
    if (workspaceId) {
        queries.push(
            queryNamespaceVectors(`project_${workspaceId}`, embedding, RAG_TOP_K).catch(() => []),
        );
    } else if (userId) {
        queries.push(
            queryNamespaceVectors(`user_${userId}`, embedding, RAG_TOP_K).catch(() => []),
        );
    }

    const [globalMatches, privateMatches = []] = await Promise.all(queries);
    const combinedMatches = [...globalMatches, ...privateMatches];

    const chunks: RetrievedChunk[] = [];
    const seenChunkIds = new Set<string>();

    for (const match of combinedMatches) {
        const score = match.score ?? 0;
        if (score < RAG_MIN_SCORE) {
            continue;
        }

        const metadata = match.metadata as Record<string, unknown> | undefined;
        if (
            !metadata ||
            typeof metadata.sourceId !== "string" ||
            typeof metadata.sourceTitle !== "string" ||
            typeof metadata.chunkId !== "string" ||
            typeof metadata.text !== "string"
        ) {
            continue;
        }

        if (seenChunkIds.has(metadata.chunkId)) {
            continue;
        }
        seenChunkIds.add(metadata.chunkId);

        chunks.push({
            sourceId: metadata.sourceId,
            sourceTitle: metadata.sourceTitle,
            sourceType: String(metadata.sourceType ?? "DOCUMENT"),
            scope: (metadata.scope as "GLOBAL" | "PRIVATE") ?? "GLOBAL",
            jurisdiction: String(metadata.jurisdiction ?? "INDIA"),
            tags: Array.isArray(metadata.tags) ? (metadata.tags as string[]) : [],
            chunkId: metadata.chunkId,
            chunkIndex: Number(metadata.chunkIndex ?? 0),
            page: typeof metadata.page === "number" ? metadata.page : undefined,
            text: metadata.text,
            score,
        });
    }

    // Sort by cosine similarity descending
    chunks.sort((a, b) => b.score - a.score);

    return chunks.slice(0, RAG_TOP_K * 2);
}

/** Backward compatibility alias */
export const retrieveWorkspaceContext = (workspaceId: string, query: string) =>
    retrieveDualTierContext({ workspaceId, query });

export type UserMemoryContext = string;

/**
 * Builds the full IP-SAKTI Sahayak system prompt with legal guardrails,
 * jurisdiction separation, and formulation diagnostic instructions.
 */
export function buildChatSystemPrompt(input: {
    chunks: RetrievedChunk[];
    conversationSummary?: string | null;
    userMemories?: UserMemoryContext[];
    webSearchEnabled?: boolean;
    jurisdiction?: JurisdictionMode;
}) {
    const jurisdictionMode = input.jurisdiction ?? "BOTH";

    const sections: string[] = [
        "You are IP-SAKTI Sahayak (IP-शक्ति सहायक), an authoritative AI assistant providing Intellectual Property (IPR) and regulatory guidance for the Ayurvedic ecosystem.",
        "Your mission is to help practitioners, researchers, AYUSH startups, MSMEs, and cultivators navigate patents, Traditional Knowledge protection, Access and Benefit Sharing (ABS), drug/food classification, and international treaties without conflation.",
        "",
        "=== CORE OPERATING MANDATES ===",
        "1. JURISDICTIONAL SEPARATION:",
        jurisdictionMode === "INDIA"
            ? "Focus strictly on National (India) Law: The Patents Act 1970 (and 2024 Rules), Biological Diversity Act 2002 (amended 2023, 2024 Rules), Drugs & Cosmetics Act 1940, and FSSAI Ayurveda-Aahar Regulations 2022."
            : jurisdictionMode === "INTERNATIONAL"
              ? "Focus strictly on International Regimes: TRIPS Agreement, Convention on Biological Diversity (CBD) & Nagoya Protocol, WIPO GRATK Treaty (2024), PCT patent filings, Madrid System (Trademarks), and major export market herbal regulations."
              : "When answering, ALWAYS keep National (India) guidance and International regimes clearly separated under distinct headings so they are never conflated.",
        "",
        "2. FORMULATION CLASSIFICATION DIAGNOSTIC FLOW:",
        "Because IPR for an Ayurvedic product is inseparable from regulatory classification, analyze or guide the formulation into its exact statutory bucket:",
        "  - Classical / Generic Medicine (First Schedule texts): Barred from patenting under Section 3(p) as Traditional Knowledge; defended through TKDL; registered Vaidyas exempt from local ABS.",
        "  - Patent & Proprietary (P&P) Medicine: Standardized or modified classical ingredients; licensed under D&C Act; high Section 3(d)/3(p) hurdle; non-exempt from Biological Diversity Act ABS duties.",
        "  - New Drug / Non-Classical Formulation: Novel extracts or synthetic combinations requiring clinical evidence; genuine patent potential under Section 48; mandatory National Biodiversity Authority (NBA) Section 6 approval.",
        "  - Phytopharmaceutical: Standardized fraction from botanical source; regulated under CDSCO; patentable composition & process; strict ABS duties.",
        "  - Ayurveda-Aahar / Nutraceutical: FSSAI 2022 regulations; strictly prohibited from claiming disease cure; trademark/design protection primary.",
        "  - Cosmetic: Regulated under Cosmetics Rules 2020; trademark/trade secret primary; cannot make medicinal claims.",
        "",
        "3. ACCESS & BENEFIT SHARING (ABS) & BIOPIRACY PREVENTION:",
        "Examine whether Indian biological resources are accessed for commercial utilization. Reference the 2023 Biological Diversity Amendment and 2024 Rules, explaining when State Biodiversity Board (SBB) or National Biodiversity Authority (NBA) approval is required.",
        "",
        "4. STRICT SOURCE CITATION & TRANSPARENCY:",
        "Every factual claim must cite its exact source using inline numbered markers ([1], [2], etc.).",
        "Refer to the exact origin provided in context (e.g. Central Library vs My Uploaded Document).",
        "NEVER invent or fabricate statutes, patent numbers, or classical verses.",
        "",
        "5. SAFE ABSTENTION & DISCLAIMER:",
        "If formulation specifics, ingredients, or intended jurisdictions are ambiguous, state clearly what is missing and ask clarifying questions instead of guessing.",
        "Include a standing closing note: 'Disclaimer: IP-SAKTI Sahayak provides informational guidance based on statutory sources and is not a substitute for formal legal counsel or patent agent representation.'",
    ];

    if (input.webSearchEnabled) {
        sections.push(
            "",
            "=== WEB SEARCH TOOL GUIDELINES ===",
            "You have access to a web_search tool for up-to-date patent gazettes, AYUSH notifications, and legal updates.",
            "Cite web results inline using [W1], [W2] matching web result blocks.",
            "Note: Always remind the user that web search results should be corroborated against official registers (e.g. IPO, USPTO, AYUSH portal).",
        );
    }

    if (input.userMemories?.length) {
        const memoryBlock = input.userMemories
            .map((memory) => `- ${memory}`)
            .join("\n");
        sections.push(
            "",
            "=== USER PROFILE & RESEARCH CONTEXT ===",
            memoryBlock,
        );
    }

    const summary = input.conversationSummary?.trim();
    if (summary) {
        sections.push(
            "",
            "=== EARLIER CONVERSATION SUMMARY ===",
            summary,
        );
    }

    if (input.chunks.length === 0) {
        sections.push(
            "",
            "=== RETRIEVED STATUTORY CONTEXT ===",
            "No specific retrieved context matched this query with sufficient confidence.",
            input.webSearchEnabled
                ? "Use web search to find current statutory or regulatory information, or answer from general knowledge."
                : "Answer helpfully from established Ayurvedic IPR principles, state the applicable statutory provisions, and suggest uploading the formulation document or searching the Central Library.",
            "Do not invent citations.",
        );
        return sections.join("\n");
    }

    const contextBlocks = input.chunks
        .map((chunk, index) => {
            const scopeBadge = chunk.scope === "GLOBAL" ? "Central Knowledge Base" : "My Uploaded Document";
            const pageInfo = chunk.page ? `, Page ${chunk.page}` : "";
            const jurisdictionBadge = chunk.jurisdiction ? ` [${chunk.jurisdiction}]` : "";
            const tagsBadge = chunk.tags.length ? ` (Tags: ${chunk.tags.join(", ")})` : "";
            const label = `[${index + 1}] ${chunk.sourceTitle} (${scopeBadge}${jurisdictionBadge}${pageInfo}${tagsBadge})`;
            return `${label}\n${chunk.text}`;
        })
        .join("\n\n---\n\n");

    sections.push(
        "",
        "=== RETRIEVED STATUTORY & SOURCE CONTEXT ===",
        "Ground your answer in the authoritative context below:",
        contextBlocks,
    );

    return sections.join("\n");
}
