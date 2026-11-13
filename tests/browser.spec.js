import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { MODES } from '../src/modes.js';
import { KEY_FORMAT } from '../src/answer-key.js';

const bookmarklet = (await readFile('dist/bookmarklet.txt', 'utf8')).trim();
const local = 'http://127.0.0.1:43917';
const panel = page => page.locator('#vin-cent-panel');

// A real React 18 app is served at a mocked Blooket origin. These tests never
// contact Blooket and must never be represented as live-game evidence.
async function fixture(page, route = '/play/gold', query = '', origin = 'https://play.blooket.com') {
  await page.route(origin + '/**', async request => {
    const url = new URL(request.request().url());
    const path = url.pathname.startsWith('/tests/') ? url.pathname : '/tests/fixture.html';
    const response = await page.request.get(local + path);
    await request.fulfill({ response });
  });
  await page.goto(origin + route + query);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Controlled React');
}

test('mode-hosted game URLs open the panel and detect Gold Quest', async ({ page }) => {
  await fixture(page, '/example-game/play/example-player', '', 'https://gold.blooket.com');
  await openBookmarklet(page);
  await expect(panel(page).locator('.mode')).toHaveText('Gold Quest');
  await panel(page).getByRole('button', { name: 'Highlight answers', exact: true }).click();
  await expect(page.locator('[data-vin-cent-highlight]')).toHaveText('Alpha');
  await panel(page).getByRole('tab', { name: 'Game values' }).click();
  await expect(panel(page).getByLabel('Your gold')).toBeVisible();
});

test('modern choice flags follow the current React tree across question changes', async ({ page }) => {
  await fixture(page, '/example-game/play/example-player', '?modern', 'https://gold.blooket.com');
  await openBookmarklet(page);
  await panel(page).getByRole('button', { name: 'Highlight answers', exact: true }).click();
  await expect(page.locator('[data-vin-cent-highlight]')).toHaveText('Alpha');
  await panel(page).getByRole('button', { name: 'Auto-answer', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.fixtureClicks)).toBe(1);
  await page.locator('#fixture-next').click();
  await expect(page.locator('[data-vin-cent-highlight]')).toHaveText('Beta');
  await expect.poll(() => page.evaluate(() => window.fixtureClicks)).toBe(2);
  await page.locator('#fixture-next').click();
  await expect(page.locator('[data-vin-cent-highlight]')).toHaveText('Alpha');
  await expect.poll(() => page.evaluate(() => window.fixtureClicks)).toBe(3);
  await panel(page).getByRole('button', { name: 'Stop All', exact: true }).click();
  await panel(page).getByRole('tab', { name: 'Support' }).click();
  await panel(page).getByRole('button', { name: 'Check page layout' }).click();
  await expect(panel(page).locator('#layout-report')).toContainText('readableQuestions: 1');
});

test('feedback-only correctness never enables an unanswered choice', async ({ page }) => {
  await fixture(page, '/example-game/play/example-player', '?modern&feedback-only', 'https://gold.blooket.com');
  await openBookmarklet(page);
  await expect(panel(page).getByRole('button', { name: 'Auto-answer', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Alpha', exact: true }).click();
  await panel(page).getByRole('button', { name: 'Refresh data', exact: true }).click();
  await expect(panel(page).getByRole('button', { name: 'Auto-answer', exact: true })).toBeDisabled();
  expect(await page.evaluate(() => window.fixtureClicks)).toBe(1);
  await page.locator('#fixture-next').click();
  await panel(page).getByRole('button', { name: 'Refresh data', exact: true }).click();
  await expect(panel(page).getByRole('button', { name: 'Auto-answer', exact: true })).toBeDisabled();
});

test('a review key prompts before feedback, follows pictures and never submits answers', async ({ page }) => {
  await fixture(page, '/example-game/play/example-player', '?modern&feedback-only&key-images', 'https://gold.blooket.com');
  await openBookmarklet(page);
  const key = { format: KEY_FORMAT, version: 1, questions: [0, 1].map(number => ({
    prompt: 'Which animal?', image: `https://example.invalid/animal-${number}.png`, answers: ['Alpha', 'Beta'], correctAnswers: [number ? 'Beta' : 'Alpha']
  })) };
  await panel(page).getByRole('textbox', { name: 'Answer key', exact: true }).fill(JSON.stringify(key));
  await panel(page).getByRole('button', { name: 'Load key', exact: true }).click();
  await expect(panel(page).getByRole('button', { name: 'Auto-answer', exact: true })).toBeDisabled();
  await panel(page).getByRole('button', { name: 'Highlight answers', exact: true }).click();
  await expect(page.locator('[data-vin-cent-highlight]')).toHaveText('Alpha');
  await expect(panel(page).locator('#prompt-answer')).toHaveText('From your answer key: Alpha');
  expect(await page.evaluate(() => window.fixtureClicks)).toBe(0);
  await page.locator('#fixture-next').click();
  await expect(page.locator('[data-vin-cent-highlight]')).toHaveText('Beta');
  await page.locator('#fixture-next').click();
  await expect(page.locator('[data-vin-cent-highlight]')).toHaveCount(0);
  await expect(panel(page).locator('#prompt-answer')).toBeHidden();
  expect(await page.evaluate(() => window.fixtureClicks)).toBe(0);
  await panel(page).getByRole('button', { name: 'Refresh data', exact: true }).click();
  await expect(panel(page).locator('#key-status')).toContainText('2 questions loaded');
  await panel(page).getByRole('button', { name: 'Clear key', exact: true }).click();
  await expect(panel(page).locator('#key-status')).toHaveText('No answer key loaded.');
});

test('review export transfers into a game page and malformed replacement clears it', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await fixture(page, '/set/exampleset', '?review', 'https://dashboard.blooket.com');
  await openBookmarklet(page);
  await panel(page).getByRole('button', { name: 'Copy review answer key', exact: true }).click();
  await expect(panel(page).locator('.status').last()).toContainText('Show all answers');
  await page.getByRole('button', { name: 'Show all answers', exact: true }).click();
  await panel(page).getByRole('button', { name: 'Copy review answer key', exact: true }).click();
  await expect(panel(page).locator('.status').last()).toContainText('2 questions copied');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(JSON.parse(copied).questions).toHaveLength(2);
  const visibleKey = panel(page).getByRole('textbox', { name: 'Review answer key to copy', exact: true });
  await expect(visibleKey).toBeVisible();
  await expect(visibleKey).toHaveValue(copied);
  await expect(visibleKey).toHaveAttribute('readonly', '');
  const downloadEvent = page.waitForEvent('download');
  await panel(page).getByRole('link', { name: 'Download key (.json)', exact: true }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('vincent-answer-key.json');
  const chunks = [];
  for await (const chunk of await download.createReadStream()) chunks.push(chunk);
  expect(Buffer.concat(chunks).toString('utf8')).toBe(copied);
  await fixture(page, '/example-game/play/example-player', '?modern&feedback-only&key-images', 'https://gold.blooket.com');
  await openBookmarklet(page);
  await panel(page).getByRole('textbox', { name: 'Answer key', exact: true }).fill(copied);
  await panel(page).getByRole('button', { name: 'Load key', exact: true }).click();
  await panel(page).getByRole('button', { name: 'Highlight answers', exact: true }).click();
  await expect(page.locator('[data-vin-cent-highlight]')).toHaveText('Alpha');
  await panel(page).getByRole('button', { name: 'Stop All', exact: true }).click();
  await expect(page.locator('[data-vin-cent-highlight]')).toHaveCount(0);
  await expect(panel(page).locator('#prompt-answer')).toBeHidden();
  expect(await page.evaluate(() => window.__VIN_CENT_PANEL__.running)).toBe(false);
  await expect(panel(page).locator('#key-status')).toContainText('2 questions loaded');
  await panel(page).getByRole('button', { name: 'Highlight answers', exact: true }).click();
  await expect(page.locator('[data-vin-cent-highlight]')).toHaveText('Alpha');
  await panel(page).getByRole('textbox', { name: 'Answer key', exact: true }).fill('not an answer key');
  await panel(page).getByRole('button', { name: 'Load key', exact: true }).click();
  await expect(panel(page).locator('.status').last()).toContainText('Key not loaded');
  await expect(page.locator('[data-vin-cent-highlight]')).toHaveCount(0);
  await expect(panel(page).locator('#key-status')).toHaveText('No answer key loaded.');
});
test('review key stays visible and downloadable when clipboard access is blocked', async ({ page }) => {
  await fixture(page, '/set/exampleset', '?review', 'https://dashboard.blooket.com');
  await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', { value: () => Promise.reject(new Error('Blocked')) }));
  await page.getByRole('button', { name: 'Show all answers', exact: true }).click();
  await openBookmarklet(page);
  await panel(page).getByRole('button', { name: 'Copy review answer key', exact: true }).click();
  const box = panel(page).getByRole('textbox', { name: 'Review answer key to copy', exact: true });
  await expect(box).toBeVisible();
  expect(JSON.parse(await box.inputValue()).questions).toHaveLength(2);
  await expect(panel(page).getByRole('link', { name: 'Download key (.json)', exact: true })).toBeVisible();
  await expect(panel(page).getByRole('status')).toContainText('Copy the selected key or download');
  await panel(page).getByRole('button', { name: 'Close panel', exact: true }).click();
  await openBookmarklet(page);
  await expect(panel(page).locator('#review-export')).toBeHidden();
});
async function openBookmarklet(page) {
  // Exercise actual javascript: URL execution, not eval(bookmarklet).
  await page.evaluate(address => {
    const anchor = document.createElement('a'); anchor.id = 'test-bookmark';
    anchor.textContent = 'Saved bookmark fixture'; anchor.href = address;
    document.body.append(anchor);
  }, bookmarklet);
  await page.locator('#test-bookmark').last().click();
  await expect(panel(page).getByRole('dialog', { name: 'V.I.N.C.E.N.T' })).toBeVisible();
}

test('demo highlights correct answer, answers once, advances, and edits sample values', async ({ page }) => {
  const foreign = []; page.on('request', request => { if (!request.url().startsWith(local)) foreign.push(request.url()); });
  await page.goto('/');
  await panel(page).getByRole('button', { name: 'Highlight answers', exact: true }).click();
  await expect(page.locator('[data-vin-cent-highlight]')).toHaveAttribute('data-answer', 'CSS');
  await panel(page).getByRole('button', { name: 'Auto-answer', exact: true }).click();
  await expect(page.locator('[data-selected=true]')).toHaveAttribute('data-answer', 'CSS');
  await page.getByRole('button', { name: 'Next question' }).click();
  await expect(page.locator('[data-selected=true]')).toHaveAttribute('data-answer', 'In the current page');
  await panel(page).getByRole('tab', { name: 'Game values' }).click();
  await panel(page).getByLabel('Your gold').fill('1000');
  await panel(page).getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.locator('#demo-score')).toContainText('1,000');
  await expect(panel(page).getByRole('status')).toContainText('Demo value changed');
  await panel(page).getByRole('button', { name: 'Stop All', exact: true }).click();
  expect(await page.evaluate(() => window.__VIN_CENT_PANEL__.running)).toBe(false);
  await expect(page.locator('[data-vin-cent-highlight]')).toHaveCount(0);
  expect(foreign).toEqual([]);
});

test('demo starts off, resets on mode switch and can close and reopen', async ({ page }) => {
  await page.goto('/');
  await expect(panel(page).getByRole('button', { name: 'Auto-answer', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await panel(page).getByRole('button', { name: 'Auto-answer', exact: true }).click();
  await page.getByLabel('Preview mode').selectOption('factory');
  await expect(panel(page).locator('.mode')).toHaveText('Factory');
  await expect(panel(page).getByRole('button', { name: 'Auto-answer', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await panel(page).getByRole('button', { name: 'Close panel' }).click();
  await expect(panel(page)).toHaveCount(0);
  await page.getByRole('button', { name: 'Open demo panel' }).click();
  await expect(panel(page)).toBeVisible();
});

test('keyboard tab controls, Escape, coverage search and copy fallback work', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  const tab = panel(page).getByRole('tab', { name: 'Answers', exact: true });
  await tab.focus(); await tab.press('ArrowRight');
  await expect(panel(page).getByRole('tab', { name: 'Game values' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  await expect(panel(page).getByRole('tab', { name: 'Support' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Escape'); await expect(panel(page)).toHaveCount(0);
  await page.getByRole('searchbox', { name: 'Find a mode' }).fill('cyber');
  await expect(page.locator('#coverage-rows tr')).toHaveCount(1);
  await expect(page.locator('#coverage-rows')).toContainText('Cyber Hack');
  await page.getByRole('button', { name: 'Copy bookmark address' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(bookmarklet);
  await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', { value: () => Promise.reject(new Error('Blocked')) }));
  await page.getByRole('button', { name: 'Copy bookmark address' }).click();
  await expect(page.getByRole('textbox', { name: 'Bookmark address to copy' })).toHaveValue(bookmarklet);
});

for (const mode of MODES) {
  test(`React fixture: ${mode.name} adapter detects page data without live claims`, async ({ page }) => {
    await fixture(page, '/play/' + mode.routes[0]); await openBookmarklet(page);
    await expect(panel(page).locator('.mode')).toHaveText(mode.name);
    await expect(panel(page).getByRole('button', { name: 'Auto-answer', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await panel(page).getByRole('button', { name: 'Highlight answers', exact: true }).click();
    await expect(page.locator('[data-vin-cent-highlight]')).toHaveText('Alpha');
    await panel(page).getByRole('tab', { name: 'Game values' }).click();
    await expect(panel(page).locator('input')).toHaveCount(mode.fields.length);
    if (mode.fields.length) {
      const input = panel(page).locator('input').first();
      await input.fill('3'); await panel(page).getByRole('button', { name: 'Apply', exact: true }).first().click();
      await expect(panel(page).getByRole('status')).toContainText('Server acceptance is not verified');
      await expect.poll(() => page.evaluate(key => window.fixture.state[key], mode.fields[0].key)).toBe(3);
    } else await expect(panel(page).locator('#fields')).toContainText('No supported numeric values');
  });
}

test('bookmarklet is a singleton, auto answers once, Stop All and Close clean up', async ({ page }) => {
  await fixture(page); await openBookmarklet(page); await openBookmarklet(page);
  await expect(panel(page)).toHaveCount(1);
  await panel(page).getByRole('button', { name: 'Highlight answers', exact: true }).click();
  await panel(page).getByRole('button', { name: 'Auto-answer', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.fixtureClicks)).toBe(1);
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => window.fixtureClicks)).toBe(1);
  await page.locator('#fixture-next').click();
  await expect.poll(() => page.evaluate(() => window.fixtureClicks)).toBe(2);
  await panel(page).getByRole('button', { name: 'Stop All', exact: true }).click();
  expect(await page.evaluate(() => window.__VIN_CENT_PANEL__.running)).toBe(false);
  await expect(page.locator('[data-vin-cent-highlight]')).toHaveCount(0);
  await panel(page).getByRole('button', { name: 'Close panel' }).click();
  expect(await page.evaluate(() => '__VIN_CENT_PANEL__' in window)).toBe(false);
  expect(await page.locator('style').count()).toBe(0);
  await page.locator('#fixture-next').click(); await page.waitForTimeout(900);
  expect(await page.evaluate(() => window.fixtureClicks)).toBe(2);
});

test('missing answers, unknown routes and hook-only values fail clearly', async ({ page }) => {
  await fixture(page, '/play/gold', '?missing'); await openBookmarklet(page);
  await expect(panel(page).getByRole('button', { name: 'Highlight answers', exact: true })).toBeDisabled();
  await expect(panel(page).getByRole('button', { name: 'Auto-answer', exact: true })).toBeDisabled();
  expect(await page.evaluate(() => window.fixtureClicks)).toBe(0);
  await page.goto('https://play.blooket.com/settings'); await openBookmarklet(page);
  await expect(panel(page).locator('.mode')).toHaveText('Game not detected');
  await page.goto('https://play.blooket.com/play/gold?hooks'); await openBookmarklet(page);
  await panel(page).getByRole('button', { name: 'Highlight answers', exact: true }).click();
  await expect(page.locator('[data-vin-cent-highlight]')).toHaveText('Alpha');
  await panel(page).getByRole('tab', { name: 'Game values' }).click();
  await expect(panel(page).locator('input')).toHaveCount(0);
});

test('hidden, transparent and accessibility-hidden choices are not clicked', async ({ page }) => {
  for (const hiddenBy of ['visibility', 'opacity', 'aria-hidden', 'disabled-fieldset']) {
    await fixture(page);
    await page.locator('button[data-answer=Alpha]').evaluate((element, kind) => {
      if (kind === 'visibility') element.style.visibility = 'hidden';
      if (kind === 'opacity') element.style.opacity = '0';
      if (kind === 'aria-hidden') element.setAttribute('aria-hidden', 'true');
      if (kind === 'disabled-fieldset') {
        const parent = document.createElement('fieldset'); parent.disabled = true;
        element.before(parent); parent.append(element);
      }
    }, hiddenBy);
    await openBookmarklet(page);
    await expect(panel(page).getByRole('button', { name: 'Auto-answer', exact: true })).toBeDisabled();
    expect(await page.evaluate(() => window.fixtureClicks)).toBe(0);
  }
});

test('navigation stops automation and stale value edits cannot change the previous mode', async ({ page }) => {
  await fixture(page); await openBookmarklet(page);
  await panel(page).getByRole('button', { name: 'Auto-answer', exact: true }).click();
  await page.evaluate(() => history.pushState({}, '', '/play/factory'));
  await expect.poll(() => page.evaluate(() => window.__VIN_CENT_PANEL__.running)).toBe(false);
  await expect(panel(page).locator('.mode')).toHaveText('Factory');
  await panel(page).getByRole('tab', { name: 'Game values' }).click();
  await panel(page).getByLabel('Your cash').fill('999');
  await page.evaluate(() => history.pushState({}, '', '/play/gold'));
  await panel(page).getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(panel(page).getByRole('status')).toContainText('game changed');
  expect(await page.evaluate(() => window.fixture.state.cash)).toBe(250);
});

test('invalid values do not update state; stopping preserves already applied values', async ({ page }) => {
  await fixture(page, '/play/rush'); await openBookmarklet(page);
  await panel(page).getByRole('tab', { name: 'Game values' }).click();
  const field = panel(page).getByLabel('Your defense');
  for (const value of ['-1', '1.5', '5', '']) {
    await field.fill(value);
    await panel(page).getByRole('button', { name: 'Apply', exact: true }).last().click();
    expect(await page.evaluate(() => window.fixture.state.numDefense)).toBe(2);
  }
  await field.fill('4'); await panel(page).getByRole('button', { name: 'Apply', exact: true }).last().click();
  await expect.poll(() => page.evaluate(() => window.fixture.state.numDefense)).toBe(4);
  await panel(page).getByRole('button', { name: 'Stop All', exact: true }).click();
  expect(await page.evaluate(() => window.fixture.state.numDefense)).toBe(4);
});

test('unrelated sites are rejected by the actual launcher', async ({ page }) => {
  await page.goto('/'); await panel(page).getByRole('button', { name: 'Close panel' }).click();
  const messages = []; page.on('dialog', async dialog => { messages.push(dialog.message()); await dialog.accept(); });
  await page.evaluate(address => { const a = document.createElement('a'); a.id = 'wrong-site-launch'; a.href = address; a.textContent = 'Launch'; document.body.append(a); }, bookmarklet);
  await page.locator('#wrong-site-launch').click();
  await expect.poll(() => messages.length).toBe(1);
  await expect(panel(page)).toHaveCount(0);
});

test('page CSP blocks javascript URLs rather than being bypassed', async ({ page }) => {
  await page.goto('/blocked');
  const violations = []; page.on('console', message => { if (message.text().includes('Content Security Policy') || message.text().includes('script-src')) violations.push(message.text()); });
  await page.evaluate(address => { const a = document.createElement('a'); a.id = 'blocked-launch'; a.href = address; a.textContent = 'Launch'; document.body.append(a); }, bookmarklet);
  await page.locator('#blocked-launch').click();
  await expect(panel(page)).toHaveCount(0);
  await expect.poll(() => violations.length).toBeGreaterThan(0);
});

for (const viewport of [{ width: 1366, height: 900 }, { width: 768, height: 720 }, { width: 390, height: 844 }]) {
  test(`demo layout fits ${viewport.width}px and has no browser errors`, async ({ page }) => {
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize(viewport); await page.goto('/');
    await expect(panel(page)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await panel(page).getByRole('tab', { name: 'Game values' }).click();
    await expect(panel(page).getByLabel('Your gold')).toBeVisible();
    expect(errors).toEqual([]);
  });
}
