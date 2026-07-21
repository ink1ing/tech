import type { PagesContext } from '../../_lib/types';
import { cleanText, fail, json, readJson } from '../../_lib/http';
import { adminSessionCookie, createAdminToken, passwordMatches, registerAdminSession } from '../../_lib/security';
import { clearRateLimit, consumeRateLimit } from '../../_lib/rate-limit';

export async function onRequestPost({ request, env }: PagesContext) {
  const rate = await consumeRateLimit(request, env, 'admin-login', 5, 15 * 60, 30 * 60);
  if (!rate.allowed) return fail('登录尝试过多，请稍后再试', 429, 'RATE_LIMITED', { 'retry-after': String(rate.retryAfter) });
  const body = await readJson<{ password?: string }>(request);
  const password = cleanText(body.password, 300);
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) return fail('管理员登录尚未配置', 503, 'ADMIN_NOT_CONFIGURED');
  if (!await passwordMatches(password, env.ADMIN_PASSWORD)) return fail('管理员密码不正确', 401, 'INVALID_CREDENTIALS');
  await clearRateLimit(request, env, 'admin-login');
  const session = await createAdminToken(env.SESSION_SECRET);
  await registerAdminSession(env, session.jti, session.expiresAt);
  return json({ ok: true, expiresIn: 2 * 60 * 60 }, 200, { 'set-cookie': adminSessionCookie(request, session.token) });
}
