import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { extractTextFromPdf } from "@/lib/pdf";
import { Ollama } from "ollama";

// Ensure Node.js runtime for pdf-parse
export const runtime = "nodejs";

const ollama = new Ollama({
    host: process.env.OLLAMA_BASE_URL || "https://ollama.com",
    headers: process.env.OLLAMA_API_KEY
        ? { Authorization: `Bearer ${process.env.OLLAMA_API_KEY}` }
        : undefined,
});

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    // NOTE: You can uncomment this to enforce auth. 
    // For now allowing testing without full auth setup if env vars are missing.
    // if (!session) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    try {
        const { messages, files } = await req.json();

        // Process files
        let fileContext = "";
        const processedImages: string[] = [];

        if (files && files.length > 0) {
            for (const file of files) {
                if (file.type === "application/pdf") {
                    // file.data is expected to be base64 string
                    const buffer = Buffer.from(file.data, "base64");
                    const text = await extractTextFromPdf(buffer);
                    fileContext += `\n\n[Context from PDF ${file.name}]:\n${text}\n`;
                } else if (file.type.startsWith("image/")) {
                    processedImages.push(file.data); // Ollama expects base64
                }
            }
        }

        // Append context to the last message if exists
        const lastMsg = messages[messages.length - 1];
        if (fileContext) {
            lastMsg.content += fileContext;
        }

        // Call Ollama
        const response = await ollama.chat({
            model: process.env.OLLAMA_MODEL || "llama3.2",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful math solver AI. You help users solve mathematical problems. IMPORTANT: Always use LaTeX for mathematical expressions. \n\nRULES:\n1. Wrap inline math in SINGLE $ signs (e.g., $x^2$). DO NOT use \\( ... \\).\n2. Wrap block math in DOUBLE $$ signs (e.g., $$ \\int x dx $$). DO NOT use \\[ ... \\].\n3. Use markdown for text formatting."
                },
                ...messages.map((m: any) => ({
                    role: m.role,
                    content: m.content,
                    images: m.role === 'user' && processedImages.length > 0 ? processedImages : undefined
                }))
            ],
            stream: true,
        });

        // Create a stream
        const stream = new ReadableStream({
            async start(controller) {
                for await (const part of response) {
                    controller.enqueue(part.message.content);
                }
                controller.close();
            },
        });

        return new NextResponse(stream);
    } catch (error) {
        console.error("Error in chat route:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
