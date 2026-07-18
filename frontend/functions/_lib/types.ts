export interface Env {
  DB: any;
  PAYMENT_PROOFS?: any;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  ALIPAY_QR_URL?: string;
  WECHAT_QR_URL?: string;
  USDT_TRC20_ADDRESS?: string;
  STORE_ORIGIN?: string;
}

export interface PagesContext {
  request: Request;
  env: Env;
  params: Record<string, string>;
  next: () => Promise<Response>;
}

