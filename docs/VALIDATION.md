# Validation record

Checked on **12 November 2026** on macOS, using Chromium **156.0.8078.4**. The browser version is recorded in [preview-check.json](../artifacts/preview-check.json); this is a local browser result, not Windows or ChromeOS certification.

## Passing checks

`npm test` passed **6 unit checks and 44 browser tests** with no skipped tests:

- All 28 mode adapters detect their own route in an actual React 18 controlled fixture. Visible answer matching and the offered value fields are checked for each mode. These are synthetic pages, not live Blooket games.
- Demo highlighting, single-answer automation, question changes, value updates, mode switching, Close and reopening work.
- The generated `javascript:` URL executes directly in the controlled browser. Duplicate launches focus one panel. The tests do not substitute `eval` for bookmarklet execution.
- Mode-hosted URLs such as `gold.blooket.com/<game>/play/<player>` open the panel and select the Gold Quest adapter in the controlled fixture. Lookalike hostnames are rejected.
- Exposed modern choice flags follow React’s current tree across question changes. Feedback-only correctness leaves unanswered-choice automation disabled.
- Auto-answer clicks once per unchanged question. Stop All clears its timer and marks. Close removes the panel, style and event listeners. Submitted values are not silently reverted.
- Missing answer data and unknown routes disable answer tools. Hook-stored question data can be read in the fixture; hook-only values remain unavailable.
- Hidden, transparent, accessibility-hidden and disabled choices are excluded from answer matching and automation.
- Blank, negative, fractional and excessive values are rejected. Stale value forms cannot edit the previous mode after navigation.
- Keyboard tabs, arrow navigation, Home/End, Escape, coverage search, clipboard copying and the manual-copy fallback work.
- A restrictive CSP blocks the launcher; the implementation does not bypass it.
- Demo layouts fit 1366px, 768px and 390px viewports without horizontal page overflow or browser errors. A further 683 × 450 reflow check also passed. Viewport checks do not establish real browser zoom behaviour.
- The demo makes no external requests. The bundled runtime has no remote loader, fetch, cookie/storage access, eval or analytics call.

The separate preview script also opened `index.html` directly through `file://` and successfully used demo auto-answer. End users do not need the development server or Node.js for the included built mockup.

## Safari launcher fix

The saved bookmark was checked in native Safari. It incorrectly rejected the real `gold.blooket.com` game host because it allowed only the main and play hosts. Host checks and mode detection now support Blooket’s mode subdomains, and the build also targets Safari 16 syntax.

The corrected address was saved into the existing Safari bookmark. Selecting it visibly opened the V.I.N.C.E.N.T panel and displayed **Gold Quest**. No game/player identifiers, account data or private screenshots are included in the repository.

## Safari live check

A controlled single-player Gold Quest game was joined in native Safari. Before submitting an answer, the inspected question contained text, choices and media metadata, but no readable correct-answer list. Every inspected choice correctness flag was false. A manual answer was accepted by the game and displayed **CORRECT**. After that response, correctness flags became available and feedback contained `correctAnswers`; the answer buttons were already disabled. V.I.N.C.E.N.T did not select that manual answer.

Answer highlighting and auto-answer are therefore **unsupported in this checked live layout**. The new reader can use current per-choice React correctness flags only when they are actually exposed for an unanswered visible choice. It never assumes an all-false set identifies a correct answer or treats feedback for an answered question as a future answer. Controlled tests cover these cases and React alternate-tree changes.

The current game had no class components with mapped numeric state. Its Gold editor is also **unsupported**; no value update or server-accepted value change was performed. Other modes and solo/homework variants remain untested. The Support tab includes a read-only page-layout check that reports field names and counts, without exporting question text, player identifiers, credentials or session values.

Earlier host and player sessions both reported **Disconnected, Error Code: 4000** and later **Failed to join, Error Code: 404**. A replacement controlled game was used for the check above. These connection failures were observed; their cause was not established.

## Visual inspection

Desktop and mobile screenshots were captured and inspected. The quiz, highlighted choice, labels, panel tabs and Stop All control are readable, with the panel stacking below the quiz on narrow screens.

- [Desktop preview](../artifacts/desktop-demo.png)
- [Complete workspace](../artifacts/workspace-demo.png)
- [Mobile workspace](../artifacts/mobile-demo.png)
- [Full page](../artifacts/full-page.png)
- [Preview check details](../artifacts/preview-check.json)
- [Sanitized test summary](../artifacts/test-summary.json)

## Live entry check and remaining limits

The earlier automated public `https://play.blooket.com/` entry request returned **HTTP 403** and a **“Just a moment...” browser challenge**. That probe did not join a game or test live tools. The later native Safari check is recorded above. [Earlier entry check details](../artifacts/live-entry-probe.json)

The Gold Quest live record is marked **unsupported in the tested layout** in [support.json](support.json). All other live, solo and homework records remain untested. There is no server-accepted value result. Plus and seasonal modes were not accessed. Actual Chromebook hardware, school policies, Windows 11 Chrome/Edge and real browser zoom remain unverified.

## Reproduce

```sh
npm ci
npx playwright install chromium
npm test
```

For screenshots, start `npm start`, then run `node scripts/capture-preview.mjs` in another terminal. For the optional public entry-page check, use `node scripts/probe-live.mjs`; this never joins a game. Set `VIN_CHROMIUM_PATH` if using an existing compatible browser binary.

The test server binds only to loopback and refuses to reuse an existing preview process. It does not stop or change unrelated servers.
