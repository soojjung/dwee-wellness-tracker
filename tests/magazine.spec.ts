import { test, expect, type Page } from '@playwright/test';

// Magazine screens have no user-data dependency, but they still live under
// `(app)/` which AuthGuard protects. We mint an anonymous session so the
// screens render instead of redirecting to /login. Anon sessions keep data
// local, so no server round-trip beyond `signInAnonymously`.

declare global {
  interface Window {
    __dweeEnsureAnon?: () => Promise<void>;
  }
}

async function ensureAnon(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __dweeTestAnon?: boolean }).__dweeTestAnon = true;
  });
  await page.goto('/');
  await page.waitForFunction(
    () => typeof window.__dweeEnsureAnon === 'function',
    null,
    { timeout: 15_000 },
  );
  await page.evaluate(async () => window.__dweeEnsureAnon!());
  // LoginScreen auto-redirects to `/` when it detects a user. If we're still
  // on /login, wait for that redirect to land so the next goto isn't
  // interrupted mid-flight.
  await page.waitForURL((url) => url.pathname === '/', { timeout: 5_000 }).catch(() => {});
}

test('magazine — list', async ({ page }) => {
  await ensureAnon(page);
  await page.goto('/magazine');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot('magazine-list.png', { fullPage: true });
});

test('magazine — article (personal-body-type)', async ({ page }) => {
  test.setTimeout(90_000);
  await ensureAnon(page);
  await page.goto('/magazine/personal-body-type');
  await page.evaluate(() => document.fonts.ready);
  // Wikimedia thumbnails are remote — give them a generous fixed window.
  await page.waitForTimeout(8_000);
  await expect(page).toHaveScreenshot('magazine-article.png', { fullPage: true });
});

test('magazine — diagnose picker', async ({ page }) => {
  await ensureAnon(page);
  await page.goto('/magazine/personal-body-type/diagnose');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot('magazine-diagnose.png', { fullPage: true });
});
