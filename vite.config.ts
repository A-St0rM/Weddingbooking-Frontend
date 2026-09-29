import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  server: {
    port: 5173,
    // In development the API is same-origin through this proxy: no CORS and no
    // base URL to configure. Deployed builds set VITE_API_BASE_URL instead.
    proxy: {
      '/api': { target: 'http://localhost:5055', changeOrigin: true },
    },
  },
});
