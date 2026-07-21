export interface PaymentConfig {
  alipayQrUrl: string;
  alipayQrSha256: string;
  wechatQrUrl: string;
  wechatQrSha256: string;
  usdtOptions: Array<{ id: string; name: string; qrUrl: string; sha256: string }>;
}
