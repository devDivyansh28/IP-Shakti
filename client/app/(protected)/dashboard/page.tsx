import { redirect } from "next/navigation";
import { requireAuth } from "@/features/auth";
import {
    listWorkspacesServer,
    createDefaultWorkspaceServer,
} from "@/features/workspaces/lib/workspace-server";
import { workspaceRoutes } from "@/features/workspaces/lib/routes";

export default async function DashboardPage() {
    await requireAuth();

    const workspaces = await listWorkspacesServer();
    if (workspaces.length > 0) {
        redirect(workspaceRoutes.detail(workspaces[0].id));
    }

    const defaultWorkspace = await createDefaultWorkspaceServer();
    redirect(workspaceRoutes.detail(defaultWorkspace.id));
}
