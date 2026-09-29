import { Router, type Request, type Response } from "express";
import { requireAuth } from "../middleware/require-auth.middleware.js";
import prisma from "../lib/db.js";
import { AppError } from "../types/app-error.js";
import { asyncHandler } from "../utils/async-handler.js";

export const authCustomRoutes = Router();

authCustomRoutes.use(requireAuth);

/**
 * Returns current user profile with role from database.
 */
authCustomRoutes.get(
    "/me",
    asyncHandler(async (req: Request, res: Response) => {
        const user = await prisma.user.findUnique({
            where: { id: req.session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new AppError(404, "User not found");
        }

        res.json({ user });
    }),
);

/**
 * Allows a user to claim the ADMIN role by providing the ADMIN_INVITE_CODE.
 */
authCustomRoutes.post(
    "/claim-admin",
    asyncHandler(async (req: Request, res: Response) => {
        const { adminCode } = req.body ?? {};
        const configuredSecret = process.env.ADMIN_INVITE_CODE?.trim();

        if (!configuredSecret) {
            throw new AppError(
                500,
                "ADMIN_INVITE_CODE is not configured on the server",
            );
        }

        if (!adminCode || String(adminCode).trim() !== configuredSecret) {
            throw new AppError(400, "Invalid admin registration code");
        }

        const updated = await prisma.user.update({
            where: { id: req.session.user.id },
            data: { role: "ADMIN" },
            select: { id: true, email: true, role: true },
        });

        res.json({
            success: true,
            message: "Admin role successfully assigned",
            user: updated,
        });
    }),
);
