import { test, expect, type Page } from '@playwright/test';

const PHASES = ['menstrual', 'follicular', 'ovulation', 'luteal', 'unknown'] as const;
const LOCALES = ['en', 'ko'] as const;

const KEYWORDS_TITLE: Record<(typeof LOCALES)[number], string> = {
  en: 'Today’s keywords',
  ko: '오늘의 키워드는',
};

type Phase = (typeof PHASES)[number];
type Locale = (typeof LOCALES)[number];

declare global {
  interface Window {
    __dweeSeedPhase?: (phase: Phase, locale: Locale) => Promise<void>;
  }
}

// Collect console.error and uncaught page errors across the visit. Some
// dev-only tooling noise is unrelated to app code — list substrings here to
// ignore them. Keep this list minimal and prefer fixing real errors over
// adding patterns.
const IGNORE_ERROR_PATTERNS: readonly string[] = [
  // Next.js dev-only stack-frame symbolication endpoint, CORS-blocked by browser.
  '__nextjs_original-stack-frames',
  // Third-party network noise (Supabase anon-auth rate-limit during heavy test runs).
  // The app surfaces real failures via authStore.error, not as uncaught console errors.
  'TypeError: Load failed',
  'Failed to load resource',
];

function isIgnored(text: string): boolean {
  return IGNORE_ERROR_PATTERNS.some((p) => text.includes(p));
}

function attachErrorGuards(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (isIgnored(text)) return;
    consoleErrors.push(text);
  });
  page.on('pageerror', (err) => {
    if (isIgnored(err.message)) return;
    pageErrors.push(err.message);
  });
  return { consoleErrors, pageErrors };
}

async function seedAndOpenHome(page: Page, phase: Phase, locale: Locale) {
  await page.goto('/');
  await page.waitForFunction(
    () => typeof window.__dweeSeedPhase === 'function',
    null,
    { timeout: 15_000 },
  );
  await page.evaluate(
    async ({ phase, locale }) => window.__dweeSeedPhase!(phase, locale),
    { phase, locale },
  );
  await page.reload();
  await page.waitForSelector(`text=${KEYWORDS_TITLE[locale]}`, { timeout: 15_000 });
  // Settle layout / fonts.
  await page.waitForTimeout(400);
}

// Locale is driven by Playwright project (`en` / `ko` in playwright.config.ts).
// Each project runs the same phase matrix; baselines split into
// `tests/snapshots/<projectName>/home-<phase>.png` via snapshotPathTemplate.
for (const phase of PHASES) {
  test(`home — ${phase}`, async ({ page }, testInfo) => {
    const locale = testInfo.project.name as Locale;
    const errors = attachErrorGuards(page);

    await seedAndOpenHome(page, phase, locale);

    await expect(page).toHaveScreenshot(`home-${phase}.png`, {
      fullPage: true,
    });

    expect(errors.pageErrors, 'uncaught page errors').toEqual([]);
    expect(errors.consoleErrors, 'console.error during home render').toEqual([]);
  });
}
