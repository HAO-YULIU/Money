/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Money/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: '程式/測試/測試設定.ts',
    globals: true,
  },
});
