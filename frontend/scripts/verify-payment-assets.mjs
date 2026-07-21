import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const assets = [
  { fileName: 'alipay.jpg', expected: 'fd8e19aeb06056a6fa35644edb746a9a22bab6b6c43e07bf8891fc39453e82f6', urlField: 'alipayQrUrl', hashField: 'alipayQrSha256' },
  { fileName: 'wechat.jpg', expected: 'd62a55c14b91dbf8bb09579d975756dce49789724c952fb9ae7865a17403c08b', urlField: 'wechatQrUrl', hashField: 'wechatQrSha256' },
  { fileName: 'usdt-xlayer.jpg', expected: '2cfb3cf8c483925a5e2eaa19baf7137bc7e0c19be28af5e44694eacb97016e51', id: 'xlayer' },
  { fileName: 'usdt-bsc.jpg', expected: '18bab790f756ee83826075ee1e08e55f2c0c7a30ccb82b1e78ea9813ad0ac16a', id: 'bsc' },
  { fileName: 'usdt-solana.jpg', expected: '8b90187c3480c3eae6103092524a9b164a2fa1d82af01603dc4065aa04129b09', id: 'solana' },
  { fileName: 'usdt-polygon.jpg', expected: '927d5e7456eb35eca1638831130348bfd3b4bc6e68c515bc4bc0884de53f9a3a', id: 'polygon' },
];

const escapePattern = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const config = await readFile(new URL('../functions/_lib/payment-config.ts', import.meta.url), 'utf8');
for (const asset of assets) {
  const { fileName, expected } = asset;
  const bytes = await readFile(new URL(`../public/payments/${fileName}`, import.meta.url));
  const actual = createHash('sha256').update(bytes).digest('hex');
  if (actual !== expected) throw new Error(`${fileName} SHA-256 mismatch: ${actual}`);
  const path = `/payments/${fileName}`;
  const pairPattern = asset.id
    ? new RegExp(`\\{[^{}]*id:\\s*['"]${escapePattern(asset.id)}['"][^{}]*qrUrl:\\s*['"]${escapePattern(path)}['"][^{}]*sha256:\\s*['"]${expected}['"][^{}]*\\}`)
    : new RegExp(`${asset.urlField}:\\s*['"]${escapePattern(path)}['"]\\s*,\\s*${asset.hashField}:\\s*['"]${expected}['"]`);
  if (!pairPattern.test(config)) {
    throw new Error(`${fileName} is not pinned to the verified hash in payment-config.ts`);
  }
}

console.log(`Verified ${assets.length} pinned payment assets.`);
