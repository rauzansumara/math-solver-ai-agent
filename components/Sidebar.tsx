"use client";

import { Clock, Plus, Settings, LogOut, PanelLeftClose, SquarePen, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import dynamic from "next/dynamic";

const ModeToggle = dynamic(() => import("./mode-toggle").then((mod) => mod.ModeToggle), { ssr: false });


interface SidebarProps {
    isDesktopOpen: boolean;
    setDesktopOpen: (open: boolean) => void;
    isMobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
    // New Props for State Management
    chats: any[]; // Using any for now, will refine type
    currentChatId: string | null;
    onSelectChat: (id: string) => void;
    onDeleteChat: (id: string) => void;
    onNewChat: () => void;
}

export function Sidebar({
    isDesktopOpen,
    setDesktopOpen,
    isMobileOpen,
    setMobileOpen,
    chats,
    currentChatId,
    onSelectChat,
    onDeleteChat,
    onNewChat
}: SidebarProps) {
    const { status } = useSession();

    // Internal component to share layout logic
    const SidebarContent = ({ isMobile = false }) => (
        <div className="flex h-full flex-col bg-background/95 backdrop-blur-xl">
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-border/40">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-muted/60"
                        onClick={() => isMobile ? setMobileOpen(false) : setDesktopOpen(false)}
                        title={isMobile ? "Close Menu" : "Collapse Sidebar"}
                    >
                        <PanelLeftClose className="h-4 w-4" />
                    </Button>
                </div>
                <Button variant="ghost" size="icon" onClick={onNewChat} className="h-8 w-8 text-muted-foreground hover:bg-muted/60" title="New Chat">
                    <SquarePen className="h-4 w-4" />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden py-4">
                <div className="px-4 mb-3">
                    <h3 className="px-2 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">
                        Recent History
                    </h3>
                </div>
                <ScrollArea className="h-[calc(100%-80px)] px-3">
                    <div className="space-y-1">
                        {/* Placeholder Items */}
                        <div className="space-y-1">
                            {chats.length === 0 ? (
                                <div className="px-4 py-8 text-center text-muted-foreground/50 text-xs">
                                    No history yet
                                </div>
                            ) : (
                                chats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        onClick={() => {
                                            onSelectChat(chat.id);
                                            if (isMobile) setMobileOpen(false);
                                        }}
                                        className={cn(
                                            "group flex flex-col gap-0.5 p-2.5 rounded-lg cursor-pointer transition-all border border-transparent hover:border-border/30 relative",
                                            currentChatId === chat.id ? "bg-muted/80" : "hover:bg-muted/50"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={cn("text-sm font-medium truncate w-[180px]", currentChatId === chat.id ? "text-foreground" : "text-foreground/80")}>
                                                {chat.title || "New Conversation"}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive absolute right-1 top-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteChat(chat.id);
                                                }}
                                            >
                                                <LogOut className="h-3 w-3 rotate-180" />
                                            </Button>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground line-clamp-1 truncate pr-6">
                                            {chat.preview || "Start calculating..."}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Footer */}
            <div className="p-3 m-3 mt-auto bg-muted/20 border border-border/40 rounded-xl space-y-1">
                {status === "authenticated" ? (
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-9 px-3 font-normal text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => signOut()}
                    >
                        <LogOut className="h-4 w-4 opacity-70" />
                        Sign out
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-9 px-3 font-normal text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => signIn("google")}
                    >
                        <LogIn className="h-4 w-4 opacity-70" />
                        Sign In
                    </Button>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden border-r border-border/40 bg-background md:block w-[260px] shrink-0 transition-all duration-300 ease-in-out",
                    !isDesktopOpen && "w-0 overflow-hidden border-none"
                )}
            >
                <SidebarContent isMobile={false} />
            </aside>

            {/* Mobile Sheet */}
            <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent side="left" className="w-[280px] p-0 md:hidden border-r">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SheetDescription className="sr-only">
                        Main navigation sidebar.
                    </SheetDescription>
                    <SidebarContent isMobile={true} />
                </SheetContent>
            </Sheet>
        </>
    );
}
