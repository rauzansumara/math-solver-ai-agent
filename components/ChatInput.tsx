"use client";

import { useState, useRef, ChangeEvent } from "react";
import { ArrowUp, X, FileText, Image as ImageIcon, Calculator, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const MathLiveInput = dynamic(
    () => import("./MathLiveInput").then((mod) => mod.MathLiveInput),
    { ssr: false }
);

interface ChatInputProps {
    onSend: (message: string, attachments: File[]) => Promise<boolean>;
    disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [input, setInput] = useState("");
    const [mathInput, setMathInput] = useState(""); // Separate state for math field
    const [files, setFiles] = useState<File[]>([]);
    const [isMathMode, setIsMathMode] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if ((!input.trim() && files.length === 0) || disabled) return;

        const success = await onSend(input, files);

        if (success) {
            setInput("");
            setFiles([]);
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith('image/') || file.type === 'application/pdf'
        );
        if (droppedFiles.length > 0) {
            setFiles(prev => [...prev, ...droppedFiles]);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        const pastedFiles: File[] = [];

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const file = items[i].getAsFile();
                if (file) pastedFiles.push(file);
            }
        }

        if (pastedFiles.length > 0) {
            e.preventDefault();
            setFiles(prev => [...prev, ...pastedFiles]);
        }
    };

    const insertMath = () => {
        if (!mathInput.trim()) return;

        // Wrap latex in delimiters and insert into text input
        const latex = ` $${mathInput}$ `;
        const cursorPosition = textareaRef.current?.selectionStart || input.length;
        const newInput = input.slice(0, cursorPosition) + latex + input.slice(cursorPosition);

        setInput(newInput);
        setMathInput(""); // Clear math input after insertion

        // Focus back on textarea and update height
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                // Set cursor after inserted text
                const newCursorPos = cursorPosition + latex.length;
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                // Adjust height
                textareaRef.current.style.height = "auto";
                textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
            }
        }, 0);
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* Input Box Wrapper - Floating Card Style */}
            <div className={cn(
                "w-full max-w-3xl relative rounded-2xl border bg-background/80 backdrop-blur-xl shadow-lg transition-all duration-300 ease-out",
                isDragOver ? "border-blue-500 ring-2 ring-blue-500/20" : "border-border/60 hover:border-border/80 hover:shadow-xl",
                "flex flex-col overflow-hidden"
            )}>

                {/* Drag Overlay */}
                {isDragOver && (
                    <div className="absolute inset-0 z-50 bg-blue-50/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200">
                        <ImagePlus className="h-10 w-10 text-blue-500 mb-2" />
                        <p className="font-semibold text-blue-600">Drop files here</p>
                    </div>
                )}

                {/* File Previews */}
                {files.length > 0 && (
                    <div className="px-4 pt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-200">
                        {files.map((file, i) => (
                            <div key={i} className="group flex items-center gap-2 p-1.5 pr-2.5 bg-muted/60 border border-border/50 rounded-lg text-xs shrink-0 animate-in fade-in zoom-in duration-200 relative">
                                <div className="p-1 bg-background rounded-md shadow-sm">
                                    {file.type.startsWith('image') ? <ImageIcon className="h-3.5 w-3.5 text-blue-500" /> : <FileText className="h-3.5 w-3.5 text-orange-500" />}
                                </div>
                                <span className="truncate max-w-[120px] font-medium text-foreground/80">{file.name}</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                >
                                    <X className="h-2 w-2" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Math Insertion Panel */}
                {isMathMode && (
                    <div className="bg-muted/30 border-b border-border/40 p-3 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">Formula Editor</span>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setIsMathMode(false)}
                                    className="h-6 w-6 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                            <div className="bg-background rounded-xl border border-input shadow-inner overflow-hidden">
                                <MathLiveInput
                                    value={mathInput}
                                    onChange={setMathInput}
                                    onEnter={insertMath}
                                    className="font-medium px-2"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-1">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setMathInput("")}
                                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    Clear
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={insertMath}
                                    disabled={!mathInput.trim()}
                                    className="h-7 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 shadow-sm shadow-blue-500/20"
                                >
                                    Insert <span className="opacity-60">↵</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Text Input Area */}
                <div
                    className="px-4 py-3 relative cursor-text"
                    onClick={() => textareaRef.current?.focus()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            e.target.style.height = "auto";
                            e.target.style.height = Math.min(e.target.scrollHeight, 250) + "px";
                        }}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        placeholder="Ask anything... type $ for math"
                        className="w-full resize-none bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/50 leading-relaxed min-h-[44px] max-h-[250px] py-2"
                        rows={1}
                        spellCheck={false}
                    />

                    {/* Bottom Actions Bar */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 -ml-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsMathMode(!isMathMode)}
                                className={cn(
                                    "h-8 gap-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors px-3",
                                    isMathMode && "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
                                )}
                            >
                                <Calculator className="h-4 w-4" />
                                <span className="hidden sm:inline">Math</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            >
                                <ImagePlus className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                multiple
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileSelect}
                                accept="image/*,application/pdf"
                            />
                            <div className="text-[10px] text-muted-foreground/40 font-medium hidden sm:block">
                                Use <span className="bg-muted px-1 py-0.5 rounded border border-border">Shift + Return</span> for new line
                            </div>
                            <Button
                                onClick={handleSubmit}
                                disabled={(!input.trim() && files.length === 0) || disabled}
                                size="icon"
                                className={cn(
                                    "h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300 shadow-sm",
                                    (input.trim() || files.length > 0)
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md transform hover:-translate-y-0.5"
                                        : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                )}
                            >
                                <ArrowUp className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Disclaimer */}
            <p className="text-[10px] text-muted-foreground/60 mt-3 font-medium">
                AI can make mistakes. Please double check important calculations.
            </p>
        </div>
    );
}
