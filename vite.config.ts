import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    assetsInlineLimit: 2048,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        gallery: resolve(root, 'gallery.html'),
      },
    },
  },
});
