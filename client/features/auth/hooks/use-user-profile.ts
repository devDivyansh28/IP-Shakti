"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type UserRole = "USER" | "ADMIN";

export type UserProfile = {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: UserRole;
    createdAt: string;
};

type UserProfileResponse = {
    user: UserProfile;
};

type ClaimAdminResponse = {
    success: boolean;
    message: string;
    user: {
        id: string;
        email: string;
        role: UserRole;
    };
};

export const USER_PROFILE_QUERY_KEY = ["user-profile"] as const;

async function fetchUserProfile(): Promise<UserProfile | null> {
    const res = await fetch("/api/auth-custom/me", {
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (res.status === 401 || res.status === 403) {
        return null;
    }

    if (!res.ok) {
        throw new Error(`Failed to fetch user profile: ${res.statusText}`);
    }

    const data: UserProfileResponse = await res.json();
    return data.user;
}

async function claimAdminRole(adminCode: string): Promise<ClaimAdminResponse> {
    const res = await fetch("/api/auth-custom/claim-admin", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminCode }),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Failed to claim admin role");
    }

    return res.json();
}

/**
 * Hook to retrieve the current user's profile and RBAC role (USER vs ADMIN),
 * with built-in mutation to claim the admin role with the secret invite code.
 */
export function useUserProfile() {
    const queryClient = useQueryClient();

    const {
        data: user,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: USER_PROFILE_QUERY_KEY,
        queryFn: fetchUserProfile,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
        retry: (failureCount, err: any) => {
            if (err?.message?.includes("401")) return false;
            return failureCount < 2;
        },
    });

    const claimAdminMutation = useMutation({
        mutationFn: claimAdminRole,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
        },
    });

    return {
        user: user ?? null,
        role: user?.role ?? null,
        isAdmin: user?.role === "ADMIN",
        isLoading,
        isError,
        error,
        refetch,
        claimAdmin: claimAdminMutation.mutate,
        claimAdminAsync: claimAdminMutation.mutateAsync,
        isClaimingAdmin: claimAdminMutation.isPending,
        claimAdminError: claimAdminMutation.error,
    };
}
