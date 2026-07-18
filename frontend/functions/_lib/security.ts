import type { Env } from './types';

const encoder = new TextEncoder();

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
  const payload = base64Url(encoder.encode(JSON.stringify({ role: 'admin', exp: Date.now() + 8 * 60 * 60 * 1000 })));
  return `${payload}.${await sign(payload, secret)}`;
}

export async function isAdmin(request: Request, env: Env) {
  if (!env.SESSION_SECRET) return false;
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const [payload, signature] = token.split('.');
  if (!payload || !signature || signature !== await sign(payload, env.SESSION_SECRET)) return false;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payload.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))));
    return parsed.role === 'admin' && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

export async function passwordMatches(actual: string, expected: string) {
  const [left, right] = await Promise.all([sha256(actual), sha256(expected)]);
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let i = 0; i < left.length; i += 1) difference |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return difference === 0;
}

