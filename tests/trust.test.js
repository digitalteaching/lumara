import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTrust, trustAnswer } from '../js/friends/trust.js';

const run = (seq, opts) => {
  const tr = createTrust(opts);
  const out = [...seq].map(c => trustAnswer(tr, c === 'R'));
  return { tr, out };
};

test('Ring: drei richtige gewinnen nach der dritten', () => {
  assert.deepEqual(run('RRR').out, ['open', 'open', 'won']);
});
test('Ring: drei falsche verlieren nach der dritten', () => {
  assert.deepEqual(run('FFF').out, ['open', 'open', 'lost']);
});
test('Ring: R F R F R gewinnt bei der fünften', () => {
  assert.deepEqual(run('RFRFR').out, ['open', 'open', 'open', 'open', 'won']);
});
test('Ring: F R F R F verliert bei der fünften', () => {
  assert.deepEqual(run('FRFRF').out, ['open', 'open', 'open', 'open', 'lost']);
});
test('Ring mit Leckerli: zwei richtige gewinnen', () => {
  assert.equal(createTrust({ treat: true }).filled, 1);
  assert.deepEqual(run('RR', { treat: true }).out, ['open', 'won']);
});
test('Ring mit Leckerli: verloren erst nach der vierten falschen', () => {
  assert.deepEqual(run('FFFF', { treat: true }).out, ['open', 'open', 'open', 'lost']);
});
test('Ring: ein fertiger Ring ändert sich nicht mehr', () => {
  const { tr } = run('RRR');
  assert.equal(trustAnswer(tr, false), 'won');
  assert.deepEqual(tr, { filled: 3, asked: 3, state: 'won' });
  const l = run('FFF').tr;
  assert.equal(trustAnswer(l, true), 'lost');
  assert.deepEqual(l, { filled: 0, asked: 3, state: 'lost' });
});
