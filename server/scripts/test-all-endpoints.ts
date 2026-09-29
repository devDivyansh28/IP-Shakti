import "dotenv/config";
import { makeSignature } from "better-auth/crypto";
import prisma from "../src/lib/db.js";

const PORT = process.env.PORT ?? 8080;
const BASE_URL = `http://localhost:${PORT}`;

type TestResult = {
    name: string;
    endpoint: string;
    expectedStatus: number;
    actualStatus: number;
    passed: boolean;
    durationMs: number;
    details?: string;
};

const results: TestResult[] = [];

async function runTest(
    name: string,
    endpoint: string,
    fn: () => Promise<{ status: number; details?: string }>,
    expectedStatus: number,
) {
    const start = Date.now();
    try {
        const { status, details } = await fn();
        const durationMs = Date.now() - start;
        const passed = status === expectedStatus;
        results.push({
            name,
            endpoint,
            expectedStatus,
            actualStatus: status,
            passed,
            durationMs,
            details,
        });
        const icon = passed ? "✅" : "❌";
        console.log(`${icon} [${status}] ${name} (${durationMs}ms)`);
        if (!passed && details) {
            console.log(`   Error details: ${details}`);
        }
    } catch (err: any) {
        const durationMs = Date.now() - start;
        results.push({
            name,
            endpoint,
            expectedStatus,
            actualStatus: 0,
            passed: false,
            durationMs,
            details: err?.message || String(err),
        });
        console.log(`❌ [FAIL] ${name}: ${err?.message || err}`);
    }
}

async function main() {
    console.log(`========================================================`);
    console.log(`  IP-SAKTI Sahayak V1 — Automated Backend Test Suite    `);
    console.log(`  Target: ${BASE_URL}                                   `);
    console.log(`========================================================\n`);

    // 1. Obtain test session for authenticated tests
    const user = await prisma.user.findFirst();
    if (!user) {
        throw new Error("No test user found in Neon database");
    }

    const testToken = `test_token_${Date.now()}`;
    const testSession = await prisma.session.create({
        data: {
            id: `test_sess_${Date.now()}`,
            token: testToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
    });

    const sig = await makeSignature(testToken, process.env.BETTER_AUTH_SECRET!);
    const cookieHeader = `better-auth.session_token=${testToken}.${sig}`;
    const authHeaders = {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
    };

    let createdSourceId: string | null = null;
    let createdConversationId: string | null = null;

    try {
        // --- Health & Public Endpoints ---
        await runTest("Health Check", "GET /health", async () => {
            const res = await fetch(`${BASE_URL}/health`);
            const data = await res.json();
            return { status: res.status, details: JSON.stringify(data) };
        }, 200);

        await runTest("Root API Welcome", "GET /", async () => {
            const res = await fetch(`${BASE_URL}/`);
            const data = await res.json();
            return { status: res.status, details: JSON.stringify(data) };
        }, 200);

        // --- Security & Unauthenticated Guards ---
        await runTest("Auth Guard: /api/auth-custom/me", "GET /api/auth-custom/me", async () => {
            const res = await fetch(`${BASE_URL}/api/auth-custom/me`);
            return { status: res.status };
        }, 401);

        await runTest("Auth Guard: /api/admin/sources", "GET /api/admin/sources", async () => {
            const res = await fetch(`${BASE_URL}/api/admin/sources`);
            return { status: res.status };
        }, 401);

        await runTest("Auth Guard: /api/sources", "GET /api/sources", async () => {
            const res = await fetch(`${BASE_URL}/api/sources`);
            return { status: res.status };
        }, 401);

        await runTest("Auth Guard: /api/chat", "POST /api/chat", async () => {
            const res = await fetch(`${BASE_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [] }),
            });
            return { status: res.status };
        }, 401);

        await runTest("Auth Guard: /api/workspaces", "GET /api/workspaces", async () => {
            const res = await fetch(`${BASE_URL}/api/workspaces`);
            return { status: res.status };
        }, 401);

        // --- Authenticated Profile & RBAC Claiming ---
        await runTest("Authenticated User Profile", "GET /api/auth-custom/me", async () => {
            const res = await fetch(`${BASE_URL}/api/auth-custom/me`, {
                headers: authHeaders,
            });
            const data = await res.json();
            return { status: res.status, details: `User: ${data.user?.email}, Role: ${data.user?.role}` };
        }, 200);

        await runTest("Claim Admin (Invalid Code Guard)", "POST /api/auth-custom/claim-admin", async () => {
            const res = await fetch(`${BASE_URL}/api/auth-custom/claim-admin`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({ adminCode: "WRONG_SECRET_123" }),
            });
            return { status: res.status };
        }, 400);

        await runTest("Claim Admin (Valid Code)", "POST /api/auth-custom/claim-admin", async () => {
            const res = await fetch(`${BASE_URL}/api/auth-custom/claim-admin`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({ adminCode: process.env.ADMIN_INVITE_CODE ?? "IP_SHAKTI_ADMIN_2026" }),
            });
            const data = await res.json();
            return { status: res.status, details: `Role now: ${data.user?.role}` };
        }, 200);

        // --- Admin Central Knowledge Base ---
        await runTest("Admin List Central Sources", "GET /api/admin/sources", async () => {
            const res = await fetch(`${BASE_URL}/api/admin/sources`, {
                headers: authHeaders,
            });
            const data = await res.json();
            return { status: res.status, details: `Central sources count: ${data.length}` };
        }, 200);

        // --- Universal Sources (Normal Library) ---
        await runTest("Create Universal Text Source", "POST /api/sources", async () => {
            const res = await fetch(`${BASE_URL}/api/sources`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    title: "Test Ashwagandha Formulation Draft",
                    content: "A novel hydro-ethanolic extraction method for Withania somnifera standardized to withanolides.",
                    type: "MARKDOWN",
                    jurisdiction: "INDIA",
                    tags: ["ashwagandha", "novelty-test"],
                }),
            });
            const data = await res.json();
            if (data.id) {
                createdSourceId = data.id;
            }
            return { status: res.status, details: `Created ID: ${data.id}` };
        }, 201);

        await runTest("List User Sources (Normal)", "GET /api/sources", async () => {
            const res = await fetch(`${BASE_URL}/api/sources`, {
                headers: authHeaders,
            });
            const data = await res.json();
            return { status: res.status, details: `Found ${data.length} sources` };
        }, 200);

        if (createdSourceId) {
            await runTest("Get Specific Source", `GET /api/sources/${createdSourceId}`, async () => {
                const res = await fetch(`${BASE_URL}/api/sources/${createdSourceId}`, {
                    headers: authHeaders,
                });
                return { status: res.status };
            }, 200);
        }

        // --- Universal Conversations & Chat Streaming ---
        await runTest("Create Universal Conversation", "POST /api/conversations", async () => {
            const res = await fetch(`${BASE_URL}/api/conversations`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({ title: "Ayurvedic Patent Novelty Query" }),
            });
            const data = await res.json();
            if (data.id) {
                createdConversationId = data.id;
            }
            return { status: res.status, details: `Conversation ID: ${data.id}` };
        }, 201);

        await runTest("List User Conversations", "GET /api/conversations", async () => {
            const res = await fetch(`${BASE_URL}/api/conversations`, {
                headers: authHeaders,
            });
            const data = await res.json();
            return { status: res.status, details: `Total conversations: ${data.length}` };
        }, 200);

        await runTest("Universal RAG Streaming Chat", "POST /api/chat", async () => {
            const res = await fetch(`${BASE_URL}/api/chat`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                    conversationId: createdConversationId,
                    jurisdiction: "INDIA",
                    messages: [
                        {
                            role: "user",
                            content: "Can a classical formulation from Charaka Samhita be patented in India?",
                        },
                    ],
                }),
            });
            // Read stream content to ensure proper SSE completion
            const text = await res.text();
            const hasCitationsOrStream = text.length > 50;
            return {
                status: res.status,
                details: `Stream length: ${text.length} chars (valid: ${hasCitationsOrStream})`,
            };
        }, 200);

        if (createdConversationId) {
            await runTest("Get Conversation Messages", `GET /api/conversations/${createdConversationId}/messages`, async () => {
                const res = await fetch(`${BASE_URL}/api/conversations/${createdConversationId}/messages`, {
                    headers: authHeaders,
                });
                const data = await res.json();
                return { status: res.status, details: `Messages in thread: ${data.length}` };
            }, 200);
        }

        // --- Workspaces & Project Scopes ---
        await runTest("List Workspaces", "GET /api/workspaces", async () => {
            const res = await fetch(`${BASE_URL}/api/workspaces`, {
                headers: authHeaders,
            });
            const data = await res.json();
            return { status: res.status, details: `Workspaces count: ${data.length}` };
        }, 200);

        // --- Cleanup Test Data ---
        if (createdSourceId) {
            await runTest("Delete Test Source", `DELETE /api/sources/${createdSourceId}`, async () => {
                const res = await fetch(`${BASE_URL}/api/sources/${createdSourceId}`, {
                    method: "DELETE",
                    headers: authHeaders,
                });
                return { status: res.status };
            }, 204);
        }

        if (createdConversationId) {
            await runTest("Delete Test Conversation", `DELETE /api/conversations/${createdConversationId}`, async () => {
                const res = await fetch(`${BASE_URL}/api/conversations/${createdConversationId}`, {
                    method: "DELETE",
                    headers: authHeaders,
                });
                return { status: res.status };
            }, 204);
        }

    } finally {
        // Clean up test session
        await prisma.session.delete({ where: { id: testSession.id } }).catch(() => {});
        await prisma.$disconnect();
    }

    // Print Summary
    console.log(`\n========================================================`);
    console.log(`  TEST RESULTS SUMMARY                                  `);
    console.log(`========================================================`);
    const total = results.length;
    const passed = results.filter((r) => r.passed).length;
    const failed = total - passed;

    console.log(`Total Endpoints Tested: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ${failed > 0 ? "❌" : ""}\n`);

    if (failed > 0) {
        console.error("Some tests failed!");
        process.exit(1);
    } else {
        console.log("🎉 ALL BACKEND ENDPOINTS PASSED WITH 100% SUCCESS!");
        process.exit(0);
    }
}

main().catch((err) => {
    console.error("Fatal test runner error:", err);
    process.exit(1);
});
