import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await context.newPage();
const shots = [
  ['list', 'http://localhost:3000/magazine'],
  ['detail', 'http://localhost:3000/magazine/personal-body-type'],
  ['bookmarks', 'http://localhost:3000/magazine/bookmarks'],
];
for (const [name, url] of shots) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `/tmp/dwee-${name}.png`, fullPage: true });
  console.log(name, 'ok');
}
await browser.close();
