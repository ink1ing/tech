import type { PagesContext } from '../../_lib/types';
import { fail, json, readJson } from '../../_lib/http';
import { isAdmin } from '../../_lib/security';

export async function onRequestPatch({ request, env }: PagesContext) {
  if (!await isAdmin(request, env)) return fail('请先登录管理员后台', 401, 'UNAUTHORIZED');
  const body = await readJson<{ limit?: number }>(request);
  const limit = Math.round(Number(body.limit));
  if (!Number.isFinite(limit) || limit < 1 || limit > 100) return fail('图片库上限必须在 1 到 100 之间');
  const countRow = await env.DB.prepare('SELECT COUNT(*) AS count FROM product_images').first();
  if (limit < Number(countRow?.count)) return fail(`当前已有 ${countRow?.count} 张图片，上限不能低于现有数量`);
  await env.DB.prepare(`INSERT INTO store_settings (key, value, updated_at) VALUES ('image_library_limit', ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`).bind(String(limit)).run();
  return json({ ok: true, limit });
}
