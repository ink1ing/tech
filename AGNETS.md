% 项目概览（AGNETS）

本仓库是一个个人技术网站项目，前端采用 React + TypeScript + Vite + Tailwind CSS 构建，后端使用 Cloudflare Workers 提供认证与受保护内容的 API，前后端分别部署在 Cloudflare Pages 与 Cloudflare Workers。

## 目录结构

- `frontend/`: 前端应用（React 18 + TypeScript + Vite 4 + Tailwind CSS）
  - `src/`
    - `components/`: 布局与页面容器（`Layout.tsx`, `PageContainer.tsx`）
    - `pages/`: 各导航与内容页面（`NavigationPage.tsx`, `AboutPage.tsx`, `WorksPage.tsx`, `ExperiencePage.tsx`, `ThoughtsPage.tsx`, `OtherStuffPage.tsx`, 私有访问页 `PrivateAccessPage.tsx` 等）
    - `context/`: 应用上下文（`AppContext.tsx`）
    - `services/`: 前端服务封装（`authService.js` 与后端 Workers 通讯）
    - `main.tsx`, `App.tsx`, `index.css`
  - `vite.config.ts`: 构建配置（`minify: 'esbuild'`，别名 `@` 指向 `src`）
  - `tailwind.config.js`, `postcss.config.js`
  - `package.json`: 脚本与依赖（`dev`, `build`, `build:safe`, `lint`）
- `backend/`: 后端服务
  - `workers/`: Cloudflare Workers 认证 API
    - `auth-worker.js`: 登录、验证、受保护内容 API，内置 CORS 处理与 HMAC-SHA256 JWT 生成/校验
    - `wrangler.toml`: Workers 配置（`name=ink-auth-api`，`main=auth-worker.js`）
    - `deploy.sh`: 一键部署与机密变量设置脚本
  - `migrations/`, `schemas/`: 预留目录（当前无实现）
- `cloudflare/`: 与 Pages/Workers 相关的占位与说明
- `docs/`: 额外项目文档（占位）
- 根目录文档：`README.md`, `SECURITY_DEPLOYMENT_GUIDE.md`, `CLOUDFLARE_PAGES_FIX.md`, `CFSTEPS.md`, `UI.md`, `idea.md`, `data.md` 等

## 前端说明

- 路由结构：
  - `/navigation`, `/about`, `/works`, `/experience`, `/thoughts`, `/other`
  - 私有区：`/private1`, `/private2`（通过密码登录后访问受保护内容）
- 关键服务：
  - `src/services/authService.js`
    - `API_BASE_URL`: 指向已部署的 Workers（示例：`https://ink-auth-api.<subdomain>.workers.dev`）
    - `login(password, section)`: 密码登录，持久化 `auth_token` 与过期时间到 `localStorage`
    - `verifyToken()`: 校验现有 JWT 是否有效
    - `getProtectedContent()`: 读取受保护内容（需要 `Authorization: Bearer <token>`）
    - `logout()/clearAuth()`: 清除本地认证状态
- UI/样式：Tailwind CSS；`vite.config.ts` 使用 `esbuild` 压缩；`lucide-react` 图标。
- 开发与构建：
  - `npm run dev`: 本地开发（Vite）
  - `npm run build`: 生产构建
  - `npm run build:safe`: 安全构建（用于规避部分构建环境问题）

## 后端说明（Cloudflare Workers）

- 技术要点：
  - 运行时：Cloudflare Workers（边缘计算）
  - 鉴权：自实现 JWT（Header/Payload Base64URL + HMAC-SHA256 签名，Web Crypto API）
  - CORS：根据请求 `Origin` 返回允许头，支持 `OPTIONS` 预检
- 环境变量（通过 `wrangler secret put` 设置）：
  - `PASSWORD_1`, `PASSWORD_2`: 对应两个私有访问区域的密码
  - `JWT_SECRET`: JWT 签名密钥（建议强随机字符串）
  - `PROTECTED_LINK_1`, `PROTECTED_LINK_2`: 受保护的返回内容/链接
- API 端点：
  - `POST /api/auth/login`: 校验密码，签发短期 JWT（示例为 24 小时）
  - `POST /api/auth/verify`: 校验现有 JWT 是否有效
  - `GET /api/protected/content`: 返回与用户授权区域相匹配的受保护内容
- 配置与部署：
  - `backend/workers/wrangler.toml`: `name`, `main`, `compatibility_date`, `vars`
  - `backend/workers/deploy.sh`: 登录、设定机密、部署的一键脚本

## 部署与运行

- Cloudflare Pages（前端）：
  - 根目录：`frontend`
  - 构建命令：`npm run build` 或 `npm run build:safe`
  - 构建产物：`dist`
  - Node 版本：`NODE_VERSION=18`
  - 参考：`CLOUDFLARE_PAGES_FIX.md`（`terser`/`esbuild` 相关说明）
- Cloudflare Workers（后端）：
  - 先安装 `wrangler` 并登录：`npm i -g wrangler && wrangler login`
  - 进入 `backend/workers` 设置机密后部署：`./deploy.sh` 或 `wrangler deploy`
  - 将前端 `authService.js` 中的 `API_BASE_URL` 替换为实际 Workers 地址

## 安全与最佳实践

- 密码仅存在 Workers 机密变量中，前端不存储明文密码
- JWT 设置过期时间并在前端自动失效清理（`localStorage`）
- CORS 白名单/策略可按需收紧
- 受保护内容仅通过后端 API 按需返回，避免静态暴露
- 参考 `SECURITY_DEPLOYMENT_GUIDE.md` 获取更完整的安全部署指引

## 主要技术栈与版本

- 前端：
  - React 18，TypeScript 5，Vite 4，Tailwind CSS 3
  - 路由：`react-router-dom` ^7.8.1
  - UI/Icon：`lucide-react`
  - 工具：ESLint、@vitejs/plugin-react-swc、PostCSS、esbuild 压缩
- 后端：
  - Cloudflare Workers（JavaScript），Wrangler CLI
  - Web Crypto API（HMAC-SHA256）实现 JWT 签名与校验

## 现状与待办

- `backend/migrations/`, `backend/schemas/` 为预留目录，暂无实现
- 根据 `data.md` 持续完善页面实际内容与外链
- 可将前端 `API_BASE_URL` 抽取为构建环境变量以便多环境部署
- 进一步收紧 CORS 策略与前端存储策略（如切换为 `sessionStorage`）视需求而定

---

更多细节可查阅：
- `README.md`: 项目快速上手与部署摘要
- `SECURITY_DEPLOYMENT_GUIDE.md`: 认证系统部署与安全说明
- `CLOUDFLARE_PAGES_FIX.md`: Cloudflare Pages 构建问题排查
- `UI.md`/`idea.md`/`data.md`: UI 方案、构想与内容来源
