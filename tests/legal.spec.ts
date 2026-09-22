import { test, expect } from '@playwright/test';

// `/legal/*` must render with NO session — it is the App Store privacy-policy
// URL and the OAuth consent-screen link. No anon bootstrap on purpose.

test('legal — privacy renders publicly in both languages', async ({ page }) => {
  await page.goto('/legal/privacy/?lang=en');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('dwee Privacy Policy');
  await page.goto('/legal/privacy/?lang=ko');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('dwee 개인정보 처리방침');
  expect(page.url()).toContain('/legal/privacy');
});

test('legal — terms renders publicly and the toggle switches language', async ({ page }) => {
  await page.goto('/legal/terms/?lang=ko');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('dwee 서비스 이용약관');
  await page.getByRole('link', { name: 'English' }).click();
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('dwee Terms of Service');
});

test('legal — support page renders publicly with the contact email', async ({ page }) => {
  await page.goto('/legal/support/?lang=en');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Email us');
  await expect(page.getByRole('link', { name: 'sojjung3@gmail.com' })).toBeVisible();
  await page.goto('/legal/support/?lang=ko');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('이메일 문의하기');
});
