// Antworten prüfen (Design 7.3) und die Antwortformen vorbereiten. DOM-frei.

const NUMBER = /^-?\d+([.,]\d+)?$/;

export function normalizeTyped(s) {
  return s
    .normalize('NFC')
    .replace(/[\s   ]+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/[’‘‛`´]/g, "'")
    .replace(/[“”„]/g, '"')
    .replace(/\s*[.!?]+$/, '')
    .trim();
}

function same(input, accepted) {
  if (input === accepted) return true;
  if (NUMBER.test(accepted)) return input.replace(',', '.') === accepted.replace(',', '.');
  return false;
}

// Genau ein Buchstabe anders: eingefügt, gelöscht, ersetzt oder zwei Nachbarn vertauscht.
export function oneEditApart(a, b) {
  if (a === b) return false;
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a.length === b.length) {
    const diffs = [];
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diffs.push(i);
    if (diffs.length === 1) return true;
    if (diffs.length === 2) {
      const [i, j] = diffs;
      return j === i + 1 && a[i] === b[j] && a[j] === b[i];
    }
    return false;
  }
  const [short, long] = a.length < b.length ? [a, b] : [b, a];
  let i = 0;
  let j = 0;
  let skipped = false;
  while (i < short.length && j < long.length) {
    if (short[i] === long[j]) {
      i++;
      j++;
    } else {
      if (skipped) return false;
      skipped = true;
      j++;
    }
  }
  return true;
}

export function checkTyped(input, accepted, knownWrong = []) {
  const inp = normalizeTyped(input);
  if (!inp) return { correct: false, almost: false };
  const normalized = accepted.map(normalizeTyped);
  if (normalized.some(a => same(inp, a))) return { correct: true, almost: false };
  const isKnownWrong = knownWrong.some(w => normalizeTyped(w) === inp);
  const almost = !isKnownWrong && normalized.some(a => a.length >= 4 && oneEditApart(inp, a));
  return { correct: false, almost };
}

export function sentenceTokens(s) {
  return s.trim().split(/\s+/).filter(Boolean);
}

export function checkTiles(placed, sentences) {
  const got = placed.join(' ');
  return sentences.some(s => sentenceTokens(s).join(' ') === got);
}

export function acceptedAnswers(q) {
  return [q.answer ?? q.sentence, ...q.alsoCorrect];
}

export function correctText(q) {
  return q.answer ?? q.sentence;
}

export function buildChoices(q, rng) {
  const right = normalizeTyped(q.answer);
  const seen = new Set([right]);
  const pool = [];
  for (const w of rng.shuffle(q.wrong)) {
    const k = normalizeTyped(w);
    if (seen.has(k)) continue;
    seen.add(k);
    pool.push(w);
  }
  const options = rng.shuffle([q.answer, ...pool.slice(0, 3)]);
  return { options, correctIndex: options.indexOf(q.answer) };
}

export function buildTiles(q, rng) {
  const tokens = sentenceTokens(q.sentence);
  const items = [...tokens, ...q.extra].map((text, i) => ({ text, i }));
  const isOrdered = order => order.filter(x => x.i < tokens.length).map(x => x.text).join(' ') === tokens.join(' ');

  let order = rng.shuffle(items);
  if (tokens.length > 1) {
    for (let tries = 0; tries < 10 && isOrdered(order); tries++) order = rng.shuffle(items);
    if (isOrdered(order)) {
      const positions = order.map((x, p) => (x.i < tokens.length ? p : -1)).filter(p => p >= 0);
      const first = positions[0];
      const other = positions.find(p => order[p].text !== order[first].text);
      if (other !== undefined) [order[first], order[other]] = [order[other], order[first]];
    }
  }
  return order.map(x => x.text);
}

export function jokerHint(presented, rng) {
  const { question, form } = presented;
  if (form === 'choice') {
    const wrong = [0, 1, 2, 3].filter(i => i !== presented.choices.correctIndex);
    return { removeIndices: rng.shuffle(wrong).slice(0, 2) };
  }
  if (form === 'typing') return { firstLetter: question.answer.trim()[0] };
  return { firstTile: sentenceTokens(question.sentence)[0] };
}
