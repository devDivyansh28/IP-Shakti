import type { Express } from "express";
import { adminSourceRoutes } from "./admin-source.routes.js";
import { authCustomRoutes } from "./auth-custom.routes.js";
import { chatRoutes, conversationRoutes } from "./chat.routes.js";
import { memoryRoutes } from "./memory.routes.js";
import { sourceRoutes } from "./source.routes.js";
import { workspaceRoutes } from "./workspace.routes.js";
import { requireAuth } from "../middleware/require-auth.middleware.js";

export function registerRoutes(app: Express): void {
    // Custom auth & role management
    app.use("/api/auth-custom", authCustomRoutes);

    // Admin Central Knowledge Base routes (protected by requireAuth & requireAdmin)
    app.use("/api/admin/sources", adminSourceRoutes);

    // Universal Normal routes (accessible without workspace/project)
    app.use("/api/sources", requireAuth, sourceRoutes);
    app.use("/api/conversations", requireAuth, conversationRoutes);
    app.use("/api/chat", requireAuth, chatRoutes);

    // Project-scoped routes
    app.use("/api/workspaces/:workspaceId/sources", requireAuth, sourceRoutes);
    app.use("/api/workspaces/:workspaceId/conversations", requireAuth, conversationRoutes);
    app.use("/api/workspaces/:workspaceId/chat", requireAuth, chatRoutes);
    app.use("/api/workspaces", workspaceRoutes);

    // User long-term memory
    app.use("/api/memory", memoryRoutes);
}