# V.I.N.C.E.N.T answer prompter

Completed scope: answer-key capture, exact matching and prompting. The next feature was not started. Live-game confirmation is still pending.

## What changed

The current Gold Quest layout does not provide readable correct answers before submission. The prompter now uses a local key copied from the same question set’s visible review. It matches text, picture, audio and the complete unordered choice list. Unknown questions stay unmarked. It never guesses or submits an answer through this key path.

The panel adds Copy review answer key, Load key, Clear key and a text hint. All tools start off. Auto-answer is disabled while a key is loaded. Stop All clears prompts and timers; Close also clears the key. Keys stay in memory and are not uploaded or stored. Copied text stays on the clipboard until replaced.

## Evidence

- 13 November 2026: saved Safari School bookmark updated and opened on a public review. It copied all 30 questions after Show all answers. No real key or question bank was saved in this repository.
- All 11 unit checks and 46 controlled browser tests passed. These cover matching, picture changes, shuffled choices, unknown questions, no answer clicks, Stop All, malformed keys and existing regressions.
- Desktop, mobile and direct-file demo preview checks passed. These are macOS Chromium checks, not Chromebook or Windows hardware results.
- The previous authenticated Safari host session is locked. No current native live game could be reused unattended. Live-game prompting remains untested. No browser or authentication protection was changed.

## Delivery

HTML, CSS and JavaScript changes are stored on the external volume in `/Volumes/CodexWork/V.I.N.C.E.N.T`. Source, bundled bookmarklet, setup, research, support results and tests are included. No paid service or new account was used.

Public repository: https://github.com/maxstelling/V.I.N.C.E.N.T

## Your check

1. On the same question set’s review, select Show all answers.
2. Open the updated bookmark and select Copy review answer key.
3. In your active game, open the bookmark, paste into Answer key, and select Load key.
4. Turn on Highlight answers. Check that the text hint and blue outline identify the correct answer across several questions.

[Full guide](docs/ANSWER-PROMPTER.md). Once you confirm that live prompting works, the next feature can begin. Auto-answer and Gold editing were left at their previous support status.

## Follow-up: shareable key in the GUI

The copied key now appears immediately in a labelled read-only box. Download key (.json) saves the same full key for manual distribution. No upload or message is sent. Closing the panel or changing pages clears the visible export and releases its download URL.

All 11 unit checks and 47 browser tests passed. Tests compare the downloaded file with the clipboard and visible key, and check blocked clipboard access. The Safari saved bookmark was not replaced in this follow-up because the user changed the active window during the update attempt. The new controls require replacing the older saved address from the local Setup page.

The later question about working without a key was answered: the checked Gold Quest layout does not expose correctness before submission. No AI service, paid API, backend or alternative answer source was added.
