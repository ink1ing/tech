const baseUrl = process.env.BASE_URL || 'http://fire.localhost:8788';
const clientId = crypto.randomUUID();
const name = `Integration ${Date.now()}`;
const defaults = {
  initialAssets: 200000,
  monthlyIncome: 20000,
  monthlyExpenses: 9000,
  annualReturn: 7,
  target: 5000000,
  forecastYears: 35,
  timeStepYears: 5,
  assetStep: 1000000,
};

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'x-fire-client-id': clientId, ...(options.headers || {}) },
  });
  const data = await response.json();
  return { response, data };
}

const created = await request('/api/fire-presets', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ name, ...defaults }),
});
if (created.response.status !== 201 || created.data.preset?.name !== name) throw new Error('Preset creation failed');

const listed = await request('/api/fire-presets');
if (!listed.response.ok || !listed.data.presets?.some((preset) => preset.id === created.data.preset.id)) throw new Error('Preset listing failed');

const updated = await request('/api/fire-presets', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ name, ...defaults, target: 8000000 }),
});
if (!updated.response.ok || updated.data.preset?.id !== created.data.preset.id || updated.data.preset?.target !== 8000000) throw new Error('Preset update failed');

const invalid = await request('/api/fire-presets', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ name: 'Invalid', ...defaults, annualReturn: 1000 }),
});
if (invalid.response.status !== 400) throw new Error('Invalid preset was accepted');

console.log(`FIRE preset integration passed: ${created.data.preset.id}`);
