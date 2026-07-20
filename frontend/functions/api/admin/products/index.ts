import type { PagesContext } from '../../../_lib/types';
import { cleanText, fail, json, readJson } from '../../../_lib/http';
import { isAdmin } from '../../../_lib/security';

interface ProductInput {
  categoryId?: string;
  slug?: string;
  name?: string;
  subtitle?: string;
  description?: string;
  priceCents?: number;
  originalPriceCents?: number;
  imageId?: string;
  descriptionImageIds?: string[];
  fulfillment?: string;
  deliveryNote?: string;
  icon?: string;
  sortOrder?: number;
}

export async function onRequestGet({ request, env }: PagesContext) {
  if (!await isAdmin(request, env)) return fail('请先登录管理员后台', 401, 'UNAUTHORIZED');
  const [result, descriptionImages] = await Promise.all([
    env.DB.prepare(`SELECT p.*, c.name AS category_name,
      CASE WHEN p.image_id != '' THEN '/api/product-images/' || p.image_id ELSE '' END AS image_url FROM products p
      JOIN categories c ON c.id = p.category_id ORDER BY p.sort_order, p.name`).all(),
    env.DB.prepare(`SELECT d.product_id, i.id, i.file_name, i.content_type, i.size_bytes, i.created_at,
      '/api/product-images/' || i.id AS url FROM product_description_images d
      JOIN product_images i ON i.id = d.image_id ORDER BY d.product_id, d.sort_order`).all(),
  ]);
  const products = result.results.map((product: any) => ({
    ...product,
    description_images: descriptionImages.results.filter((image: any) => image.product_id === product.id),
  }));
  return json({ products });
}

export async function onRequestPost({ request, env }: PagesContext) {
  if (!await isAdmin(request, env)) return fail('请先登录管理员后台', 401, 'UNAUTHORIZED');
  const body = await readJson<ProductInput>(request);
  const product = normalize(body);
  if ('error' in product) return fail(product.error);
  const id = `prod-${crypto.randomUUID()}`;
  await env.DB.batch([env.DB.prepare(`INSERT INTO products
    (id, category_id, slug, name, subtitle, description, price_cents, original_price_cents, image_id, fulfillment, delivery_note, icon, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, product.categoryId, product.slug, product.name, product.subtitle, product.description,
      product.priceCents, product.originalPriceCents, product.imageId, product.fulfillment, product.deliveryNote, product.icon, product.sortOrder),
    ...product.descriptionImageIds.map((imageId, index) => env.DB.prepare(
      'INSERT INTO product_description_images (product_id, image_id, sort_order) VALUES (?, ?, ?)',
    ).bind(id, imageId, index)),
  ]);
  return json({ id }, 201);
}

export function normalize(body: ProductInput) {
  const categoryId = cleanText(body.categoryId, 100);
  const slug = cleanText(body.slug, 100).toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const name = cleanText(body.name, 120);
  const priceCents = Math.round(Number(body.priceCents));
  const originalPriceCents = Math.round(Number(body.originalPriceCents) || 0);
  const fulfillment = cleanText(body.fulfillment, 20);
  if (!categoryId || !slug || !name) return { error: '分类、商品名称和标识不能为空' };
  if (!Number.isFinite(priceCents) || priceCents < 0) return { error: '商品价格不正确' };
  if (!Number.isFinite(originalPriceCents) || originalPriceCents < 0) return { error: '商品原价不正确' };
  if (!['digital', 'shipping'].includes(fulfillment)) return { error: '交付方式不正确' };
  return {
    categoryId, slug, name, priceCents, originalPriceCents, fulfillment,
    imageId: cleanText(body.imageId, 100),
    descriptionImageIds: Array.from(new Set(Array.isArray(body.descriptionImageIds)
      ? body.descriptionImageIds.map(id => cleanText(id, 100)).filter(Boolean)
      : [])).slice(0, 20),
    subtitle: cleanText(body.subtitle, 200),
    description: cleanText(body.description, 3000),
    deliveryNote: cleanText(body.deliveryNote, 100),
    icon: cleanText(body.icon, 60) || 'Package',
    sortOrder: Number(body.sortOrder) || 0,
  };
}
