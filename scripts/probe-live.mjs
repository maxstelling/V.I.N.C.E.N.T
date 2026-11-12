// Optional public entry-page check. This does NOT join a game or test a tool.
import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ headless: true,
  ...(process.env.VIN_CHROMIUM_PATH ? { executablePath: process.env.VIN_CHROMIUM_PATH } : {}) });
const page = await browser.newPage();
const record = { checkedAt: new Date().toISOString(), target: 'https://play.blooket.com/', authenticated: false, gameJoined: false, liveFeaturesTested: false };
try {
  const response = await page.goto(record.target, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  record.httpStatus = response?.status(); record.finalUrl = page.url(); record.title = await page.title();
  record.gameCodeInputPresent = await page.locator('input[placeholder*="Game ID" i], input[placeholder*="Game code" i]').count() > 0;
  record.note = record.httpStatus === 403 ? 'The public entry page returned a browser challenge (HTTP 403). No game was joined or feature tested.' : 'Public entry page only. No game code, signed-in account or controlled game was available to this browser.';
} catch (error) { record.error = error.message; }
finally { await browser.close(); }
await writeFile('artifacts/live-entry-probe.json', JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify(record, null, 2));
