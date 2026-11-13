import panelCSS from './panel.css';
import { createLiveAdapter } from './adapters/index.js';
import { isBlooketHost } from './modes.js';

const INSTANCE = '__VIN_CENT_PANEL__';
const MARK = 'data-vin-cent-highlight';

export function launch({ adapter: suppliedAdapter, demo = false, mount = null } = {}) {
  if (window[INSTANCE]) { window[INSTANCE].focus(); return window[INSTANCE]; }
  if (!demo && !isBlooketHost(location.hostname)) {
    window.alert('Open a Blooket game before using V.I.N.C.E.N.T. The separate demo uses sample data.');
    return null;
  }
  const previousFocus = document.activeElement;
  const host = document.createElement('div');
  host.id = 'vin-cent-panel';
  host.style.cssText = 'position:relative;z-index:2147483646';
  if (mount) host.setAttribute('data-inline', '');
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>${panelCSS}</style>
    <section class="panel" role="dialog" aria-modal="false" aria-labelledby="vin-title">
      <header><div class="heading"><h2 id="vin-title">V.I.N.C.E.N.T</h2><button class="close" aria-label="Close panel">Close</button></div>
      <p class="subtitle"><span class="badge"></span><span class="mode"></span></p></header>
      <nav class="tabs" role="tablist" aria-label="Tool sections">
        <button role="tab" id="tab-answers" aria-controls="answers" aria-selected="true">Answers</button>
        <button role="tab" id="tab-values" aria-controls="values" aria-selected="false" tabindex="-1">Game values</button>
        <button role="tab" id="tab-support" aria-controls="support" aria-selected="false" tabindex="-1">Support</button>
      </nav>
      <div class="body">
        <section id="answers" role="tabpanel" aria-labelledby="tab-answers">
          <div id="review-tools" hidden><p class="note">Select Show all answers on this review page, then copy its key. In the game, open V.I.N.C.E.N.T and load the copied key.</p><button id="copy-review-key" class="apply">Copy review answer key</button><textarea id="review-key" aria-label="Review answer key to copy" readonly hidden></textarea></div>
          <div id="play-tools">
          <div class="row"><div><span class="name">Highlight answers</span><span class="hint">Mark readable correct choices</span></div><button class="toggle" id="highlight" aria-label="Highlight answers" aria-pressed="false">Off</button></div>
          <div class="row"><div><span class="name">Auto-answer</span><span class="hint">Select one answer per question</span></div><button class="toggle" id="auto" aria-label="Auto-answer" aria-pressed="false">Off</button></div>
          <div id="prompt-answer" class="status" role="note" aria-live="polite" hidden></div>
          <form id="key-form" hidden><label class="name" for="answer-key-input">Load a review answer key</label><p class="hint">Copy it from the question-set review, then paste it here. It stays in this panel until you clear it or close.</p><textarea id="answer-key-input" placeholder="Paste your V.I.N.C.E.N.T answer key" aria-label="Answer key" maxlength="1000000" required></textarea><div class="input-row"><button class="apply" type="submit">Load key</button><button id="clear-key" type="button">Clear key</button></div><p id="key-status" class="hint" aria-live="polite">No answer key loaded.</p></form>
          <p class="note" id="answer-note"></p>
          </div>
        </section>
        <section id="values" role="tabpanel" aria-labelledby="tab-values" hidden><div id="fields"></div><p class="note">Local state edits can trigger the game’s normal effects. Server acceptance is not verified.</p></section>
        <section id="support" role="tabpanel" aria-labelledby="tab-support" hidden><p class="note" id="evidence"></p><ul>
          <li>Missing page data disables a feature.</li><li>Stop All ends automation and clears highlights.</li><li>Close cannot undo answers or values already submitted.</li><li>School settings or page security may block the launcher.</li>
        </ul><button id="check-layout">Check page layout</button><pre id="layout-report" style="white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px" hidden></pre></section>
        <p class="small-label">Activity</p><div class="status" role="status" aria-live="polite"></div>
      </div>
      <footer><button class="stop">Stop All</button><button class="refresh">Refresh data</button></footer>
    </section>`;
  (mount ?? document.body).append(host);
  const $ = selector => root.querySelector(selector);
  $('.badge').textContent = demo ? 'Demo' : 'Page detected';
  let adapter = suppliedAdapter ?? createLiveAdapter();
  let snapshot;
  let highlight = false;
  let auto = false;
  let timer = null;
  let closed = false;
  let lastAnswered = null;
  let href = location.href;
  const marks = new Map();
  const token = `vin-${Math.random().toString(36).slice(2)}`;
  const pageStyle = document.createElement('style');
  pageStyle.textContent = `[${MARK}="${token}"]{outline:4px solid #86bdff!important;outline-offset:3px!important;box-shadow:0 0 0 6px #102c55!important}`;
  document.head.append(pageStyle);
  const status = message => { $('[role=status]').textContent = message; };
  const clearMarks = () => {
    for (const [element, previous] of marks) {
      if (element.getAttribute(MARK) === token) {
        if (previous === null) element.removeAttribute(MARK); else element.setAttribute(MARK, previous);
      }
    }
    marks.clear();
  };
  const applyMarks = targets => {
    clearMarks();
    for (const target of targets) {
      marks.set(target, target.getAttribute(MARK));
      target.setAttribute(MARK, token);
    }
  };
  const syncButtons = () => {
    for (const [id, enabled] of [['highlight', highlight], ['auto', auto]]) {
      $(`#${id}`).setAttribute('aria-pressed', String(enabled));
      $(`#${id}`).textContent = enabled ? 'On' : 'Off';
    }
  };
  function stop(message = 'Stopped. Highlights cleared; submitted changes remain.') {
    highlight = false; auto = false;
    if (timer !== null) window.clearInterval(timer);
    timer = null;
    clearMarks(); $('#prompt-answer').hidden = true; syncButtons(); status(message);
  }
  function inspect() {
    if (!adapter) return { targets: [], fields: [], question: null, reason: 'No supported game route detected.', evidence: 'Open a game, then select Refresh data. Live compatibility is not verified.' };
    return adapter.inspect();
  }
  function renderFields() {
    const container = $('#fields');
    container.replaceChildren();
    if (!snapshot.fields.length) {
      const note = document.createElement('p'); note.className = 'note';
      note.textContent = 'No supported numeric values were found. New layouts and fields need a separate support check.';
      container.append(note); return;
    }
    for (const field of snapshot.fields) {
      const wrapper = document.createElement('form'); wrapper.className = 'value';
      const label = document.createElement('label'); label.htmlFor = `value-${field.key}`; label.textContent = `Your ${field.label.toLowerCase()}`;
      const row = document.createElement('div'); row.className = 'input-row';
      const input = document.createElement('input');
      input.id = label.htmlFor; input.type = 'number'; input.value = field.value;
      input.min = field.min; input.max = field.max; input.step = '1'; input.required = true;
      const button = document.createElement('button'); button.className = 'apply'; button.type = 'submit'; button.textContent = 'Apply';
      wrapper.addEventListener('submit', event => {
        event.preventDefault();
        try {
          if (location.href !== href || !adapter?.detect()) throw new Error('The game changed. Refresh the panel.');
          status(adapter.setValue(field, input.value));
        } catch (error) { status(error.message); }
      });
      row.append(input, button); wrapper.append(label, row); container.append(wrapper);
    }
  }
  function refresh({ replaceAdapter = false } = {}) {
    if (replaceAdapter && !suppliedAdapter && (!adapter?.detect() || location.href !== href)) {
      adapter?.clearAnswerKey?.(); adapter = createLiveAdapter();
    }
    href = location.href;
    try { snapshot = inspect(); }
    catch { snapshot = { targets: [], fields: [], question: null, reason: 'The page layout could not be read.', evidence: 'This layout is unsupported.' }; }
    $('.mode').textContent = adapter?.mode.name ?? 'Game not detected';
    $('#answer-note').textContent = snapshot.reason || (demo ? 'Sample answers only. Try the next question.' : snapshot.answerSource === 'answer key' ? 'Exact match from your loaded review key. Prompting only; no answer is submitted.' : 'Answer data found on this page. Live compatibility has not been verified.');
    $('#evidence').textContent = snapshot.evidence;
    $('#highlight').disabled = !snapshot.targets.length && !adapter?.answerKeyCount;
    $('#auto').disabled = !snapshot.targets.length || snapshot.canAutoAnswer === false || !!adapter?.answerKeyCount;
    $('#review-tools').hidden = !adapter?.review;
    $('#play-tools').hidden = !!adapter?.review;
    $('#key-form').hidden = demo || !adapter?.setAnswerKey;
    $('#key-status').textContent = adapter?.answerKeyCount ? `${adapter.answerKeyCount} questions loaded. Highlight answers to start the prompter.` : 'No answer key loaded.';
    renderFields();
  }
  function tick() {
    if (closed) return;
    if (location.href !== href || !adapter?.detect()) {
      stop('Page changed. Automation stopped. Refresh data to continue.');
      refresh({ replaceAdapter: true }); return;
    }
    try {
      snapshot = inspect();
      if (auto && snapshot.canAutoAnswer === false) {
        auto = false; syncButtons();
        if (!highlight) { stop('Auto-answer is off. Loaded answer keys support prompting only.'); return; }
      }
      if (!snapshot.targets.length) {
        clearMarks(); $('#prompt-answer').hidden = true;
        status('Waiting for readable answer data. No answer selected.');
        return;
      }
      if (highlight) {
        applyMarks(snapshot.targets);
        $('#prompt-answer').hidden = false;
        $('#prompt-answer').textContent = `${demo ? 'Sample answer' : snapshot.answerSource === 'answer key' ? 'From your answer key' : 'From page data'}: ${snapshot.question.correct.join(' / ')}`;
      }
      if (auto && snapshot.question.key !== lastAnswered) {
        // Record before clicking because the game may synchronously replace the question.
        lastAnswered = snapshot.question.key;
        snapshot.targets[0].click();
        status(demo ? 'Demo answer selected.' : 'Answer clicked on this page. Server result is not verified.');
      }
    } catch {
      stop('The page layout changed. Automation stopped.');
      refresh();
    }
  }
  function updateRunState() {
    syncButtons();
    if (timer !== null) window.clearInterval(timer);
    timer = null;
    if (!highlight) { clearMarks(); $('#prompt-answer').hidden = true; }
    if (highlight || auto) {
      tick();
      if (highlight || auto) timer = window.setInterval(tick, 700);
    } else status('All tools off.');
  }
  $('#highlight').addEventListener('click', () => { highlight = !highlight; status(highlight ? 'Highlighting readable correct choices.' : 'Highlighting off.'); updateRunState(); });
  $('#auto').addEventListener('click', () => { auto = !auto; updateRunState(); });
  $('.stop').addEventListener('click', () => stop());
  $('.refresh').addEventListener('click', () => { stop('Data refreshed. All tools off.'); refresh({ replaceAdapter: true }); });
  $('#key-form').addEventListener('submit', event => {
    event.preventDefault(); stop('Loading answer key. All tools off.');
    adapter?.clearAnswerKey?.();
    try {
      if (!adapter?.setAnswerKey || !adapter.detect()) throw new Error('Open a supported game before loading a key.');
      const count = adapter.setAnswerKey($('#answer-key-input').value);
      $('#answer-key-input').value = ''; refresh();
      status(`${count} questions loaded. Turn on Highlight answers. Auto-answer remains off.`);
    } catch (error) { refresh(); status(`Key not loaded: ${error.message}`); }
  });
  $('#clear-key').addEventListener('click', () => {
    stop('Answer key cleared.'); adapter?.clearAnswerKey?.(); $('#answer-key-input').value = ''; refresh();
  });
  $('#copy-review-key').addEventListener('click', async () => {
    try {
      const key = adapter.captureKey(); const text = JSON.stringify(key);
      const box = $('#review-key'); box.value = text;
      try { await navigator.clipboard.writeText(text); status(`${key.questions.length} questions copied. Open the game panel and paste into Load a review answer key.`); }
      catch { box.hidden = false; box.focus(); box.select(); status(`${key.questions.length} questions ready. Copy the selected key, then load it in the game panel.`); }
    } catch (error) { status(error.message); }
  });
  $('#check-layout').addEventListener('click', () => {
    const report = $('#layout-report'); report.hidden = false;
    try {
      report.replaceChildren();
      const details = adapter?.diagnostics ? adapter.diagnostics() : { note: 'Page layout checks are available in a detected live game.' };
      for (const [key, value] of Object.entries(details)) {
        for (const row of Array.isArray(value) ? value.length ? value : ['None found'] : [String(value)]) {
          const line = document.createElement('div'); line.textContent = `${key}: ${row}`;
          line.style.marginBottom = '12px'; report.append(line);
        }
      }
    }
    catch { report.textContent = 'This page layout could not be inspected.'; }
  });
  const tabs = Array.from(root.querySelectorAll('[role=tab]'));
  function selectTab(tab) {
    tabs.forEach(other => {
      const active = other === tab;
      other.setAttribute('aria-selected', String(active)); other.tabIndex = active ? 0 : -1;
      $(`#${other.getAttribute('aria-controls')}`).hidden = !active;
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectTab(tabs[next]); tabs[next].focus(); }
    });
  });
  const onNavigation = () => { stop('Navigation detected. All tools off.'); refresh({ replaceAdapter: true }); };
  const onKey = event => { if (event.key === 'Escape') close(); };
  function close() {
    if (closed) return;
    stop(); closed = true;
    adapter?.clearAnswerKey?.();
    window.removeEventListener('popstate', onNavigation);
    window.removeEventListener('hashchange', onNavigation);
    window.removeEventListener('pagehide', close);
    root.removeEventListener('keydown', onKey);
    host.remove(); pageStyle.remove(); delete window[INSTANCE];
    if (previousFocus?.isConnected) previousFocus.focus();
  }
  $('.close').addEventListener('click', close);
  root.addEventListener('keydown', onKey);
  window.addEventListener('popstate', onNavigation);
  window.addEventListener('hashchange', onNavigation);
  window.addEventListener('pagehide', close);
  const api = { focus: () => $('.close').focus(), stop, close, get running() { return timer !== null; } };
  window[INSTANCE] = api;
  refresh(); status(demo ? 'Demo ready. All tools off.' : 'All tools off. Live support is not verified.');
  if (!mount) api.focus();
  return api;
}
