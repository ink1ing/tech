import type { PagesContext } from '../../../_lib/types';
import { cleanText, fail, json, readJson } from '../../../_lib/http';
import { isAdmin } from '../../../_lib/security';

export async function onRequestPatch({ request, env, params }: PagesContext) {
  if (!await isAdmin(request, env)) return fail('请先登录管理员后台', 401, 'UNAUTHORIZED');
  const body = await readJson<{ name?: string; active?: boolean; sortOrder?: number }>(request);
  const name = cleanText(body.name, 80);
  if (!name) return fail('分类名称不能为空');
  await env.DB.prepare('UPDATE categories SET name = ?, active = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(name, body.active === false ? 0 : 1, Number(body.sortOrder) || 0, params.id).run();
  return json({ ok: true });
}

