import type { PagesContext } from '../../_lib/types';
import { cleanText, fail, json, readJson } from '../../_lib/http';
import { consumeRateLimit } from '../../_lib/rate-limit';
import { sha256 } from '../../_lib/security';

interface FirePresetInput {
  name?: string;
  initialAssets?: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  annualReturn?: number;
  target?: number;
  forecastYears?: number;
  timeStepYears?: number;
  assetStep?: number;
}

const CLIENT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function onRequestGet({ request, env }: PagesContext) {
  if (!isFireHost(request)) return fail('接口不存在', 404, 'NOT_FOUND');
  const ownerHash = await getOwnerHash(request, env.SESSION_SECRET);
  if (!ownerHash) return fail('浏览器标识无效，请刷新页面后重试', 400, 'INVALID_CLIENT_ID');
  const result = await env.DB.prepare(`SELECT id, name, initial_assets AS initialAssets,
    monthly_income AS monthlyIncome, monthly_expenses AS monthlyExpenses,
    annual_return AS annualReturn, target, forecast_years AS forecastYears,
    time_step_years AS timeStepYears, asset_step AS assetStep, updated_at AS updatedAt
    FROM fire_presets WHERE owner_hash = ? ORDER BY updated_at DESC, name LIMIT 50`)
    .bind(ownerHash).all();
  return json({ presets: result.results || [] });
}

export async function onRequestPost({ request, env }: PagesContext) {
  if (!isFireHost(request)) return fail('接口不存在', 404, 'NOT_FOUND');
  const ownerHash = await getOwnerHash(request, env.SESSION_SECRET);
  if (!ownerHash) return fail('浏览器标识无效，请刷新页面后重试', 400, 'INVALID_CLIENT_ID');
  const rate = await consumeRateLimit(request, env, 'fire-preset-save', 30, 60 * 60, 60 * 60);
  if (!rate.allowed) return fail('保存过于频繁，请稍后再试', 429, 'RATE_LIMITED', { 'retry-after': String(rate.retryAfter) });

  let input: FirePresetInput;
  try { input = await readJson<FirePresetInput>(request); } catch (error) { return fail((error as Error).message); }
  const name = cleanText(input.name, 40);
  if (!name || Array.from(name).some((character) => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127;
  })) return fail('预设名称应为 1 至 40 个字符');

  const values = validateInputs(input);
  if (!values) return fail('规划参数超出允许范围', 400, 'INVALID_PRESET');
  const existing = await env.DB.prepare('SELECT id FROM fire_presets WHERE owner_hash = ? AND name = ?')
    .bind(ownerHash, name).first();
  if (!existing) {
    const count = await env.DB.prepare('SELECT COUNT(*) AS total FROM fire_presets WHERE owner_hash = ?')
      .bind(ownerHash).first();
    if (Number(count?.total) >= 50) return fail('最多保存 50 个预设，请使用已有名称进行更新', 409, 'PRESET_LIMIT');
  }

  const id = typeof existing?.id === 'string' ? existing.id : crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(`INSERT INTO fire_presets
    (id, owner_hash, name, initial_assets, monthly_income, monthly_expenses, annual_return,
     target, forecast_years, time_step_years, asset_step, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(owner_hash, name) DO UPDATE SET
      initial_assets = excluded.initial_assets,
      monthly_income = excluded.monthly_income,
      monthly_expenses = excluded.monthly_expenses,
      annual_return = excluded.annual_return,
      target = excluded.target,
      forecast_years = excluded.forecast_years,
      time_step_years = excluded.time_step_years,
      asset_step = excluded.asset_step,
      updated_at = excluded.updated_at`)
    .bind(id, ownerHash, name, values.initialAssets, values.monthlyIncome, values.monthlyExpenses,
      values.annualReturn, values.target, values.forecastYears, values.timeStepYears, values.assetStep, now, now).run();
  return json({ preset: { id, name, ...values, updatedAt: now } }, existing ? 200 : 201);
}

async function getOwnerHash(request: Request, secret: string) {
  const clientId = request.headers.get('x-fire-client-id') || '';
  if (!CLIENT_ID_PATTERN.test(clientId)) return '';
  return sha256(`${secret}:${clientId}`);
}

function isFireHost(request: Request) {
  return new URL(request.url).hostname.startsWith('fire.');
}

function validateInputs(input: FirePresetInput) {
  const ranges: Array<[keyof Omit<FirePresetInput, 'name'>, number, number]> = [
    ['initialAssets', -1e12, 1e12],
    ['monthlyIncome', 0, 1e9],
    ['monthlyExpenses', 0, 1e9],
    ['annualReturn', -99, 100],
    ['target', 1, 1e13],
    ['forecastYears', 1, 100],
    ['timeStepYears', 0.25, 100],
    ['assetStep', 1, 1e13],
  ];
  const values: Record<string, number> = {};
  for (const [key, minimum, maximum] of ranges) {
    const value = input[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) return null;
    values[key] = value;
  }
  return values as Required<Omit<FirePresetInput, 'name'>>;
}
