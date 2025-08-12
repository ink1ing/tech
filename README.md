# Tech Website

个人技术网站项目，包含前端和后端部分。

## 项目结构

```
.
├── frontend/          # 前端应用 (React + Vite + TypeScript)
├── backend/           # 后端服务 (待开发)
├── docs/             # 项目文档
├── scripts/          # 脚本文件
└── cloudflare/       # Cloudflare配置
```

## 前端开发

### 技术栈
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router v6

### 开发环境

```bash
# 安装依赖
cd frontend
npm install

# 启动开发服务器
npm run dev
```

### 构建

```bash
# 生产构建
npm run build

# 安全构建 (绕过可能的构建问题)
npm run build:safe
```

## 部署到 Cloudflare Pages

### 配置设置

在 Cloudflare Pages 项目设置中，确保以下配置：

1. **框架预设**: `React (Vite)`
2. **构建命令**: `npm run build` 或 `npm run build:safe`
3. **构建输出目录**: `dist`
4. **根目录**: `frontend`
5. **环境变量**: 
   - `NODE_VERSION=18`

### 解决常见部署问题

#### Terser 错误

如果遇到以下错误：
```
[vite:terser] terser not found. Since Vite v3, terser has become an optional dependency. You need to install it.
```

解决方案：
1. 项目已配置使用 `esbuild` 压缩替代 `terser`，更轻量且速度更快
2. 如果仍需要 `terser`，请确保在 `devDependencies` 中添加：
   ```json
   "devDependencies": {
     "terser": "^5.19.2"
   }
   ```

#### 构建失败

如果构建失败，尝试使用安全构建命令：
```bash
npm run build:safe
```

该命令会创建一个最小化的构建配置，绕过可能的构建问题。

### 本地测试构建

要本地测试 Cloudflare Pages 构建环境：

```bash
cd frontend
npm run build
# 或
npm run build:safe
```

## 许可证

本项目采用 Apache License 2.0 许可证。