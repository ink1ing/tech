import type { PagesContext } from '../../../_lib/types';
import { fail, json, readJson } from '../../../_lib/http';
import { isAdmin } from '../../../_lib/security';
import { normalize } from './index';

export async function onRequestPatch({ request, env, params }: PagesContext) {
  if (!await isAdmin(request, env)) return fail('请先登录管理员后台', 401, 'UNAUTHORIZED');
  const body = await readJson<any>(request);
  const product = normalize(body);
  if ('error' in product) return fail(product.error);
  await env.DB.prepare(`UPDATE products SET category_id = ?, slug = ?, name = ?, subtitle = ?, description = ?,
    price_cents = ?, fulfillment = ?, delivery_note = ?, icon = ?, sort_order = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .bind(product.categoryId, product.slug, product.name, product.subtitle, product.description, product.priceCents,
      product.fulfillment, product.deliveryNote, product.icon, product.sortOrder, body.active === false ? 0 : 1, params.id).run();
  return json({ ok: true });
}

export async function onRequestDelete({ request, env, params }: PagesContext) {
  if (!await isAdmin(request, env)) return fail('请先登录管理员后台', 401, 'UNAUTHORIZED');
  await env.DB.prepare('UPDATE products SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}

