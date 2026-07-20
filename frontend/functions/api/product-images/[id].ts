import type { PagesContext } from '../../_lib/types';
import { fail } from '../../_lib/http';

export async function onRequestGet({ env, params }: PagesContext) {
  if (!env.PAYMENT_PROOFS) return fail('图片存储尚未配置', 503, 'IMAGE_STORAGE_UNAVAILABLE');
  const image = await env.DB.prepare('SELECT object_key FROM product_images WHERE id = ?').bind(params.id).first();
  if (!image) return fail('图片不存在', 404, 'IMAGE_NOT_FOUND');
  const object = await env.PAYMENT_PROOFS.get(image.object_key);
  if (!object) return fail('图片文件不存在', 404, 'IMAGE_NOT_FOUND');
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('cache-control', 'public, max-age=86400');
  headers.set('x-content-type-options', 'nosniff');
  return new Response(object.body, { headers });
}
