import type { Env } from './types';
import { sha256 } from './security';

export interface RateLimitResult {
  allowed: boolean;
  retryAfter: number;
}

export async function consumeRateLimit(
  request: Request,
  env: Env,
  scope: string,
  maximum: number,
  windowSeconds: number,
  blockSeconds: number,
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000);
  const forwarded = request.headers.get('cf-connecting-ip')
    || 'unknown';
  const keyHash = await sha256(`${env.SESSION_SECRET}:${forwarded}`);
  await env.DB.prepare(`INSERT INTO security_rate_limits
    (scope, key_hash, window_started_at, attempts, blocked_until) VALUES (?, ?, ?, 1, 0)
    ON CONFLICT(scope, key_hash) DO UPDATE SET
      window_started_at = CASE
        WHEN security_rate_limits.blocked_until <= ? AND ? - security_rate_limits.window_started_at >= ? THEN ?
        ELSE security_rate_limits.window_started_at END,
      attempts = CASE
        WHEN security_rate_limits.blocked_until > ? THEN security_rate_limits.attempts
        WHEN ? - security_rate_limits.window_started_at >= ? THEN 1
        ELSE security_rate_limits.attempts + 1 END,
      blocked_until = CASE
        WHEN security_rate_limits.blocked_until > ? THEN security_rate_limits.blocked_until
        WHEN ? - security_rate_limits.window_started_at >= ? THEN 0
        WHEN security_rate_limits.attempts >= ? THEN ?
        ELSE 0 END`)
    .bind(scope, keyHash, now,
      now, now, windowSeconds, now,
      now, now, windowSeconds,
      now, now, windowSeconds, maximum, now + blockSeconds).run();
  const row = await env.DB.prepare(`SELECT blocked_until FROM security_rate_limits
    WHERE scope = ? AND key_hash = ?`).bind(scope, keyHash).first();
  const blockedUntil = Number(row?.blocked_until) || 0;
  return blockedUntil > now
    ? { allowed: false, retryAfter: blockedUntil - now }
    : { allowed: true, retryAfter: 0 };
}

export async function clearRateLimit(request: Request, env: Env, scope: string) {
  const forwarded = request.headers.get('cf-connecting-ip')
    || 'unknown';
  const keyHash = await sha256(`${env.SESSION_SECRET}:${forwarded}`);
  await env.DB.prepare('DELETE FROM security_rate_limits WHERE scope = ? AND key_hash = ?')
    .bind(scope, keyHash).run();
}
