"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface MathKeyboardProps {
    onInsert: (symbol: string) => void;
    className?: string;
}

const TABS = [
    { id: "popular", label: "Popular" },
    { id: "trig", label: "sin cos" },
    { id: "calculus", label: "Calculus" },
    { id: "relations", label: "≥ ≠" },
    { id: "sets", label: "∈ ⊂" },
    { id: "arrows", label: "→" },
    { id: "greek", label: "ΩΔ" },
];

const SYMBOLS: Record<string, { label: string; value: string; latex?: boolean }[]> = {
    popular: [
        { label: "x/y", value: "\\frac{x}{y}" },
        { label: "x^2", value: "^2" },
        { label: "x^n", value: "^n" },
        { label: "√x", value: "\\sqrt{x}" },
        { label: "n√x", value: "\\sqrt[n]{x}" },
        { label: "log_n", value: "\\log_{n}" },
        { label: "∫", value: "\\int" },
        { label: "∑", value: "\\sum" },
        { label: "π", value: "\\pi" },
        { label: "∞", value: "\\infty" },
        { label: "+", value: "+" },
        { label: "-", value: "-" },
        { label: "×", value: "\\times" },
        { label: "÷", value: "\\div" },
        { label: "!", value: "!" },
        { label: "log", value: "\\log" },
        { label: "ln", value: "\\ln" },
        { label: "e", value: "e" },
        { label: "e^x", value: "e^x" },
        { label: "i", value: "i" },
    ],
    trig: [
        { label: "θ", value: "\\theta" },
        { label: "°", value: "^\\circ" },
        { label: "sin", value: "\\sin" },
        { label: "cos", value: "\\cos" },
        { label: "tan", value: "\\tan" },
        { label: "cot", value: "\\cot" },
        { label: "csc", value: "\\csc" },
        { label: "sec", value: "\\sec" },
        { label: "sinh", value: "\\sinh" },
        { label: "cosh", value: "\\cosh" },
        { label: "tanh", value: "\\tanh" },
        { label: "arcsin", value: "\\arcsin" },
        { label: "arccos", value: "\\arccos" },
        { label: "arctan", value: "\\arctan" },
    ],
    calculus: [
        { label: "∫", value: "\\int" },
        { label: "∫_a^b", value: "\\int_{a}^{b}" },
        { label: "d/dx", value: "\\frac{d}{dx}" },
        { label: "∂/∂x", value: "\\frac{\\partial}{\\partial x}" },
        { label: "lim", value: "\\lim_{x \\to a}" },
        { label: "∑", value: "\\sum" },
        { label: "∏", value: "\\prod" },
        { label: "∇", value: "\\nabla" },
        { label: "∇^2", value: "\\nabla^2" },
        { label: "x'", value: "'" },
    ],
    relations: [
        { label: "=", value: "=" },
        { label: "≠", value: "\\neq" },
        { label: "≈", value: "\\approx" },
        { label: ">", value: ">" },
        { label: "<", value: "<" },
        { label: "≥", value: "\\geq" },
        { label: "≤", value: "\\leq" },
        { label: "±", value: "\\pm" },
    ],
    sets: [
        { label: "∈", value: "\\in" },
        { label: "∉", value: "\\notin" },
        { label: "⊂", value: "\\subset" },
        { label: "⊆", value: "\\subseteq" },
        { label: "∪", value: "\\cup" },
        { label: "∩", value: "\\cap" },
        { label: "∅", value: "\\emptyset" },
        { label: "∀", value: "\\forall" },
        { label: "∃", value: "\\exists" },
    ],
    arrows: [
        { label: "→", value: "\\rightarrow" },
        { label: "←", value: "\\leftarrow" },
        { label: "↔", value: "\\leftrightarrow" },
        { label: "⇒", value: "\\Rightarrow" },
        { label: "⇐", value: "\\Leftarrow" },
        { label: "⇔", value: "\\Leftrightarrow" },
    ],
    greek: [
        { label: "α", value: "\\alpha" },
        { label: "β", value: "\\beta" },
        { label: "γ", value: "\\gamma" },
        { label: "δ", value: "\\delta" },
        { label: "Δ", value: "\\Delta" },
        { label: "ε", value: "\\epsilon" },
        { label: "θ", value: "\\theta" },
        { label: "λ", value: "\\lambda" },
        { label: "μ", value: "\\mu" },
        { label: "π", value: "\\pi" },
        { label: "σ", value: "\\sigma" },
        { label: "Σ", value: "\\Sigma" },
        { label: "φ", value: "\\phi" },
        { label: "ω", value: "\\omega" },
        { label: "Ω", value: "\\Omega" },
    ]
};

export function MathKeyboard({ onInsert, className }: MathKeyboardProps) {
    const [activeTab, setActiveTab] = useState("popular");

    return (
        <div className={cn("w-full bg-background border rounded-lg shadow-sm p-2 select-none", className)}>
            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-2 border-b mb-2 scrollbar-hide">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors",
                            activeTab === tab.id
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-[200px] overflow-y-auto p-1">
                {SYMBOLS[activeTab].map((symbol, idx) => (
                    <button
                        key={`${activeTab}-${idx}`}
                        onClick={() => onInsert(symbol.value)}
                        className="flex items-center justify-center h-10 rounded bg-secondary/50 hover:bg-secondary border border-border/50 text-sm font-serif italic transition-all active:scale-95"
                        title={symbol.value} // Tooltip shows the LaTeX code
                    >
                        {symbol.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
