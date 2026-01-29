// @ts-ignore
import pdf from "pdf-parse";

// Polyfill for Vercel/Node environment where DOMMatrix is missing (required by pdf.js legacy builds)
if (typeof global.DOMMatrix === "undefined") {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {
        constructor() { }
        toString() { return "matrix(1, 0, 0, 1, 0, 0)"; }
    };
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
        const data = await pdf(buffer);
        return data.text;
    } catch (error) {
        console.error("Error parsing PDF:", error);
        return "";
    }
}
