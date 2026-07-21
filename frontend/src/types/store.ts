export interface Category {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  grid_columns?: 1 | 2;
  active?: number;
}

export interface Product {
  id: string;
  category_id?: string;
  category_slug?: string;
  category_name?: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  price_cents: number;
  original_price_cents: number;
  image_id: string;
  image_url?: string;
  description_images?: ProductImage[];
  fulfillment: 'digital' | 'shipping';
  delivery_note: string;
  icon: string;
  sort_order: number;
  active?: number;
}

export interface ProductImage {
  id: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
  url: string;
}

export interface PaymentConfig {
  alipayQrUrl: string;
  alipayQrSha256: string;
  wechatQrUrl: string;
  wechatQrSha256: string;
  usdtOptions: Array<{ id: string; name: string; qrUrl: string; sha256: string }>;
}

export interface OrderReceipt {
  orderNumber: string;
  lookupKey: string;
  totalCents: number;
  fulfillment: 'digital' | 'shipping';
  paymentMethod: 'alipay' | 'wechat' | 'usdt';
  paymentNetwork: string;
  paymentConfig: PaymentConfig;
}

export interface OrderSummary {
  id: string;
  order_number: string;
  contact_name: string;
  email: string;
  messenger: string;
  fulfillment: 'digital' | 'shipping';
  shipping_address: string;
  shipping_phone: string;
  payment_method: string;
  payment_network: string;
  payment_status: string;
  payment_reference: string;
  payment_proof_key: string;
  order_status: string;
  total_cents: number;
  product_names: string;
  customer_note: string;
  admin_note: string;
  created_at: string;
}

export interface LookupOrder {
  order_number: string;
  fulfillment: 'digital' | 'shipping';
  payment_method: string;
  payment_network: string;
  payment_status: string;
  order_status: string;
  currency: string;
  total_cents: number;
  created_at: string;
  updated_at: string;
  items: Array<{ product_name: string; unit_price_cents: number; quantity: number }>;
  events: Array<{ event_type: string; detail: string; created_at: string }>;
}
