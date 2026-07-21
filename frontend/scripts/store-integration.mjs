import http from 'node:http';
import https from 'node:https';

const baseUrl = process.env.STORE_TEST_URL || 'http://127.0.0.1:8788';
const adminPassword = process.env.STORE_TEST_ADMIN_PASSWORD || 'local-admin-test';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${path}: ${response.status} ${JSON.stringify(body)}`);
  return body;
}

const catalog = await request('/api/catalog');
assert(catalog.categories.length >= 4, 'catalog categories');
assert(catalog.products.length >= 8, 'catalog products');
assert(catalog.categories.every(category => [1, 2].includes(category.grid_columns)), 'category grid layout');
const paymentConfig = await request('/api/payment-config');
assert(paymentConfig.usdtOptions.length === 4, 'USDT network configuration');
assert(paymentConfig.usdtOptions.every(option => /^[a-f0-9]{64}$/.test(option.sha256)), 'pinned USDT hashes');

const adminPage = await fetch(`${baseUrl}/admin`);
const adminCsp = adminPage.headers.get('content-security-policy') || '';
assert(adminPage.ok && adminCsp.includes("script-src 'self'") && !adminCsp.includes('googlesyndication'), 'isolated admin CSP');
assert(adminPage.headers.get('x-frame-options') === 'DENY', 'clickjacking protection');

const crossOrigin = await fetch(`${baseUrl}/api/orders`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', origin: 'https://attacker.example' },
  body: '{}',
});
assert(crossOrigin.status === 403, 'cross-origin mutation blocked');

const order = await request('/api/orders', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    productIds: ['prod-remote-kit'],
    contactName: 'Store integration test',
    email: 'integration@example.com',
    shippingAddress: 'Local test address',
    shippingPhone: '000-0000-0000',
    shippingPostalCode: '100000',
    paymentMethod: 'usdt',
    paymentNetwork: 'bsc',
    note: 'Automated local test; safe to delete',
  }),
});
assert(/^SS-\d{8}-[A-F0-9]{10}$/.test(order.orderNumber), 'safe order number');
assert(order.totalCents === 32900, 'server-calculated total');
assert(order.lookupKey.length >= 20, 'lookup key');
assert(order.fulfillment === 'shipping', 'shipping fulfillment');
assert(order.paymentNetwork === 'bsc', 'selected payment network');

const payment = new FormData();
const paymentReference = `integration-${Date.now()}`;
payment.set('lookupKey', order.lookupKey);
payment.set('paymentReference', paymentReference);
await request(`/api/orders/${order.orderNumber}/payment`, { method: 'POST', body: payment });
const replay = await fetch(`${baseUrl}/api/orders/${order.orderNumber}/payment`, { method: 'POST', body: payment });
assert(replay.status === 409, 'payment replay blocked');

const lookup = await request(`/api/orders/${order.orderNumber}`, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lookupKey: order.lookupKey }),
});
assert(lookup.order.payment_status === 'submitted', 'payment submission');
assert(lookup.order.payment_network === 'bsc', 'lookup payment network');
assert(!('id' in lookup.order), 'internal id is private');
assert(!JSON.stringify(lookup.order.events).includes(paymentReference), 'payment reference is absent from public events');

const loginResponse = await fetch(`${baseUrl}/api/admin/login`, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: adminPassword }),
});
const login = await loginResponse.json().catch(() => ({}));
assert(loginResponse.ok && login.ok === true, 'admin login');
const setCookie = loginResponse.headers.get('set-cookie') || '';
assert(setCookie.includes('HttpOnly') && setCookie.includes('SameSite=Strict'), 'hardened admin cookie');
const cookie = setCookie.split(';')[0] || '';
assert(loginResponse.ok && cookie.includes('silas_store_admin='), 'admin session cookie');
const adminHeaders = { 'content-type': 'application/json', cookie };
assert(await chunkedMultipartStatus(`/api/orders/${order.orderNumber}/payment`) === 411, 'payment upload requires a verifiable body length');
const adminOrders = await request('/api/admin/orders', { headers: adminHeaders });
const created = adminOrders.orders.find(item => item.order_number === order.orderNumber);
assert(created, 'admin order listing');
assert(created.payment_network === 'bsc', 'admin payment network');
assert(created.fulfillment === 'shipping', 'admin shipping fulfillment');
assert(created.shipping_address === 'Local test address', 'shipping address persisted');
assert(created.shipping_phone === '000-0000-0000', 'shipping phone persisted');
assert(created.shipping_postal_code === '100000', 'shipping postal code persisted');
assert(!('lookup_hash' in created), 'lookup hash is private');

const imageSource = await fetch(`${baseUrl}/payments/wechat.jpg`);
const imageBytes = await imageSource.arrayBuffer();
const productId = `prod-${crypto.randomUUID()}`;
assert(await chunkedMultipartStatus(`/api/admin/products/${productId}/images`, cookie) === 411, 'product upload requires a verifiable body length');
const uploadImage = async (role, name = 'test.jpg', type = 'image/jpeg', bytes = imageBytes) => {
  const form = new FormData();
  form.set('role', role);
  form.set('image', new File([bytes], name, { type }));
  return request(`/api/admin/products/${productId}/images`, { method: 'POST', headers: { cookie }, body: form });
};

const forged = new FormData();
forged.set('role', 'avatar');
forged.set('image', new File(['not an image'], 'forged.png', { type: 'image/png' }));
const forgedResponse = await fetch(`${baseUrl}/api/admin/products/${productId}/images`, {
  method: 'POST', headers: { cookie }, body: forged,
});
assert(forgedResponse.status === 400, 'forged image rejected');

const avatar = (await uploadImage('avatar')).image;
const descriptionImages = [];
for (let index = 0; index < 21; index += 1) {
  descriptionImages.push((await uploadImage('description', `description-${index}.jpg`)).image);
}
const productPayload = (imageId, descriptionImageIds) => ({
  id: productId,
  categoryId: catalog.categories[0].id,
  slug: `integration-product-${productId.slice(-8)}`,
  name: 'Image integration product',
  subtitle: 'Local test only',
  description: 'Verifies product-scoped image ownership and unlimited descriptions.',
  priceCents: 100,
  originalPriceCents: 200,
  imageId,
  descriptionImageIds,
  fulfillment: 'digital',
  deliveryNote: 'Local test',
  icon: 'Package',
  sortOrder: 999,
  active: true,
});
await request('/api/admin/products', {
  method: 'POST', headers: adminHeaders,
  body: JSON.stringify(productPayload(avatar.id, descriptionImages.map(image => image.id))),
});
const adminProducts = await request('/api/admin/products', { headers: adminHeaders });
const imageProduct = adminProducts.products.find(product => product.id === productId);
assert(imageProduct?.description_images.length === 21, 'description images have no fixed count limit');

const foreignProductId = `prod-${crypto.randomUUID()}`;
const foreignResponse = await fetch(`${baseUrl}/api/admin/products`, {
  method: 'POST', headers: adminHeaders,
  body: JSON.stringify({ ...productPayload(avatar.id, []), id: foreignProductId, slug: `foreign-${foreignProductId.slice(-8)}` }),
});
assert(foreignResponse.status === 400, 'cross-product image reuse blocked');

const replacementAvatar = (await uploadImage('avatar', 'replacement.jpg')).image;
await request(`/api/admin/products/${productId}`, {
  method: 'PATCH', headers: adminHeaders,
  body: JSON.stringify(productPayload(replacementAvatar.id, [])),
});
assert((await fetch(`${baseUrl}${avatar.url}`)).status === 404, 'replaced avatar deleted');
assert((await fetch(`${baseUrl}${descriptionImages[0].url}`)).status === 404, 'removed description image deleted');

const cancelledImage = (await uploadImage('description', 'cancelled.jpg')).image;
await request(`/api/admin/products/${productId}/images/${cancelledImage.id}`, { method: 'DELETE', headers: { cookie } });
await request(`/api/admin/products/${productId}/images/${cancelledImage.id}`, { method: 'DELETE', headers: { cookie } });
assert((await fetch(`${baseUrl}${cancelledImage.url}`)).status === 404, 'cancelled upload deleted');

await request(`/api/admin/products/${productId}`, {
  method: 'PATCH', headers: adminHeaders,
  body: JSON.stringify(productPayload('', [])),
});
await request(`/api/admin/products/${productId}`, { method: 'DELETE', headers: { cookie } });

await request(`/api/admin/orders/${order.orderNumber}`, {
  method: 'PATCH', headers: adminHeaders,
  body: JSON.stringify({ orderStatus: 'processing', paymentStatus: 'verified', adminNote: 'Integration test passed' }),
});
const verified = await request(`/api/orders/${order.orderNumber}`, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lookupKey: order.lookupKey }),
});
assert(verified.order.payment_status === 'verified', 'admin payment verification');
assert(verified.order.order_status === 'processing', 'admin order update');
const publicEventText = JSON.stringify(verified.order.events);
assert(!publicEventText.includes('Integration test passed'), 'admin note is absent from public events');
assert(!publicEventText.includes(paymentReference), 'payment reference remains absent after verification');
assert(verified.order.events.every(event => [
  '订单已创建', '付款资料已提交，等待核验', '订单状态已更新',
].includes(event.detail)), 'public event details are allowlisted');

await request('/api/admin/logout', { method: 'POST', headers: { cookie } });
const revokedSession = await fetch(`${baseUrl}/api/admin/orders`, { headers: { cookie } });
assert(revokedSession.status === 401, 'logged-out admin session is revoked server-side');

console.log(`Store integration passed: ${order.orderNumber}`);

function assert(value, label) {
  if (!value) throw new Error(`Assertion failed: ${label}`);
}

function chunkedMultipartStatus(path, cookie = '') {
  const target = new URL(path, baseUrl);
  const transport = target.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const req = transport.request(target, {
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data; boundary=integration-boundary',
        ...(cookie ? { cookie } : {}),
      },
    }, (response) => {
      response.resume();
      response.on('end', () => resolve(response.statusCode));
    });
    req.on('error', reject);
    req.write('--integration-boundary\r\nContent-Disposition: form-data; name="test"\r\n\r\ntest\r\n');
    req.end('--integration-boundary--\r\n');
  });
}
