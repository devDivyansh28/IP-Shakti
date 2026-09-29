import { headers } from "next/headers";
import type { Workspace } from "./types";

const apiUrl = process.env.API_URL ?? "http://localhost:8080";

async function fetchWorkspace(id: string): Promise<Workspace | null> {
    const requestHeaders = await headers();
    const cookie = requestHeaders.get("cookie") ?? "";

    const response = await fetch(`${apiUrl}/api/workspaces/${id}`, {
        headers: { cookie },
        cache: "no-store",
    });

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error("Failed to fetch workspace");
    }

    return response.json() as Promise<Workspace>;
}

export async function getWorkspaceOrNull(id: string) {
    return fetchWorkspace(id);
}

export async function listWorkspacesServer(): Promise<Workspace[]> {
    const requestHeaders = await headers();
    const cookie = requestHeaders.get("cookie") ?? "";

    const response = await fetch(`${apiUrl}/api/workspaces`, {
        headers: { cookie },
        cache: "no-store",
    });

    if (!response.ok) {
        return [];
    }

    return response.json() as Promise<Workspace[]>;
}

export async function createDefaultWorkspaceServer(): Promise<Workspace> {
    const requestHeaders = await headers();
    const cookie = requestHeaders.get("cookie") ?? "";

    const response = await fetch(`${apiUrl}/api/workspaces`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            cookie,
        },
        body: JSON.stringify({
            title: "Ayurveda IPR & Regulatory Knowledge Base",
            description:
                "Primary statutory research dossier for Indian patent compliance and classical formulations.",
        }),
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Failed to create default workspace");
    }

    return response.json() as Promise<Workspace>;
}
