import type { PagesContext } from '../../../_lib/types';
import { fail, json } from '../../../_lib/http';
import { isAdmin } from '../../../_lib/security';

export async function onRequestDelete({ request, env, params }: PagesContext) {
  if (!await isAdmin(request, env)) return fail('请先登录管理员后台', 401, 'UNAUTHORIZED');
  const image = await env.DB.prepare(`SELECT i.object_key, COUNT(p.id) AS usage_count FROM product_images i
    LEFT JOIN products p ON p.image_id = i.id WHERE i.id = ? GROUP BY i.id`).bind(params.id).first();
  if (!image) return fail('图片不存在', 404, 'IMAGE_NOT_FOUND');
  if (Number(image.usage_count) > 0) return fail('图片正在被商品使用，请先更换商品图片', 409, 'IMAGE_IN_USE');
  if (env.PAYMENT_PROOFS) await env.PAYMENT_PROOFS.delete(image.object_key);
  await env.DB.prepare('DELETE FROM product_images WHERE id = ?').bind(params.id).run();
  return json({ ok: true });
}
