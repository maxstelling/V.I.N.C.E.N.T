import { MODES, detectMode, validateValue } from '../modes.js';
import { collectReactViews, questionFrom, answerTargets } from './react.js';

// One adapter instance per mode. New layouts/fields can be handled here without
// changing the panel. No server writes are made or asserted by these adapters.
export function createModeAdapter(mode, doc = document) {
  return {
    mode,
    detect: () => detectMode(doc.location.pathname)?.id === mode.id,
    inspect() {
      const views = collectReactViews(doc);
      const questions = views.map(questionFrom).filter(Boolean);
      const question = questions.find(q => answerTargets(doc, q).length) ?? null;
      const fields = mode.fields.flatMap(spec => {
        const view = views.find(v => v.owner && Object.hasOwn(v.state, spec.key) && Number.isFinite(v.state[spec.key]));
        return view ? [{ ...spec, value: view.state[spec.key], owner: view.owner }] : [];
      });
      return { question, targets: answerTargets(doc, question), fields,
        reason: question ? '' : 'No visible answer matches readable correct-answer data.',
        evidence: 'Live compatibility not tested. Detected page data is not proof of server acceptance.' };
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
  const mode = detectMode(doc.location.pathname);
  return mode ? createModeAdapter(mode, doc) : null;
}

export const adapterCatalog = MODES.map(mode => ({ id: mode.id, create: doc => createModeAdapter(mode, doc) }));
