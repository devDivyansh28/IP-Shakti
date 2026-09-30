import { headers } from "next/headers";
import { authClient } from "./auth-client";

export type Session = typeof authClient.$Infer.Session;

function getAuthBaseUrl(): string {
    if (process.env.API_URL) {
        return process.env.API_URL.replace(/\/$/, "");
    }
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return "http://localhost:8080";
}

export async function getSession(): Promise<Session | null> {
    const requestHeaders = await headers();
    const cookie = requestHeaders.get("cookie") ?? "";
    const baseUrl = getAuthBaseUrl();

    try {
        const response = await fetch(`${baseUrl}/api/auth/get-session`, {
            headers: { cookie },
            cache: "no-store",
        });

        if (!response.ok) {
            return null;
        }

        const data = (await response.json()) as Session | null;
        return data?.user ? data : null;
    } catch (error) {
        console.warn("Unable to fetch session in auth-server:", error);
        return null;
    }
}
