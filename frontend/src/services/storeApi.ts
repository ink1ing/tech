import type { Category, LookupOrder, OrderReceipt, OrderSummary, Product } from '../types/store';

interface ApiErrorPayload { error?: { message?: string } }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, options);
  const payload = await response.json().catch(() => ({})) as T & ApiErrorPayload;
  if (!response.ok) throw new Error(payload.error?.message || '请求失败，请稍后重试');
  return payload;
}

const authHeaders = () => ({
  'content-type': 'application/json',
  authorization: `Bearer ${sessionStorage.getItem('silas-store-admin-token') || ''}`,
});

export const storeApi = {
  getCatalog: () => request<{ categories: Category[]; products: Product[] }>('/api/catalog'),
  createOrder: (body: Record<string, unknown>) => request<OrderReceipt>('/api/orders', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  }),
  submitPayment: (orderNumber: string, form: FormData) => request<{ ok: true; paymentStatus: string }>(
    `/api/orders/${encodeURIComponent(orderNumber)}/payment`, { method: 'POST', body: form },
  ),
  lookupOrder: (orderNumber: string, lookupKey: string) => request<{ order: LookupOrder }>(
    `/api/orders/${encodeURIComponent(orderNumber)}?key=${encodeURIComponent(lookupKey)}`,
  ),
  adminLogin: (password: string) => request<{ token: string }>('/api/admin/login', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password }),
  }),
  getAdminData: async () => {
    const headers = authHeaders();
    const [orders, products, categories] = await Promise.all([
      request<{ orders: OrderSummary[] }>('/api/admin/orders', { headers }),
      request<{ products: Product[] }>('/api/admin/products', { headers }),
      request<{ categories: Category[] }>('/api/admin/categories', { headers }),
    ]);
    return { orders: orders.orders, products: products.products, categories: categories.categories };
  },
  updateOrder: (orderNumber: string, body: Record<string, unknown>) => request<{ ok: true }>(
    `/api/admin/orders/${encodeURIComponent(orderNumber)}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(body) },
  ),
  saveProduct: (product: Product, isNew: boolean) => request<{ id?: string; ok?: true }>(
    isNew ? '/api/admin/products' : `/api/admin/products/${encodeURIComponent(product.id)}`,
    { method: isNew ? 'POST' : 'PATCH', headers: authHeaders(), body: JSON.stringify({
      categoryId: product.category_id,
      slug: product.slug,
      name: product.name,
      subtitle: product.subtitle,
      description: product.description,
      priceCents: product.price_cents,
      originalPriceCents: product.original_price_cents,
      fulfillment: product.fulfillment,
      deliveryNote: product.delivery_note,
      icon: product.icon,
      sortOrder: product.sort_order,
      active: product.active !== 0,
    }) },
  ),
  createCategory: (body: Record<string, unknown>) => request<{ id: string }>('/api/admin/categories', {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(body),
  }),
  updateCategory: (category: Category) => request<{ ok: true }>(`/api/admin/categories/${encodeURIComponent(category.id)}`, {
    method: 'PATCH', headers: authHeaders(), body: JSON.stringify({
      name: category.name, active: category.active !== 0, sortOrder: category.sort_order, gridColumns: category.grid_columns === 1 ? 1 : 2,
    }),
  }),
  fetchProof: async (orderNumber: string) => {
    const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}/proof`, {
      headers: { authorization: authHeaders().authorization },
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({})) as ApiErrorPayload;
      throw new Error(payload.error?.message || '无法读取付款截图');
    }
    return response.blob();
  },
};
