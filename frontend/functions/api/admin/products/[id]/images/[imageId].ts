import type { PagesContext } from '../../../../../_lib/types';
import { cleanText, fail, json } from '../../../../../_lib/http';
import { deleteImageIfUnused, isProductId } from '../../../../../_lib/product-images';
import { isAdmin } from '../../../../../_lib/security';

export async function onRequestDelete({ request, env, params }: PagesContext) {
  if (!await isAdmin(request, env)) return fail('请先登录管理员后台', 401, 'UNAUTHORIZED');
  const productId = cleanText(params.id, 100);
  const imageId = cleanText(params.imageId, 100);
  if (!isProductId(productId) || !imageId.startsWith('img-')) return fail('图片标识无效');
  const deleted = await deleteImageIfUnused(env, imageId, productId);
  if (!deleted) return fail('图片已绑定商品或不存在，不能直接删除', 409, 'IMAGE_IN_USE');
  return json({ ok: true });
}
