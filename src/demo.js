import { launch } from './runtime.js';
import { MODES, validateValue } from './modes.js';

const $ = selector => document.querySelector(selector);
const questions = [
  { question: 'Which part of a website handles its appearance?', answers: ['HTML', 'CSS', 'JavaScript', 'A database'], correctAnswers: ['CSS'] },
  { question: 'Where does a bookmarklet run?', answers: ['In the current page', 'On a remote server', 'Inside Windows settings', 'In a spreadsheet'], correctAnswers: ['In the current page'] },
  { question: 'Does a local value change prove the server accepted it?', answers: ['Always', 'Only on Fridays', 'No', 'Only in dark mode'], correctAnswers: ['No'] }
];
let mode = MODES.find(m => m.id === 'gold-quest');
let index = 0;
let values = {};
const adapter = {
  get mode() { return mode; },
  detect: () => true,
  inspect() {
    const question = questions[index % questions.length];
    return {
      question: { key: String(index), correct: question.correctAnswers },
      targets: [...document.querySelectorAll('[data-vin-answer]')].filter(el => question.correctAnswers.includes(el.dataset.answer)),
      fields: mode.fields.map(spec => ({ ...spec, value: values[spec.key] })),
      reason: '', evidence: 'Demo adapter. Sample interactions only; this is not a live Blooket test.'
    };
  },
  setValue(field, raw) {
    values[field.key] = validateValue(raw, field); renderScore();
    return 'Demo value changed. No Blooket data was accessed.';
  }
};

function openPanel() {
  launch({ adapter, demo: true, mount: $('#demo-panel') });
  $('#reopen-panel').hidden = true;
}
function renderScore() {
  $('#demo-score').textContent = mode.fields.length ? mode.fields.map(f => `${f.label} · ${values[f.key].toLocaleString()}`).join(' / ') : 'No value tool in this version';
}
function renderQuestion() {
  const question = questions[index % questions.length];
  $('#question-number').textContent = String(index + 1).padStart(2, '0');
  $('#question-text').textContent = question.question;
  $('#demo-feedback').textContent = 'Your next move is up to you.';
  $('#demo-answers').replaceChildren(...question.answers.map((answer, i) => {
    const button = document.createElement('button'); button.className = 'answer';
    button.setAttribute('data-vin-answer', ''); button.dataset.answer = answer;
    const choice = document.createElement('span'); choice.className = 'choice'; choice.textContent = String.fromCharCode(65 + i); choice.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span'); text.textContent = answer;
    button.append(choice, text);
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-vin-answer]').forEach(el => { el.removeAttribute('data-selected'); el.setAttribute('aria-pressed', 'false'); });
      button.dataset.selected = 'true'; button.setAttribute('aria-pressed', 'true');
      $('#demo-feedback').textContent = question.correctAnswers.includes(answer) ? 'Correct. That’s the idea.' : 'Try another answer.';
    });
    return button;
  }));
}

$('#demo-mode').replaceChildren(...MODES.map(m => {
  const option = document.createElement('option'); option.value = m.id; option.textContent = m.name; option.selected = m.id === mode.id; return option;
}));
function resetValues() { values = Object.fromEntries(mode.fields.map(f => [f.key, Math.min(f.max, 250)])); renderScore(); }
$('#demo-mode').addEventListener('change', () => {
  window.__VIN_CENT_PANEL__?.close();
  mode = MODES.find(m => m.id === $('#demo-mode').value); resetValues(); renderQuestion(); openPanel();
});
$('#next-question').addEventListener('click', () => { index++; renderQuestion(); });
$('#reopen-panel').addEventListener('click', openPanel);
new MutationObserver(() => { $('#reopen-panel').hidden = !!document.querySelector('#vin-cent-panel'); }).observe($('#demo-panel'), { childList: true });

function renderCoverage() {
  const query = $('#mode-search').value.trim().toLowerCase();
  const filtered = MODES.filter(m => `${m.name} ${m.legacy ?? ''}`.toLowerCase().includes(query));
  $('#coverage-rows').replaceChildren(...filtered.map(m => {
    const row = document.createElement('tr');
    const title = document.createElement('td'); title.textContent = m.name;
    if (m.plus || m.seasonal) { const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = m.plus ? 'Plus' : 'Seasonal'; title.append(tag); }
    row.append(title);
    for (const value of [m.contexts.join(' / '), m.id === 'gold-quest' ? 'Unsupported in checked live layout' : 'Not tested', m.id === 'gold-quest' ? 'Unsupported in checked live layout' : m.fields.length ? 'Not tested' : 'Unsupported in v1']) {
      const cell = document.createElement('td'); cell.textContent = value; row.append(cell);
    }
    return row;
  }));
  $('#mode-count').textContent = `${MODES.length} named modes / variants`;
  $('#search-count').textContent = `${filtered.length} of ${MODES.length} shown`;
}
$('#mode-search').addEventListener('input', renderCoverage);
const address = window.VIN_BOOKMARKLET;
$('#bookmarklet-link').href = address;
$('#bookmarklet-link').addEventListener('click', event => { event.preventDefault(); $('#copy-status').textContent = 'Drag this button to the bookmarks bar, or use Copy bookmark address. Run it from a Blooket game tab.'; });
$('#copy-bookmarklet').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(address); $('#copy-status').textContent = 'Copied. Paste into a bookmark’s URL field.'; }
  catch {
    let box = $('#manual-bookmarklet');
    if (!box) { box = document.createElement('textarea'); box.id = 'manual-bookmarklet'; box.setAttribute('aria-label', 'Bookmark address to copy'); box.readOnly = true; box.style.cssText = 'width:100%;height:90px;margin-top:12px'; $('#copy-status').after(box); }
    box.value = address; box.focus(); box.select(); $('#copy-status').textContent = 'Copy the selected address, then paste it into a bookmark’s URL field.';
  }
});
resetValues(); renderQuestion(); renderCoverage(); openPanel();
