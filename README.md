# 个人网站项目 (Personal Website)

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?logo=Cloudflare&logoColor=white)](https://www.cloudflare.com/)
[![Tech Domain](https://img.shields.io/badge/Domain-.tech-success)](https://get.tech/)

## 🌟 项目概述

这是一个基于现代 Web 技术栈构建的个人网站，专为中国大陆用户优化访问速度，集成了 Cloudflare CDN 和安全服务。

### 🎯 主要特性

- 🚀 **快速访问**: 基于 Cloudflare CDN，针对中国大陆网络优化
- 🔐 **智能安全**: 集成 Cloudflare 人机验证和访问控制
- 🔑 **动态密码**: 部分内容需要密码访问，密码自动更新机制
- 🎨 **现代设计**: 响应式设计，支持多设备访问
- 🔗 **外链集成**: 无缝跳转到 Notion、GitHub 等平台

## 🏗️ 技术架构

### 前端技术栈
- **框架**: React 18 + TypeScript
- **样式**: Tailwind CSS + Framer Motion
- **构建**: Vite + SWC
- **部署**: Cloudflare Pages

### 后端服务
- **API**: Cloudflare Workers
- **数据库**: Cloudflare D1 (SQLite)
- **存储**: Cloudflare R2
- **缓存**: Cloudflare KV Store

### 安全与性能
- **CDN**: Cloudflare Global Network
- **WAF**: Cloudflare Web Application Firewall
- **Bot Protection**: Cloudflare Bot Management
- **DDoS Protection**: Cloudflare DDoS Protection

## 📁 项目结构

```
tech/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/      # React 组件
│   │   ├── pages/          # 页面组件
│   │   ├── hooks/          # 自定义 Hooks
│   │   ├── utils/          # 工具函数
│   │   └── styles/         # 样式文件
│   ├── public/             # 静态资源
│   └── package.json
├── backend/                 # 后端服务
│   ├── workers/            # Cloudflare Workers
│   ├── schemas/            # 数据库模式
│   └── migrations/         # 数据库迁移
├── docs/                   # 项目文档
├── scripts/                # 部署脚本
└── cloudflare/             # Cloudflare 配置
```

## 🌐 网站功能模块

### 公开访问区域
- **首页**: 个人介绍和导航
- **项目展示**: 开源项目和作品集
- **文章列表**: 技术博客和思考文章
- **联系方式**: 社交媒体和联系信息

### 密码保护区域
- **职业信息**: 线上工作详情和经验
- **加密货币**: 返佣链接和投资建议
- **私人内容**: 个人笔记和内部资源
- **管理后台**: 密码管理和访问统计

### 外链跳转
- **Notion**: 个人知识库和文档
- **GitHub**: 代码仓库和项目
- **社交媒体**: 微博、推特等平台
- **其他平台**: 专业网络和作品展示

## 🔒 安全机制

### 访问控制
- **IP 地理定位**: 基于访问者地理位置的内容展示
- **设备指纹**: 防止恶意访问和爬虫
- **访问频率限制**: API 调用和页面访问限制
- **Cloudflare Turnstile**: 人机验证集成

### 密码系统
- **动态生成**: 每24小时自动更新密码
- **多级权限**: 不同内容区域使用不同密码
- **访问日志**: 记录所有密码使用情况
- **管理界面**: 后台查看和手动更新密码

## 🚀 部署流程

### 1. 域名配置
```bash
# 将 .tech 域名添加到 Cloudflare
# 配置 DNS 记录指向 Cloudflare Pages
```

### 2. 前端部署
```bash
# 构建前端应用
npm run build

# 部署到 Cloudflare Pages
wrangler pages deploy dist
```

### 3. 后端部署
```bash
# 部署 Cloudflare Workers
wrangler deploy

# 初始化数据库
wrangler d1 execute tech-db --file=./schemas/init.sql
```

### 4. 安全配置
- 配置 WAF 规则
- 设置 Bot Management
- 启用 DDoS Protection
- 配置 Turnstile 验证

## 📊 性能优化

### 中国大陆访问优化
- **Cloudflare 中国网络**: 利用合作伙伴网络加速
- **智能路由**: 自动选择最优访问路径
- **资源压缩**: Gzip/Brotli 压缩
- **图片优化**: WebP 格式和自适应压缩

### 缓存策略
- **静态资源**: 长期缓存 (1年)
- **API 响应**: 短期缓存 (5分钟)
- **HTML 页面**: 边缘缓存 (1小时)
- **动态内容**: 智能缓存失效

## 🔧 开发环境设置

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0
- Cloudflare CLI (Wrangler)

### 安装依赖
```bash
# 克隆仓库
git clone https://github.com/ink1ing/tech.git
cd tech

# 安装前端依赖
cd frontend && npm install

# 安装后端依赖
cd ../backend && npm install

# 安装 Cloudflare CLI
npm install -g wrangler
```

### 本地开发
```bash
# 启动前端开发服务器
npm run dev

# 启动后端开发服务器
wrangler dev
```

## 📝 内容管理

### 文章系统
- **Markdown 支持**: 使用 MDX 编写文章
- **代码高亮**: Prism.js 语法高亮
- **图片处理**: 自动压缩和 CDN 分发
- **SEO 优化**: 自动生成元数据

### 项目展示
- **GitHub 集成**: 自动同步项目信息
- **技术标签**: 自动提取技术栈
- **在线演示**: 嵌入式预览功能
- **星标统计**: 实时更新项目数据

## 🔐 环境变量

```env
# Cloudflare 配置
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_ZONE_ID=your_zone_id

# 数据库配置
DATABASE_URL=your_d1_database_url
KV_NAMESPACE_ID=your_kv_namespace_id

# 安全配置
JWT_SECRET=your_jwt_secret
TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key

# 第三方服务
GITHUB_TOKEN=your_github_token
NOTION_TOKEN=your_notion_token
```

## 📈 监控与分析

### 性能监控
- **Cloudflare Analytics**: 访问统计和性能指标
- **Core Web Vitals**: 页面加载性能监控
- **错误追踪**: Sentry 集成
- **用户行为**: 匿名化用户行为分析

### 安全监控
- **WAF 日志**: 攻击尝试和拦截记录
- **访问模式**: 异常访问行为检测
- **密码使用**: 密码访问频率统计
- **地理分布**: 访问者地理位置分析

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目基于 Apache 2.0 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- **GitHub**: [@ink1ing](https://github.com/ink1ing)
- **Email**: [联系邮箱]
- **网站**: [即将上线]

## 🗺️ 项目路线图

### Phase 1: 基础架构 (进行中)
- [x] 项目初始化和架构设计
- [ ] 前端框架搭建
- [ ] 后端 API 开发
- [ ] Cloudflare 服务集成

### Phase 2: 核心功能 (计划中)
- [ ] 用户界面开发
- [ ] 密码保护系统
- [ ] 内容管理系统
- [ ] 外链跳转功能

### Phase 3: 优化增强 (待定)
- [ ] 性能优化
- [ ] SEO 优化
- [ ] 移动端适配
- [ ] 多语言支持

### Phase 4: 高级功能 (待定)
- [ ] 访客分析
- [ ] 内容推荐
- [ ] 社交集成
- [ ] API 开放

---

**注**: 本项目正在积极开发中，功能和文档会持续更新。 