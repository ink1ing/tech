import type { PagesContext } from '../../../_lib/types';
import { cleanText, fail, json } from '../../../_lib/http';
import { sha256 } from '../../../_lib/security';
import { notifyTelegram } from '../../../_lib/telegram';

export async function onRequestPost({ request, env, params }: PagesContext) {
  const form = await request.formData();
  const lookupKey = cleanText(form.get('lookupKey'), 200);
  const paymentReference = cleanText(form.get('paymentReference'), 200);
  if (!lookupKey || !paymentReference) return fail('需要查询密钥和付款流水号');

  const order = await env.DB.prepare('SELECT id, order_number, payment_method, total_cents FROM orders WHERE order_number = ? AND lookup_hash = ?')
    .bind(params.orderId, await sha256(lookupKey)).first();
  if (!order) return fail('订单号或查询密钥不正确', 404, 'ORDER_NOT_FOUND');

  let proofKey = '';
  const proof = form.get('proof');
  if (proof instanceof File && proof.size > 0) {
    if (proof.size > 5 * 1024 * 1024) return fail('付款截图不能超过 5MB');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(proof.type)) return fail('付款截图仅支持 JPG、PNG 或 WebP');
    if (!env.PAYMENT_PROOFS) return fail('付款截图存储尚未配置，请只提交交易流水号', 503, 'PROOF_STORAGE_UNAVAILABLE');
    proofKey = `${order.id}/${Date.now()}-${randomSafeName(proof.name)}`;
    await env.PAYMENT_PROOFS.put(proofKey, proof.stream(), { httpMetadata: { contentType: proof.type } });
  }

  await env.DB.batch([
    env.DB.prepare(`UPDATE orders SET payment_reference = ?, payment_proof_key = ?, payment_status = 'submitted',
      updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(paymentReference, proofKey, order.id),
    env.DB.prepare('INSERT INTO order_events (order_id, event_type, detail) VALUES (?, ?, ?)')
      .bind(order.id, 'payment_submitted', `Reference: ${paymentReference}${proofKey ? '; proof uploaded' : ''}`),
  ]);

  await notifyTelegram(env, [
    'Silas Store 待核验付款',
    `订单：${order.order_number}`,
    `金额：¥${(Number(order.total_cents) / 100).toFixed(2)}`,
    `方式：${order.payment_method}`,
    `流水：${paymentReference}`,
    proofKey ? '已上传付款截图' : '未上传截图',
  ].join('\n'));

  return json({ ok: true, paymentStatus: 'submitted' });
}

function randomSafeName(name: string) {
  const extension = name.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/)?.[0] || '.jpg';
  return `${crypto.randomUUID()}${extension}`;
}

