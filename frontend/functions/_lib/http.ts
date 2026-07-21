export const json = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers,
    },
  });

export const fail = (message: string, status = 400, code = 'BAD_REQUEST', headers: HeadersInit = {}) =>
  json({ error: { code, message } }, status, headers);

export async function readJson<T>(request: Request): Promise<T> {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) throw new Error('请求格式必须为 JSON');
  const maximumBytes = 64 * 1024;
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (Number.isFinite(contentLength) && contentLength > maximumBytes) throw new Error('请求内容过大');
  if (!request.body) throw new Error('请求内容不能为空');

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maximumBytes) {
      await reader.cancel();
      throw new Error('请求内容过大');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  } catch {
    throw new Error('JSON 内容无效');
  }
}

export const cleanText = (value: unknown, maxLength = 500) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

export const isEmail = (value: string) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function verifiedContentLength(request: Request, maximumBytes: number) {
  const header = request.headers.get('content-length');
  if (!header || !/^\d+$/.test(header)) return { valid: false, missing: true, bytes: 0 };
  const bytes = Number(header);
  return { valid: Number.isSafeInteger(bytes) && bytes <= maximumBytes, missing: false, bytes };
}
