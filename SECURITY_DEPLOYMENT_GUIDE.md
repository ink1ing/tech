# 安全认证系统部署指南

## 📋 概述

已为你的项目添加了基于 Cloudflare Workers 的安全后端认证系统，彻底解决密码安全问题。

## 🔧 部署步骤

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 配置 Workers

```bash
cd backend/workers
```

编辑 `wrangler.toml` 文件，替换 `your-domain.com` 为你的实际域名（或删除routes配置使用workers.dev子域名）。

### 4. 设置环境变量

运行部署脚本：

```bash
./deploy.sh
```

或手动设置：

```bash
# 设置密码
wrangler secret put PASSWORD_1    # 私有访问1的密码
wrangler secret put PASSWORD_2    # 私有访问2的密码

# 设置JWT密钥（建议使用长随机字符串）
wrangler secret put JWT_SECRET

# 设置受保护链接
wrangler secret put PROTECTED_LINK_1
wrangler secret put PROTECTED_LINK_2
```

### 5. 部署 Worker

```bash
wrangler deploy
```

### 6. 更新前端配置

编辑 `frontend/src/services/authService.js`：

```javascript
const API_BASE_URL = 'https://ink-auth-api.your-subdomain.workers.dev';
```

替换为你的实际 Workers URL。

### 7. 构建和部署前端

```bash
cd frontend
npm run build
```

然后将 `dist` 目录部署到 Cloudflare Pages。

## 🔒 安全特性

### ✅ 解决的安全问题：
- **密码服务器端验证**：密码存储在 Cloudflare 环境变量中
- **JWT Token 认证**：24小时自动过期
- **CORS 保护**：防止跨域攻击
- **敏感内容动态加载**：受保护内容从API获取
- **客户端状态管理**：自动处理token过期

### 🛡️ 安全架构：
1. 用户输入密码 → 发送到 Cloudflare Workers
2. Workers 验证密码（从环境变量）
3. 验证成功 → 生成 JWT token
4. 前端使用 token 访问受保护内容
5. Token 过期自动清除认证状态

## 📡 API 端点

- `POST /api/auth/login` - 登录验证
- `POST /api/auth/verify` - Token验证
- `GET /api/protected/content` - 获取受保护内容

## 💡 使用说明

### 前端使用：
```javascript
import authService from './services/authService';

// 登录
const result = await authService.login(password, 'private1');

// 获取受保护内容
const content = await authService.getProtectedContent();

// 登出
authService.logout();
```

### 环境变量说明：
- `PASSWORD_1` - 私有访问区域1密码
- `PASSWORD_2` - 私有访问区域2密码  
- `JWT_SECRET` - JWT签名密钥（强随机字符串）
- `PROTECTED_LINK_1` - 受保护链接1
- `PROTECTED_LINK_2` - 受保护链接2

## 🚀 优势

1. **完全免费**：Cloudflare Workers 每天10万次免费请求
2. **全球快速**：边缘计算，毫秒级响应
3. **零运维**：无需管理服务器
4. **高安全性**：企业级安全保护
5. **易扩展**：可轻松添加更多认证功能

## 🔍 测试

部署完成后，访问你的网站：
1. 点击"私有访问1"或"私有访问2"
2. 输入设置的密码
3. 验证成功后会显示受保护内容
4. 24小时后需重新登录

现在你的网站具有真正的安全保护！🎉