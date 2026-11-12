# How Blooket browser scripts work

Research date: **12 November 2026**. These are static source observations, not proof that an old script works on the current service.

## Four common methods

1. **Read data already in the page.** Some quiz clients hold the current question and correct-answer text in browser memory. If those answers are available, a script can match them to visible choices. It cannot reliably invent missing answers.
2. **Change page elements.** A script can mark an answer or change displayed text. A display change alone says nothing about the server’s records.
3. **Change React state.** Some older implementations expose class components and numeric game state. Updating that state can change the local game. React’s private layout is not a stable API.
4. **Use game functions or requests.** Historical scripts also invoke the client’s game controller or make requests. Authentication, server validation and current game rules decide whether such changes are accepted. This project does not replay those requests or claim server writes.

The [inspected historical script](https://github.com/LiL-Zapped/Blooket-GUI/blob/5a276104a8acf1c253e7b6ada075ad5074e491b8/The%20Cheats) demonstrates these approaches. It was inspected as text, never executed or imported. Its SHA-256 at inspection was `84f5cb0077a12927cfcc9ba8ff8525af428533b1d39b7e784f5d38c4f5e0161e`. The file also contains outbound logging and global function changes; those are not part of this implementation. No third-party cheat code is copied into this repository.

## What V.I.N.C.E.N.T implements

The bookmarklet runs inside the current game tab. It looks for React attachments on a bounded number of page elements and reads only known question shapes and explicitly mapped numeric fields. There is one adapter instance per catalogued mode, sharing the common reader. The panel itself uses a Shadow DOM so its styles and controls do not clash with the game.

Answer highlighting marks matching visible choices. Auto-answer clicks one readable correct choice per question key, only after the user switches it on. It pauses when no answer can be matched and stops on a route change or reader error. It does not answer image-only questions, guess answers, call hidden answer methods, or repeatedly click the same unchanged question. Identical consecutive questions without a distinct question index may be skipped rather than clicked twice.

Value controls exist only for mapped finite numbers found directly on a React class component’s local state. A functional state update requests the new value; a message explicitly says server acceptance is unverified. There is no edit to another player’s data, account rewards, inventory, passwords, tokens or session storage. Hook-only value state is unsupported. Missing fields never produce pretend controls.

Stop All removes the panel’s answer marks and clears its automation timer. Close also removes its style, panel and event listeners. Neither operation undoes a click or value update already sent through the game. No game functions or browser prototypes are patched.

## Every current mode

The catalog follows [Blooket’s official mode previews](https://help.blooket.com/hc/en-us/articles/21408591795351-Blooket-Game-Mode-Previews), with separate entries for Coco Cabana and Cocoa Cottage. It includes Plus, solo/homework and seasonal modes. Historical names such as Crypto Hack are recorded as aliases of the current Cyber Hack label; a rename does not prove unchanged internals.

[SUPPORT.md](SUPPORT.md) lists every mode and field mapping. [support.json](support.json) has a separate record for each mode’s published live, solo or homework context. Older code names are research leads; candidate URL names still need current-page verification. The newer modes have no assumed numeric field mapping. Modes absent from the historical script use the generic answer reader as an unverified candidate, not as evidence that answers are exposed.

## Why the launcher must run in the game tab

A bookmarklet is a saved `javascript:` URL. The browser executes it against the active page when allowed. A separate mockup website cannot directly read another site’s tab because of the [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy). A browser extension is another possible delivery method, but it adds installation and permissions and is outside this release. Extension scripts also have [separate execution worlds](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts), so copying a page script into an extension does not guarantee access to the same variables.

The generated bookmarklet contains its runtime and styles. It has no remote loader, `eval`, credential reader or outbound logging. Browser policy and a site’s Content Security Policy can still block [javascript: URLs](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/javascript). Its roughly 26 KB address needs real target-browser testing; source size alone does not establish a browser limit or compatibility.

## Blooket’s rules

Blooket’s [Terms of Service](https://www.blooket.com/terms), checked on the research date, prohibit unauthorized cheats, bots and modifications. The project documents that restriction and makes no claim that publishing or using these tools is approved by Blooket.

## Evidence needed before claiming support

- Run the exact generated bookmarklet in a controlled game and record the browser, OS, mode and context.
- Check visible results separately from local state and independent host/server results.
- Stop if the layout cannot be read. Record the limitation instead of silently falling back to guesses.
- Keep unavailable Plus and seasonal modes untested. Recheck after site updates.
- Do not publish session data, real player names, cookies, screenshots of private games or credentials as evidence.

No current live game has been tested. Controlled fixture tests establish the implementation’s behaviour only.
