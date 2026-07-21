import type { PagesContext } from '../_lib/types';

export function onRequest({ request }: PagesContext) {
  const destination = new URL(request.url);
  destination.protocol = 'https:';
  destination.hostname = 'store.shangdian.me';
  destination.port = '';
  destination.pathname = destination.pathname.replace(/^\/mystore/, '') || '/';
  return Response.redirect(destination.toString(), 308);
}
