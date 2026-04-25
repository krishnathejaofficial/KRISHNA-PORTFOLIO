import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load .env.local for local dev — never committed to git
  const env = loadEnv(mode, process.cwd(), '');

  const NVIDIA_API_KEY = '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';

  // ⬇️ Fill these in .env.local (see instructions below)
  const ELEVENLABS_API_KEY = env.ELEVENLABS_API_KEY || '';
  const ELEVENLABS_VOICE_ID = env.ELEVENLABS_VOICE_ID || '';

  return {
    plugins: [react()],
    server: {
      proxy: {
        // NVIDIA NIM proxy (AI chat + voice Q&A)
        '/api/chat': {
          target: 'https://integrate.api.nvidia.com/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace('/api/chat', '/chat/completions'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${NVIDIA_API_KEY}`);
              proxyReq.setHeader('Content-Type', 'application/json');
            });
          },
        },

        // ElevenLabs TTS proxy (voice cloning)
        '/api/tts': {
          target: `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
          changeOrigin: true,
          rewrite: () => '', // strip /api/tts — the full path is baked in target
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('xi-api-key', ELEVENLABS_API_KEY);
              proxyReq.setHeader('Content-Type', 'application/json');
              proxyReq.setHeader('Accept', 'audio/mpeg');
            });
          },
        },
      },
    },
  };
});

/*
  ── Local Dev Setup ──────────────────────────────────────────
  Create a file called .env.local in the project root (next to package.json).
  This file is gitignored by default, so your keys stay private.

  Paste this into .env.local (replace with your real values):

    ELEVENLABS_API_KEY=your_api_key_here
    ELEVENLABS_VOICE_ID=your_voice_id_here

  Then restart npm run dev.
  ─────────────────────────────────────────────────────────────
*/
