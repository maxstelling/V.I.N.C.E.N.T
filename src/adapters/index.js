import { MODES, detectPageMode, validateValue } from '../modes.js';
import { collectReactViews, questionFrom, answerTargets, exposedChoiceQuestion, currentChoiceQuestion } from './react.js';
import { createReviewAdapter, isReviewPage } from './review.js';
import { matchAnswerKey, parseAnswerKey } from '../answer-key.js';

// One adapter instance per mode. New layouts/fields can be handled here without
// changing the panel. No server writes are made or asserted by these adapters.
export function createModeAdapter(mode, doc = document) {
  let answerKey = null;
  return {
    mode,
    detect: () => detectPageMode(doc.location)?.id === mode.id,
    inspect() {
      const views = collectReactViews(doc);
      const questions = views.map(questionFrom).filter(Boolean);
      const exposed = exposedChoiceQuestion(doc);
      const direct = exposed?.question ?? questions.find(q => answerTargets(doc, q).length) ?? null;
      const active = answerKey ? currentChoiceQuestion(doc) : null;
      const matched = active ? matchAnswerKey(answerKey, active.object) : null;
      const question = direct ?? (matched ? { object: active.object, key: active.key, correct: matched.correctAnswers } : null);
      const answerSource = direct ? 'page data' : matched ? 'answer key' : null;
      const fields = mode.fields.flatMap(spec => {
        const view = views.find(v => v.owner && Object.hasOwn(v.state, spec.key) && Number.isFinite(v.state[spec.key]));
        return view ? [{ ...spec, value: view.state[spec.key], owner: view.owner }] : [];
      });
      return { question, targets: exposed?.targets ?? answerTargets(doc, question), fields, answerSource,
        canAutoAnswer: !!direct,
        reason: question ? '' : answerKey ? 'Waiting for an exact question, picture and choices match in the loaded key.' : !views.length ? 'This page does not expose a supported React layout.' : !questions.length ? 'No readable correct-answer data was found in this page layout. Load a review answer key to use the prompter.' : 'Answer data was found, but no visible choices matched it.',
        evidence: 'Page data detection does not prove server acceptance. Check the support record for live results.' };
    },
    setAnswerKey(input) { answerKey = parseAnswerKey(input); return answerKey.questions.length; },
    clearAnswerKey() { answerKey = null; },
    get answerKeyCount() { return answerKey?.questions.length ?? 0; },
    diagnostics() {
      const views = collectReactViews(doc);
      const relevance = value => (value.match(/question|answer|correct|gold|score|choice/gi) ?? []).length;
      const shapes = objects => [...new Set(objects.filter(value => value && typeof value === 'object')
        .map(value => Object.keys(value).sort().slice(0, 24).join(', ')).filter(Boolean))]
        .sort((a, b) => relevance(b) - relevance(a)).slice(0, 12);
      const questions = views.flatMap(view => [view.state.question, view.state.currentQuestion, view.props.question, view.props.currentQuestion, view.props.client?.question]).filter(Boolean);
      const flags = views.filter(view => Object.hasOwn(view.props, 'isCorrect')).map(view =>
        typeof view.props.isCorrect === 'boolean' ? `boolean:${view.props.isCorrect}` : 'unavailable');
      return {
        reactViews: views.length,
        classComponents: new Set(views.map(view => view.owner).filter(Boolean)).size,
        readableQuestions: views.map(questionFrom).filter(Boolean).length + (exposedChoiceQuestion(doc) ? 1 : 0),
        correctnessFlagCounts: [...new Set(flags)].map(flag => `${flag} (${flags.filter(value => value === flag).length})`).join('; ') || 'None found',
        answerFieldNames: shapes(questions.flatMap(question => Array.isArray(question.answers) ? question.answers : [])),
        feedbackFieldNames: shapes(views.map(view => view.props.feedback)),
        stateFieldNames: shapes(views.map(view => view.state)),
        propFieldNames: shapes(views.map(view => view.props)),
        questionFieldNames: shapes(questions),
        answerElementClasses: [...new Set(Array.from(doc.querySelectorAll('button')).slice(0, 80).map(button => button.className).filter(value => typeof value === 'string' && value))].slice(0, 6).map(value => value.slice(0, 350))
      };
    },
    setValue(field, raw) {
      if (!this.detect()) throw new Error('The game changed. Refresh the panel.');
      const fresh = this.inspect().fields.find(f => f.key === field.key && f.owner === field.owner);
      if (!fresh) throw new Error('This value is no longer available.');
      const value = validateValue(raw, fresh);
      fresh.owner.setState(previous => {
        if (!Object.hasOwn(previous, fresh.key) || !Number.isFinite(previous[fresh.key])) return null;
        return { [fresh.key]: value };
      });
      return 'Local state update requested. Server acceptance is not verified.';
    }
  };
}

export function createLiveAdapter(doc = document) {
  if (isReviewPage(doc.location)) return createReviewAdapter(doc);
  const mode = detectPageMode(doc.location);
  return mode ? createModeAdapter(mode, doc) : null;
}

export const adapterCatalog = MODES.map(mode => ({ id: mode.id, create: doc => createModeAdapter(mode, doc) }));
