# Chromebook and Windows 11 setup

## Try the mockup first

1. Download the repository ZIP and extract it.
2. Open `index.html` in Chrome or Edge. Built scripts are included. You do not need Node.js or a Blooket account.
3. Choose a preview mode and try the panel. The Demo badge means the questions and values are sample data.

The mockup does not control another tab or connect to Blooket.

## Save the launcher

1. Show the bookmarks bar with **Ctrl + Shift + B** in Chrome or Edge.
2. In the mockup’s Setup section, drag the **V.I.N CENT** launcher to the bookmarks bar.
3. Alternatively, select **Copy bookmark address**, create or edit a bookmark, name it `V.I.N CENT`, and paste the full copied address into its URL/address field.
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
| Real Chromebook Chrome | Not tested: hardware unavailable |
| School-managed Chromebook | Not tested: managed device unavailable |
| Windows 11 Chrome | Not tested: OS unavailable |
| Windows 11 Edge | Not tested: OS unavailable |
| Current authenticated Blooket game | Not tested: no controlled signed-in session provided |

Browser viewport tests are layout checks, not proof of a physical Chromebook or Windows 11 installation. Blooket’s [terms](https://www.blooket.com/terms) prohibit unauthorized cheats and scripts.
