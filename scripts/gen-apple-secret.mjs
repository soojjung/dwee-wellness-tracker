// Generates the Apple Sign in with Apple client_secret JWT used by Supabase.
// Apple requires ES256-signed JWT with a max lifetime of 6 months.
//
// Usage:
//   APPLE_TEAM_ID=XXXXXXXXXX \
//   APPLE_CLIENT_ID=com.dwee.app.web \
//   APPLE_KEY_ID=YYYYYYYYYY \
//   APPLE_P8_PATH=/absolute/path/to/AuthKey_YYYYYYYYYY.p8 \
//   node scripts/gen-apple-secret.mjs
//
// Paste the printed JWT into Supabase → Auth → Providers → Apple → "Secret Key (for OAuth)".
import { readFileSync } from 'node:fs';
import { createSign } from 'node:crypto';

const { APPLE_TEAM_ID, APPLE_CLIENT_ID, APPLE_KEY_ID, APPLE_P8_PATH } = process.env;

if (!APPLE_TEAM_ID || !APPLE_CLIENT_ID || !APPLE_KEY_ID || !APPLE_P8_PATH) {
  console.error(
    'Missing env vars. Required: APPLE_TEAM_ID, APPLE_CLIENT_ID, APPLE_KEY_ID, APPLE_P8_PATH'
  );
  process.exit(1);
}

const privateKey = readFileSync(APPLE_P8_PATH, 'utf8');

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const now = Math.floor(Date.now() / 1000);
const header = { alg: 'ES256', kid: APPLE_KEY_ID, typ: 'JWT' };
const payload = {
  iss: APPLE_TEAM_ID,
  iat: now,
  exp: now + 60 * 60 * 24 * 180, // 180 days (Apple max: 6 months)
  aud: 'https://appleid.apple.com',
  sub: APPLE_CLIENT_ID,
};

const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;

const signer = createSign('SHA256');
signer.update(signingInput);
const signature = signer
  .sign({ key: privateKey, dsaEncoding: 'ieee-p1363' })
  .toString('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

process.stdout.write(`${signingInput}.${signature}\n`);
