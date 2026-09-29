"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import type { Workspace } from "../lib/types";

type DeleteWorkspaceDialogProps = {
    workspace: Workspace | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>;
    isPending?: boolean;
};

export function DeleteWorkspaceDialog({
    workspace,
    open,
    onOpenChange,
    onConfirm,
    isPending = false,
}: DeleteWorkspaceDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-[#FAF8F5] dark:bg-[#161B20] border-2 border-neutral-900 dark:border-white/20 text-neutral-900 dark:text-[#FBF9F5] sm:max-w-md p-6 rounded-[24px] shadow-[4px_4px_0px_0px_#121212] dark:shadow-none">
                <AlertDialogHeader className="space-y-1 text-left">
                    <AlertDialogTitle className="text-lg font-heading font-extrabold tracking-tight text-neutral-900 dark:text-[#FBF9F5]">
                        Delete project?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-neutral-600 dark:text-[#9EA8B3] leading-relaxed">
                        This will permanently delete{" "}
                        <span className="font-bold text-neutral-900 dark:text-[#FBF9F5]">
                            {workspace?.title}
                        </span>
                        {" "}along with all its consultations, TKDL citations, and sources. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4 flex flex-row items-center justify-end gap-2">
                    <AlertDialogCancel
                        disabled={isPending}
                        className="rounded-xl border-2 border-neutral-900/20 dark:border-white/10 bg-white dark:bg-[#1D232A] text-neutral-700 dark:text-[#9EA8B3] hover:bg-neutral-100 dark:hover:bg-white/[0.04] text-xs font-bold px-4 py-2 transition-colors"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        disabled={isPending}
                        onClick={(event) => {
                            event.preventDefault();
                            void onConfirm();
                        }}
                        className="rounded-xl border-2 border-red-900/20 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 shadow-sm transition-colors flex items-center gap-1.5"
                    >
                        {isPending ? <Spinner className="size-3.5" /> : null}
                        Delete Project
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
