import type { PagesContext } from '../../../../../_lib/types';
import { cleanText, fail, json, verifiedContentLength } from '../../../../../_lib/http';
import { readVerifiedImage } from '../../../../../_lib/image-file';
import { cleanupExpiredOrphanImages, deleteImageIfUnused, isProductId, type ProductImageRole } from '../../../../../_lib/product-images';
import { isAdmin } from '../../../../../_lib/security';

export async function onRequestPost({ request, env, params }: PagesContext) {
  if (!await isAdmin(request, env)) return fail('请先登录管理员后台', 401, 'UNAUTHORIZED');
  if (!env.PAYMENT_PROOFS) return fail('图片存储尚未配置', 503, 'IMAGE_STORAGE_UNAVAILABLE');
  const productId = cleanText(params.id, 100);
  if (!isProductId(productId)) return fail('商品标识无效');
  const contentLength = verifiedContentLength(request, 6 * 1024 * 1024);
  if (contentLength.missing) return fail('无法验证上传大小，请重新选择图片', 411, 'CONTENT_LENGTH_REQUIRED');
  if (!contentLength.valid) return fail('图片不能超过 5MB', 413, 'IMAGE_TOO_LARGE');

  const form = await request.formData();
  const role = cleanText(form.get('role'), 20) as ProductImageRole;
  if (!['avatar', 'description'].includes(role)) return fail('图片用途无效');
  const file = form.get('image');
  if (!(file instanceof File)) return fail('请选择图片');
  let verified;
  try { verified = await readVerifiedImage(file); } catch (error) { return fail((error as Error).message); }

  const id = `img-${crypto.randomUUID()}`;
  const objectKey = `product-images/${productId}/${id}${verified.extension}`;
  try { await cleanupExpiredOrphanImages(env); } catch (error) { console.error('Product image cleanup unavailable', error); }
  await env.PAYMENT_PROOFS.put(objectKey, verified.bytes, { httpMetadata: { contentType: verified.contentType } });
  try {
    await env.DB.prepare(`INSERT INTO product_images
      (id, object_key, file_name, content_type, size_bytes, owner_product_id, image_role)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, objectKey, file.name.slice(0, 180), verified.contentType, file.size, productId, role).run();
  } catch (error) {
    await env.PAYMENT_PROOFS.delete(objectKey);
    throw error;
  }

  if (role === 'avatar') {
    try {
      const stale = await env.DB.prepare(`SELECT i.id FROM product_images i
        WHERE i.owner_product_id = ? AND i.image_role = 'avatar' AND i.id != ?
          AND NOT EXISTS (SELECT 1 FROM products p WHERE p.image_id = i.id)`).bind(productId, id).all();
      for (const row of stale.results) await deleteImageIfUnused(env, String((row as any).id), productId);
    } catch (error) {
      console.error('Stale avatar cleanup failed', error);
    }
  }
  return json({ image: {
    id, file_name: file.name, content_type: verified.contentType, size_bytes: file.size,
    created_at: new Date().toISOString(), url: `/api/product-images/${id}`,
  } }, 201);
}
