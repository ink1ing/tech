#!/usr/bin/env node

// 安全构建脚本 - 绕过 terser 问题
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 开始安全构建...');

try {
  // 1. 清理旧的构建文件
  console.log('📁 清理构建目录...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // 2. 创建最小化的 vite 配置
  console.log('⚙️ 创建安全构建配置...');
  const safeConfig = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
`;

  // 备份原配置
  if (fs.existsSync('vite.config.ts')) {
    fs.copyFileSync('vite.config.ts', 'vite.config.ts.backup');
  }

  // 写入安全配置
  fs.writeFileSync('vite.config.safe.js', safeConfig);

  // 3. 使用安全配置构建
  console.log('🚀 开始构建...');
  execSync('npx vite build --config vite.config.safe.js', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  console.log('✅ 构建成功完成！');

  // 4. 清理临时文件
  fs.unlinkSync('vite.config.safe.js');

} catch (error) {
  console.error('❌ 构建失败:', error.message);
  
  // 清理临时文件
  if (fs.existsSync('vite.config.safe.js')) {
    fs.unlinkSync('vite.config.safe.js');
  }
  
  process.exit(1);
}