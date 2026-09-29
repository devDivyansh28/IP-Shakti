"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, Loader2, Sparkles } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useCreateWorkspace } from "../hooks/use-workspaces";
import { workspaceRoutes } from "../lib/routes";

type CreateProjectModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function CreateProjectModal({
    open,
    onOpenChange,
}: CreateProjectModalProps) {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState<string | null>(null);

    const createWorkspace = useCreateWorkspace();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setError("Project title is required");
            return;
        }

        setError(null);
        try {
            const newWorkspace = await createWorkspace.mutateAsync({
                title: trimmedTitle,
                description: description.trim() || undefined,
            });

            setTitle("");
            setDescription("");
            onOpenChange(false);
            router.push(workspaceRoutes.detail(newWorkspace.id));
        } catch (err: any) {
            setError(err?.message ?? "Failed to create project");
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#161B20] border border-white/10 text-[#FBF9F5] sm:max-w-md p-6 rounded-2xl shadow-2xl">
                <DialogHeader className="space-y-1 text-left">
                    <DialogTitle className="text-lg font-semibold tracking-tight text-[#FBF9F5] flex items-center gap-2">
                        <FolderPlus className="size-4 text-[#D4F843]" />
                        <span>Create New Project Dossier</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-[#9EA8B3]">
                        Organize your patent drafts, TKDL citations, and lab research notes in an isolated project workspace.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {error && (
                        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5 text-left">
                        <label className="text-xs font-medium text-[#9EA8B3] uppercase tracking-wider block">
                            Project Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Curcumin Synergy Formulation Dossier"
                            required
                            className="w-full px-3 py-2 rounded-xl bg-[#111417] text-sm text-[#FBF9F5] placeholder-[#6C7684] border border-white/[0.08] focus:border-[#D4F843]/60 focus:outline-none transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5 text-left">
                        <label className="text-xs font-medium text-[#9EA8B3] uppercase tracking-wider block">
                            Description (Optional)
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief scope, target claims, or traditional botanical references..."
                            className="w-full px-3 py-2 rounded-xl bg-[#111417] text-sm text-[#FBF9F5] placeholder-[#6C7684] border border-white/[0.08] focus:border-[#D4F843]/60 focus:outline-none transition-colors resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="px-3 py-2 rounded-xl text-xs text-[#9EA8B3] hover:text-[#FBF9F5] hover:bg-white/[0.06] transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={createWorkspace.isPending || !title.trim()}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4F843] hover:bg-[#c2e438] text-black font-semibold text-xs transition-all shadow-md shadow-[#D4F843]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {createWorkspace.isPending ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                <FolderPlus className="size-3.5" />
                            )}
                            <span>Create Project</span>
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
