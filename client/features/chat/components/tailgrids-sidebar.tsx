"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
    Folder,
    FolderPlus,
    MoreHorizontal,
    PanelLeftClose,
    Search,
    Sparkles,
    SquarePen,
    Trash2,
} from "lucide-react";
import { isToday, isYesterday } from "date-fns";
import {
    useConversations,
    useDeleteConversation,
} from "../hooks/use-conversations";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import { useUserProfile } from "@/features/auth/hooks/use-user-profile";
import { workspaceRoutes } from "@/features/workspaces/lib/routes";
import { CreateProjectModal } from "@/features/workspaces/components/create-project-modal";
import { SettingsDialog } from "./settings-dialog";
import type { Conversation } from "../lib/types";

type TailgridsSidebarProps = {
    workspaceId: string;
    activeConversationId: string | null;
    onSelectConversation: (id: string | null) => void;
    onNewChat: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
};

export function TailgridsSidebar({
    workspaceId,
    activeConversationId,
    onSelectConversation,
    onNewChat,
    isCollapsed,
    onToggleCollapse,
}: TailgridsSidebarProps) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [createProjectOpen, setCreateProjectOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const { user: userProfile } = useUserProfile();
    const { data: conversations = [], isLoading: isConversationsLoading } =
        useConversations(workspaceId);
    const { data: workspaces = [] } = useWorkspaces();
    const deleteConversation = useDeleteConversation(workspaceId);

    // Filter conversations by search
    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        const q = searchQuery.toLowerCase();
        return conversations.filter((c) =>
            (c.title ?? "Untitled Chat").toLowerCase().includes(q),
        );
    }, [conversations, searchQuery]);

    // Group into Today and Yesterday / Earlier
    const { todayChats, yesterdayChats } = useMemo(() => {
        const today: Conversation[] = [];
        const yesterday: Conversation[] = [];

        for (const conv of filteredConversations) {
            const date = new Date(conv.updatedAt || conv.createdAt);
            if (isToday(date)) {
                today.push(conv);
            } else {
                yesterday.push(conv);
            }
        }

        return { todayChats: today, yesterdayChats: yesterday };
    }, [filteredConversations]);

    async function handleDelete(e: React.MouseEvent, convId: string) {
        e.stopPropagation();
        setActiveMenuId(null);
        await deleteConversation.mutateAsync(convId);
        if (activeConversationId === convId) {
            onNewChat();
        }
    }

    const userInitials = useMemo(() => {
        if (!userProfile?.name) return "RS";
        return userProfile.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    }, [userProfile]);

    return (
        <>
            <motion.aside
                initial={false}
                animate={{
                    width: isCollapsed ? 0 : 280,
                    opacity: isCollapsed ? 0 : 1,
                }}
                transition={{
                    type: "spring",
                    damping: 26,
                    stiffness: 240,
                    mass: 0.8,
                }}
                className="relative flex flex-col h-full bg-[#0D1115] border-r border-white/[0.08] text-[#FBF9F5] select-none overflow-hidden shrink-0 z-20 font-sans"
            >
                <div className="w-[280px] h-full flex flex-col justify-between">
                    {/* Top Content */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 flex flex-col">
                        {/* 1. Header: Brand + Collapse Button */}
                        <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06]">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 group"
                            >
                                <Sparkles className="size-5 text-[#D4F843] group-hover:rotate-12 transition-transform" />
                                <span className="font-semibold text-base tracking-tight text-[#FBF9F5] font-heading">
                                    IP-SAKTI
                                </span>
                            </Link>

                            <button
                                type="button"
                                onClick={onToggleCollapse}
                                title="Collapse sidebar"
                                className="p-1.5 rounded-lg text-[#9EA8B3] hover:text-[#FBF9F5] hover:bg-white/[0.06] transition-colors"
                            >
                                <PanelLeftClose className="size-4" />
                            </button>
                        </div>

                        <div className="px-3 pt-3 space-y-1">
                            {/* 2. New Chat Link Row (Matching TailGrids Screenshot) */}
                            <button
                                type="button"
                                onClick={onNewChat}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-[#FBF9F5] hover:bg-white/[0.06] transition-colors group text-left"
                            >
                                <SquarePen className="size-4 text-[#9EA8B3] group-hover:text-[#D4F843] transition-colors" />
                                <span>New Chat</span>
                            </button>

                            {/* 3. Search Row */}
                            <div className="w-full">
                                {!searchOpen ? (
                                    <button
                                        type="button"
                                        onClick={() => setSearchOpen(true)}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-normal text-[#9EA8B3] hover:text-[#FBF9F5] hover:bg-white/[0.06] transition-colors text-left"
                                    >
                                        <Search className="size-4 text-[#9EA8B3]" />
                                        <span>Search</span>
                                    </button>
                                ) : (
                                    <div className="relative my-1">
                                        <Search className="absolute left-2.5 top-2.5 size-3.5 text-[#9EA8B3]" />
                                        <input
                                            type="text"
                                            autoFocus
                                            placeholder="Search chats or projects..."
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            onBlur={() => {
                                                if (!searchQuery)
                                                    setSearchOpen(false);
                                            }}
                                            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#161B20] text-xs text-[#FBF9F5] placeholder-[#6C7684] border border-white/[0.08] focus:border-[#D4F843]/60 focus:outline-none transition-colors"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 4. Projects Section */}
                        <div className="px-3 pt-5">
                            <div className="flex items-center justify-between px-3 py-1 text-xs font-semibold text-[#9EA8B3] tracking-wide">
                                <span>Projects</span>
                                <button
                                    type="button"
                                    onClick={() => setCreateProjectOpen(true)}
                                    title="Create New Project"
                                    className="p-1 rounded-md text-[#9EA8B3] hover:text-[#D4F843] hover:bg-white/[0.06] transition-colors"
                                >
                                    <FolderPlus className="size-4" />
                                </button>
                            </div>

                            <div className="mt-1 space-y-0.5">
                                {workspaces.map((ws, idx) => {
                                    const isCurrent = ws.id === workspaceId;
                                    // 2-digit format count (e.g., 01, 02)
                                    const countStr = String(idx + 1).padStart(
                                        2,
                                        "0",
                                    );

                                    return (
                                        <Link
                                            key={ws.id}
                                            href={workspaceRoutes.detail(ws.id)}
                                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                                                isCurrent
                                                    ? "bg-[#181E25] text-[#FBF9F5] font-medium border border-white/[0.08]"
                                                    : "text-[#9EA8B3] hover:text-[#FBF9F5] hover:bg-white/[0.04]"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 truncate">
                                                <Folder
                                                    className={`size-4 shrink-0 ${
                                                        isCurrent
                                                            ? "text-[#D4F843]"
                                                            : "text-[#6C7684]"
                                                    }`}
                                                />
                                                <span className="truncate">
                                                    {ws.title}
                                                </span>
                                            </div>

                                            <span className="text-[10px] font-mono text-[#6C7684] px-1.5 py-0.5 rounded bg-white/[0.04]">
                                                {countStr}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 5. Recent Chats Section (TODAY & YESTERDAY) */}
                        <div className="px-3 pt-5 space-y-4">
                            {/* TODAY */}
                            {todayChats.length > 0 && (
                                <div className="space-y-1">
                                    <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-[#6C7684]">
                                        TODAY
                                    </div>
                                    {todayChats.map((chat) => (
                                        <ChatListItem
                                            key={chat.id}
                                            chat={chat}
                                            isActive={
                                                activeConversationId === chat.id
                                            }
                                            onSelect={() =>
                                                onSelectConversation(chat.id)
                                            }
                                            onDelete={(e) =>
                                                handleDelete(e, chat.id)
                                            }
                                            isMenuOpen={activeMenuId === chat.id}
                                            onToggleMenu={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuId(
                                                    activeMenuId === chat.id
                                                        ? null
                                                        : chat.id,
                                                );
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* YESTERDAY / EARLIER */}
                            {yesterdayChats.length > 0 && (
                                <div className="space-y-1">
                                    <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-[#6C7684]">
                                        YESTERDAY
                                    </div>
                                    {yesterdayChats.map((chat) => (
                                        <ChatListItem
                                            key={chat.id}
                                            chat={chat}
                                            isActive={
                                                activeConversationId === chat.id
                                            }
                                            onSelect={() =>
                                                onSelectConversation(chat.id)
                                            }
                                            onDelete={(e) =>
                                                handleDelete(e, chat.id)
                                            }
                                            isMenuOpen={activeMenuId === chat.id}
                                            onToggleMenu={(e) => {
                                                e.stopPropagation();
                                                setActiveMenuId(
                                                    activeMenuId === chat.id
                                                        ? null
                                                        : chat.id,
                                                );
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {!isConversationsLoading &&
                                filteredConversations.length === 0 && (
                                    <div className="px-3 py-4 text-xs text-[#6C7684] italic">
                                        No recent consultations
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* 6. Floating Bottom User Tile (Matching Screenshot) */}
                    <div className="p-3 border-t border-white/[0.06] bg-[#0D1115]">
                        <div
                            onClick={() => setSettingsOpen(true)}
                            className="flex items-center justify-between gap-2.5 p-2 rounded-2xl bg-gradient-to-r from-white/[0.06] to-white/[0.02] border border-white/[0.08] hover:border-[#D4F843]/40 cursor-pointer transition-all shadow-lg group"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="size-8 rounded-full bg-gradient-to-br from-[#28313B] to-[#12161A] border border-white/10 flex items-center justify-center text-xs font-semibold text-[#D4F843] shrink-0">
                                    {userInitials}
                                </div>
                                <div className="min-w-0 text-left">
                                    <p className="text-xs font-semibold text-[#FBF9F5] truncate">
                                        {userProfile?.name ?? "Researcher"}
                                    </p>
                                    <p className="text-[10px] text-[#9EA8B3] truncate">
                                        {userProfile?.role === "ADMIN"
                                            ? "Admin"
                                            : "Scholar"}
                                    </p>
                                </div>
                            </div>

                            <span className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-white/[0.06] text-[#9EA8B3] group-hover:text-[#FBF9F5] group-hover:bg-white/[0.1] transition-colors shrink-0">
                                Settings
                            </span>
                        </div>
                    </div>
                </div>
            </motion.aside>

            {/* In-place Modals */}
            <CreateProjectModal
                open={createProjectOpen}
                onOpenChange={setCreateProjectOpen}
            />

            <SettingsDialog
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
                workspaceId={workspaceId}
            />
        </>
    );
}

type ChatListItemProps = {
    chat: Conversation;
    isActive: boolean;
    onSelect: () => void;
    onDelete: (e: React.MouseEvent) => void;
    isMenuOpen: boolean;
    onToggleMenu: (e: React.MouseEvent) => void;
};

function ChatListItem({
    chat,
    isActive,
    onSelect,
    onDelete,
    isMenuOpen,
    onToggleMenu,
}: ChatListItemProps) {
    return (
        <div
            onClick={onSelect}
            className={`group relative flex items-center justify-between px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                isActive
                    ? "bg-[#181E25] text-[#FBF9F5] font-medium border-l-2 border-l-[#D4F843]"
                    : "text-[#9EA8B3] hover:text-[#FBF9F5] hover:bg-white/[0.04]"
            }`}
        >
            <span className="truncate pr-2 font-normal">
                {chat.title ?? "Untitled Consultation"}
            </span>

            <div className="relative shrink-0">
                <button
                    type="button"
                    onClick={onToggleMenu}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/[0.08] text-[#9EA8B3] hover:text-[#FBF9F5] transition-opacity"
                >
                    <MoreHorizontal className="size-3.5" />
                </button>

                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 z-30 w-32 bg-[#181E25] border border-white/10 rounded-lg shadow-xl p-1 text-xs">
                        <button
                            type="button"
                            onClick={onDelete}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-red-400 hover:bg-red-500/10 text-left transition-colors"
                        >
                            <Trash2 className="size-3.5" />
                            <span>Delete Chat</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
