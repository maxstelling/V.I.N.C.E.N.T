import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KEY_FORMAT, MAX_KEY_LENGTH, parseAnswerKey, matchAnswerKey } from '../src/answer-key.js';

const question = (image, correctAnswers = ['Alpha']) => ({ prompt: 'Which animal?', image, answers: ['Alpha', 'Beta'], correctAnswers });
const bank = questions => ({ format: KEY_FORMAT, version: 1, questions });

test('reordered choices match the same question and correct answer text', () => {
  const key = parseAnswerKey(bank([question('https://example.invalid/one.png')]));
  assert.deepEqual(matchAnswerKey(key, { text: 'Which animal?', image: 'https://example.invalid/one.png', answers: ['Beta', 'Alpha'] }).correctAnswers, ['Alpha']);
});
test('identical wording and choices are distinguished by picture and audio', () => {
  const first = question('https://example.invalid/one.png');
  const second = question('https://example.invalid/two.png', ['Beta']);
  const key = parseAnswerKey(bank([first, second]));
  assert.deepEqual(matchAnswerKey(key, second).correctAnswers, ['Beta']);
  assert.equal(matchAnswerKey(key, { ...first, image: 'https://example.invalid/three.png' }), null);
  assert.equal(matchAnswerKey(key, { ...first, image: '' }), null);
  assert.equal(matchAnswerKey(key, { ...first, audio: 'https://example.invalid/clip.mp3' }), null);
  assert.equal(matchAnswerKey(key, { ...first, prompt: 'Which animal is this?' }), null);
});
test('conflicting keys and unknown correct choices fail closed', () => {
  assert.throws(() => parseAnswerKey(bank([question(''), question('', ['Beta'])])), /disagree/);
  assert.throws(() => parseAnswerKey(bank([question('', ['Gamma'])])), /missing/);
  assert.throws(() => parseAnswerKey(bank([{ ...question(''), answers: ['Alpha', 'Alpha'] }])), /duplicate/);
  assert.equal(parseAnswerKey(bank([question(''), question('')])).questions.length, 1);
});
test('malformed, oversized and executable input is rejected without evaluation', () => {
  for (const input of ['alert(1)', '{}', '{', 'x'.repeat(MAX_KEY_LENGTH + 1)]) assert.throws(() => parseAnswerKey(input));
  assert.throws(() => parseAnswerKey(bank([question('javascript:alert(1)')])), /media address/);
  assert.throws(() => parseAnswerKey(bank([question('https://name:password@example.invalid/image.png')])), /media address/);
});
test('only question data is kept; blank media and multiple correct answers work', () => {
  const key = parseAnswerKey({ ...bank([{ ...question(null, ['Alpha', 'Beta']), sessionId: 'not-kept' }]), account: 'not-kept' });
  assert.deepEqual(key.questions[0].correctAnswers, ['Alpha', 'Beta']);
  assert.equal(key.questions[0].image, '');
  assert.ok(!JSON.stringify(key).includes('not-kept'));
});
