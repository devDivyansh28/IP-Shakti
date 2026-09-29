import type { Request, Response } from "express";
import {
    createTextOrMarkdownSource,
    bulkDeleteSourcesForWorkspace,
    deleteSourceForUser,
    getSourceChunksForUser,
    getSourceForUser,
    importWebSearchSource,
    importWebsiteSource,
    importYoutubeSource,
    listSourcesForUser,
    reprocessSourceForWorkspace,
    reprocessSourcesForWorkspace,
    uploadPdfSource,
} from "../services/source.service.js";
import { ValidationError } from "../types/app-error.js";
import {
    bulkDeleteSourcesSchema,
    createSourceSchema,
    importWebSearchSchema,
    importWebsiteSchema,
    importYoutubeSchema,
    listSourcesQuerySchema,
    reprocessSourcesSchema,
} from "../validators/source.validator.js";

function getWorkspaceId(req: Request): string | undefined {
    const raw = req.params.workspaceId;
    return typeof raw === "string" && raw.length > 0 ? raw : undefined;
}

function getSourceId(req: Request): string {
    const raw = req.params.sourceId;
    return typeof raw === "string" ? raw : "";
}

export async function listSources(req: Request, res: Response) {
    const workspaceId = getWorkspaceId(req);
    const filters = listSourcesQuerySchema.parse(req.query);
    const sources = await listSourcesForUser(
        req.session.user.id,
        workspaceId,
        filters,
    );
    res.json(sources);
}

export async function getSource(req: Request, res: Response) {
    const workspaceId = getWorkspaceId(req);
    const sourceId = getSourceId(req);
    const source = await getSourceForUser(
        sourceId,
        req.session.user.id,
        workspaceId,
    );
    res.json(source);
}

export async function getSourceChunks(req: Request, res: Response) {
    const workspaceId = getWorkspaceId(req);
    const sourceId = getSourceId(req);
    const result = await getSourceChunksForUser(
        sourceId,
        req.session.user.id,
        workspaceId,
    );
    res.json(result);
}

export async function createSource(req: Request, res: Response) {
    const workspaceId = getWorkspaceId(req);
    const input = createSourceSchema.parse(req.body);
    const source = await createTextOrMarkdownSource(
        req.session.user.id,
        input,
        { workspaceId, scope: "PRIVATE" },
    );
    res.status(201).json(source);
}

export async function uploadPdf(req: Request, res: Response) {
    const workspaceId = getWorkspaceId(req);

    if (!req.file) {
        throw new ValidationError("PDF file is required");
    }

    const title =
        typeof req.body.title === "string" ? req.body.title : undefined;
    const jurisdiction =
        typeof req.body.jurisdiction === "string" ? req.body.jurisdiction : "INDIA";
    const tags = Array.isArray(req.body.tags) ? req.body.tags : [];

    const source = await uploadPdfSource(
        req.session.user.id,
        req.file,
        {
            workspaceId,
            scope: "PRIVATE",
            title,
            jurisdiction,
            tags,
        },
    );

    res.status(201).json(source);
}

export async function importWebsite(req: Request, res: Response) {
    const workspaceId = getWorkspaceId(req);
    const input = importWebsiteSchema.parse(req.body);
    const source = await importWebsiteSource(
        req.session.user.id,
        input,
        { workspaceId, scope: "PRIVATE" },
    );
    res.status(201).json(source);
}

export async function importYoutube(req: Request, res: Response) {
    const workspaceId = getWorkspaceId(req);
    const input = importYoutubeSchema.parse(req.body);
    const source = await importYoutubeSource(
        req.session.user.id,
        input,
        { workspaceId, scope: "PRIVATE" },
    );
    res.status(201).json(source);
}

export async function deleteSource(req: Request, res: Response) {
    const workspaceId = getWorkspaceId(req);
    const sourceId = getSourceId(req);
    await deleteSourceForUser(
        sourceId,
        req.session.user.id,
        workspaceId,
    );
    res.status(204).send();
}

export async function bulkDeleteSources(req: Request, res: Response) {
    const workspaceId = String(req.params.workspaceId ?? "");
    const input = bulkDeleteSourcesSchema.parse(req.body);
    await bulkDeleteSourcesForWorkspace(
        workspaceId,
        req.session.user.id,
        input.sourceIds,
    );
    res.status(204).send();
}

export async function reprocessSources(req: Request, res: Response) {
    const workspaceId = String(req.params.workspaceId ?? "");
    const input = reprocessSourcesSchema.parse(req.body ?? {});
    const result = await reprocessSourcesForWorkspace(
        workspaceId,
        req.session.user.id,
        input,
    );
    res.json(result);
}

export async function reprocessSource(req: Request, res: Response) {
    const workspaceId = String(req.params.workspaceId ?? "");
    const sourceId = getSourceId(req);
    await reprocessSourceForWorkspace(
        workspaceId,
        sourceId,
        req.session.user.id,
    );
    res.status(202).json({ reprocessed: true });
}

export async function importWebSearch(req: Request, res: Response) {
    const workspaceId = getWorkspaceId(req);
    const input = importWebSearchSchema.parse(req.body);
    const source = await importWebSearchSource(
        req.session.user.id,
        input,
        { workspaceId, scope: "PRIVATE" },
    );
    res.status(201).json(source);
}
