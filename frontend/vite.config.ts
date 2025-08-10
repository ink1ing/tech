import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild', // 使用 esbuild 而不是 terser，更快且兼容性更好
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          motion: ['framer-motion']
        }
      }
    },
    // 确保构建结果兼容 Cloudflare Pages
    assetsInlineLimit: 4096
  },
  server: {
    port: 3000,
    open: true
  },
  preview: {
    port: 4173
  },
  // 针对 Cloudflare Pages 的优化
  base: './'
}) 