import type { PagesContext } from '../_lib/types';
import { json } from '../_lib/http';

export function onRequestGet({ env }: PagesContext) {
  return json({
    alipayQrUrl: env.ALIPAY_QR_URL || '',
    wechatQrUrl: env.WECHAT_QR_URL || '',
    usdtOptions: getUsdtOptions(env),
  });
}

function getUsdtOptions(env: PagesContext['env']) {
  return [
    { id: 'xlayer', name: 'X Layer', qrUrl: env.USDT_XLAYER_QR_URL || '' },
    { id: 'bsc', name: 'BNB Chain', qrUrl: env.USDT_BSC_QR_URL || '' },
    { id: 'solana', name: 'Solana', qrUrl: env.USDT_SOLANA_QR_URL || '' },
    { id: 'polygon', name: 'Polygon', qrUrl: env.USDT_POLYGON_QR_URL || '' },
  ];
}
