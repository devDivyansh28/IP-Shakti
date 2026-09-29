import { Router } from "express";
import {
    createAdminTextSource,
    deleteAdminSource,
    getAdminSource,
    getAdminSourceChunks,
    importAdminDatabase,
    importAdminWebsite,
    importAdminYoutube,
    listAdminSources,
    uploadAdminPdf,
} from "../controllers/admin-source.controller.js";
import { requireAuth } from "../middleware/require-auth.middleware.js";
import { requireAdmin } from "../middleware/rbac.middleware.js";
import { uploadSinglePdf } from "../middleware/upload.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

export const adminSourceRoutes = Router();

adminSourceRoutes.use(requireAuth);
adminSourceRoutes.use(requireAdmin);

adminSourceRoutes.get("/", asyncHandler(listAdminSources));
adminSourceRoutes.post("/", asyncHandler(createAdminTextSource));
adminSourceRoutes.post(
    "/upload",
    uploadSinglePdf,
    asyncHandler(uploadAdminPdf),
);
adminSourceRoutes.post("/import/website", asyncHandler(importAdminWebsite));
adminSourceRoutes.post("/import/youtube", asyncHandler(importAdminYoutube));
adminSourceRoutes.post("/import/database", asyncHandler(importAdminDatabase));
adminSourceRoutes.get("/:sourceId", asyncHandler(getAdminSource));
adminSourceRoutes.get("/:sourceId/chunks", asyncHandler(getAdminSourceChunks));
adminSourceRoutes.delete("/:sourceId", asyncHandler(deleteAdminSource));
