import { defineConfig, devices } from '@playwright/test';

// dwee tests target the mobile web bundle. Baselines live in `tests/snapshots/`.
// On a new machine: `pnpm test:e2e:update` to create baselines, then `pnpm test:e2e`
// to diff against them.
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  // One project per locale; baselines live under `tests/snapshots/<locale>/`.
  snapshotPathTemplate: 'tests/snapshots/{projectName}/{arg}{ext}',
  use: {
    baseURL: process.env.SNAPSHOT_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 200,
      animations: 'disabled',
    },
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    {
      name: 'en',
      use: { ...devices['iPhone 13 Mini'], locale: 'en-US' },
    },
    {
      name: 'ko',
      use: { ...devices['iPhone 13 Mini'], locale: 'ko-KR' },
    },
  ],
});
