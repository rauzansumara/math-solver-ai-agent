"use client";

import { useEffect, useRef } from "react";
import "mathlive";
import { cn } from "@/lib/utils";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "math-field": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                value?: string;
                ref?: React.RefObject<any>;
                style?: React.CSSProperties;
            };
        }
    }
}
interface MathLiveInputProps {
    value: string;
    onChange: (value: string) => void;
    onEnter?: () => void;
    className?: string;
}

export function MathLiveInput({ value, onChange, onEnter, className }: MathLiveInputProps) {
    const mfRef = useRef<HTMLElement>(null);

    // Initialize and handle value updates
    useEffect(() => {
        const mf = mfRef.current;
        if (!mf) return;

        // Set initial value
        if ((mf as any).value !== value) {
            (mf as any).value = value;
        }

        // Event listener for input changes
        const handleInput = (evt: Event) => {
            onChange((evt.target as any).value);
        };

        // Event listener for Enter key
        const handleKeydown = (evt: KeyboardEvent) => {
            if (evt.key === "Enter" && !evt.shiftKey) {
                evt.preventDefault();
                onEnter?.();
            }
        };

        mf.addEventListener("input", handleInput);
        mf.addEventListener("keydown", handleKeydown as any);

        return () => {
            mf.removeEventListener("input", handleInput);
            mf.removeEventListener("keydown", handleKeydown as any);
        };
    }, [onChange, onEnter]); // Intentionally omitting 'value' from dependency to avoid loop, handled deeply below

    // Sync external value changes back to the field if they differ significantly
    useEffect(() => {
        const mf = mfRef.current;
        if (mf && (mf as any).value !== value) {
            (mf as any).setValue(value, { silenceNotifications: true });
        }
    }, [value]);

    const MathField = "math-field" as any;

    return (
        <div className={cn("w-full", className)}>
            <MathField
                ref={mfRef}
                style={{
                    width: "100%",
                    fontSize: "1.2rem",
                    padding: "8px",
                    borderRadius: "0.5rem",
                    border: "none",
                    outline: "none",
                    backgroundColor: "transparent",
                }}
            >
                {value}
            </MathField>
        </div>
    );
}
