import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'demo.html'),
    },
  },
  base: './',
  esbuild: {
    // 忽略未使用的变量等非关键错误
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})