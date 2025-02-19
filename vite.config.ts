import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
const isDev = process.env.NODE_ENV === 'development';
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    DEV_SERVER: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
  base: isDev ? '/' : '/apps/questions/',
  esbuild: {
    target: 'esnext',
  },
  build: {
    target: 'esnext'
  }
});
