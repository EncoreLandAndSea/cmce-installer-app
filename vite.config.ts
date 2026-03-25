import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Stub out jsPDF's optional html2canvas dep — we don't use HTML-to-canvas rendering
      'html2canvas': path.resolve(__dirname, 'src/lib/html2canvas-stub.ts'),
    },
  },
  build: {
    // Split vendor chunks for better caching on self-hosted deployments
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf': ['jspdf'],
          'router': ['@tanstack/react-router'],
          'vendor': ['react', 'react-dom', 'zustand', 'date-fns'],
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    allowedHosts: true,
  }
});