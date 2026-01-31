# Math Solver Based on AI Agent

**Math Solver AI** is an intelligent research assistant designed to help users solve complex mathematical problems. Built with **Next.js 16** and **Tailwind CSS**, it features a modern, responsive chat interface that supports:

*   **Multimodal Input**: Upload images or PDFs to get context-aware solutions.
*   **LaTeX Support**: Beautifully rendered mathematical equations using KaTeX.
*   **Smart History**: Automatically saves your conversation history (requires Google Login).
*   **Flexible AI Backend**: Connects to any OpenAI-compatible API (like Ollama Cloud) for privacy-focused or cloud-based inference.
*   **Built on Free Infrastructure**: Designed to run entirely on the Vercel Hobby plan + free tier AI providers.

## 🚀 Features at a Glance

*   **⚡ Zero-Cost Deployment**: Optimized for Vercel's serverless environment.
*   **📄 PDF & Image Parsing**: Drag-and-drop support for analyzing documents and diagrams.
*   **🧮 Math Formulas**: Native `KaTeX` rendering and a custom "Math Keyboard" for easy input.
*   **💾 Cloud Sync**: Chat history persists across devices (via Google Auth + LocalStorage fallback).

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Demo Link 

It’s open for anyone to try. Check it out and let me know what you think!
Live Demo: https://lnkd.in/dSgHyFbw

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with a browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js)

## Deploy on Vercel

The easiest way to deploy the Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
