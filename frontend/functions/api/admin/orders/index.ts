import type { PagesContext } from '../../../_lib/types';
import { fail, json } from '../../../_lib/http';
import { isAdmin } from '../../../_lib/security';

export async function onRequestGet({ request, env }: PagesContext) {
  if (!await isAdmin(request, env)) return fail('请先登录管理员后台', 401, 'UNAUTHORIZED');
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || '';
  const search = (url.searchParams.get('search') || '').slice(0, 100);
  const conditions: string[] = [];
  const values: string[] = [];
  if (status) { conditions.push('(o.order_status = ? OR o.payment_status = ?)'); values.push(status, status); }
  if (search) { conditions.push('(o.order_number LIKE ? OR o.contact_name LIKE ? OR o.payment_reference LIKE ?)'); values.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await env.DB.prepare(`SELECT o.id, o.order_number, o.contact_name, o.email, o.messenger,
    o.fulfillment, o.shipping_address, o.shipping_phone, o.shipping_postal_code, o.payment_method, o.payment_network,
    o.payment_status, o.order_status, o.payment_reference, o.payment_proof_key, o.currency,
    o.total_cents, o.customer_note, o.admin_note, o.created_at, o.updated_at,
    GROUP_CONCAT(oi.product_name, '、') AS product_names
    FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
    ${where} GROUP BY o.id ORDER BY o.created_at DESC LIMIT 200`).bind(...values).all();
  return json({ orders: result.results });
}
