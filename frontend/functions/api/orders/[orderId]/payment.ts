import type { PagesContext } from '../../../_lib/types';
import { cleanText, fail, json, verifiedContentLength } from '../../../_lib/http';
import { sha256 } from '../../../_lib/security';
import { notifyTelegram, telegramValue } from '../../../_lib/telegram';
import { consumeRateLimit } from '../../../_lib/rate-limit';
import { readVerifiedImage } from '../../../_lib/image-file';

export async function onRequestPost({ request, env, params }: PagesContext) {
  const rate = await consumeRateLimit(request, env, 'payment-submit', 15, 10 * 60, 30 * 60);
  if (!rate.allowed) return fail('付款资料提交过于频繁，请稍后再试', 429, 'RATE_LIMITED', { 'retry-after': String(rate.retryAfter) });
  const contentLength = verifiedContentLength(request, 6 * 1024 * 1024);
  if (contentLength.missing) return fail('无法验证上传大小，请重新提交', 411, 'CONTENT_LENGTH_REQUIRED');
  if (!contentLength.valid) return fail('付款截图不能超过 5MB', 413, 'PROOF_TOO_LARGE');
  const form = await request.formData();
  const lookupKey = cleanText(form.get('lookupKey'), 200);
  const paymentReference = cleanText(form.get('paymentReference'), 200);
  if (!lookupKey || !paymentReference) return fail('需要查询密钥和付款流水号');

  const order = await env.DB.prepare(`SELECT id, order_number, contact_name, fulfillment, shipping_address,
    shipping_phone, shipping_postal_code, payment_method, payment_network, payment_status, payment_proof_key, total_cents
    FROM orders WHERE order_number = ? AND lookup_hash = ?`)
    .bind(params.orderId, await sha256(lookupKey)).first();
  if (!order) return fail('订单号或查询密钥不正确', 404, 'ORDER_NOT_FOUND');
  if (!['awaiting_payment', 'rejected'].includes(String(order.payment_status))) {
    return fail('该订单的付款资料已经提交，不能重复覆盖', 409, 'PAYMENT_ALREADY_SUBMITTED');
  }

  const previousProofKey = String(order.payment_proof_key || '');
  let proofKey = previousProofKey;
  let uploadedProofKey = '';
  const proof = form.get('proof');
  if (proof instanceof File && proof.size > 0) {
    if (!env.PAYMENT_PROOFS) return fail('付款截图存储尚未配置，请只提交交易流水号', 503, 'PROOF_STORAGE_UNAVAILABLE');
    let verified;
    try { verified = await readVerifiedImage(proof); } catch (error) { return fail((error as Error).message); }
    proofKey = `${order.id}/${Date.now()}-${crypto.randomUUID()}${verified.extension}`;
    uploadedProofKey = proofKey;
    await env.PAYMENT_PROOFS.put(proofKey, verified.bytes, { httpMetadata: { contentType: verified.contentType } });
  }

  const update = await env.DB.prepare(`UPDATE orders SET payment_reference = ?, payment_proof_key = ?, payment_status = 'submitted',
    updated_at = CURRENT_TIMESTAMP WHERE id = ? AND payment_status IN ('awaiting_payment', 'rejected')`)
    .bind(paymentReference, proofKey, order.id).run();
  const changes = Number(update?.meta?.changes ?? update?.changes ?? 0);
  if (changes !== 1) {
    if (uploadedProofKey && env.PAYMENT_PROOFS) await env.PAYMENT_PROOFS.delete(uploadedProofKey);
    return fail('订单状态已经变化，请刷新订单后再试', 409, 'PAYMENT_STATE_CHANGED');
  }
  try {
    await env.DB.prepare('INSERT INTO order_events (order_id, event_type, detail) VALUES (?, ?, ?)')
      .bind(order.id, 'payment_submitted', uploadedProofKey ? 'Proof uploaded' : 'Reference submitted').run();
  } catch (error) {
    console.error('Payment event insert failed', error);
  }
  if (uploadedProofKey && previousProofKey && previousProofKey !== uploadedProofKey && env.PAYMENT_PROOFS) {
    try { await env.PAYMENT_PROOFS.delete(previousProofKey); } catch (error) { console.error('Old payment proof cleanup failed', error); }
  }

  const shippingLines = order.fulfillment === 'shipping' ? [
    '',
    '需要发货',
    `收件人：${telegramValue(order.contact_name)}`,
    `电话：${telegramValue(order.shipping_phone)}`,
    `地址：${telegramValue(order.shipping_address)}`,
    `邮编：${telegramValue(order.shipping_postal_code || '未填写')}`,
  ] : [];
  await notifyTelegram(env, [
    'Silas Store 待核验付款',
    `订单：${order.order_number}`,
    `金额：¥${(Number(order.total_cents) / 100).toFixed(2)}`,
    `方式：${order.payment_method}${order.payment_network ? ` / ${order.payment_network}` : ''}`,
    `流水：${telegramValue(paymentReference)}`,
    proofKey ? '已上传付款截图' : '未上传截图',
    ...shippingLines,
  ].join('\n'));

  return json({ ok: true, paymentStatus: 'submitted' });
}
