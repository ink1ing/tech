import type { PagesContext } from './_lib/types';
import { fail } from './_lib/http';

export async function onRequest(context: PagesContext) {
  try {
    const url = new URL(context.request.url);
    const method = context.request.method.toUpperCase();
    const origin = context.request.headers.get('origin');
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && origin && origin !== url.origin) {
      return fail('拒绝跨站请求', 403, 'CROSS_ORIGIN_REQUEST');
    }
    const response = await context.next();
    const headers = new Headers(response.headers);
    const isStoreSurface = url.hostname.startsWith('store.')
      || url.pathname.startsWith('/mystore')
      || url.pathname.startsWith('/admin')
      || url.pathname.startsWith('/api/')
      || url.pathname.startsWith('/payments/');
    headers.delete('access-control-allow-origin');
    headers.set('x-content-type-options', 'nosniff');
    headers.set('x-frame-options', 'DENY');
    headers.set('x-xss-protection', '0');
    headers.set('referrer-policy', 'no-referrer');
    headers.set('permissions-policy', 'accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()');
    headers.set('cross-origin-opener-policy', 'same-origin');
    headers.set('cross-origin-resource-policy', isStoreSurface ? 'same-origin' : 'same-site');
    if (isStoreSurface) headers.set('cross-origin-embedder-policy', 'require-corp');
    const basePolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
    ];
    const storePolicy = [
      "script-src 'self'",
      "style-src 'self'",
      "font-src 'self' data:",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "frame-src 'none'",
    ];
    const personalSitePolicy = [
      "script-src 'self' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.googlesyndication.com https://*.doubleclick.net",
      "frame-src https://*.googlesyndication.com https://*.doubleclick.net",
    ];
    headers.set('content-security-policy', [...basePolicy, ...(isStoreSurface ? storePolicy : personalSitePolicy), 'upgrade-insecure-requests'].join('; '));
    if (url.protocol === 'https:') headers.set('strict-transport-security', 'max-age=63072000; includeSubDomains; preload');
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin') || url.pathname.startsWith('/payments/')) {
      headers.set('cache-control', 'no-store, max-age=0');
    } else if (/^\/assets\/.*\.[a-f0-9]{8}\.(js|css)$/.test(url.pathname)) {
      headers.set('cache-control', 'public, max-age=31536000, immutable');
    }
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  } catch (error) {
    console.error(error);
    return fail('服务器暂时无法处理请求', 500, 'INTERNAL_ERROR');
  }
}
