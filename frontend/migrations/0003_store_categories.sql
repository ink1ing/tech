UPDATE categories
SET slug = 'subscriptions', name = '订阅产品', sort_order = 20
WHERE id = 'cat-membership';

UPDATE categories
SET slug = 'digital-products', name = '数码产品', sort_order = 10
WHERE id = 'cat-consulting';

UPDATE products
SET category_id = 'cat-consulting'
WHERE category_id = 'cat-tools';

UPDATE categories
SET slug = 'links', name = '友情链接', sort_order = 60
WHERE id = 'cat-tools';

UPDATE categories
SET slug = 'used-goods', name = '闲置二手', sort_order = 50
WHERE id = 'cat-physical';

INSERT INTO categories (id, slug, name, sort_order, active)
VALUES
  ('cat-sim', 'sim-esim', 'sim卡 / esim卡', 30, 1),
  ('cat-banking', 'international-cards', '国际银行卡', 40, 1);
