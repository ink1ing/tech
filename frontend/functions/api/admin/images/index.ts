import type { PagesContext } from '../../../_lib/types';
import { fail, json } from '../../../_lib/http';
import { isAdmin } from '../../../_lib/security';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

export async function onRequestGet({ request, env }: PagesContext) {
  if (!await isAdmin(request, env)) return fail('请先登录管理员后台', 401, 'UNAUTHORIZED');
  const [result, setting] = await Promise.all([
    env.DB.prepare(`SELECT i.id, i.file_name, i.content_type, i.size_bytes, i.created_at,
      COUNT(p.id) AS usage_count FROM product_images i LEFT JOIN products p ON p.image_id = i.id
      GROUP BY i.id ORDER BY i.created_at DESC`).all(),
    env.DB.prepare("SELECT value FROM store_settings WHERE key = 'image_library_limit'").first(),
  ]);
  const images = result.results.map((image: any) => ({ ...image, url: `/api/product-images/${image.id}` }));
  return json({ images, limit: Number(setting?.value) || 10 });
}

export async function onRequestPost({ request, env }: PagesContext) {
  if (!await isAdmin(request, env)) return fail('请先登录管理员后台', 401, 'UNAUTHORIZED');
  if (!env.PAYMENT_PROOFS) return fail('图片存储尚未配置', 503, 'IMAGE_STORAGE_UNAVAILABLE');
  const [countRow, setting] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) AS count FROM product_images').first(),
    env.DB.prepare("SELECT value FROM store_settings WHERE key = 'image_library_limit'").first(),
  ]);
  const limit = Number(setting?.value) || 10;
  if (Number(countRow?.count) >= limit) return fail(`图片库已达到 ${limit} 张上限`, 409, 'IMAGE_LIMIT_REACHED');
  const form = await request.formData();
  const file = form.get('image');
  if (!(file instanceof File) || file.size === 0) return fail('请选择图片');
  if (file.size > 5 * 1024 * 1024) return fail('商品图片不能超过 5MB');
  if (!allowedTypes.includes(file.type)) return fail('商品图片仅支持 JPG、PNG 或 WebP');
  const id = `img-${crypto.randomUUID()}`;
  const extension = file.type === 'image/png' ? '.png' : file.type === 'image/webp' ? '.webp' : '.jpg';
  const objectKey = `product-images/${id}${extension}`;
  await env.PAYMENT_PROOFS.put(objectKey, file.stream(), { httpMetadata: { contentType: file.type } });
  await env.DB.prepare(`INSERT INTO product_images (id, object_key, file_name, content_type, size_bytes)
    VALUES (?, ?, ?, ?, ?)`).bind(id, objectKey, file.name.slice(0, 180), file.type, file.size).run();
  return json({ image: { id, file_name: file.name, content_type: file.type, size_bytes: file.size, url: `/api/product-images/${id}`, usage_count: 0 } }, 201);
}
