import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  // staticwebapp.config.json must land in dist/ so Static Web Apps picks it up.
  publicDir: 'public',
  server: {
    port: 5173,
    // The API is same-origin in development, so no CORS and no base URL to configure.
    proxy: {
      '/api': { target: 'http://localhost:5055', changeOrigin: true },
    },
  },
});
