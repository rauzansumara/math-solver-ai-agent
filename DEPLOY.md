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
    *   `OLLAMA_API_KEY`: The API key for the AI provider (if protected) or any string if not.
    *   `OLLAMA_MODEL`: The model to use (e.g., `llama3`, `deepseek-r1`, `gpt-oss:120b-cloud`).
    *   `NEXTAUTH_SECRET`: A random string (e.g. run `openssl rand -base64 32`).
    *   `NEXTAUTH_URL`: The Vercel domain (e.g. `https://math-solver.vercel.app`).
    *   `GOOGLE_CLIENT_ID`: The Google Client ID (same as local).
    *   `GOOGLE_CLIENT_SECRET`: The Google Client Secret (same as local).
4. Click **Deploy**.
5. **Post-Deployment Setup (Critical)**:
    *   Go back to [Google Cloud Console](https://console.cloud.google.com/).
    *   Go to **Credentials** -> Click the "Math Solver Web Client".
    *   **Authorized JavaScript origins**: ADD the new Vercel URL (e.g., `https://math-solver-ai-agent.vercel.app`).
    *   **Authorized redirect URIs**: ADD the callback URL (e.g., `https://math-solver-ai-agent.vercel.app/api/auth/callback/google`).
    *   Click **Save**.

**Important**: The `OLLAMA_BASE_URL` should point to a public endpoint (e.g., `https://api.ollama.com` or your own server).
 
## Troubleshooting & Known Issues

### 1. "Something went wrong" (Timeouts)
Large models (like `gpt-oss:120b`) can take >10s to start replying, which hits Vercel's default timeout.
*   **Fix**: This project sets `maxDuration = 60` in `app/api/chat/route.ts` to allow 60-second responses on Vercel Hobby/Pro.

### 2. PDF Parsing Crashes (`DOMMatrix` / `Canvas`)
Serverless environments lack browser APIs (`DOMMatrix`, `Path2D`) used by PDF libraries.
*   **Fix**: This project includes custom polyfills in `lib/polyfill.ts` and `lib/pdf.ts`. A specific `npm install @napi-rs/canvas` dependency handles backend canvas rendering.

### 3. Image Attachments "Disappearing"
*   **Fix**: Images are now converted to Base64 in the frontend and persisted in the local chat state immediately to ensure they stay visible even if the backend is slow.
