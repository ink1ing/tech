# Silas Store 上线与运维

## 架构

- 前端：React + Vite，Cloudflare Pages 静态托管。
- API：同一 Pages 项目中的 Pages Functions，路径为 `/api/*`。
- 数据：Cloudflare D1，迁移文件位于 `frontend/migrations/`。
- 付款截图：私有 R2 Bucket，只有管理员鉴权接口可以读取。
- 通知：Telegram Bot API。
- 管理后台：`/mystore/admin`，8 小时签名会话，不在前端保存管理员密码。

## 业务流程

1. 前端从 D1 加载启用的分类和商品。
2. 客户选择商品并提交联系方式；含实体商品时强制填写地址和电话。
3. 后端重新读取数据库价格并生成订单，绝不采用前端传入金额。
4. 客户取得订单号和随机查询密钥，再按选择的方式付款。
5. 客户提交支付宝/微信流水号或 USDT 交易哈希，可附 5MB 以内截图。
6. D1 保存付款信息并通过 Telegram 通知管理员。
7. 管理员核验后更新付款和订单状态，客户无需登录即可使用两段凭证查询。

## Cloudflare 资源

在 Cloudflare 账户中创建：

- D1 数据库：`silas-store`
- R2 Bucket：`silas-store-payment-proofs`
- Pages 项目：现有 `tech`

创建 D1 后，把 `frontend/wrangler.toml` 中占位的 `database_id` 换成真实 ID。随后执行：

```bash
cd frontend
npm run db:migrate:remote
```

在 Pages 项目的 Settings > Bindings 中添加：

- D1 binding：变量名 `DB`，选择 `silas-store`
- R2 binding：变量名 `PAYMENT_PROOFS`，选择 `silas-store-payment-proofs`

## 环境变量和机密

必须配置：

- `ADMIN_PASSWORD`：强管理员密码，建议使用密码管理器生成 20 位以上随机值。
- `SESSION_SECRET`：至少 32 字节随机字符串。

收款配置：

- `ALIPAY_QR_URL`：可公开访问的支付宝收款码图片地址。
- `WECHAT_QR_URL`：可公开访问的微信收款码图片地址。
- `USDT_TRC20_ADDRESS`：TRC20 收款地址。

Telegram 通知：

- `TELEGRAM_BOT_TOKEN`：BotFather 创建机器人后得到的 Token。
- `TELEGRAM_CHAT_ID`：接收订单通知的个人或群组 Chat ID。

这些值只配置在 Cloudflare，不提交到 Git。生产环境建议把管理员密码、会话密钥和 Bot Token 设为加密 Secrets。

## 本地开发与测试

复制 `.dev.vars.example` 为 `.dev.vars` 并填写本地测试值，然后：

```bash
cd frontend
npm run db:migrate:local
npm run build
npm run cf:dev
```

另一个终端运行：

```bash
npm run test:store
```

测试会验证商品读取、实体订单、服务端计价、付款流水、密钥查询、管理员登录和状态核验。

## 上线检查

- 确认三种支付方式至少有一种已配置可用。
- 用小额真实订单验证收款信息和 Telegram 通知。
- 确认 R2 Bucket 没有开启公共访问。
- 管理后台不要使用与其他网站相同的密码。
- 定期导出 D1 订单数据备份。
- 正式开放后为 `POST /api/orders` 和管理员登录添加 Cloudflare Rate Limiting 或 Turnstile。
