import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import { MODES, CODE_SOURCE, MODE_SOURCE } from '../src/modes.js';

await mkdir('dist', { recursive: true });
const common = { bundle: true, format: 'iife', target: ['chrome110', 'edge110', 'safari16'], loader: { '.css': 'text' }, legalComments: 'none' };
const result = await build({ ...common, entryPoints: ['src/bookmarklet.js'], minify: true, write: false });
const code = result.outputFiles[0].text.trim();
const bookmarklet = `javascript:void ${encodeURIComponent(code)}`;
await writeFile('dist/v.i.n.c.e.n.t.js', code + '\n');
await writeFile('dist/bookmarklet.txt', bookmarklet + '\n');
await writeFile('dist/bookmarklet-data.js', `window.VIN_BOOKMARKLET = ${JSON.stringify(bookmarklet)};\n`);
await build({ ...common, entryPoints: ['src/demo.js'], outfile: 'dist/demo.js', minify: true });
await build({ ...common, entryPoints: ['tests/fixture-app.js'], outfile: 'tests/.generated/fixture.js', minify: true, define: { 'process.env.NODE_ENV': '"production"' } });

const sourceDate = '2026-11-12';
const feature = (method, result = 'not tested') => ({ method, source: CODE_SOURCE, researchedOn: sourceDate, testedOn: null, result });
const records = MODES.flatMap(mode => mode.contexts.map(context => ({
  mode: mode.name, id: mode.id, context, plus: !!mode.plus, seasonal: !!mode.seasonal,
  officialSource: MODE_SOURCE,
  routeEvidence: 'Candidate route names; current live detection has not been verified.',
  features: {
    highlight: feature('Read exposed correct-answer text or current React choice flags; mark matching visible answer elements.'),
    autoAnswer: feature('Click one matching visible answer per question, only when enabled.'),
    values: feature(mode.fields.length ? `Request local class state updates for observed keys: ${mode.fields.map(f => f.key).join(', ')}. No server acceptance claim.` : 'No researched value mapping implemented for this mode.', mode.fields.length ? 'not tested' : 'unsupported')
  },
  note: mode.fields.length ? 'Historical field names only. Live, solo and homework are separate unverified targets.' : 'Generic answer reader only. Value tools are unsupported in this release; this is not a claim about what Blooket permits.'
})));
for (const record of records) {
  if (record.id !== 'gold-quest' || record.context !== 'live') continue;
  record.routeEvidence = 'Native Safari check: Gold Quest mode-hosted URL detected. Session identifiers are not stored.';
  record.note = 'Tested Safari live layout: no usable correctness data before submission; correctness flags appeared after manual answer feedback. No class-state value fields were available.';
  for (const observed of Object.values(record.features)) {
    observed.result = 'unsupported'; observed.testedOn = sourceDate;
    observed.verificationSource = 'https://github.com/maxstelling/V.I.N.C.E.N.T/blob/main/docs/VALIDATION.md#safari-live-check';
  }
}
const answerPrompter = {
  method: 'Copy a visible question-set review into a local key; match question text, image, audio and unordered choices. Highlight only; no answer submission.',
  source: 'https://help.blooket.com/hc/en-us/articles/15984215236503-How-to-Host-a-Blooket-Game',
  reviewCapture: { result: 'working', testedOn: '2026-11-13', environment: 'Native macOS Safari, public review, 30 questions copied' },
  controlledGame: { result: 'working', testedOn: '2026-11-13', environment: 'Local Chromium, synthetic modern Gold Quest question layout' },
  liveGame: { result: 'not tested', testedOn: null, note: 'The previous authenticated Safari host session is locked. User confirmation is required before the next feature.' }
};
await writeFile('docs/support.json', JSON.stringify({ researchedOn: sourceDate, liveTestedOn: sourceDate, answerPrompter, records }, null, 2) + '\n');
const header = `# Support record\n\nResearch checked: ${sourceDate}. **The current Gold Quest live layout was checked in native Safari; other live modes and target-device OS tests remain untested.**\n\nThis table is generated from the mode catalog. It lists all ${MODES.length} named modes/variants, including Coco Cabana and Cocoa Cottage separately. Each available play context has its own record in [support.json](support.json). The source catalog is [Blooket’s official list](${MODE_SOURCE}).\n\n- **Working:** demonstrated in the named environment, with a test date.\n- **Screen-only:** observed locally without evidence of server acceptance.\n- **Unsupported:** no implementation in this release, or a runtime layout cannot be read.\n- **Not tested:** no current live result exists. A detected field is not a compatibility test.\n\nThe table below concerns live Blooket, not the local demo. Only the checked Gold Quest live record has a test date; other live test dates remain empty. Fixture results are recorded separately in [VALIDATION.md](VALIDATION.md).\n\n| Mode | Play contexts | Highlight / auto-answer | Value keys researched | Value result |\n|---|---|---|---|---|\n`;
const rows = MODES.map(m => `| ${m.name}${m.plus ? ' (Plus)' : ''}${m.seasonal ? ' (seasonal)' : ''} | ${m.contexts.join(', ')} | ${m.id === 'gold-quest' ? 'Unsupported in tested live layout' : 'Not tested / not tested'} | ${m.fields.map(f => f.key).join(', ') || 'None implemented'} | ${m.id === 'gold-quest' ? 'Unsupported in tested live layout' : m.fields.length ? 'Not tested' : 'Unsupported'} |`).join('\n');
const footer = `\n\n## Methods and evidence\n\nThe [historical source](${CODE_SOURCE}) contains generic answer readers and mode-specific local state writes. Candidate field names are taken from its corresponding mode sections, not guessed from a resource name. Cyber Hack uses historical Crypto Hack field names; this rename does not establish current compatibility. The newer and seasonal modes without mapped fields retain explicit unsupported value controls. The runtime does not expose another mode’s fields. Gold Quest mode-hosted detection was checked in native Safari. Other candidate routes require independent current-page verification.\n\nEach answer record references the generic historical method. For a mode absent from that source, this is a method to test, not evidence of that mode’s support. Current server rejection, missing answer data, image-only answers, hook-only values, hidden answers, unsupported URLs and changed React layouts disable features or stop automation. No endpoint replay, reward farming, player targeting or account changes are implemented.\n\n## Updating results\n\nRecord the exact mode, context, browser, operating system, feature, outcome and date after a controlled test. A server claim needs an independent host/server result; reading the same local state twice is insufficient. Keep Plus modes untested without access and seasonal modes untested while unavailable. Do not replace “not tested” with “working” based on the demo. Update the generator and evidence together so the next build preserves the record.\n`;
const prompterNote = '\n\n## Review-key answer prompter\n\nAdded 13 November 2026. Public review copying works in native Safari (30 questions). Exact matching and highlighting work in a controlled Chromium game fixture. **Live game prompting remains not tested**, pending user confirmation. These checks do not change the historical direct-reader results in the table above. See [the setup steps](ANSWER-PROMPTER.md). Auto-answer and value editing have not been expanded.\n';
await writeFile('docs/SUPPORT.md', header + rows + prompterNote + footer);
console.log(`Built ${MODES.length} mode adapters, ${records.length} context records, and a ${bookmarklet.length.toLocaleString()}-character bookmarklet.`);
