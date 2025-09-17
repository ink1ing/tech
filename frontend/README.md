# Frontend - 个人网站前端应用

这是个人网站的前端应用，基于 React + TypeScript + Vite 构建，专为 Cloudflare Pages 部署优化。

## 🚀 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite + SWC
- **样式**: Tailwind CSS
- **路由**: React Router
- **动画**: Framer Motion
- **图标**: Lucide React
- **UI组件**: Headless UI

## 📦 安装依赖

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install
```

## 🛠️ 开发环境

```bash
# 启动开发服务器
npm run dev

# 预览构建结果
npm run preview

# 代码检查
npm run lint

# 代码格式化
npm run lint:fix
```

## 🏗️ 构建配置

### Cloudflare Pages 配置

根据您提供的配置信息：

- **框架预设**: React (Vite)
- **构建命令**: `npm run build`
- **构建输出目录**: `dist`
- **根目录**: `frontend`

### 环境变量

在 Cloudflare Pages 中设置以下环境变量：

```env
# Node.js 版本
NODE_VERSION=18

# API 配置
VITE_API_BASE_URL=https://your-domain.pages.dev/api

# Cloudflare Turnstile (可选)
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
```

## 📁 项目结构

```
frontend/
├── public/                 # 静态资源
│   └── vite.svg           # 应用图标
├── src/
│   ├── components/        # React 组件
│   │   └── Header.tsx     # 头部导航
│   ├── pages/             # 页面组件
│   │   ├── Home.tsx       # 首页
│   │   ├── Projects.tsx   # 项目展示
│   │   ├── Blog.tsx       # 博客文章
│   │   ├── Contact.tsx    # 联系表单
│   │   └── Protected.tsx  # 密码保护页面
│   ├── styles/            # 样式文件
│   ├── utils/             # 工具函数
│   ├── hooks/             # 自定义 Hooks
│   ├── App.tsx            # 主应用组件
│   ├── main.tsx           # 应用入口
│   └── index.css          # 全局样式
├── index.html             # HTML 模板
├── package.json           # 项目配置
├── vite.config.ts         # Vite 配置
├── tailwind.config.js     # Tailwind 配置
├── postcss.config.js      # PostCSS 配置
├── tsconfig.json          # TypeScript 配置
└── .eslintrc.cjs          # ESLint 配置
```

## 🌐 部署到 Cloudflare Pages

### 方法一：通过 Git 集成（推荐）

1. 在 Cloudflare Dashboard 中创建新的 Pages 项目
2. 连接您的 GitHub 仓库 `ink1ing/tech`
3. 配置构建设置：
   - **框架预设**: React (Vite)
   - **构建命令**: `npm run build`
   - **构建输出目录**: `dist`
   - **根目录**: `frontend`
4. 部署项目

### 方法二：直接上传

```bash
# 构建项目
npm run build

# 使用 Wrangler CLI 部署
npx wrangler pages deploy dist --project-name=tech
```

## 🔧 自定义配置

### Vite 配置

`vite.config.ts` 包含：
- React SWC 插件
- 路径别名配置
- 构建优化
- 代码分割

### Tailwind 配置

`tailwind.config.js` 包含：
- 自定义颜色主题
- 动画配置
- 响应式断点
- 字体配置

### TypeScript 配置

- 严格模式启用
- 路径映射配置
- JSX 支持
- ES2020 目标

## 🎨 主题和样式

- 支持亮色/暗色主题切换
- 使用 Tailwind CSS 工具类
- 自定义组件样式
- 动画效果支持

## 🔒 密码保护功能

项目包含密码保护页面，可以：
- 设置访问密码
- 动态密码更新
- 访问日志记录
- 多级权限控制

## 📱 响应式设计

- 移动端优先设计
- 多设备适配
- 触摸友好界面
- 性能优化

## 🚀 性能优化

- 代码分割和懒加载
- 图片压缩和 WebP 支持
- 资源预加载
- 服务工作线程（Service Worker）

## 🔗 外链集成

支持跳转到：
- GitHub 项目页面
- Notion 知识库
- 社交媒体平台
- 其他个人网站

---

**注**: 这是个人网站项目的前端部分，更多信息请查看根目录的 [README.md](../README.md)。 