// Only inspect React's public DOM attachments and known question/state shapes.
// Never enumerate user records, storage, cookies, tokens, or other players.
export function collectReactViews(doc) {
  const queue = [];
  for (const el of Array.from(doc.querySelectorAll('body *')).slice(0, 1800)) {
    for (const key of Object.keys(el)) {
      if (/^__react(Fiber|InternalInstance|Container)\$/.test(key)) queue.push(el[key]);
      if (key === '_reactRootContainer') queue.push(el[key]?._internalRoot?.current);
    }
  }
  const seen = new Set();
  const views = [];
  while (queue.length && seen.size < 5000) {
    const fiber = queue.shift();
    if (!fiber || typeof fiber !== 'object' || seen.has(fiber)) continue;
    seen.add(fiber);
    const owner = fiber.stateNode;
    if (owner?.state && typeof owner.setState === 'function') {
      views.push({ state: owner.state, props: owner.props ?? {}, owner });
    }
    if (fiber.memoizedProps) views.push({ state: {}, props: fiber.memoizedProps, owner: null });
    let hook = fiber.memoizedState;
    const hooksSeen = new Set();
    while (hook && typeof hook === 'object' && hooksSeen.size < 50 && !hooksSeen.has(hook)) {
      hooksSeen.add(hook);
      if (hook.memoizedState && typeof hook.memoizedState === 'object') {
        views.push({ state: hook.memoizedState, props: fiber.memoizedProps ?? {}, owner: null });
      }
      hook = hook.next;
    }
    queue.push(fiber.child, fiber.sibling, fiber.return, fiber._owner);
  }
  return views;
}

export function questionFrom(view) {
  const { state, props } = view;
  // A hook may store the question itself, rather than { question: ... }.
  const question = [state.question, state.currentQuestion, props.question, props.client?.question,
    state.correctAnswers ? state : null].find(value => value && typeof value === 'object');
  if (!question || typeof question !== 'object') return null;
  const correct = question.correctAnswers ?? question.correctAnswer;
  const answers = Array.isArray(correct) ? correct : correct == null ? [] : [correct];
  if (!answers.length || answers.some(a => typeof a !== 'string' && typeof a !== 'number')) return null;
  const prompt = question.question ?? question.text ?? question.id;
  if (typeof prompt !== 'string' && typeof prompt !== 'number') return null;
  return { object: question, correct: answers.map(String), key: JSON.stringify([
    prompt, question.answers ?? [], answers, state.questionIndex ?? state.questionNumber ?? props.questionIndex ?? null
  ]) };
}

const normalize = text => String(text).replace(/\s+/g, ' ').trim();
export function answerTargets(doc, question) {
  if (!question) return [];
  const correct = new Set(question.correct.map(normalize));
  const selector = '[data-vin-answer], button[data-answer], [class*="answerContainer"], [class*="answerButton"], [role="button"][class*="answer"], button[class*="answer"]';
  const elements = Array.from(doc.querySelectorAll(selector));
  return elements.filter(el => {
    if (elements.some(other => other !== el && el.contains(other))) return false;
    if (el.closest('#vin-cent-panel, [hidden], [aria-hidden="true"]') || el.matches(':disabled') || el.getAttribute('aria-disabled') === 'true') return false;
    if (!el.getClientRects().length) return false;
    if (el.checkVisibility?.({ checkOpacity: true, checkVisibilityCSS: true }) === false) return false;
    const style = doc.defaultView.getComputedStyle(el);
    if (style.visibility !== 'visible' || style.opacity === '0') return false;
    const text = el.getAttribute('data-answer') ?? el.querySelector('[class*="answerText"]')?.textContent ?? el.textContent;
    return correct.has(normalize(text));
  });
}
