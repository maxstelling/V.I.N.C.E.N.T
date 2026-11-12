import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODES, detectMode, validateValue } from '../src/modes.js';
import { questionFrom } from '../src/adapters/react.js';
import { adapterCatalog } from '../src/adapters/index.js';
import { readFile } from 'node:fs/promises';

test('official catalog has unique entries, all current named variants and separate contexts', () => {
  assert.equal(MODES.length, 28);
  assert.equal(new Set(MODES.map(m => m.id)).size, 28);
  assert.equal(adapterCatalog.length, 28);
  for (const name of ['Busy Bees', 'Coco Cabana', 'Cocoa Cottage', 'Cyber Hack', 'Pirate Pool', 'Plushie Panic', 'Study', 'Zorblitz', 'Egg Hunt', 'Tag or Treat']) assert.ok(MODES.some(m => m.name === name));
  assert.deepEqual(MODES.find(m => m.id === 'factory').contexts, ['live', 'solo', 'homework']);
  assert.deepEqual(MODES.find(m => m.id === 'pirate-pool').contexts, ['solo', 'homework']);
});
test('route matching respects mode boundaries and rejects unrelated pages', () => {
  assert.equal(detectMode('/play/defense2').id, 'tower-defense-2');
  assert.equal(detectMode('/play/defense').id, 'tower-defense');
  assert.equal(detectMode('/factory-solo').id, 'factory');
  assert.equal(detectMode('/play/homework/cafe').id, 'cafe');
  for (const path of ['/', '/play', '/settings', '/set/gold', '/play/gold-unrelated', '/random/path/factory', '/play/gold/extra']) assert.equal(detectMode(path), null);
});
test('value validation rejects blank, infinite, unsafe, fractional and out-of-range values', () => {
  const field = { min: 0, max: 5 };
  for (const value of ['', ' ', 'no', 'Infinity', '-1', '1.5', '6', '9007199254740992']) assert.throws(() => validateValue(value, field));
  assert.equal(validateValue('0', field), 0);
  assert.equal(validateValue('5', field), 5);
});
test('question reader requires explicit answer data and supports class and hook shapes', () => {
  assert.equal(questionFrom({ state: { question: { question: 'Q', answers: ['A'] } }, props: {} }), null);
  assert.equal(questionFrom({ state: { question: { question: 'Q', correctAnswers: [{}] } }, props: {} }), null);
  assert.deepEqual(questionFrom({ state: { question: { question: 'Q', correctAnswers: ['A'] } }, props: {} }).correct, ['A']);
  assert.deepEqual(questionFrom({ state: { question: 'Hook Q', correctAnswers: ['A'] }, props: {} })?.correct, ['A']);
  assert.deepEqual(questionFrom({ state: {}, props: { client: { question: { question: 'Client Q', correctAnswer: 'A' } } } }).correct, ['A']);
});
test('build contains self-contained runtime and preserves untested live evidence', async () => {
  const bookmarklet = (await readFile('dist/bookmarklet.txt', 'utf8')).trim();
  assert.ok(bookmarklet.startsWith('javascript:void '));
  const source = decodeURIComponent(bookmarklet.slice('javascript:void '.length));
  assert.doesNotThrow(() => new Function(source));
  assert.doesNotMatch(source, /\beval\(|\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|document\.cookie|localStorage/);
  assert.doesNotMatch(source, /sourceMappingURL/);
  const support = JSON.parse(await readFile('docs/support.json', 'utf8'));
  assert.equal(support.liveTestedOn, null);
  for (const record of support.records) {
    assert.ok(['live', 'solo', 'homework'].includes(record.context));
    for (const feature of Object.values(record.features)) {
      assert.equal(feature.testedOn, null);
      assert.ok(['not tested', 'unsupported'].includes(feature.result));
      assert.ok(feature.source.startsWith('https://github.com/'));
    }
  }
});
