import type { PagesContext } from '../../_lib/types';
import { cleanText, fail, isEmail, json, readJson } from '../../_lib/http';
import { randomToken, sha256 } from '../../_lib/security';
import { notifyTelegram } from '../../_lib/telegram';

interface OrderInput {
  productIds?: string[];
  contactName?: string;
  email?: string;
  messenger?: string;
  shippingAddress?: string;
  shippingPhone?: string;
  shippingPostalCode?: string;
  paymentMethod?: string;
  paymentNetwork?: string;
  note?: string;
}

export async function onRequestPost({ request, env }: PagesContext) {
  let input: OrderInput;
  try { input = await readJson<OrderInput>(request); } catch (error) { return fail((error as Error).message); }

  const contactName = cleanText(input.contactName, 80);
  const email = cleanText(input.email, 160).toLowerCase();
  const messenger = cleanText(input.messenger, 160);
  const productIds = Array.from(new Set((input.productIds || []).filter(id => typeof id === 'string'))).slice(0, 20);
  const paymentMethod = cleanText(input.paymentMethod, 20);
  const paymentNetwork = paymentMethod === 'usdt' ? cleanText(input.paymentNetwork, 20) : '';
  if (!contactName || (!email && !messenger)) return fail('请填写姓名，并至少提供邮箱或 Telegram / 微信');
  if (!isEmail(email)) return fail('邮箱格式不正确');
  if (!productIds.length) return fail('购物袋为空');
  if (!['alipay', 'wechat', 'usdt'].includes(paymentMethod)) return fail('请选择有效的支付方式');
  if (paymentMethod === 'usdt' && !['xlayer', 'bsc', 'solana', 'polygon'].includes(paymentNetwork)) return fail('请选择有效的 USDT 网络');

  const placeholders = productIds.map(() => '?').join(',');
  const productsResult = await env.DB.prepare(
    `SELECT id, name, price_cents, fulfillment FROM products WHERE active = 1 AND id IN (${placeholders})`,
  ).bind(...productIds).all();
  const products = productsResult.results || [];
  if (products.length !== productIds.length) return fail('部分商品已下架，请刷新后重试');

  const fulfillment = products.some((product: any) => product.fulfillment === 'shipping') ? 'shipping' : 'digital';
  const shippingAddress = cleanText(input.shippingAddress, 300);
  const shippingPhone = cleanText(input.shippingPhone, 60);
  const shippingPostalCode = cleanText(input.shippingPostalCode, 30);
  if (fulfillment === 'shipping' && (!shippingAddress || !shippingPhone)) return fail('邮寄商品需要填写地址和联系电话');

  const orderId = crypto.randomUUID();
  const orderCode = crypto.randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase();
  const orderNumber = `SS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${orderCode}`;
  const lookupKey = randomToken(18);
  const lookupHash = await sha256(lookupKey);
  const totalCents = products.reduce((sum: number, product: any) => sum + Number(product.price_cents), 0);

  const statements = [
    env.DB.prepare(`INSERT INTO orders
      (id, order_number, lookup_hash, contact_name, email, messenger, fulfillment, shipping_address,
       shipping_phone, shipping_postal_code, payment_method, payment_network, total_cents, customer_note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(orderId, orderNumber, lookupHash, contactName, email, messenger, fulfillment, shippingAddress,
        shippingPhone, shippingPostalCode, paymentMethod, paymentNetwork, totalCents, cleanText(input.note, 1000)),
    ...products.map((product: any) => env.DB.prepare(
      'INSERT INTO order_items (order_id, product_id, product_name, unit_price_cents, quantity) VALUES (?, ?, ?, ?, 1)',
    ).bind(orderId, product.id, product.name, product.price_cents)),
    env.DB.prepare('INSERT INTO order_events (order_id, event_type, detail) VALUES (?, ?, ?)')
      .bind(orderId, 'order_created', `Payment method: ${paymentMethod}${paymentNetwork ? `; network: ${paymentNetwork}` : ''}`),
  ];
  await env.DB.batch(statements);

  await notifyTelegram(env, [
    'Silas Store 新订单',
    `订单：${orderNumber}`,
    `金额：¥${(totalCents / 100).toFixed(2)}`,
    `支付：${paymentMethod}${paymentNetwork ? ` / ${paymentNetwork}` : ''}`,
    `商品：${products.map((product: any) => product.name).join('、')}`,
  ].join('\n'));

  return json({
    orderNumber,
    lookupKey,
    totalCents,
    paymentMethod,
    paymentNetwork,
    paymentConfig: {
      alipayQrUrl: env.ALIPAY_QR_URL || '',
      wechatQrUrl: env.WECHAT_QR_URL || '',
      usdtOptions: [
        { id: 'xlayer', name: 'X Layer', qrUrl: env.USDT_XLAYER_QR_URL || '' },
        { id: 'bsc', name: 'BNB Chain', qrUrl: env.USDT_BSC_QR_URL || '' },
        { id: 'solana', name: 'Solana', qrUrl: env.USDT_SOLANA_QR_URL || '' },
        { id: 'polygon', name: 'Polygon', qrUrl: env.USDT_POLYGON_QR_URL || '' },
      ],
    },
  }, 201);
}
