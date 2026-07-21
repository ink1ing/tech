import type { Env } from './types';

const encoder = new TextEncoder();
const localAdminCookieName = 'silas_store_admin';
const productionAdminCookieName = '__Host-silas_store_admin';

interface AdminTokenPayload {
  v: number;
  role: string;
  iat: number;
  exp: number;
  jti: string;
}

const base64Url = (bytes: Uint8Array) => {
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

export const randomToken = (bytes = 24) => {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return base64Url(value);
};

export async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return base64Url(new Uint8Array(digest));
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return base64Url(new Uint8Array(signature));
}

export async function createAdminToken(secret: string) {
  const now = Date.now();
  const jti = randomToken(16);
  const expiresAt = now + 2 * 60 * 60 * 1000;
  const payload = base64Url(encoder.encode(JSON.stringify({
    v: 1,
    role: 'admin',
    iat: now,
    exp: expiresAt,
    jti,
  })));
  return { token: `${payload}.${await sign(payload, secret)}`, jti, expiresAt };
}

export async function isAdmin(request: Request, env: Env) {
  return Boolean(await verifiedAdminPayload(request, env));
}

export async function registerAdminSession(env: Env, jti: string, expiresAt: number) {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').bind(Date.now()),
    env.DB.prepare('INSERT INTO admin_sessions (jti_hash, expires_at) VALUES (?, ?)')
      .bind(await sha256(jti), expiresAt),
  ]);
}

export async function revokeAdminSession(request: Request, env: Env) {
  const payload = await verifiedAdminPayload(request, env);
  if (!payload) return;
  await env.DB.prepare('DELETE FROM admin_sessions WHERE jti_hash = ?')
    .bind(await sha256(payload.jti)).run();
}

async function verifiedAdminPayload(request: Request, env: Env): Promise<AdminTokenPayload | null> {
  if (!env.SESSION_SECRET) return null;
  const token = readCookie(request, adminCookieName(request));
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  if (!payload || !signature || !constantTimeEqual(signature, await sign(payload, env.SESSION_SECRET))) return null;
  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const parsed = JSON.parse(new TextDecoder().decode(
      Uint8Array.from(atob(padded), character => character.charCodeAt(0)),
    )) as AdminTokenPayload;
    const now = Date.now();
    if (parsed.v !== 1 || parsed.role !== 'admin' || !parsed.jti
      || !Number.isFinite(parsed.iat) || !Number.isFinite(parsed.exp)
      || parsed.iat > now || parsed.exp <= now || parsed.exp - parsed.iat > 2 * 60 * 60 * 1000) return null;
    const session = await env.DB.prepare(`SELECT 1 AS valid FROM admin_sessions
      WHERE jti_hash = ? AND expires_at > ?`).bind(await sha256(parsed.jti), now).first();
    return session?.valid ? parsed : null;
  } catch {
    return null;
  }
}

export function adminSessionCookie(request: Request, token: string, maximumAge = 2 * 60 * 60) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${adminCookieName(request)}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maximumAge}${secure}`;
}

export function clearAdminSessionCookie(request: Request) {
  return adminSessionCookie(request, '', 0);
}

export async function passwordMatches(actual: string, expected: string) {
  const [left, right] = await Promise.all([sha256(actual), sha256(expected)]);
  return constantTimeEqual(left, right);
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let i = 0; i < left.length; i += 1) difference |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return difference === 0;
}

function readCookie(request: Request, name: string) {
  const value = (request.headers.get('cookie') || '').split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${name}=`));
  return value ? value.slice(name.length + 1) : '';
}

function adminCookieName(request: Request) {
  return new URL(request.url).protocol === 'https:' ? productionAdminCookieName : localAdminCookieName;
}
