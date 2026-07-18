import type { PagesContext } from '../../../_lib/types';
import { cleanText, fail, json, readJson } from '../../../_lib/http';
import { isAdmin } from '../../../_lib/security';

export async function onRequestGet({ request, env }: PagesContext) {
  if (!await isAdmin(request, env)) return fail('请先登录管理员后台', 401, 'UNAUTHORIZED');
  const result = await env.DB.prepare('SELECT * FROM categories ORDER BY sort_order, name').all();
  return json({ categories: result.results });
}

export async function onRequestPost({ request, env }: PagesContext) {
  if (!await isAdmin(request, env)) return fail('请先登录管理员后台', 401, 'UNAUTHORIZED');
  const body = await readJson<{ name?: string; slug?: string; sortOrder?: number }>(request);
  const name = cleanText(body.name, 80);
  const slug = cleanText(body.slug, 80).toLowerCase().replace(/[^a-z0-9-]/g, '-');
  if (!name || !slug) return fail('分类名称和标识不能为空');
  const id = `cat-${crypto.randomUUID()}`;
  await env.DB.prepare('INSERT INTO categories (id, slug, name, sort_order) VALUES (?, ?, ?, ?)')
    .bind(id, slug, name, Number(body.sortOrder) || 0).run();
  return json({ id }, 201);
}

