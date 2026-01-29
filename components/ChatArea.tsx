"use client";

import { useState } from "react";
import { Message } from "./Message";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calculator } from "lucide-react";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    images?: string[];
}

interface ChatAreaProps {
    messages: ChatMessage[];
    onSendMessage: (text: string, attachments: File[]) => Promise<boolean>;
    isLoading: boolean;
}

export function ChatArea({ messages, onSendMessage, isLoading }: ChatAreaProps) {
    // Removed internal state for messages and loading (lifted up)

    // We can keep a local handler if needed, but for now we delegate directly
    const handleSend = async (text: string, attachments: File[]) => {
        return await onSendMessage(text, attachments);
    };

    return (
        <div className="flex flex-col h-full w-full">
            {/* Header Hero - Fixed at top when no messages */}
            {messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-700 slide-in-from-bottom-4">
                    <div className="inline-flex h-16 w-16 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl items-center justify-center mb-6 ring-1 ring-blue-100 dark:ring-blue-900 shadow-sm">
                        <Calculator className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-3 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Math Solver AI
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-[600px] mx-auto leading-relaxed">
                        Intelligent research assistant for mathematics. <br className="hidden sm:inline" />
                        Ask complex questions or upload problems to get started.
                    </p>
                </div>
            )}

            {/* Scrollable Message Area - takes remaining space */}
            <ScrollArea className="flex-1 px-4">
                <div className="max-w-3xl mx-auto py-4">
                    {messages.map((msg, i) => (
                        <Message key={i} role={msg.role} content={msg.content} images={msg.images} />
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-2 py-4 text-muted-foreground animate-pulse">
                            <span className="h-2 w-2 rounded-full bg-current"></span>
                            <span className="h-2 w-2 rounded-full bg-current"></span>
                            <span className="h-2 w-2 rounded-full bg-current"></span>
                            <span>Thinking...</span>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area - Fixed at bottom */}
            <div className="mt-auto w-full px-4 pb-6 pt-2 bg-background">
                <div className="max-w-3xl mx-auto">
                    <ChatInput onSend={handleSend} disabled={isLoading} />
                </div>
            </div>
        </div>
    );
}
