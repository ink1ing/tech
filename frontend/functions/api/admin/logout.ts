import type { PagesContext } from '../../_lib/types';
import { json } from '../../_lib/http';
import { clearAdminSessionCookie, revokeAdminSession } from '../../_lib/security';

export async function onRequestPost({ request, env }: PagesContext) {
  try { await revokeAdminSession(request, env); } catch (error) { console.error('Admin session revocation failed', error); }
  return json({ ok: true }, 200, { 'set-cookie': clearAdminSessionCookie(request) });
}
