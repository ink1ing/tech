import type { PagesContext } from './_lib/types';
import { fail } from './_lib/http';

export async function onRequest(context: PagesContext) {
  try {
    const response = await context.next();
    const headers = new Headers(response.headers);
    headers.set('x-content-type-options', 'nosniff');
    headers.set('referrer-policy', 'strict-origin-when-cross-origin');
    headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
    if (new URL(context.request.url).pathname.startsWith('/api/')) headers.set('cache-control', 'no-store');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  } catch (error) {
    console.error(error);
    return fail('服务器暂时无法处理请求', 500, 'INTERNAL_ERROR');
  }
}

