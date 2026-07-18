import type { PagesContext } from '../_lib/types';
import { json } from '../_lib/http';

export function onRequestGet({ env }: PagesContext) {
  return json({
    alipayQrUrl: env.ALIPAY_QR_URL || '',
    wechatQrUrl: env.WECHAT_QR_URL || '',
    usdtAddress: env.USDT_TRC20_ADDRESS || '',
    usdtNetwork: 'TRC20',
  });
}

