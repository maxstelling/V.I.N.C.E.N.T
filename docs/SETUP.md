# Chromebook and Windows 11 setup

## Try the mockup first

1. Download the repository ZIP and extract it.
2. Open `index.html` in Chrome or Edge. Built scripts are included. You do not need Node.js or a Blooket account.
3. Choose a preview mode and try the panel. The Demo badge means the questions and values are sample data.

The mockup does not control another tab or connect to Blooket.

## Save the launcher

1. Show the bookmarks bar with **Ctrl + Shift + B** in Chrome or Edge.
2. In the mockup’s Setup section, drag the **V.I.N.C.E.N.T** launcher to the bookmarks bar.
3. Alternatively, select **Copy bookmark address**, create or edit a bookmark, name it `V.I.N.C.E.N.T`, and paste the full copied address into its URL/address field.
4. If clipboard access is unavailable, the page shows a selected text box for manual copying. `dist/bookmarklet.txt` also contains the address.
5. Check the saved address begins with `javascript:` and is complete. Save it as a bookmark, rather than searching for it in the address bar.

The bookmarklet is self-contained. It does not fetch the newest code when opened; after updating this project, replace the saved bookmark with the new generated address.

## Personal Chromebook

Open the game in Chrome, then select the saved bookmark while that game tab is active. The panel should open with every tool off. Use Refresh data after entering a game or reaching a new screen. If no readable correct answers or supported numeric fields exist, the related controls are disabled or absent.

## School Chromebook

The same bookmark method may be allowed or blocked by your school’s settings. A normal demo page may work even if the bookmarklet does not. Ask the administrator about allowed tools when settings block it. This project does not bypass policies, developer-tool restrictions, extensions rules or filters.

Google documents how [managed Chrome can restrict features](https://support.google.com/chrome/answer/9281740) and how [Chromebook extensions are controlled](https://support.google.com/chromebook/answer/2588006). No extension is required by this project.

## Windows 11

Use current Chrome or Edge. Save the bookmark in that browser, open the game, then select the bookmark. There is no installer, EXE or Windows service. Edge’s [JavaScript console documentation](https://learn.microsoft.com/en-us/microsoft-edge/devtools/console/console-javascript) explains how browser scripts run; pasting code into DevTools is not required by this launcher.

## Safari on Mac

Open the updated local `index.html`. Select **Copy bookmark address**. In Safari’s bookmarks sidebar, right-click the saved V.I.N.C.E.N.T bookmark, choose **Edit Address**, replace the whole address with the copied address, and select Done. Then open the game tab and select the saved bookmark.

Current games can use a separate address such as `gold.blooket.com`, with the game and player identifiers in the path. The launcher now accepts Blooket subdomains and detects the mode from the game hostname. It still rejects lookalike domains. Updating the page or repository alone does not update an existing self-contained bookmark: replace its saved address after updates.

If Blooket reports **Disconnected** or **Failed to join**, rejoin an active game first. Opening the panel cannot restore an expired game session.

## Use and stop

- **Highlight answers** marks matching readable correct choices.
- **Auto-answer** selects one answer per question. It starts off and stops on a detected route change.
- **Game values** offers mapped numeric fields only. Apply requests a local state update; server acceptance remains unverified.
- **Stop All** clears highlights and timers. Values and answers already submitted remain.
- **Close** also removes the panel. Select the bookmark again to reopen it with tools off.
- **Refresh data** checks the current page again and turns all automation off.

## If it does not open

Check the active tab is a Blooket game and the saved address is complete. Browser policy, bookmark handling or the game page’s security rules may block `javascript:` execution or inline styles. Do not disable browser protections to make the panel work. Record the browser/version and the failure; use the mockup to inspect the interface meanwhile.

## Verification status

| Environment | Result |
|---|---|
| Local Chromium on macOS, controlled sample pages | See [validation record](VALIDATION.md) |
| Native Safari on Mac, Gold Quest live | Launcher and mode detection work; answer/value tools unsupported in the checked layout |
| Real Chromebook Chrome | Not tested: hardware unavailable |
| School-managed Chromebook | Not tested: managed device unavailable |
| Windows 11 Chrome | Not tested: OS unavailable |
| Windows 11 Edge | Not tested: OS unavailable |
| Other live Blooket modes and solo/homework variants | Not tested |

Browser viewport tests are layout checks, not proof of a physical Chromebook or Windows 11 installation. Blooket’s [terms](https://www.blooket.com/terms) prohibit unauthorized cheats and scripts.
