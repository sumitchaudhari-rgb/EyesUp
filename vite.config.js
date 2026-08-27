import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '127.0.0.1',
    open: false
  },
  build: {
    target: 'esnext',
    // Exclude the massive PDF.js worker from Rollup transformation.
    // It is served as a raw asset URL via the ?url import in pdfExtractor.js.
    rollupOptions: {
      external: [],
      output: {
        manualChunks(id) {
          if (id.includes('pdfjs-dist/build/pdf.worker')) return null; // keep as asset, not chunk
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react-vendor';
          if (id.includes('node_modules/lucide-react')) return 'lucide-icons';
          if (id.includes('node_modules/pdfjs-dist')) return 'pdf-engine';
          if (id.includes('node_modules/tesseract.js')) return 'ocr-engine';
        }
      }
    },
    chunkSizeWarningLimit: 1500
  }
});
