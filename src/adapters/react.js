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
function visibleAnswerElements(doc) {
  const selector = '[data-vin-answer], button[data-answer], [class*="answerContainer"], [class*="answerButton"], [role="button"][class*="answer"], button[class*="answer"]';
  const elements = Array.from(doc.querySelectorAll(selector));
  return elements.filter(el => {
    if (elements.some(other => other !== el && el.contains(other))) return false;
    if (el.closest('#vin-cent-panel, [hidden], [aria-hidden="true"]') || el.matches(':disabled') || el.getAttribute('aria-disabled') === 'true') return false;
    if (!el.getClientRects().length) return false;
    if (el.checkVisibility?.({ checkOpacity: true, checkVisibilityCSS: true }) === false) return false;
    const style = doc.defaultView.getComputedStyle(el);
    if (style.visibility !== 'visible' || style.opacity === '0') return false;
    return true;
  });
}

export function answerTargets(doc, question) {
  if (!question) return [];
  const correct = new Set(question.correct.map(normalize));
  return visibleAnswerElements(doc).filter(el => {
    const text = el.getAttribute('data-answer') ?? el.querySelector('[class*="answerText"]')?.textContent ?? el.textContent;
    return correct.has(normalize(text));
  });
}

function currentElementFiber(element) {
  const key = Object.keys(element).find(name => /^__react(Fiber|InternalInstance)\$/.test(name));
  let fiber = key ? element[key] : null;
  let root = fiber;
  const seen = new Set();
  while (root?.return && !seen.has(root) && seen.size < 100) { seen.add(root); root = root.return; }
  // React's DOM attachment can point to the alternate tree after a render.
  // Compare the HostRoot with FiberRoot.current before reading button props.
  if (root?.stateNode?.current && root.stateNode.current !== root && fiber?.alternate) fiber = fiber.alternate;
  return fiber;
}

export function exposedChoiceQuestion(doc) {
  const choices = [];
  for (const element of visibleAnswerElements(doc)) {
    let fiber = currentElementFiber(element);
    let correctness;
    let question;
    let questionIndex;
    const seen = new Set();
    while (fiber && !seen.has(fiber) && seen.size < 24) {
      seen.add(fiber);
      const props = fiber.memoizedProps;
      if (props && typeof props === 'object') {
        if (correctness === undefined && Object.hasOwn(props, 'answer') && typeof props.isCorrect === 'boolean') correctness = props.isCorrect;
        const candidate = props.question;
        if (!question && candidate && typeof candidate === 'object' && typeof candidate.text === 'string' && Array.isArray(candidate.answers)) question = candidate;
        if (questionIndex === undefined && Number.isInteger(props.currentIndex) && Array.isArray(props.questions)) questionIndex = props.currentIndex;
      }
      fiber = fiber.return;
    }
    if (typeof correctness === 'boolean' && question) choices.push({ element, correctness, question, questionIndex });
  }
  if (!choices.length) return null;
  // Require a single current question and at least two independently labelled
  // choices. A missing flag is not treated as an incorrect answer.
  const question = choices[0].question;
  if (choices.length < 2 || choices.some(choice => choice.question !== question)) return null;
  const correct = choices.filter(choice => choice.correctness);
  if (!correct.length) return null;
  return {
    question: { object: question, correct: correct.map(choice => normalize(choice.element.textContent)),
      key: JSON.stringify([question.text, question.number ?? null, choices[0].questionIndex ?? null,
        choices.map(choice => normalize(choice.element.textContent))]) },
    targets: correct.map(choice => choice.element)
  };
}
