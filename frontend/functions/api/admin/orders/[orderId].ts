import type { PagesContext } from '../../../_lib/types';
import { cleanText, fail, json, readJson } from '../../../_lib/http';
import { isAdmin } from '../../../_lib/security';
import { notifyTelegram } from '../../../_lib/telegram';

const orderStatuses = ['pending', 'processing', 'fulfilled', 'shipped', 'completed', 'cancelled'];
const paymentStatuses = ['awaiting_payment', 'submitted', 'verified', 'rejected', 'refunded'];

export async function onRequestPatch({ request, env, params }: PagesContext) {
  if (!await isAdmin(request, env)) return fail('请先登录管理员后台', 401, 'UNAUTHORIZED');
  const body = await readJson<{ orderStatus?: string; paymentStatus?: string; adminNote?: string }>(request);
  const orderStatus = cleanText(body.orderStatus, 30);
  const paymentStatus = cleanText(body.paymentStatus, 30);
  const adminNote = cleanText(body.adminNote, 2000);
  if (!orderStatuses.includes(orderStatus) || !paymentStatuses.includes(paymentStatus)) return fail('订单状态不合法');

  const order = await env.DB.prepare('SELECT id, order_number, messenger, email FROM orders WHERE order_number = ?').bind(params.orderId).first();
  if (!order) return fail('订单不存在', 404, 'ORDER_NOT_FOUND');
  await env.DB.batch([
    env.DB.prepare(`UPDATE orders SET order_status = ?, payment_status = ?, admin_note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(orderStatus, paymentStatus, adminNote, order.id),
    env.DB.prepare('INSERT INTO order_events (order_id, event_type, detail) VALUES (?, ?, ?)')
      .bind(order.id, 'admin_status_updated', `Order: ${orderStatus}; Payment: ${paymentStatus}`),
  ]);
  await notifyTelegram(env, `Silas Store 状态已更新\n订单：${order.order_number}\n订单状态：${orderStatus}\n付款状态：${paymentStatus}`);
  return json({ ok: true });
}
