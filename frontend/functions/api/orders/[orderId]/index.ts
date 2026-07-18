import type { PagesContext } from '../../../_lib/types';
import { fail, json } from '../../../_lib/http';
import { sha256 } from '../../../_lib/security';

export async function onRequestGet({ request, env, params }: PagesContext) {
  const lookupKey = new URL(request.url).searchParams.get('key') || '';
  if (!lookupKey) return fail('请输入订单查询密钥', 401, 'LOOKUP_KEY_REQUIRED');
  const order = await env.DB.prepare(`SELECT id, order_number, fulfillment, payment_method, payment_status,
    order_status, currency, total_cents, created_at, updated_at FROM orders WHERE order_number = ? AND lookup_hash = ?`)
    .bind(params.orderId, await sha256(lookupKey)).first();
  if (!order) return fail('订单号或查询密钥不正确', 404, 'ORDER_NOT_FOUND');

  const [items, events] = await Promise.all([
    env.DB.prepare('SELECT product_name, unit_price_cents, quantity FROM order_items WHERE order_id = ? ORDER BY id').bind(order.id).all(),
    env.DB.prepare('SELECT event_type, detail, created_at FROM order_events WHERE order_id = ? ORDER BY id DESC LIMIT 20').bind(order.id).all(),
  ]);
  const publicOrder = { ...order };
  delete publicOrder.id;
  return json({ order: { ...publicOrder, items: items.results, events: events.results } });
}
