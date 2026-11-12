# Support record

Research checked: 2026-11-12. **The current Gold Quest live layout was checked in native Safari; other live modes and target-device OS tests remain untested.**

This table is generated from the mode catalog. It lists all 28 named modes/variants, including Coco Cabana and Cocoa Cottage separately. Each available play context has its own record in [support.json](support.json). The source catalog is [Blooket’s official list](https://help.blooket.com/hc/en-us/articles/21408591795351-Blooket-Game-Mode-Previews).

- **Working:** demonstrated in the named environment, with a test date.
- **Screen-only:** observed locally without evidence of server acceptance.
- **Unsupported:** no implementation in this release, or a runtime layout cannot be read.
- **Not tested:** no current live result exists. A detected field is not a compatibility test.

The table below concerns live Blooket, not the local demo. Only the checked Gold Quest live record has a test date; other live test dates remain empty. Fixture results are recorded separately in [VALIDATION.md](VALIDATION.md).

| Mode | Play contexts | Highlight / auto-answer | Value keys researched | Value result |
|---|---|---|---|---|
| Battle Royale | live | Not tested / not tested | None implemented | Unsupported |
| Blook Rush | live | Not tested / not tested | numBlooks, numDefense | Not tested |
| Busy Bees (Plus) | live | Not tested / not tested | None implemented | Unsupported |
| Classic | live | Not tested / not tested | None implemented | Unsupported |
| Coco Cabana (Plus) | live | Not tested / not tested | None implemented | Unsupported |
| Cocoa Cottage (Plus) | live | Not tested / not tested | None implemented | Unsupported |
| Crazy Kingdom | solo, homework | Not tested / not tested | guestScore | Not tested |
| Cyber Hack | live | Not tested / not tested | crypto | Not tested |
| Deceptive Dinos | live | Not tested / not tested | fossils, fossilMult | Not tested |
| Café | live, solo, homework | Not tested / not tested | cafeCash | Not tested |
| Factory | live, solo, homework | Not tested / not tested | cash | Not tested |
| Fishing Frenzy | live, solo, homework | Not tested / not tested | weight, lure | Not tested |
| Gold Quest | live | Unsupported in tested live layout | gold | Unsupported in tested live layout |
| Laser Tag (Plus) | live | Not tested / not tested | None implemented | Unsupported |
| Mini Mine (Plus) | live | Not tested / not tested | None implemented | Unsupported |
| Monster Brawl | live, solo, homework | Not tested / not tested | level | Not tested |
| Pirate Pool | solo, homework | Not tested / not tested | None implemented | Unsupported |
| Plushie Panic | solo, homework | Not tested / not tested | None implemented | Unsupported |
| Racing | live | Not tested / not tested | progress | Not tested |
| Star Grazer (Plus) | live | Not tested / not tested | None implemented | Unsupported |
| Study | solo, homework | Not tested / not tested | None implemented | Unsupported |
| Tower Defense | live, solo, homework | Not tested / not tested | tokens, round | Not tested |
| Tower Defense 2 | live, solo, homework | Not tested / not tested | coins, health, round | Not tested |
| Zorblitz | solo, homework | Not tested / not tested | None implemented | Unsupported |
| Candy Quest (seasonal) | live | Not tested / not tested | None implemented | Unsupported |
| Santa’s Workshop (seasonal) | live | Not tested / not tested | toys, toysPerQ | Not tested |
| Egg Hunt (seasonal) | live | Not tested / not tested | None implemented | Unsupported |
| Tag or Treat (seasonal) | live | Not tested / not tested | None implemented | Unsupported |

## Methods and evidence

The [historical source](https://github.com/LiL-Zapped/Blooket-GUI/blob/main/The%20Cheats) contains generic answer readers and mode-specific local state writes. Candidate field names are taken from its corresponding mode sections, not guessed from a resource name. Cyber Hack uses historical Crypto Hack field names; this rename does not establish current compatibility. The newer and seasonal modes without mapped fields retain explicit unsupported value controls. The runtime does not expose another mode’s fields. Gold Quest mode-hosted detection was checked in native Safari. Other candidate routes require independent current-page verification.

Each answer record references the generic historical method. For a mode absent from that source, this is a method to test, not evidence of that mode’s support. Current server rejection, missing answer data, image-only answers, hook-only values, hidden answers, unsupported URLs and changed React layouts disable features or stop automation. No endpoint replay, reward farming, player targeting or account changes are implemented.

## Updating results

Record the exact mode, context, browser, operating system, feature, outcome and date after a controlled test. A server claim needs an independent host/server result; reading the same local state twice is insufficient. Keep Plus modes untested without access and seasonal modes untested while unavailable. Do not replace “not tested” with “working” based on the demo. Update the generator and evidence together so the next build preserves the record.
