// Lernpaket lesen und prüfen (Design 10.2, 10.3). DOM-frei.
// Fehler verhindern das Laden, Hinweise nicht. Jede Meldung nennt, wo möglich, die Zeile.

import { CONFIG } from '../config.js';
import { DEFAULT_LINES } from '../data/texts.js';
import { packIdentity, shortId } from './packId.js';

const HEADER_KEYS = new Set(['PAKET', 'KENNUNG', 'FACH', 'ZEITDRUCK']);
const TRAINER_KEYS = new Set(['NAME', 'THEMA', 'HALLO', 'SIEG', 'NIEDERLAGE', 'REVANCHE']);
const BOSS_KEYS = new Set(['HALLO', 'SIEG', 'NIEDERLAGE']);
const QUESTION_FIELDS = new Set(['ANTWORT', 'SATZ', 'AUCH RICHTIG', 'FALSCH', 'EXTRA', 'FORM']);
const KNOWN = new Set([...HEADER_KEYS, ...TRAINER_KEYS, 'FRAGE', ...QUESTION_FIELDS]);
const FORM_VALUES = { auswahl: 'choice', eintippen: 'typing', satzbau: 'tiles' };
const TIME_VALUES = new Set(['normal', 'lang', 'aus']);
const LINE_KEYS = { NAME: 'name', THEMA: 'topic', SIEG: 'win', NIEDERLAGE: 'loss', REVANCHE: 'rematch' };

export function normalizeKeyword(k) {
  return k
    .trim()
    .toUpperCase()
    .replace(/Ä/g, 'AE')
    .replace(/Ö/g, 'OE')
    .replace(/Ü/g, 'UE')
    .replace(/ß/g, 'SS')
    .replace(/[\s_-]+/g, ' ');
}

export function normalizeKey(text) {
  return text.trim().replace(/\s+/g, ' ').toLowerCase();
}

const splitList = value => value.split('|').map(s => s.trim()).filter(Boolean);

function looksBinary(text) {
  return text.includes('\u0000') || /^﻿?\{\\rtf/.test(text) || text.startsWith('PK\u0003\u0004');
}

export function parsePack(input) {
  const errors = [];
  const warnings = [];
  const error = (line, message) => errors.push({ line, message: line ? `Zeile ${line}: ${message}` : message });
  const warn = (line, message) => warnings.push({ line, message: line ? `Zeile ${line}: ${message}` : message });
  const result = () => ({ ok: errors.length === 0, errors, warnings, pack: errors.length === 0 ? pack : null });
  let pack = null;

  if (new TextEncoder().encode(input).length > CONFIG.pack.maxBytes) {
    error(null, 'Die Datei ist größer als 1 MB.');
    return result();
  }
  if (looksBinary(input)) {
    error(null, 'Diese Datei ist keine reine Textdatei. Speichere sie im Texteditor als reinen Text (.txt, UTF-8).');
    return result();
  }

  const text = input.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const lines = text.split('\n');

  const header = { title: null, kennung: null, subject: null, timePressure: 'normal' };
  const headerSeen = new Map();
  const trainers = new Map();
  let boss = null;
  const notes = [];
  const notesKeys = new Map();
  let section = null; // null = Kopf, sonst { kind, name, trainer? }
  let current = null;

  function closeQuestion() {
    if (current) finishQuestion(current);
    current = null;
  }

  function finishQuestion(cq) {
    if (cq.ignored) return;
    const f = cq.fields;
    const answer = f.ANTWORT?.value ?? null;
    const sentence = f.SATZ?.value ?? null;
    if (answer && sentence) return error(cq.line, 'Eine Frage hat entweder ANTWORT oder SATZ, nicht beides.');
    if (!answer && !sentence) return error(cq.line, 'Bei dieser Frage fehlt ANTWORT oder SATZ.');

    const alsoCorrect = f['AUCH RICHTIG'] ? splitList(f['AUCH RICHTIG'].value) : [];
    const extra = f.EXTRA ? splitList(f.EXTRA.value) : [];
    const wrong = [];
    if (f.FALSCH) {
      const accepted = new Set([answer ?? sentence, ...alsoCorrect].map(normalizeKey));
      const seen = new Set();
      for (const w of splitList(f.FALSCH.value)) {
        const k = normalizeKey(w);
        if (accepted.has(k)) warn(f.FALSCH.line, 'Eine falsche Antwort ist gleich der richtigen und wird ignoriert.');
        else if (seen.has(k)) warn(f.FALSCH.line, 'Eine falsche Antwort steht doppelt und wird nur einmal benutzt.');
        else {
          seen.add(k);
          wrong.push(w);
        }
      }
    }

    let forms;
    if (f.FORM) {
      const form = FORM_VALUES[f.FORM.value.trim().toLowerCase()];
      if (!form) return error(f.FORM.line, 'FORM kennt nur auswahl, eintippen oder satzbau.');
      const label = f.FORM.value.trim().toLowerCase();
      if (form === 'tiles' && !sentence) return error(f.FORM.line, `FORM: ${label} passt nicht zu ANTWORT.`);
      if (form !== 'tiles' && sentence) return error(f.FORM.line, `FORM: ${label} passt nicht zu SATZ.`);
      if (form === 'choice' && wrong.length < 3) {
        return error(f.FALSCH?.line ?? f.FORM.line, 'Für die Auswahl braucht es mindestens 3 falsche Antworten.');
      }
      forms = [form];
    } else if (sentence) {
      forms = ['tiles'];
    } else if (f.FALSCH) {
      if (wrong.length < 3) return error(f.FALSCH.line, 'Für die Auswahl braucht es mindestens 3 falsche Antworten.');
      forms = ['choice', 'typing'];
    } else {
      forms = ['typing'];
    }

    const key = normalizeKey(cq.text);
    const seenKeys = cq.keys;
    if (seenKeys.has(key)) warn(cq.line, `Diese Frage gibt es schon in Zeile ${seenKeys.get(key)}.`);
    else seenKeys.set(key, cq.line);

    cq.target.push({ key, text: cq.text, line: cq.line, answer, sentence, alsoCorrect, wrong, extra, forms });
  }

  function startSection(raw, n) {
    const name = normalizeKeyword(raw);
    const m = name.match(/^TRAINER ?(\d+)$/);
    if (m) {
      const num = Number(m[1]);
      if (num < 1 || num > 8) {
        error(n, 'Es gibt nur Trainer 1 bis 8.');
        return { kind: 'ignored' };
      }
      if (trainers.has(num)) {
        error(n, `Trainer ${num} gibt es schon in Zeile ${trainers.get(num).line}.`);
        return { kind: 'ignored' };
      }
      const trainer = { number: num, line: n, name: null, topic: null, hello: [], win: null, loss: null, rematch: null, questions: [], keys: new Map(), seen: new Map() };
      trainers.set(num, trainer);
      return { kind: 'trainer', name: `TRAINER ${num}`, trainer };
    }
    if (name === 'ENDGEGNER') {
      boss ??= { hello: [], win: null, loss: null, seen: new Map() };
      return { kind: 'boss', name: 'ENDGEGNER' };
    }
    if (name === 'ZETTEL') return { kind: 'notes', name: 'ZETTEL' };
    error(n, `Unbekannter Abschnitt ‚${raw.trim()}‘.`);
    return { kind: 'ignored' };
  }

  function setLine(target, seen, key, value, n) {
    if (seen.has(key)) return warn(n, `${key} steht hier schon einmal. Es gilt die erste Zeile.`);
    seen.set(key, n);
    target[LINE_KEYS[key]] = value;
  }

  lines.forEach((raw, i) => {
    const n = i + 1;
    const line = raw.trim();
    if (!line) return closeQuestion();
    if (line.startsWith('#')) return;

    const sec = line.match(/^={2,}\s*(.+?)\s*={2,}$/);
    if (sec) {
      closeQuestion();
      section = startSection(sec[1], n);
      return;
    }
    if (section?.kind === 'ignored') return;

    const colon = line.indexOf(':');
    if (colon < 0) return warn(n, 'Diese Zeile wird nicht verstanden und übersprungen.');
    const written = line.slice(0, colon).trim();
    const key = normalizeKeyword(written);
    const value = line.slice(colon + 1).trim();
    if (!KNOWN.has(key)) return warn(n, `Unbekanntes Schlüsselwort ‚${written}‘.`);

    if (HEADER_KEYS.has(key)) {
      if (section) return warn(n, `Im Abschnitt ${section.name} wird ${key} nicht benutzt.`);
      if (headerSeen.has(key)) return warn(n, `${key} steht hier schon einmal. Es gilt die erste Zeile.`);
      headerSeen.set(key, n);
      if (key === 'PAKET') header.title = value || null;
      else if (key === 'FACH') header.subject = value || null;
      else if (key === 'KENNUNG') header.kennung = value || null;
      else if (key === 'ZEITDRUCK') {
        const v = value.toLowerCase();
        if (TIME_VALUES.has(v)) header.timePressure = v;
        else warn(n, 'ZEITDRUCK kennt nur normal, lang oder aus. Es gilt normal.');
      }
      return;
    }

    if (TRAINER_KEYS.has(key)) {
      closeQuestion();
      if (!section) return warn(n, `${key} steht vor dem ersten Abschnitt und wird nicht benutzt.`);
      if (section.kind === 'trainer') {
        const t = section.trainer;
        if (key === 'HALLO') {
          if (value) t.hello.push(value);
        } else setLine(t, t.seen, key, value, n);
        return;
      }
      if (section.kind === 'boss' && BOSS_KEYS.has(key)) {
        if (key === 'HALLO') {
          if (value) boss.hello.push(value);
        } else setLine(boss, boss.seen, key, value, n);
        return;
      }
      return warn(n, `Im Abschnitt ${section.name} wird ${key} nicht benutzt.`);
    }

    if (key === 'FRAGE') {
      closeQuestion();
      if (!section) return error(n, 'Fragen gehören in einen Abschnitt wie === TRAINER 1 ===.');
      if (section.kind === 'boss') {
        warn(n, `Im Abschnitt ${section.name} wird FRAGE nicht benutzt.`);
        current = { ignored: true };
        return;
      }
      const target = section.kind === 'trainer' ? section.trainer.questions : notes;
      const keys = section.kind === 'trainer' ? section.trainer.keys : notesKeys;
      current = { line: n, text: value, fields: {}, target, keys };
      return;
    }

    // Felder einer Frage
    if (!current) return error(n, `${key} gehört zu einer Frage, davor fehlt FRAGE:.`);
    if (current.ignored) return;
    if (current.fields[key]) {
      const hint = key === 'ANTWORT' || key === 'SATZ' ? ' Weitere richtige Antworten gehören zu AUCH RICHTIG.' : '';
      return error(n, `Diese Frage hat schon ${key}.${hint}`);
    }
    current.fields[key] = { value, line: n };
  });
  closeQuestion();

  // Kopf
  if (!header.title) error(null, 'Es fehlt PAKET: mit dem Titel des Pakets.');
  if (!header.subject) error(null, 'Es fehlt FACH: mit dem Fach.');
  if (!header.kennung) warn(null, 'Keine KENNUNG angegeben. Jede Änderung an der Datei setzt die Statistik der Kinder zurück.');
  else if (header.kennung === CONFIG.pack.templateId) {
    warn(null, 'Die KENNUNG ist noch die aus der Vorlage. Wähle einen eigenen Namen, zum Beispiel englisch6-unit1-4.');
  }

  // Trainer
  const numbers = [...trainers.keys()].sort((a, b) => a - b);
  let gap = false;
  if (!trainers.has(1)) {
    error(null, 'Trainer 1 fehlt. Jedes Paket braucht mindestens === TRAINER 1 ===.');
    gap = true;
  } else {
    for (let k = 2; k <= (numbers.at(-1) ?? 0); k++) {
      if (!trainers.has(k)) {
        error(null, `Trainer ${k} fehlt, aber Trainer ${numbers.find(x => x > k)} ist vorhanden.`);
        gap = true;
        break;
      }
    }
  }

  const { minQuestions, recommendedQuestions, maxHello } = CONFIG.pack;
  for (const num of numbers) {
    const t = trainers.get(num);
    if (!t.name) error(null, `Trainer ${num} hat keinen NAME:.`);
    if (!t.topic) error(null, `Trainer ${num} hat kein THEMA:.`);
    const count = t.questions.length;
    if (count < minQuestions) error(null, `Trainer ${num} hat nur ${count} Fragen. Es braucht mindestens ${minQuestions}.`);
    else if (count < recommendedQuestions) warn(null, `Trainer ${num} hat nur ${count} Fragen, empfohlen sind ${recommendedQuestions}.`);
    if (t.hello.length > maxHello) {
      warn(null, `Trainer ${num} hat mehr als ${maxHello} HALLO-Zeilen. Nur die ersten ${maxHello} werden gezeigt.`);
      t.hello = t.hello.slice(0, maxHello);
    }
  }

  const last = numbers.at(-1) ?? 0;
  if (!gap && last > 0 && last < 8) {
    warn(
      null,
      last === 1
        ? 'Das Paket enthält nur Trainer 1. Die Wege ab Gebiet 2 bleiben im Nebel.'
        : `Das Paket enthält nur Trainer 1 bis ${last}. Die Wege ab Gebiet ${last + 1} bleiben im Nebel.`,
    );
  }

  if (errors.length) return result();

  const identity = packIdentity(text, header.kennung);
  pack = {
    title: header.title,
    subject: header.subject,
    kennung: header.kennung,
    identity,
    shortId: shortId(identity),
    timePressure: header.timePressure,
    trainers: numbers.map(num => {
      const t = trainers.get(num);
      return {
        number: num,
        name: t.name,
        topic: t.topic,
        hello: t.hello.length ? t.hello : [DEFAULT_LINES.hello],
        win: t.win || DEFAULT_LINES.win,
        loss: t.loss || DEFAULT_LINES.loss,
        rematch: t.rematch || DEFAULT_LINES.rematch,
        questions: t.questions,
      };
    }),
    boss: boss ? { hello: boss.hello, win: boss.win, loss: boss.loss } : null,
    notes,
  };
  return result();
}
