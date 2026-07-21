import type { Env } from './types';

export async function notifyTelegram(env: Env, text: string) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  try {
    const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) console.error('Telegram notification failed', response.status);
  } catch (error) {
    console.error('Telegram notification unavailable', error);
  }
}

export const telegramValue = (value: unknown, maximumLength = 300) => Array.from(String(value ?? ''))
  .map(character => {
    const code = character.codePointAt(0) || 0;
    return code <= 0x1f || (code >= 0x7f && code <= 0x9f)
      || (code >= 0x202a && code <= 0x202e) || (code >= 0x2066 && code <= 0x2069) ? ' ' : character;
  })
  .join('')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, maximumLength);
