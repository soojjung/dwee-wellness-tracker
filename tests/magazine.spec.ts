import { test, expect } from '@playwright/test';

// Magazine screens have no user-data dependency — no seed step required.
// Diagnose picker triggers anonymous Supabase auth only when analyze is invoked,
// so the initial render is deterministic without Supabase credentials.

test('magazine — list', async ({ page }) => {
  await page.goto('/magazine');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot('magazine-list.png', { fullPage: true });
});

test('magazine — article (personal-body-type)', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/magazine/personal-body-type');
  await page.evaluate(() => document.fonts.ready);
  // Wikimedia thumbnails are remote — give them a generous fixed window.
  await page.waitForTimeout(8_000);
  await expect(page).toHaveScreenshot('magazine-article.png', { fullPage: true });
});

test('magazine — diagnose picker', async ({ page }) => {
  await page.goto('/magazine/personal-body-type/diagnose');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot('magazine-diagnose.png', { fullPage: true });
});
