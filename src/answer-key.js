// An answer key is local data, never executable code or a network request.
export const KEY_FORMAT = 'vincent-answer-key';
export const MAX_KEY_LENGTH = 1_000_000;
export const normalizeText = value => String(value).normalize('NFC').replace(/\s+/g, ' ').trim();

export function mediaIdentity(value) {
  if (value == null || value === false || value === '' || (Array.isArray(value) && !value.length)) return '';
  if (typeof value === 'object') value = value.url ?? value.src;
  if (typeof value !== 'string' || value.length > 20_000) throw new Error('Unsupported question media.');
  if (!value.trim()) return '';
  const url = new URL(value, 'https://dashboard.blooket.com');
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Unsupported question media address.');
  url.hash = ''; url.searchParams.sort();
  return url.href;
}

function textList(value, label, min, max) {
  if (!Array.isArray(value) || value.length < min || value.length > max || value.some(item => typeof item !== 'string' || !normalizeText(item) || item.length > 10_000)) {
    throw new Error(`${label} must contain ${min} to ${max} non-empty text choices.`);
  }
  const normalized = value.map(normalizeText);
  if (new Set(normalized).size !== normalized.length) throw new Error(`${label} contains duplicate choices.`);
  return normalized;
}

export function normalizeQuestion(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid question.');
  const prompt = raw.prompt ?? raw.text ?? raw.question;
  if (typeof prompt !== 'string' || !normalizeText(prompt) || prompt.length > 10_000) throw new Error('A question needs text.');
  return { prompt: normalizeText(prompt), answers: textList(raw.answers, 'Answers', 2, 8),
    image: mediaIdentity(raw.image), audio: mediaIdentity(raw.audio) };
}

export function questionIdentity(question) {
  const normalized = normalizeQuestion(question);
  return JSON.stringify([normalized.prompt, normalized.image, normalized.audio, [...normalized.answers].sort()]);
}

export function parseAnswerKey(input) {
  const text = typeof input === 'string' ? input : JSON.stringify(input);
  if (typeof text !== 'string' || text.length > MAX_KEY_LENGTH) throw new Error('The answer key is too large (maximum 1 MB).');
  let raw;
  try { raw = JSON.parse(text); } catch { throw new Error('Paste a complete V.I.N.C.E.N.T answer key.'); }
  if (raw?.format !== KEY_FORMAT || raw.version !== 1 || !Array.isArray(raw.questions) || !raw.questions.length || raw.questions.length > 1000) {
    throw new Error('Use a V.I.N.C.E.N.T answer key with 1 to 1000 questions.');
  }
  const unique = new Map();
  for (const entry of raw.questions) {
    const question = normalizeQuestion(entry);
    const correctAnswers = textList(entry.correctAnswers, 'Correct answers', 1, question.answers.length);
    if (correctAnswers.some(answer => !question.answers.includes(answer))) throw new Error('A correct answer is missing from its question choices.');
    const key = questionIdentity(question);
    const previous = unique.get(key);
    if (previous && JSON.stringify([...previous.correctAnswers].sort()) !== JSON.stringify([...correctAnswers].sort())) {
      throw new Error('Two identical questions disagree about the correct answer.');
    }
    unique.set(key, { ...question, correctAnswers });
  }
  return { format: KEY_FORMAT, version: 1, title: typeof raw.title === 'string' ? raw.title.slice(0, 200) : 'Answer key', questions: [...unique.values()] };
}

export function matchAnswerKey(key, question) {
  if (!key) return null;
  let identity;
  try { identity = questionIdentity(question); } catch { return null; }
  return key.questions.find(record => questionIdentity(record) === identity) ?? null;
}
