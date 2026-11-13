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
function ModernAnswer({ answer, isCorrect, onClick, answerSent }) {
  return h('button', { className: '_answerButton_fixture', onClick, disabled: answerSent }, answer);
}
function ModernQuestion({ question, currentIndex, questions, onAnswer, answerSent, correctnessAvailable }) {
  return h('section', null, h('p', null, question.text), ...question.answers.map((answer, i) =>
    h(ModernAnswer, { key: i, answer, isCorrect: correctnessAvailable && i === currentIndex % 2, onClick: onAnswer, answerSent })));
}
function ModernFixture() {
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const feedbackOnly = params.has('feedback-only');
  const questions = [0, 1, 2, 3].map(number => ({
    text: params.has('key-images') ? 'Which animal?' : 'Modern question ' + number,
    image: params.has('key-images') ? `https://example.invalid/animal-${number}.png` : '',
    number, answers: params.has('key-images') && number % 2 ? ['Beta', 'Alpha'] : ['Alpha', 'Beta']
  }));
  const question = questions[index];
  return h('main', null, h('h1', null, 'Controlled React modern fixture'),
    h(ModernQuestion, { question, currentIndex: index, questions, correctnessAvailable: !feedbackOnly || answered,
      answerSent: feedbackOnly && answered, onAnswer: () => { window.fixtureClicks++; setAnswered(true); } }),
    h('button', { id: 'fixture-next', onClick: () => { setIndex(i => i + 1); setAnswered(false); } }, 'Next'));
}
function ReviewCard({ currentQuestion, expanded }) {
  return h('article', null, h('h2', null, currentQuestion.question), expanded ? currentQuestion.answers.map(answer => h('p', { key: answer }, answer)) : null);
}
function ReviewFixture() {
  const [expanded, setExpanded] = useState(false);
  const questions = [0, 1].map(number => ({ question: 'Which animal?', number,
    image: `https://example.invalid/animal-${number}.png`, audio: '',
    answers: ['Alpha', 'Beta'], correctAnswers: [number ? 'Beta' : 'Alpha'] }));
  return h('main', null, h('h1', null, 'Controlled React review fixture'),
    h('button', { onClick: () => setExpanded(!expanded) }, expanded ? 'Hide all answers' : 'Show all answers'),
    ...questions.map(currentQuestion => h(ReviewCard, { key: currentQuestion.number, currentQuestion, expanded })));
}
createRoot(document.getElementById('root')).render(h(params.has('review') ? ReviewFixture : params.has('modern') ? ModernFixture : params.has('hooks') ? HooksFixture : Fixture));
