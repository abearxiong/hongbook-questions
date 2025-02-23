import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pkgs from './package.json' with { type: 'json'}; // eslint-disable-line

// https://vitejs.dev/config/
const isDev = process.env.NODE_ENV === 'development';
const version = pkgs.version || '1.0.0';
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    DEV_SERVER: JSON.stringify(process.env.NODE_ENV === 'development'),
    VERSION: JSON.stringify(version),
  },
  base: isDev ? '/' : '/apps/questions/',
  esbuild: {
    target: 'esnext',
  },
  build: {
    target: 'esnext'
  }
});
