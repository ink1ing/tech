import type { PagesContext } from '../../_lib/types';
import { cleanText, fail, json, readJson } from '../../_lib/http';
import { createAdminToken, passwordMatches } from '../../_lib/security';

export async function onRequestPost({ request, env }: PagesContext) {
  const body = await readJson<{ password?: string }>(request);
  const password = cleanText(body.password, 300);
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) return fail('管理员登录尚未配置', 503, 'ADMIN_NOT_CONFIGURED');
  if (!await passwordMatches(password, env.ADMIN_PASSWORD)) return fail('管理员密码不正确', 401, 'INVALID_CREDENTIALS');
  return json({ token: await createAdminToken(env.SESSION_SECRET), expiresIn: 8 * 60 * 60 });
}

