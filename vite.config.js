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

      /* AI Resume Tailor — same pattern, just proxies to NVIDIA */
      '/api/tailor-resume': {
        target: 'https://integrate.api.nvidia.com/v1',
        changeOrigin: true,
        rewrite: () => '/chat/completions',
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Authorization', `Bearer ${NVIDIA_KEY}`);
            proxyReq.setHeader('Content-Type', 'application/json');
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
