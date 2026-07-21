import type { Env } from './types';

export type ProductImageRole = 'avatar' | 'description';

export const isProductId = (value: string) => /^prod-[a-z0-9-]{1,90}$/.test(value);

export async function validateProductImages(
  env: Env,
  productId: string,
  avatarId: string,
  descriptionIds: string[],
  allowedLegacyIds = new Set<string>(),
) {
  const requested = Array.from(new Set([avatarId, ...descriptionIds].filter(Boolean)));
  if (!requested.length) return '';
  const placeholders = requested.map(() => '?').join(',');
  const rows = await env.DB.prepare(`SELECT id, owner_product_id, image_role FROM product_images
    WHERE id IN (${placeholders})`).bind(...requested).all();
  const images = new Map(rows.results.map((row: any) => [String(row.id), row]));
  if (images.size !== requested.length) return '部分商品图片不存在，请重新上传';

  const valid = (imageId: string, role: ProductImageRole) => {
    if (!imageId) return true;
    const image: any = images.get(imageId);
    return (image.owner_product_id === productId && image.image_role === role)
      || (image.owner_product_id === productId && image.image_role === 'legacy' && allowedLegacyIds.has(imageId));
  };
  if (!valid(avatarId, 'avatar')) return '商品头像不属于当前商品，请重新上传';
  if (descriptionIds.some(imageId => !valid(imageId, 'description'))) return '部分描述图片不属于当前商品，请重新上传';
  return '';
}

export async function deleteImageIfUnused(env: Env, imageId: string, ownerProductId?: string) {
  const image = await env.DB.prepare(`SELECT i.object_key, i.owner_product_id,
    (SELECT COUNT(*) FROM products p WHERE p.image_id = i.id) +
    (SELECT COUNT(*) FROM product_description_images d WHERE d.image_id = i.id) AS usage_count
    FROM product_images i WHERE i.id = ?`).bind(imageId).first();
  if (!image) return true;
  if (Number(image.usage_count) > 0) return false;
  if (ownerProductId && image.owner_product_id !== ownerProductId) return false;
  if (env.PAYMENT_PROOFS) await env.PAYMENT_PROOFS.delete(image.object_key);
  await env.DB.prepare('DELETE FROM product_images WHERE id = ?').bind(imageId).run();
  return true;
}

export async function cleanupExpiredOrphanImages(env: Env) {
  const result = await env.DB.prepare(`SELECT i.id FROM product_images i
    WHERE datetime(i.created_at) < datetime('now', '-1 day')
      AND NOT EXISTS (SELECT 1 FROM products p WHERE p.image_id = i.id)
      AND NOT EXISTS (SELECT 1 FROM product_description_images d WHERE d.image_id = i.id)
    ORDER BY i.created_at LIMIT 25`).all();
  for (const row of result.results) {
    try {
      await deleteImageIfUnused(env, String((row as any).id));
    } catch (error) {
      console.error('Expired product image cleanup failed', error);
    }
  }
}
