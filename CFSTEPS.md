# Cloudflare Pages 部署步骤指南

本文档详细说明了如何在 Cloudflare Pages 上正确部署本项目。

## 部署前准备

确保您已经将最新的代码推送到 GitHub 仓库：
```bash
git add .
git commit -m "fix: 修复Cloudflare Pages部署问题"
git push origin main
```

## Cloudflare Pages 配置步骤

### 1. 登录 Cloudflare 控制台
1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 登录您的账户

### 2. 创建新项目
1. 在左侧导航栏中，点击 "Workers & Pages"
2. 点击 "Create application"
3. 选择 "Pages"
4. 点击 "Connect to Git"

### 3. 连接 GitHub 仓库
1. 选择您的 GitHub 账户
2. 授权 Cloudflare 访问您的仓库（如果需要）
3. 选择 `ink1ing/tech` 仓库
4. 点击 "Begin setup"

### 4. 项目设置
在项目设置页面，配置以下参数：

#### 基本设置
- **Project name**: `tech` (或您喜欢的名称)
- **Production branch**: `main`

#### 构建设置
- **Framework preset**: `None`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `frontend`

#### 环境变量
添加以下环境变量：
- `NODE_VERSION` = `18`

### 5. 高级设置（可选）
- **Build comments on pull requests**: 可根据需要启用
- **Preview branches**: 可根据需要配置

### 6. 部署
1. 点击 "Save and Deploy"
2. 等待构建和部署完成（通常需要1-3分钟）

## 部署后操作

### 1. 检查部署状态
1. 在 "Deployments" 选项卡中查看部署进度
2. 点击最新的部署查看详细日志
3. 确认状态显示为 "Success"

### 2. 访问您的网站
1. 部署成功后，您会看到一个 `.pages.dev` 的临时域名
2. 点击该链接访问您的网站

## 常见问题和解决方案

### 1. 构建失败
如果遇到构建失败：
1. 检查构建日志中的错误信息
2. 确认所有依赖已正确安装
3. 清除构建缓存后重新部署

### 2. 清除构建缓存
1. 进入项目设置
2. 点击 "Build & deploy" 选项卡
3. 在 "Build cache" 部分点击 "Clear cache"

### 3. 重新部署
1. 在 "Deployments" 选项卡中
2. 点击 "Retry deployment" 或创建新的部署

## 自定义域名（可选）

如果您想使用自定义域名：
1. 在项目设置中点击 "Custom domains"
2. 点击 "Add custom domain"
3. 输入您的域名
4. 按照提示完成 DNS 配置

## 故障排除

### 检查依赖问题
确保所有必需的依赖都在 `package.json` 中正确声明

### 检查构建配置
确认 `vite.config.ts` 中没有引用已删除的模块

### 查看构建日志
详细查看构建日志可以帮助定位具体问题

## 更新部署

每次推送新代码到 `main` 分支时，Cloudflare Pages 会自动触发新的部署。

## 联系支持

如果遇到无法解决的问题，可以：
1. 查看 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
2. 在 [Cloudflare 社区](https://community.cloudflare.com/) 寻求帮助