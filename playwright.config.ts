import { defineConfig, devices } from '@playwright/test';

// dwee tests target the mobile web bundle. Baselines live in `tests/snapshots/`.
// On a new machine: `pnpm test:e2e:update` to create baselines, then `pnpm test:e2e`
// to diff against them.
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  snapshotPathTemplate: 'tests/snapshots/{arg}{ext}',
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
      name: 'mobile',
      use: { ...devices['iPhone 13 Mini'] },
    },
  ],
});
