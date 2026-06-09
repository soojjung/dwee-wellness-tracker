import { test, expect, type Page } from '@playwright/test';

const PHASES = ['menstrual', 'follicular', 'ovulation', 'luteal', 'unknown'] as const;

const TITLE: Record<'en' | 'ko', string> = {
  en: 'Customize home',
  ko: '홈 꾸미기',
};

type Phase = (typeof PHASES)[number];
type Locale = 'en' | 'ko';

declare global {
  interface Window {
    __dweeSeedPhase?: (phase: Phase, locale: Locale) => Promise<void>;
  }
}

const IGNORE_ERROR_PATTERNS: readonly string[] = [
  '__nextjs_original-stack-frames',
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

async function seedAndOpenCustomize(page: Page, phase: Phase, locale: Locale) {
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
  await page.goto('/home/customize');
  await page.waitForSelector(`text=${TITLE[locale]}`, { timeout: 15_000 });
  // Wait for prefill effect (autoCopy) + textareas to settle.
  await page.waitForTimeout(600);
}

for (const phase of PHASES) {
  test(`customize — ${phase}`, async ({ page }, testInfo) => {
    const locale = testInfo.project.name as Locale;
    const errors = attachErrorGuards(page);

    await seedAndOpenCustomize(page, phase, locale);

    await expect(page).toHaveScreenshot(`customize-${phase}.png`, {
      fullPage: true,
    });

    expect(errors.pageErrors, 'uncaught page errors').toEqual([]);
    expect(errors.consoleErrors, 'console.error during customize render').toEqual([]);
  });
}
