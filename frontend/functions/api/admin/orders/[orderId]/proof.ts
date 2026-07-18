import type { PagesContext } from '../../../../_lib/types';
import { fail } from '../../../../_lib/http';
import { isAdmin } from '../../../../_lib/security';

export async function onRequestGet({ request, env, params }: PagesContext) {
  if (!await isAdmin(request, env)) return fail('请先登录管理员后台', 401, 'UNAUTHORIZED');
  if (!env.PAYMENT_PROOFS) return fail('付款截图存储尚未配置', 503, 'PROOF_STORAGE_UNAVAILABLE');
  const order = await env.DB.prepare('SELECT payment_proof_key FROM orders WHERE order_number = ?').bind(params.orderId).first();
  if (!order?.payment_proof_key) return fail('该订单没有付款截图', 404, 'PROOF_NOT_FOUND');
  const object = await env.PAYMENT_PROOFS.get(order.payment_proof_key);
  if (!object) return fail('付款截图不存在', 404, 'PROOF_NOT_FOUND');
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('cache-control', 'private, no-store');
  headers.set('content-disposition', 'inline');
  return new Response(object.body, { headers });
}

