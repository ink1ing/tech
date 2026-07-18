PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  fulfillment TEXT NOT NULL CHECK (fulfillment IN ('digital', 'shipping')),
  delivery_note TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'Package',
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  lookup_hash TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  messenger TEXT NOT NULL DEFAULT '',
  fulfillment TEXT NOT NULL CHECK (fulfillment IN ('digital', 'shipping')),
  shipping_address TEXT NOT NULL DEFAULT '',
  shipping_phone TEXT NOT NULL DEFAULT '',
  shipping_postal_code TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('alipay', 'wechat', 'usdt')),
  payment_status TEXT NOT NULL DEFAULT 'awaiting_payment' CHECK (payment_status IN ('awaiting_payment', 'submitted', 'verified', 'rejected', 'refunded')),
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'fulfilled', 'shipped', 'completed', 'cancelled')),
  payment_reference TEXT NOT NULL DEFAULT '',
  payment_proof_key TEXT NOT NULL DEFAULT '',
  currency TEXT NOT NULL DEFAULT 'CNY',
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  customer_note TEXT NOT NULL DEFAULT '',
  admin_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS order_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id, active, sort_order);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status, payment_status);
CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events(order_id, created_at DESC);

INSERT OR IGNORE INTO categories (id, slug, name, sort_order) VALUES
  ('cat-membership', 'memberships', '数字会员', 10),
  ('cat-consulting', 'consulting', '咨询服务', 20),
  ('cat-tools', 'tools', '研究与工具', 30),
  ('cat-physical', 'physical', '实体商品', 40);

INSERT OR IGNORE INTO products (id, category_id, slug, name, subtitle, description, price_cents, fulfillment, delivery_note, icon, sort_order) VALUES
  ('prod-chatgpt', 'cat-membership', 'chatgpt-plus', 'ChatGPT Plus 年度方案', '个人 AI 生产力会员', '付款后由人工核验订单并安排交付，处理状态可通过订单号查询。', 69900, 'digital', '1-12 小时', 'MessageCircle', 10),
  ('prod-google-ai', 'cat-membership', 'google-ai-pro', 'Google AI Pro', 'AI 工具与云端存储方案', '适合希望使用 Google AI 能力与云端服务的个人用户。', 19900, 'digital', '1-12 小时', 'Star', 20),
  ('prod-tech', 'cat-consulting', 'tech-consulting', '科技咨询', '一对一远程技术支持', '围绕设备、软件、AI 工具与自动化流程提供远程协助。', 14900, 'digital', '预约处理', 'Hammer', 30),
  ('prod-invest', 'cat-consulting', 'investment-research', '投资研究咨询', '信息整理与研究方法', '提供研究框架、信息整理和风险识别，不构成投资建议。', 21900, 'digital', '预约处理', 'ChartNoAxesColumnIncreasing', 40),
  ('prod-api', 'cat-tools', 'api-setup', 'API 接入配置', '远程完成接口与客户端配置', '协助完成 API 客户端、环境变量及基础调用配置。', 29900, 'digital', '24 小时内', 'Settings', 50),
  ('prod-prompts', 'cat-tools', 'prompt-pack', '高效提示词包', '精选工作流提示词与模板', '付款核验后通过订单联系方式交付数字文件。', 3900, 'digital', '即时交付', 'FileText', 60),
  ('prod-remote-kit', 'cat-physical', 'remote-work-kit', '远程工作套装', '键盘收纳与桌面工具组合', '实体套装，下单时需要提供完整配送信息。', 32900, 'shipping', '3-7 个工作日', 'Package', 70),
  ('prod-brief', 'cat-tools', 'custom-research-brief', '定制研究简报', '围绕指定主题形成结构化报告', '确认研究范围后开始制作，并通过订单联系方式交付。', 49900, 'digital', '2-5 个工作日', 'BookOpenText', 80);

