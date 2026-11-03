// Duellregeln als Zustandsmaschine (Design 6.1, 6.2, 7.1). DOM-frei.
// ready → question → feedback → ready … bis won, lost oder fled.

import { CONFIG } from '../config.js';
import { pickForm } from './questions.js';
import { buildChoices, buildTiles, checkTyped, checkTiles, jokerHint, acceptedAnswers, correctText } from './answers.js';

const FINAL = new Set(['won', 'lost', 'fled']);

// timeFor(presented) → Millisekunden oder null (Zeitdruck, Design 7.4); fehlt es, gibt es keine Uhr.
export function createDuel({ kind, player, foe, deck, rng, timeFor = () => null }) {
  const critEvery = player.stage >= 3 ? CONFIG.duel.critEveryFromStage3 : CONFIG.duel.critEvery;
  const recentForms = [];
  const answers = [];
  let jokerUsed = false;
  let swapUsed = false;
  let shieldUsed = false;
  let secondChanceUsed = false;
  let wrongCount = 0;
  let feeds = 0;
  let hintShown = false; // für die aktuelle Frage (Erleuchtung oder Weitblick)

  const d = {
    kind,
    state: 'ready',
    playerEnergy: player.energy,
    playerMax: player.maxEnergy,
    foeEnergy: foe.maxEnergy,
    foeMax: foe.maxEnergy,
    streak: 0,
    critEvery,
    current: null,
    timeLimit: null, // Uhr der aktuellen Frage in ms, null ohne Zeitdruck
    timeLeft: null,
    frozen: false, // Zeitstein: die Uhr steht für diese Frage
  };

  function startClock() {
    d.timeLimit = timeFor(d.current) ?? null;
    d.timeLeft = d.timeLimit;
  }

  function present(question) {
    const form = pickForm(question.forms, recentForms, rng);
    recentForms.push(form);
    const p = { question, form };
    if (form === 'choice') p.choices = buildChoices(question, rng);
    if (form === 'tiles') p.tiles = buildTiles(question, rng);
    return p;
  }

  d.ask = () => {
    if (d.state !== 'ready') throw new Error(`ask() geht nur im Zustand ready, nicht in ${d.state}`);
    d.current = present(deck.draw());
    d.state = 'question';
    hintShown = false;
    d.frozen = false;
    startClock();
    return d.current;
  };

  d.canJoker = () => player.species === 'funki' && !jokerUsed && !hintShown && d.state === 'question';
  d.useJoker = () => {
    if (!d.canJoker()) return null;
    jokerUsed = true;
    hintShown = true;
    return jokerHint(d.current, rng);
  };

  // Weitblickstein (Design 8.2): derselbe Hinweis wie Funkis Erleuchtung, einmal pro Frage.
  // Ob einer im Rucksack ist, prüft die Szene.
  d.canFarsight = () => !hintShown && d.state === 'question';
  d.useFarsight = () => {
    if (!d.canFarsight()) return null;
    hintShown = true;
    return jokerHint(d.current, rng);
  };

  d.canSwap = () => player.species === 'flausch' && !swapUsed && d.state === 'question';
  d.swap = () => {
    if (!d.canSwap()) return null;
    swapUsed = true;
    recentForms.pop();
    d.current = present(deck.draw());
    hintShown = false;
    startClock(); // neue Frage, neue Zeit; ein Zeitstein gilt für den ganzen Zug
    return d.current;
  };

  // Füttern statt antworten (Design 8): kostet den Zug, aber niemand verliert Energie.
  // amount ist eine Zahl oder 'full'. Gibt zurück, wie viel Energie dazukam. Wirkt schon ein
  // Zeitstein, bleibt es bei der Antwort, sonst ginge der Stein verloren.
  d.canFeed = () => d.state === 'question' && !d.frozen && feeds < CONFIG.food.maxFeedPerDuel;
  d.feed = amount => {
    if (!d.canFeed()) return 0;
    feeds++;
    const room = d.playerMax - d.playerEnergy;
    const gained = amount === 'full' ? room : Math.max(0, Math.min(amount, room));
    d.playerEnergy += gained;
    d.state = 'ready';
    return gained;
  };

  d.answer = response => {
    if (d.state !== 'question') return null;
    const { question, form } = d.current;
    let correct = false;
    let almost = false;
    if (form === 'choice') correct = response.index === d.current.choices.correctIndex;
    else if (form === 'typing') ({ correct, almost } = checkTyped(response.text ?? '', acceptedAnswers(question), question.wrong));
    else correct = checkTiles(response.tokens ?? [], acceptedAnswers(question));
    return settle(correct, almost);
  };

  // Die Uhr läuft nur bei offener Frage (die Szene ruft tick nur, solange die Frage zu sehen ist).
  // Abgelaufene Zeit zählt wie eine falsche Antwort (Design 7.1).
  d.tick = ms => {
    if (d.state !== 'question' || d.timeLeft == null || d.frozen) return null;
    d.timeLeft -= ms;
    if (d.timeLeft > 0) return null;
    d.timeLeft = 0;
    return { ...settle(false, false), timedOut: true };
  };

  // Zeitstein (Design 7.6, 8.2): hält die Uhr für diese Frage an. Ob einer im Rucksack ist, prüft die Szene.
  d.canFreeze = () => d.state === 'question' && d.timeLeft != null && !d.frozen;
  d.freezeTime = () => {
    if (!d.canFreeze()) return false;
    d.frozen = true;
    return true;
  };

  function settle(correct, almost) {
    const { question } = d.current;
    answers.push({ key: question.key, correct, trainer: question.trainer ?? null });

    const r = {
      correct,
      almost,
      crit: false,
      foeDamage: 0,
      playerDamage: 0,
      healed: 0,
      shielded: false,
      secondChance: false,
      correctText: correctText(question),
      state: null,
    };

    if (correct) {
      d.streak++;
      r.crit = d.streak % critEvery === 0;
      r.foeDamage = r.crit ? 2 : 1;
      d.foeEnergy = Math.max(0, d.foeEnergy - r.foeDamage);
      if (player.species === 'nixi' && d.streak % CONFIG.duel.nixiEvery === 0 && d.playerEnergy < d.playerMax) {
        d.playerEnergy++;
        r.healed = 1;
      }
      d.state = d.foeEnergy === 0 ? 'won' : 'feedback';
    } else {
      wrongCount++;
      d.streak = 0;
      if (player.stage >= 4 && !shieldUsed) {
        shieldUsed = true;
        r.shielded = true;
        d.state = 'feedback';
      } else if (player.stage >= 2 && !secondChanceUsed) {
        secondChanceUsed = true;
        r.secondChance = true;
        d.state = 'question';
        d.timeLeft = d.timeLimit; // zweiter Versuch mit voller Zeit
      } else {
        r.playerDamage = 1;
        d.playerEnergy = Math.max(0, d.playerEnergy - 1);
        d.state = d.playerEnergy === 0 ? 'lost' : 'feedback';
      }
    }
    r.state = d.state;
    return r;
  }

  d.next = () => {
    if (d.state === 'feedback') d.state = 'ready';
  };

  d.flee = () => {
    if (kind !== 'wild' || FINAL.has(d.state)) return false;
    d.state = 'fled';
    return true;
  };

  d.surrender = () => {
    if (kind === 'trainer' && !FINAL.has(d.state)) d.state = 'lost';
  };

  d.summary = () => ({
    outcome: d.state,
    playerEnergy: d.playerEnergy,
    flawless: wrongCount === 0,
    answers: [...answers],
  });

  return d;
}
