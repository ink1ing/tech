import type { PagesContext } from '../../../_lib/types';
import { fail, json, readJson } from '../../../_lib/http';
import { isAdmin } from '../../../_lib/security';
import { normalize } from './index';

export async function onRequestPatch({ request, env, params }: PagesContext) {
  if (!await isAdmin(request, env)) return fail('请先登录管理员后台', 401, 'UNAUTHORIZED');
  const body = await readJson<any>(request);
  const product = normalize(body);
  if ('error' in product) return fail(product.error);
  await env.DB.batch([env.DB.prepare(`UPDATE products SET category_id = ?, slug = ?, name = ?, subtitle = ?, description = ?,
    price_cents = ?, original_price_cents = ?, image_id = ?, fulfillment = ?, delivery_note = ?, icon = ?, sort_order = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(product.categoryId, product.slug, product.name, product.subtitle, product.description, product.priceCents,
      product.originalPriceCents, product.imageId, product.fulfillment, product.deliveryNote, product.icon, product.sortOrder, body.active === false ? 0 : 1, params.id),
    env.DB.prepare('DELETE FROM product_description_images WHERE product_id = ?').bind(params.id),
    ...product.descriptionImageIds.map((imageId, index) => env.DB.prepare(
      'INSERT INTO product_description_images (product_id, image_id, sort_order) VALUES (?, ?, ?)',
    ).bind(params.id, imageId, index)),
  ]);
  return json({ ok: true });
}

export async function onRequestDelete({ request, env, params }: PagesContext) {
  if (!await isAdmin(request, env)) return fail('请先登录管理员后台', 401, 'UNAUTHORIZED');
  await env.DB.prepare('UPDATE products SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}
