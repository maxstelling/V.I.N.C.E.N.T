import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
const h = React.createElement;
const makeQuestion = (n, missing = false) => ({ question: `Fixture ${n}`, answers: ['Alpha', 'Beta'], ...(missing ? {} : { correctAnswers: [n % 2 ? 'Beta' : 'Alpha'] }) });
const params = new URLSearchParams(location.search);
window.fixtureClicks = 0;
function answers(question, onClick) {
  return question.answers.map(answer => h('button', { key: answer, 'data-answer': answer, className: 'answerContainer', onClick }, answer));
}
class Fixture extends React.Component {
  constructor(props) {
    super(props);
    this.state = { question: makeQuestion(0, params.has('missing')), questionIndex: 0, gold: 250, cash: 250, cafeCash: 250, tokens: 5, round: 2, coins: 5, health: 100, crypto: 250, progress: 2, weight: 250, lure: 2, level: 2, fossils: 250, fossilMult: 2, guestScore: 2, numBlooks: 2, numDefense: 2, toys: 250, toysPerQ: 2 };
    window.fixture = this;
  }
  render() {
    return h('main', null, h('h1', null, 'Controlled React class fixture'),
      h('p', { id: 'fixture-question' }, this.state.question.question),
      ...answers(this.state.question, () => { window.fixtureClicks++; }),
      h('button', { id: 'fixture-next', onClick: () => this.setState(s => ({ questionIndex: s.questionIndex + 1, question: makeQuestion(s.questionIndex + 1) })) }, 'Next'),
      h('p', { id: 'fixture-gold' }, String(this.state.gold)));
  }
}
function HooksFixture() {
  const [question, setQuestion] = useState(makeQuestion(0));
  return h('main', null, h('h1', null, 'Controlled React hooks fixture'), ...answers(question, () => { window.fixtureClicks++; }),
    h('button', { onClick: () => setQuestion(makeQuestion(1)) }, 'Next'));
}
createRoot(document.getElementById('root')).render(h(params.has('hooks') ? HooksFixture : Fixture));
