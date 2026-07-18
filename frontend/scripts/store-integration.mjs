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

const order = await request('/api/orders', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    productIds: ['prod-remote-kit'],
    contactName: 'Store integration test',
    email: 'integration@example.com',
    shippingAddress: 'Local test address',
    shippingPhone: '000-0000-0000',
    paymentMethod: 'usdt',
    paymentNetwork: 'bsc',
    note: 'Automated local test; safe to delete',
  }),
});
assert(/^SS-\d{8}-[A-F0-9]{10}$/.test(order.orderNumber), 'safe order number');
assert(order.totalCents === 32900, 'server-calculated total');
assert(order.lookupKey.length >= 20, 'lookup key');
assert(order.paymentNetwork === 'bsc', 'selected payment network');

const payment = new FormData();
payment.set('lookupKey', order.lookupKey);
payment.set('paymentReference', `integration-${Date.now()}`);
await request(`/api/orders/${order.orderNumber}/payment`, { method: 'POST', body: payment });

const lookup = await request(`/api/orders/${order.orderNumber}?key=${encodeURIComponent(order.lookupKey)}`);
assert(lookup.order.payment_status === 'submitted', 'payment submission');
assert(lookup.order.payment_network === 'bsc', 'lookup payment network');
assert(!('id' in lookup.order), 'internal id is private');

const login = await request('/api/admin/login', {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: adminPassword }),
});
const adminHeaders = { 'content-type': 'application/json', authorization: `Bearer ${login.token}` };
const adminOrders = await request('/api/admin/orders', { headers: adminHeaders });
const created = adminOrders.orders.find(item => item.order_number === order.orderNumber);
assert(created, 'admin order listing');
assert(created.payment_network === 'bsc', 'admin payment network');
assert(!('lookup_hash' in created), 'lookup hash is private');

await request(`/api/admin/orders/${order.orderNumber}`, {
  method: 'PATCH', headers: adminHeaders,
  body: JSON.stringify({ orderStatus: 'processing', paymentStatus: 'verified', adminNote: 'Integration test passed' }),
});
const verified = await request(`/api/orders/${order.orderNumber}?key=${encodeURIComponent(order.lookupKey)}`);
assert(verified.order.payment_status === 'verified', 'admin payment verification');
assert(verified.order.order_status === 'processing', 'admin order update');

console.log(`Store integration passed: ${order.orderNumber}`);

function assert(value, label) {
  if (!value) throw new Error(`Assertion failed: ${label}`);
}
