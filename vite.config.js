import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const NVIDIA_KEY = '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';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      /* AI Chat */
      '/api/chat': {
        target: 'https://integrate.api.nvidia.com/v1',
        changeOrigin: true,
        rewrite: (p) => p.replace('/api/chat', '/chat/completions'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Authorization', `Bearer ${NVIDIA_KEY}`);
            proxyReq.setHeader('Content-Type', 'application/json');
          });
        },
      },

      /* Voice AI */
      '/api/voice': {
        target: 'https://integrate.api.nvidia.com/v1',
        changeOrigin: true,
        rewrite: (p) => p.replace('/api/voice', '/chat/completions'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Authorization', 'Bearer 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');
            proxyReq.setHeader('Content-Type', 'application/json');
          });
        },
      },

      /* AI Resume Tailor — same proven pattern as /api/chat */
      '/api/tailor-resume': {
        target: 'https://integrate.api.nvidia.com/v1',
        changeOrigin: true,
        rewrite: () => '/chat/completions',
        proxyTimeout: 120000,
        timeout: 120000,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Authorization', `Bearer ${NVIDIA_KEY}`);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Accept-Encoding', 'identity');
          });
          proxy.on('error', (err, req, res) => {
            console.error('[proxy/tailor-resume] error:', err.message);
          });
        },
      },

      /* PDF Compile — proxy to ytotech */
      '/api/compile-pdf-api': {
        target: 'https://latex.ytotech.com',
        changeOrigin: true,
        rewrite: () => '/builds/sync',
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Content-Type', 'application/json');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            proxyRes.headers['content-type'] = 'application/pdf';
          });
        },
      },
    },
  },
});
