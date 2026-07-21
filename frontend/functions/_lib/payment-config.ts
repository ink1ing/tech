import type { PaymentConfig } from './payment-config-types';

export function getPaymentConfig(): PaymentConfig {
  return {
    alipayQrUrl: '/payments/alipay.jpg',
    alipayQrSha256: 'fd8e19aeb06056a6fa35644edb746a9a22bab6b6c43e07bf8891fc39453e82f6',
    wechatQrUrl: '/payments/wechat.jpg',
    wechatQrSha256: 'd62a55c14b91dbf8bb09579d975756dce49789724c952fb9ae7865a17403c08b',
    usdtOptions: [
      { id: 'xlayer', name: 'X Layer', qrUrl: '/payments/usdt-xlayer.jpg', sha256: '2cfb3cf8c483925a5e2eaa19baf7137bc7e0c19be28af5e44694eacb97016e51' },
      { id: 'bsc', name: 'BNB Chain', qrUrl: '/payments/usdt-bsc.jpg', sha256: '18bab790f756ee83826075ee1e08e55f2c0c7a30ccb82b1e78ea9813ad0ac16a' },
      { id: 'solana', name: 'Solana', qrUrl: '/payments/usdt-solana.jpg', sha256: '8b90187c3480c3eae6103092524a9b164a2fa1d82af01603dc4065aa04129b09' },
      { id: 'polygon', name: 'Polygon', qrUrl: '/payments/usdt-polygon.jpg', sha256: '927d5e7456eb35eca1638831130348bfd3b4bc6e68c515bc4bc0884de53f9a3a' },
    ],
  };
}
