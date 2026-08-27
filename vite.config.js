import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: '127.0.0.1',
      open: false,
      // Proxy /api/tts to a local dev handler when running `vercel dev`,
      // or directly to Google TTS during local-only development.
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path
        }
      }
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'lucide-icons': ['lucide-react'],
            'pdf-engine': ['pdfjs-dist'],
            'ocr-engine': ['tesseract.js']
          }
        }
      },
      chunkSizeWarningLimit: 1500
    }
  };
});
