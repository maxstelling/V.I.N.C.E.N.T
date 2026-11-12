import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ headless: true,
  ...(process.env.VIN_CHROMIUM_PATH ? { executablePath: process.env.VIN_CHROMIUM_PATH } : {}) });
try {
  const page = await browser.newPage({ viewport: { width: 1366, height: 1200 }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto('http://127.0.0.1:43917');
  if (response.status() !== 200 || !(await page.title()).includes('V.I.N.C.E.N.T')) throw new Error('Wrong preview server.');
  await page.locator('#vin-cent-panel').getByRole('button', { name: 'Highlight answers', exact: true }).click();
  await page.screenshot({ path: 'artifacts/desktop-demo.png' });
  await page.locator('#workspace').screenshot({ path: 'artifacts/workspace-demo.png' });
  await page.screenshot({ path: 'artifacts/full-page.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#workspace').screenshot({ path: 'artifacts/mobile-demo.png' });
  // Check local-file delivery as well as the HTTP development preview.
  await page.goto(pathToFileURL(resolve('index.html')).href);
  await page.locator('#vin-cent-panel').getByRole('button', { name: 'Auto-answer', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('[data-selected=true]')?.getAttribute('data-answer') === 'CSS');
  const fileDemoWorks = await page.locator('#vin-cent-panel').getByRole('status').textContent();
  await page.setViewportSize({ width: 683, height: 450 });
  await page.evaluate(() => window.__VIN_CENT_PANEL__.close());
  await page.getByRole('button', { name: 'Open demo panel' }).click();
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  await writeFile('artifacts/preview-check.json', JSON.stringify({ checkedAt: new Date().toISOString(), browser: await browser.version(), fileDemoWorks, viewportWidths: [1366, 390, 683], horizontalOverflowAt683: horizontalOverflow, browserErrors: errors }, null, 2) + '\n');
  if (errors.length || horizontalOverflow) throw new Error('Preview validation failed.');
  console.log('Captured desktop, workspace, mobile and full-page previews. Local-file demo passed.');
} finally { await browser.close(); }
