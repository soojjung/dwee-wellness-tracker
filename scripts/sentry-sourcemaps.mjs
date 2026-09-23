#!/usr/bin/env node
/**
 * Upload the static-export source maps to Sentry, then strip them from `out/`
 * so they are never shipped to Vercel or bundled into the iOS app.
 *
 *   pnpm build && pnpm sentry:sourcemaps
 *
 * Needs SENTRY_AUTH_TOKEN (scopes: project:releases, org:read) in the env or
 * .env.local; without it the step is skipped with a note so a plain build
 * still works. The release name must equal what `lib/monitoring/sentry.ts`
 * reports: `dwee@<package.json version>`.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'out');
const ORG = process.env.SENTRY_ORG ?? 'sooya';
const PROJECT = process.env.SENTRY_PROJECT ?? 'dwee';

loadDotEnvLocal();

const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const release = `dwee@${version}`;

if (!existsSync(join(outDir, '_next'))) {
  console.error('[sentry-sourcemaps] out/_next not found — run `pnpm build` first.');
  process.exit(1);
}

if (!process.env.SENTRY_AUTH_TOKEN) {
  console.warn(
    '[sentry-sourcemaps] SENTRY_AUTH_TOKEN not set — skipping upload, stripping maps only.',
  );
} else {
  // A Sentry outage or a bad token must not block a deploy: the app works
  // without source maps, only the stack traces get uglier until the next build.
  try {
    upload();
    console.log(`[sentry-sourcemaps] uploaded for ${release}`);
  } catch (err) {
    console.warn(
      `[sentry-sourcemaps] upload failed — continuing without source maps.\n${String(err.message ?? err)}`,
    );
  }
}

const removed = stripMaps(join(outDir, '_next', 'static'));
console.log(`[sentry-sourcemaps] removed ${removed} .map files from out/`);

function upload() {
  const cli = join(root, 'node_modules', '.bin', 'sentry-cli');
  const common = ['--org', ORG, '--project', PROJECT];
  const run = (args) => execFileSync(cli, [...args, ...common], { stdio: 'inherit' });
  run(['releases', 'new', release]);
  run(['sourcemaps', 'inject', join(outDir, '_next', 'static')]);
  run(['sourcemaps', 'upload', '--release', release, join(outDir, '_next', 'static')]);
  run(['releases', 'finalize', release]);
}

function stripMaps(dir) {
  let n = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) n += stripMaps(p);
    else if (entry.name.endsWith('.map')) {
      rmSync(p);
      n += 1;
    }
  }
  return n;
}

function loadDotEnvLocal() {
  const file = join(root, '.env.local');
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
