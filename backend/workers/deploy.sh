#!/bin/bash
# Cloudflare Workers 部署脚本

echo "🚀 部署 Cloudflare Workers 认证 API"

# 检查 wrangler 是否安装
if ! command -v wrangler &> /dev/null; then
    echo "❌ wrangler CLI 未安装"
    echo "请运行: npm install -g wrangler"
    exit 1
fi

# 检查是否已登录 Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo "🔐 请先登录 Cloudflare:"
    wrangler login
fi

echo "📝 设置环境变量..."

# 设置密码 (请替换为您的实际密码)
echo "设置私有访问区域1的密码:"
wrangler secret put PASSWORD_1

echo "设置私有访问区域2的密码:"  
wrangler secret put PASSWORD_2

# 设置 JWT 密钥 (建议使用强随机字符串)
echo "设置 JWT 密钥 (建议使用强随机字符串):"
wrangler secret put JWT_SECRET

# 设置受保护的链接
echo "设置受保护链接1:"
wrangler secret put PROTECTED_LINK_1

echo "设置受保护链接2:"
wrangler secret put PROTECTED_LINK_2

echo "🚀 部署 Worker..."
wrangler deploy

echo "✅ 部署完成!"
echo ""
echo "🔗 您的 API 端点:"
echo "- 登录: https://ink-auth-api.your-subdomain.workers.dev/api/auth/login"
echo "- 验证: https://ink-auth-api.your-subdomain.workers.dev/api/auth/verify" 
echo "- 受保护内容: https://ink-auth-api.your-subdomain.workers.dev/api/protected/content"
echo ""
echo "⚠️  请更新前端代码中的 API_BASE_URL 为上述地址"