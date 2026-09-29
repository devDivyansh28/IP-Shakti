import type { Request, Response } from "express";
import {
    createTextOrMarkdownSource,
    deleteSourceForUser,
    getSourceChunksForUser,
    getSourceForUser,
    importDatabaseSource,
    importWebsiteSource,
    importYoutubeSource,
    listCentralSources,
    uploadPdfSource,
} from "../services/source.service.js";
import { ValidationError } from "../types/app-error.js";
import {
    createSourceSchema,
    importDatabaseSchema,
    importWebsiteSchema,
    importYoutubeSchema,
    listSourcesQuerySchema,
} from "../validators/source.validator.js";

export async function listAdminSources(req: Request, res: Response) {
    const filters = listSourcesQuerySchema.parse(req.query);
    const sources = await listCentralSources(filters);
    res.json(sources);
}

export async function getAdminSource(req: Request, res: Response) {
    const sourceId = String(req.params.sourceId ?? "");
    const source = await getSourceForUser(sourceId, req.session.user.id, null);
    res.json(source);
}

export async function uploadAdminPdf(req: Request, res: Response) {
    if (!req.file) {
        throw new ValidationError("PDF file is required");
    }

    const title = typeof req.body.title === "string" ? req.body.title : undefined;
    const jurisdiction = typeof req.body.jurisdiction === "string" ? req.body.jurisdiction : "INDIA";
    const tags = Array.isArray(req.body.tags) ? req.body.tags : [];

    const source = await uploadPdfSource(
        req.session.user.id,
        req.file,
        {
            scope: "GLOBAL",
            jurisdiction,
            tags,
            title,
        },
    );

    res.status(201).json(source);
}

export async function createAdminTextSource(req: Request, res: Response) {
    const input = createSourceSchema.parse(req.body);
    const source = await createTextOrMarkdownSource(
        req.session.user.id,
        input,
        { scope: "GLOBAL" },
    );
    res.status(201).json(source);
}

export async function importAdminWebsite(req: Request, res: Response) {
    const input = importWebsiteSchema.parse(req.body);
    const source = await importWebsiteSource(
        req.session.user.id,
        input,
        { scope: "GLOBAL" },
    );
    res.status(201).json(source);
}

export async function importAdminYoutube(req: Request, res: Response) {
    const input = importYoutubeSchema.parse(req.body);
    const source = await importYoutubeSource(
        req.session.user.id,
        input,
        { scope: "GLOBAL" },
    );
    res.status(201).json(source);
}

export async function importAdminDatabase(req: Request, res: Response) {
    const input = importDatabaseSchema.parse(req.body);
    const source = await importDatabaseSource(
        req.session.user.id,
        input,
        { scope: "GLOBAL" },
    );
    res.status(201).json(source);
}

export async function deleteAdminSource(req: Request, res: Response) {
    const sourceId = String(req.params.sourceId ?? "");
    await deleteSourceForUser(sourceId, req.session.user.id, null, true);
    res.status(204).send();
}

export async function getAdminSourceChunks(req: Request, res: Response) {
    const sourceId = String(req.params.sourceId ?? "");
    const chunks = await getSourceChunksForUser(sourceId, req.session.user.id, null);
    res.json(chunks);
}
