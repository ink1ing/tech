import type { PagesContext } from '../../../_lib/types';
import { cleanText, fail, json, readJson } from '../../../_lib/http';
import { isAdmin } from '../../../_lib/security';

export async function onRequestPatch({ request, env, params }: PagesContext) {
  if (!await isAdmin(request, env)) return fail('请先登录管理员后台', 401, 'UNAUTHORIZED');
  const body = await readJson<{ name?: string; slug?: string; active?: boolean; sortOrder?: number; gridColumns?: number }>(request);
  const name = cleanText(body.name, 80);
  const slug = cleanText(body.slug, 80).toLowerCase().replace(/[^a-z0-9-]/g, '-');
  if (!name || !slug) return fail('分类名称和标识不能为空');
  const duplicate = await env.DB.prepare('SELECT id FROM categories WHERE slug = ? AND id != ?').bind(slug, params.id).first();
  if (duplicate) return fail('分类标识已被使用');
  const gridColumns = Number(body.gridColumns) === 1 ? 1 : 2;
  await env.DB.prepare('UPDATE categories SET name = ?, slug = ?, active = ?, sort_order = ?, grid_columns = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(name, slug, body.active === false ? 0 : 1, Number(body.sortOrder) || 0, gridColumns, params.id).run();
  return json({ ok: true });
}
