import type { NextFunction, Request, Response } from "express";
import prisma from "../lib/db.js";
import { AppError } from "../types/app-error.js";
import type { UserRole } from "../generated/prisma/client.js";


/**
 * Ensures the authenticated user has one of the allowed roles.
 * Queries the database to guarantee fresh role status.
 */
export function requireRole(allowedRoles: UserRole[]) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        const userId = req.session?.user?.id;
        if (!userId) {
            throw new AppError(401, "Authentication required");
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (!user) {
            throw new AppError(404, "User not found");
        }

        req.userRole = user.role;

        if (!allowedRoles.includes(user.role)) {
            throw new AppError(403, "Access forbidden: insufficient role permissions");
        }

        next();
    };
}

/**
 * Convenience middleware for Admin-only routes.
 */
export const requireAdmin = requireRole(["ADMIN"]);
