import type { PagesContext } from '../../../_lib/types';
import { cleanText, fail, json, readJson } from '../../../_lib/http';
import { sha256 } from '../../../_lib/security';
import { consumeRateLimit } from '../../../_lib/rate-limit';

export async function onRequestPost({ request, env, params }: PagesContext) {
  const rate = await consumeRateLimit(request, env, 'order-lookup', 30, 10 * 60, 30 * 60);
  if (!rate.allowed) return fail('查询过于频繁，请稍后再试', 429, 'RATE_LIMITED', { 'retry-after': String(rate.retryAfter) });
  let body: { lookupKey?: string };
  try { body = await readJson<{ lookupKey?: string }>(request); } catch (error) { return fail((error as Error).message); }
  const lookupKey = cleanText(body.lookupKey, 200);
  if (!lookupKey) return fail('请输入订单查询密钥', 401, 'LOOKUP_KEY_REQUIRED');
  const order = await env.DB.prepare(`SELECT id, order_number, fulfillment, payment_method, payment_network, payment_status,
    order_status, currency, total_cents, created_at, updated_at FROM orders WHERE order_number = ? AND lookup_hash = ?`)
    .bind(params.orderId, await sha256(lookupKey)).first();
  if (!order) return fail('订单号或查询密钥不正确', 404, 'ORDER_NOT_FOUND');

  const [items, events] = await Promise.all([
    env.DB.prepare('SELECT product_name, unit_price_cents, quantity FROM order_items WHERE order_id = ? ORDER BY id').bind(order.id).all(),
    env.DB.prepare(`SELECT event_type, created_at FROM order_events
      WHERE order_id = ? AND event_type IN ('order_created', 'payment_submitted', 'admin_status_updated')
      ORDER BY id DESC LIMIT 20`).bind(order.id).all(),
  ]);
  const publicOrder = { ...order };
  delete publicOrder.id;
  const publicEventDetails: Record<string, string> = {
    order_created: '订单已创建',
    payment_submitted: '付款资料已提交，等待核验',
    admin_status_updated: '订单状态已更新',
  };
  const publicEvents = events.results.map((event: any) => ({
    event_type: event.event_type,
    detail: publicEventDetails[String(event.event_type)] || '订单已更新',
    created_at: event.created_at,
  }));
  return json({ order: { ...publicOrder, items: items.results, events: publicEvents } });
}
