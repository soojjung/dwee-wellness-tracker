import { test, expect } from '@playwright/test';

// Release STEP 1.5: a fresh install must tick the 14+/terms consent before any
// sign-in path is enabled. No session bootstrap on purpose — this is the
// cold-start login screen.

test('login — sign-in buttons stay disabled until consent is ticked', async ({ page }) => {
  await page.goto('/login/');
  const guest = page.getByTestId('guest-sign-in');
  const consent = page.getByTestId('consent-check');
  await expect(consent).toBeVisible();
  await expect(guest).toBeDisabled();
  await expect(page.getByRole('button', { name: /Apple/ })).toBeDisabled();
  await consent.check();
  await expect(guest).toBeEnabled();
  await expect(page.getByRole('button', { name: /Apple/ })).toBeEnabled();
  // The document links point at the public pages, reachable without a session.
  // Located by href so the assertion holds in both locale projects.
  await expect(page.locator('a[href="/legal/terms/"]')).toBeVisible();
  await expect(page.locator('a[href="/legal/privacy/"]')).toBeVisible();
});
