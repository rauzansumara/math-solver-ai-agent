"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Sidebar } from "./Sidebar";
import { ChatArea } from "./ChatArea";
import { Menu, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { UserNav } from "./user-nav";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const ModeToggle = dynamic(() => import("./mode-toggle").then((mod) => mod.ModeToggle), { ssr: false });

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

interface ChatSession {
    id: string;
    title: string;
    preview: string;
    messages: ChatMessage[];
    updatedAt: number;
}

export function MathSolverApp() {
    const { data: session } = useSession();
    const [isDesktopOpen, setIsDesktopOpen] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [showLoginDialog, setShowLoginDialog] = useState(false);

    // Chat State
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load from LocalStorage on Mount
    useEffect(() => {
        const savedChats = localStorage.getItem("math-solver-chats");
        if (savedChats) {
            try {
                const parsed = JSON.parse(savedChats);
                setChats(parsed);
                if (parsed.length > 0) {
                    // Load most recent
                    const mostRecent = parsed.sort((a: ChatSession, b: ChatSession) => b.updatedAt - a.updatedAt)[0];
                    setCurrentChatId(mostRecent.id);
                    setCurrentMessages(mostRecent.messages);
                }
            } catch (e) {
                console.error("Failed to parse chats", e);
            }
        }
    }, []);

    // Save to LocalStorage whenever chats change
    useEffect(() => {
        if (chats.length > 0) {
            localStorage.setItem("math-solver-chats", JSON.stringify(chats));
        }
    }, [chats]);

    const createNewChat = () => {
        const newChat: ChatSession = {
            id: crypto.randomUUID(),
            title: "New Calculation",
            preview: "Start asking...",
            messages: [],
            updatedAt: Date.now()
        };
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        setCurrentMessages([]);
        if (window.innerWidth < 768) setIsMobileOpen(false); // Close sidebar on mobile
    };

    const deleteChat = (id: string) => {
        const newChats = chats.filter(c => c.id !== id);
        setChats(newChats);
        localStorage.setItem("math-solver-chats", JSON.stringify(newChats)); // Force save immediately

        if (currentChatId === id) {
            if (newChats.length > 0) {
                setCurrentChatId(newChats[0].id);
                setCurrentMessages(newChats[0].messages);
            } else {
                setCurrentChatId(null);
                setCurrentMessages([]);
            }
        }
    };

    const selectChat = (id: string) => {
        const chat = chats.find(c => c.id === id);
        if (chat) {
            setCurrentChatId(id);
            setCurrentMessages(chat.messages);
        }
    };

    const handleSendMessage = async (text: string, attachments: File[]): Promise<boolean> => {
        if (!session) {
            setShowLoginDialog(true);
            return false;
        }

        // Optimistic Update
        const newUserMsg: ChatMessage = { role: "user", content: text };
        const updatedMsgs = [...currentMessages, newUserMsg];
        setCurrentMessages(updatedMsgs);
        setIsLoading(true);

        // Ensure we have a chat ID
        let activeChatId = currentChatId;
        if (!activeChatId) {
            const newChat: ChatSession = {
                id: crypto.randomUUID(),
                title: text.slice(0, 30) || "New Chat",
                preview: text.slice(0, 50),
                messages: updatedMsgs,
                updatedAt: Date.now()
            };
            setChats(prev => [newChat, ...prev]);
            activeChatId = newChat.id;
            setCurrentChatId(newChat.id);
        } else {
            // Update existing chat title/preview if it's the first message
            setChats(prev => prev.map(c => {
                if (c.id === activeChatId) {
                    return {
                        ...c,
                        messages: updatedMsgs,
                        title: c.messages.length === 0 ? text.slice(0, 30) : c.title,
                        preview: text.slice(0, 50),
                        updatedAt: Date.now()
                    };
                }
                return c;
            }));
        }

        try {
            // Process Files
            const processedFiles = await Promise.all(attachments.map(async (file) => {
                return new Promise<{ type: string; name: string; data: string }>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64 = (reader.result as string).split(',')[1];
                        resolve({ type: file.type, name: file.name, data: base64 });
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }));

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: updatedMsgs, files: processedFiles }),
            });

            if (!response.ok) throw new Error(await response.text() || "Failed to send message");
            if (!response.body) throw new Error("No response body");

            // Add empty assistant message
            let finalAssistantContent = "";
            setCurrentMessages(prev => [...prev, { role: "assistant", content: "" }]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunk = decoder.decode(value, { stream: true });
                finalAssistantContent += chunk;

                setCurrentMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1].content = finalAssistantContent;
                    return newMsgs;
                });
            }

            // Final Update to Chat History
            setChats(prev => prev.map(c => {
                if (c.id === activeChatId) {
                    return {
                        ...c,
                        messages: [...updatedMsgs, { role: "assistant", content: finalAssistantContent }],
                        updatedAt: Date.now()
                    };
                }
                return c;
            }));

        } catch (error) {
            console.error("Chat error:", error);
            setCurrentMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong." }]);
        } finally {
            setIsLoading(false);
        }

        return true;
    };

    return (
        <div className="relative flex h-screen overflow-hidden bg-background">
            {/* Top Left Controls (Mobile & Desktop Collapsed) */}
            <div className="absolute top-4 left-4 z-30 flex items-center gap-2 pointer-events-none">
                {/* Mobile Menu Button */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMobileOpen(true)}
                    className="md:hidden h-10 w-10 shadow-sm pointer-events-auto"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Desktop Open Button */}
                <div className={`hidden md:block transition-all duration-300 ${!isDesktopOpen ? 'opacity-100' : 'opacity-0'}`}>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsDesktopOpen(true)}
                        className="h-9 w-9 shadow-sm pointer-events-auto"
                    >
                        <PanelLeftOpen className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Top Right Controls (User Profile + Toggle) */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
                <ModeToggle />
                <UserNav />
            </div>

            <Sidebar
                isDesktopOpen={isDesktopOpen}
                setDesktopOpen={setIsDesktopOpen}
                isMobileOpen={isMobileOpen}
                setMobileOpen={setIsMobileOpen}
                chats={chats}
                currentChatId={currentChatId}
                onSelectChat={selectChat}
                onDeleteChat={deleteChat}
                onNewChat={createNewChat}
            />
            <main className="flex-1 flex flex-col relative w-full h-full overflow-hidden transition-all duration-300 ease-in-out bg-background">
                <ChatArea
                    messages={currentMessages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                />
            </main>

            <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Login Required</DialogTitle>
                        <DialogDescription>
                            Please log in to use the chat functionality and save history.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => signIn("google")}>
                            Log in with Google
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
