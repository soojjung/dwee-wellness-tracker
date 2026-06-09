import { test, expect, type Page } from '@playwright/test';

const TITLE: Record<'en' | 'ko', string> = {
  en: 'Edit photos',
  ko: '사진 편집',
};

type Phase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'unknown';
type Locale = 'en' | 'ko';

declare global {
  interface Window {
    __dweeSeedPhase?: (phase: Phase, locale: Locale) => Promise<void>;
    __dweeSeedPhotos?: (count: 1 | 2 | 4) => Promise<void>;
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

async function seedAndOpenPhotoEdit(page: Page, locale: Locale) {
  await page.goto('/');
  await page.waitForFunction(
    () =>
      typeof window.__dweeSeedPhase === 'function' &&
      typeof window.__dweeSeedPhotos === 'function',
    null,
    { timeout: 15_000 },
  );
  await page.evaluate(async ({ locale }) => {
    await window.__dweeSeedPhase!('unknown', locale);
    await window.__dweeSeedPhotos!(4);
  }, { locale });
  await page.goto('/home/customize/edit-photos');
  await page.waitForSelector(`text=${TITLE[locale]}`, { timeout: 15_000 });
  await page.waitForTimeout(800);
}

// Playwright's WebKit (iPhone 13 Mini emulation) rejects Blob storage in
// IndexedDB during structured clone with a null DOMException, which blocks
// seeding photo data needed to render this screen. The same path works in
// production Safari/WKWebView and Chromium; this is a Playwright-only quirk.
// Re-enable once we have a chromium project or an alternative storage path.
test.skip('photo-edit — 4-photo grid', async ({ page }, testInfo) => {
  const locale = testInfo.project.name as Locale;
  const errors = attachErrorGuards(page);

  await seedAndOpenPhotoEdit(page, locale);

  await expect(page).toHaveScreenshot('photo-edit-4.png', { fullPage: true });

  expect(errors.pageErrors, 'uncaught page errors').toEqual([]);
  expect(errors.consoleErrors, 'console.error during photo-edit render').toEqual([]);
});
