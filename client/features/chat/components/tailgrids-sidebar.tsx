"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
    FolderGit2,
    LogOut,
    MessageSquare,
    MoreHorizontal,
    PanelLeftClose,
    Plus,
    Search,
    Settings,
    ShieldCheck,
    Trash2,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import {
    useConversations,
    useDeleteConversation,
} from "../hooks/use-conversations";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import { useUserProfile } from "@/features/auth/hooks/use-user-profile";
import { signOut } from "@/features/auth/lib/auth-client";
import { authRoutes } from "@/features/auth/lib/auth-routes";
import { workspaceRoutes } from "@/features/workspaces/lib/routes";
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
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [projectsOpen, setProjectsOpen] = useState(true);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [isSigningOut, setIsSigningOut] = useState(false);

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

    // Group into Today and Earlier
    const { todayChats, earlierChats } = useMemo(() => {
        const today: Conversation[] = [];
        const earlier: Conversation[] = [];

        for (const conv of filteredConversations) {
            const date = new Date(conv.updatedAt || conv.createdAt);
            if (isToday(date)) {
                today.push(conv);
            } else {
                earlier.push(conv);
            }
        }

        return { todayChats: today, earlierChats: earlier };
    }, [filteredConversations]);

    async function handleDelete(e: React.MouseEvent, convId: string) {
        e.stopPropagation();
        setActiveMenuId(null);
        await deleteConversation.mutateAsync(convId);
        if (activeConversationId === convId) {
            onNewChat();
        }
    }

    async function handleSignOut() {
        setIsSigningOut(true);
        try {
            await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push(authRoutes.login);
                        router.refresh();
                    },
                },
            });
        } finally {
            setIsSigningOut(false);
        }
    }

    const userInitials = useMemo(() => {
        if (!userProfile?.name) return "U";
        return userProfile.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    }, [userProfile]);

    return (
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
            className="relative flex flex-col h-full bg-[#161B20] border-r border-white/[0.08] text-[#FBF9F5] select-none overflow-hidden shrink-0 z-20"
        >
            <div className="w-[280px] h-full flex flex-col">
                {/* 1. Brand Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06]">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 group"
                    >
                        <div className="size-8 rounded-lg bg-[#D4F843] flex items-center justify-center text-black font-bold shadow-sm shadow-[#D4F843]/20 group-hover:scale-105 transition-transform">
                            <ShieldCheck className="size-5 text-black" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm tracking-tight text-[#FBF9F5]">
                                IP-SAKTI
                            </span>
                            <span className="text-[10px] font-mono text-[#D4F843] uppercase tracking-wider">
                                Sahayak AI
                            </span>
                        </div>
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

                {/* 2. Action Bar: + New Chat */}
                <div className="p-3">
                    <button
                        type="button"
                        onClick={onNewChat}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#1D232A] hover:bg-[#252C35] text-[#FBF9F5] text-sm font-medium border border-white/[0.08] hover:border-[#D4F843]/40 transition-all shadow-sm group"
                    >
                        <Plus className="size-4 text-[#D4F843] group-hover:rotate-90 transition-transform" />
                        <span>New Chat</span>
                    </button>
                </div>

                {/* 3. Search Bar */}
                <div className="px-3 pb-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 size-3.5 text-[#9EA8B3]" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#111417] text-xs text-[#FBF9F5] placeholder-[#6C7684] border border-white/[0.06] focus:border-[#D4F843]/50 focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* 4. Scrollable Content: Projects & Recent Chats */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 text-xs font-sans scrollbar-thin scrollbar-thumb-white/10">
                    {/* Projects Section */}
                    <div>
                        <div
                            onClick={() => setProjectsOpen(!projectsOpen)}
                            className="flex items-center justify-between px-2 py-1 text-[11px] font-medium text-[#9EA8B3] uppercase tracking-wider cursor-pointer hover:text-[#FBF9F5]"
                        >
                            <span>Projects</span>
                            <span className="px-1.5 py-0.5 rounded-full bg-white/[0.06] text-[10px] text-[#9EA8B3]">
                                {workspaces.length}
                            </span>
                        </div>

                        {projectsOpen && (
                            <div className="mt-1 space-y-0.5">
                                {workspaces.map((ws) => {
                                    const isCurrent = ws.id === workspaceId;
                                    return (
                                        <Link
                                            key={ws.id}
                                            href={workspaceRoutes.detail(ws.id)}
                                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                                                isCurrent
                                                    ? "bg-[#1D232A] text-[#FBF9F5] font-medium border border-white/[0.08]"
                                                    : "text-[#9EA8B3] hover:text-[#FBF9F5] hover:bg-white/[0.04]"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <FolderGit2
                                                    className={`size-3.5 shrink-0 ${
                                                        isCurrent
                                                            ? "text-[#D4F843]"
                                                            : "text-[#6C7684]"
                                                    }`}
                                                />
                                                <span className="truncate">
                                                    {ws.title}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Recent Chats Section */}
                    <div>
                        <div className="px-2 py-1 text-[11px] font-medium text-[#9EA8B3] uppercase tracking-wider">
                            Recent Chats
                        </div>

                        {isConversationsLoading ? (
                            <div className="px-2 py-3 text-xs text-[#6C7684]">
                                Loading chats...
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="px-2 py-3 text-xs text-[#6C7684]">
                                No conversations found
                            </div>
                        ) : (
                            <div className="mt-1 space-y-3">
                                {/* Today */}
                                {todayChats.length > 0 && (
                                    <div className="space-y-0.5">
                                        <div className="px-2 py-0.5 text-[10px] text-[#6C7684] font-medium uppercase">
                                            Today
                                        </div>
                                        {todayChats.map((chat) => (
                                            <ChatListItem
                                                key={chat.id}
                                                chat={chat}
                                                isActive={
                                                    activeConversationId ===
                                                    chat.id
                                                }
                                                onSelect={() =>
                                                    onSelectConversation(
                                                        chat.id,
                                                    )
                                                }
                                                onDelete={(e) =>
                                                    handleDelete(e, chat.id)
                                                }
                                                isMenuOpen={
                                                    activeMenuId === chat.id
                                                }
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

                                {/* Earlier */}
                                {earlierChats.length > 0 && (
                                    <div className="space-y-0.5">
                                        <div className="px-2 py-0.5 text-[10px] text-[#6C7684] font-medium uppercase">
                                            Earlier
                                        </div>
                                        {earlierChats.map((chat) => (
                                            <ChatListItem
                                                key={chat.id}
                                                chat={chat}
                                                isActive={
                                                    activeConversationId ===
                                                    chat.id
                                                }
                                                onSelect={() =>
                                                    onSelectConversation(
                                                        chat.id,
                                                    )
                                                }
                                                onDelete={(e) =>
                                                    handleDelete(e, chat.id)
                                                }
                                                isMenuOpen={
                                                    activeMenuId === chat.id
                                                }
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
                            </div>
                        )}
                    </div>
                </div>

                {/* 5. Bottom User Profile Card */}
                <div className="p-3 border-t border-white/[0.06] bg-[#111417]/40">
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#1D232A]/80 border border-white/[0.06]">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="size-8 rounded-full bg-gradient-to-br from-[#28313B] to-[#161B20] border border-white/10 flex items-center justify-center text-xs font-semibold text-[#D4F843] shrink-0">
                                {userInitials}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-[#FBF9F5] truncate">
                                    {userProfile?.name ?? "Researcher"}
                                </p>
                                <p className="text-[10px] text-[#9EA8B3] truncate">
                                    {userProfile?.email ?? "user@ipsakti.in"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            <Link
                                href="/settings"
                                title="Settings"
                                className="p-1 rounded-md text-[#9EA8B3] hover:text-[#FBF9F5] hover:bg-white/[0.06] transition-colors"
                            >
                                <Settings className="size-3.5" />
                            </Link>
                            <button
                                type="button"
                                onClick={() => void handleSignOut()}
                                disabled={isSigningOut}
                                title="Sign out"
                                className="p-1 rounded-md text-[#9EA8B3] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="size-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.aside>
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
            className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                isActive
                    ? "bg-[#1D232A] text-[#FBF9F5] font-medium border-l-2 border-l-[#D4F843] border-y border-r border-white/[0.06]"
                    : "text-[#9EA8B3] hover:text-[#FBF9F5] hover:bg-white/[0.04]"
            }`}
        >
            <div className="flex items-center gap-2 truncate pr-2">
                <MessageSquare
                    className={`size-3.5 shrink-0 ${
                        isActive ? "text-[#D4F843]" : "text-[#6C7684]"
                    }`}
                />
                <span className="truncate">
                    {chat.title ?? "Untitled Chat"}
                </span>
            </div>

            <div className="relative shrink-0">
                <button
                    type="button"
                    onClick={onToggleMenu}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/[0.08] text-[#9EA8B3] hover:text-[#FBF9F5] transition-opacity"
                >
                    <MoreHorizontal className="size-3.5" />
                </button>

                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 z-30 w-32 bg-[#1D232A] border border-white/10 rounded-lg shadow-xl p-1 text-xs">
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
