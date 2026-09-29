import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAuth } from "@/features/auth";
import { WorkspaceChat } from "@/features/chat";
import { getWorkspaceOrNull } from "@/features/workspaces/lib/workspace-server";
import { WorkspaceShell } from "@/features/workspaces";

type WorkspacePageProps = {
    params: Promise<{ id: string }>;
};

export default async function WorkspacePage({ params }: WorkspacePageProps) {
    await requireAuth();
    const { id } = await params;
    const workspace = await getWorkspaceOrNull(id);

    if (!workspace) {
        notFound();
    }

    return (
        <div className="flex h-screen w-full bg-[#FAF8F5] dark:bg-[#0B0F12] text-neutral-900 dark:text-[#FBF9F5] overflow-hidden">
            <Suspense fallback={null}>
                <WorkspaceChat
                    workspaceId={workspace.id}
                    defaultModel={workspace.defaultModel}
                />
            </Suspense>
        </div>
    );
}
