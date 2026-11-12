import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import { MODES, CODE_SOURCE, MODE_SOURCE } from '../src/modes.js';

await mkdir('dist', { recursive: true });
const common = { bundle: true, format: 'iife', target: ['chrome110', 'edge110'], loader: { '.css': 'text' }, legalComments: 'none' };
const result = await build({ ...common, entryPoints: ['src/bookmarklet.js'], minify: true, write: false });
const code = result.outputFiles[0].text.trim();
const bookmarklet = `javascript:void ${encodeURIComponent(code)}`;
await writeFile('dist/vin-cent.js', code + '\n');
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
    highlight: feature('Read exposed correct-answer text; mark matching visible answer elements.'),
    autoAnswer: feature('Click one matching visible answer per question, only when enabled.'),
    values: feature(mode.fields.length ? `Request local class state updates for observed keys: ${mode.fields.map(f => f.key).join(', ')}. No server acceptance claim.` : 'No researched value mapping implemented for this mode.', mode.fields.length ? 'not tested' : 'unsupported')
  },
  note: mode.fields.length ? 'Historical field names only. Live, solo and homework are separate unverified targets.' : 'Generic answer reader only. Value tools are unsupported in this release; this is not a claim about what Blooket permits.'
})));
await writeFile('docs/support.json', JSON.stringify({ researchedOn: sourceDate, liveTestedOn: null, records }, null, 2) + '\n');
const header = `# Support record\n\nResearch checked: ${sourceDate}. **No authenticated live games or target-device OS tests were performed.**\n\nThis table is generated from the mode catalog. It lists all ${MODES.length} named modes/variants, including Coco Cabana and Cocoa Cottage separately. Each available play context has its own record in [support.json](support.json). The source catalog is [Blooket’s official list](${MODE_SOURCE}).\n\n- **Working:** demonstrated in the named environment, with a test date.\n- **Screen-only:** observed locally without evidence of server acceptance.\n- **Unsupported:** no implementation in this release, or a runtime layout cannot be read.\n- **Not tested:** no current live result exists. A detected field is not a compatibility test.\n\nThe table below concerns live Blooket, not the local demo. All live test dates are empty in the JSON record. Fixture results are recorded separately in [VALIDATION.md](VALIDATION.md).\n\n| Mode | Play contexts | Highlight / auto-answer | Value keys researched | Value result |\n|---|---|---|---|---|\n`;
const rows = MODES.map(m => `| ${m.name}${m.plus ? ' (Plus)' : ''}${m.seasonal ? ' (seasonal)' : ''} | ${m.contexts.join(', ')} | Not tested / not tested | ${m.fields.map(f => f.key).join(', ') || 'None implemented'} | ${m.fields.length ? 'Not tested' : 'Unsupported'} |`).join('\n');
const footer = `\n\n## Methods and evidence\n\nThe [historical source](${CODE_SOURCE}) contains generic answer readers and mode-specific local state writes. Candidate field names are taken from its corresponding mode sections, not guessed from a resource name. Cyber Hack uses historical Crypto Hack field names; this rename does not establish current compatibility. The newer and seasonal modes without mapped fields retain explicit unsupported value controls. The runtime does not expose another mode’s fields. Candidate routes require independent current-page verification.\n\nEach answer record references the generic historical method. For a mode absent from that source, this is a method to test, not evidence of that mode’s support. Current server rejection, missing answer data, image-only answers, hook-only values, hidden answers, unsupported URLs and changed React layouts disable features or stop automation. No endpoint replay, reward farming, player targeting or account changes are implemented.\n\n## Updating results\n\nRecord the exact mode, context, browser, operating system, feature, outcome and date after a controlled test. A server claim needs an independent host/server result; reading the same local state twice is insufficient. Keep Plus modes untested without access and seasonal modes untested while unavailable. Do not replace “not tested” with “working” based on the demo. Update the generator and evidence together so the next build preserves the record.\n`;
await writeFile('docs/SUPPORT.md', header + rows + footer);
console.log(`Built ${MODES.length} mode adapters, ${records.length} context records, and a ${bookmarklet.length.toLocaleString()}-character bookmarklet.`);
