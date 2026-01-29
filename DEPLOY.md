# Deployment Instructions

## Option 1: Vercel (Recommended for the App)
Vercel is the best place to host the Next.js frontend. However, **Vercel cannot run the AI model (Ollama)**.

### Architecture
*   **Frontend (UI)**: Hosted on Vercel.
*   **Backend (AI)**: Hosted on a personal PC (using Ngrok) or a cheap VPS (like Hetzner/DigitalOcean).

### Steps
1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com) -> "Add New Project" -> Import the repo.
3. **Environment Variables**: You MUST set these in the Vercel Dashboard:
    *   `OLLAMA_BASE_URL`: The public URL of the AI provider (e.g., `https://my-gpu-server.com` or `https://abcdef.ngrok-free.app`).
    *   `NEXTAUTH_SECRET`: A random string (e.g. run `openssl rand -base64 32`).
    *   `NEXTAUTH_URL`: The Vercel domain (e.g. `https://math-solver.vercel.app`).
4. Click **Deploy**.

**Important**: If running Ollama on a local PC, use a tool like **Ngrok** to provide a public URL for Vercel connectivity.
Example: `ngrok http 11434` -> Use the resulting URL as the `OLLAMA_BASE_URL`.
