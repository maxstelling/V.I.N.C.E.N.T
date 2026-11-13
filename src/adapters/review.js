import { collectReactViews, questionFrom } from './react.js';
import { KEY_FORMAT, normalizeQuestion, parseAnswerKey } from '../answer-key.js';

export const isReviewPage = location => location.hostname === 'dashboard.blooket.com' && /^\/set\/[a-z0-9]+\/?$/i.test(location.pathname);

export function captureReviewKey(doc) {
  if (!isReviewPage(doc.location)) throw new Error('Open the question set’s review page first.');
  if ([...doc.querySelectorAll('button')].some(button => button.textContent.trim().toLowerCase() === 'show all answers')) {
    throw new Error('Select Show all answers on the review page, then copy the key.');
  }
  const records = [];
  const seen = new Set();
  for (const view of collectReactViews(doc)) {
    const found = questionFrom(view);
    if (!found || seen.has(found.object)) continue;
    seen.add(found.object);
    try { records.push({ ...normalizeQuestion(found.object), correctAnswers: found.correct }); }
    catch { /* Unsupported question types are reported by the count, not guessed. */ }
  }
  if (!records.length) throw new Error('No complete multiple-choice answers were found in this review.');
  return parseAnswerKey({ format: KEY_FORMAT, version: 1, title: doc.title.replace(/\s*\|\s*Blooket\s*$/, ''), questions: records });
}

export function createReviewAdapter(doc) {
  return {
    mode: { id: 'set-review', name: 'Question set review' }, review: true,
    detect: () => isReviewPage(doc.location),
    inspect: () => ({ question: null, targets: [], fields: [], reason: 'Show all answers, then copy this review’s answer key.', evidence: 'The copied key stays local. It contains question text, choices and media references, with no account or session data.' }),
    captureKey: () => captureReviewKey(doc)
  };
}
