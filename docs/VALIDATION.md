# Validation record

Checked on **12 November 2026** on macOS, using Chromium **156.0.8078.4**. The browser version is recorded in [preview-check.json](../artifacts/preview-check.json); this is a local browser result, not Windows or ChromeOS certification.

## Passing checks

`npm test` passed **5 unit checks and 41 browser tests** with no skipped tests:

- All 28 mode adapters detect their own route in an actual React 18 controlled fixture. Visible answer matching and the offered value fields are checked for each mode. These are synthetic pages, not live Blooket games.
- Demo highlighting, single-answer automation, question changes, value updates, mode switching, Close and reopening work.
- The generated `javascript:` URL executes directly in the controlled browser. Duplicate launches focus one panel. The tests do not substitute `eval` for bookmarklet execution.
- Auto-answer clicks once per unchanged question. Stop All clears its timer and marks. Close removes the panel, style and event listeners. Submitted values are not silently reverted.
- Missing answer data and unknown routes disable answer tools. Hook-stored question data can be read in the fixture; hook-only values remain unavailable.
- Hidden, transparent, accessibility-hidden and disabled choices are excluded from answer matching and automation.
- Blank, negative, fractional and excessive values are rejected. Stale value forms cannot edit the previous mode after navigation.
- Keyboard tabs, arrow navigation, Home/End, Escape, coverage search, clipboard copying and the manual-copy fallback work.
- A restrictive CSP blocks the launcher; the implementation does not bypass it.
- Demo layouts fit 1366px, 768px and 390px viewports without horizontal page overflow or browser errors. A further 683 × 450 reflow check also passed. Viewport checks do not establish real browser zoom behaviour.
- The demo makes no external requests. The bundled runtime has no remote loader, fetch, cookie/storage access, eval or analytics call.

The separate preview script also opened `index.html` directly through `file://` and successfully used demo auto-answer. End users do not need the development server or Node.js for the included built mockup.

## Visual inspection

Desktop and mobile screenshots were captured and inspected. The quiz, highlighted choice, labels, panel tabs and Stop All control are readable, with the panel stacking below the quiz on narrow screens.

- [Desktop preview](../artifacts/desktop-demo.png)
- [Complete workspace](../artifacts/workspace-demo.png)
- [Mobile workspace](../artifacts/mobile-demo.png)
- [Full page](../artifacts/full-page.png)
- [Preview check details](../artifacts/preview-check.json)
- [Sanitized test summary](../artifacts/test-summary.json)

## Live entry check and remaining limits

The public `https://play.blooket.com/` entry request returned **HTTP 403** and a **“Just a moment...” browser challenge**. No game was joined, no account was signed in, and no live feature was tested. [Entry check details](../artifacts/live-entry-probe.json)

Current live, solo and homework games are therefore **not tested**, separately for every feature/context in [support.json](support.json). There is no server-accepted value result. Plus and seasonal modes were not accessed. Actual Chromebook hardware, school policies, Windows 11 Chrome/Edge and real browser zoom remain unverified.

## Reproduce

```sh
npm ci
npx playwright install chromium
npm test
```

For screenshots, start `npm start`, then run `node scripts/capture-preview.mjs` in another terminal. For the optional public entry-page check, use `node scripts/probe-live.mjs`; this never joins a game. Set `VIN_CHROMIUM_PATH` if using an existing compatible browser binary.

The test server binds only to loopback and refuses to reuse an existing preview process. It does not stop or change unrelated servers.
