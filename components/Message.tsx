"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";
import { Copy, ThumbsUp, ThumbsDown, RotateCw, User, Bot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface MessageProps {
    role: "user" | "assistant";
    content: string;
}

export function Message({ role, content }: MessageProps) {
    const isUser = role === "user";

    return (
        <div className={cn(
            "flex w-full gap-4 p-4",
            isUser ? "flex-row-reverse" : "flex-row"
        )}>
            <Avatar className={cn("h-8 w-8 mt-1 border ring-2 ring-background", isUser ? "bg-primary text-primary-foreground" : "bg-transparent border-border")}>
                <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-white dark:bg-zinc-900 border border-border"}>
                    {isUser ? <User className="h-4 w-4" /> : <div className="h-5 w-5 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center"><Bot className="h-3 w-3 text-white" /></div>}
                </AvatarFallback>
            </Avatar>

            <div className={cn(
                "flex flex-col gap-1 max-w-[85%]",
                isUser ? "items-end" : "items-start"
            )}>
                <div className={cn(
                    "px-5 py-3.5 text-sm shadow-sm transition-all duration-200",
                    isUser
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                        : "bg-transparent text-foreground/90 rounded-2xl rounded-tl-sm px-0"
                )}>
                    <div className={cn("prose prose-sm max-w-none break-words leading-7",
                        isUser ? "prose-invert text-primary-foreground" : "dark:prose-invert"
                    )}>
                        <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                a: ({ node, ...props }) => <a className="underline hover:decoration-2 underline-offset-2 opacity-90 transition-opacity" target="_blank" rel="noopener noreferrer" {...props} />,
                                code: ({ node, className, children, ...props }: any) => {
                                    const match = /language-(\w+)/.exec(className || "");
                                    return match ? (
                                        <div className="rounded-lg bg-zinc-950 p-3 overflow-x-auto my-3 border border-white/5 shadow-inner">
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        </div>
                                    ) : (
                                        <code className={cn("px-1.5 py-0.5 rounded font-mono text-xs font-semibold",
                                            isUser ? "bg-white/20 text-white" : "bg-muted text-foreground"
                                        )} {...props}>
                                            {children}
                                        </code>
                                    );
                                }
                            }}
                        >
                            {content.replace(/\\\[/g, '$$$$').replace(/\\\]/g, '$$$$').replace(/\\\(/g, '$').replace(/\\\)/g, '$')}
                        </ReactMarkdown>
                    </div>
                </div>

                {!isUser && (
                    <div className="flex items-center gap-1 mt-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                            <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                            <RotateCw className="h-3 w-3" />
                        </Button>
                        <div className="flex items-center gap-1 ml-2 border-l pl-2">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                                <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                                <ThumbsDown className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
