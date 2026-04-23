import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/chat': {
        target: 'https://integrate.api.nvidia.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/chat', '/chat/completions'),
        headers: {
          'Origin': 'https://integrate.api.nvidia.com',
        },
      },
    },
  },
})
