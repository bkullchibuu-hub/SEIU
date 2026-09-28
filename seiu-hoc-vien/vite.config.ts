import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

// `vite build --mode demo`: bản demo chạy hoàn toàn trên trình duyệt, không cần máy chủ.
export default defineConfig(({ mode }) => (mode === 'demo'
  ? {
    plugins: [react()],
    base: './',
    define: { __DEMO__: 'true' },
    resolve: {
      alias: [
        { find: 'node:crypto', replacement: path.resolve('demo/crypto-shim.mjs') },
        { find: /^\.\/auth\.mjs$/, replacement: path.resolve('demo/auth-demo.mjs') },
      ],
    },
    build: { outDir: 'dist-demo' },
  }
  : { plugins: [react()], define: { __DEMO__: 'false' } }));
