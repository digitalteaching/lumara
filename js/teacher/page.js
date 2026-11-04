// Seite für Lehrkräfte (Design 12.3): Statistik prüfen, Lernpaket prüfen, Probefrage.
// Speichert nichts und lädt nichts hoch.

import { el, clear, appendAll } from '../ui/dom.js';
import { CONFIG } from '../config.js';
import { parsePack } from '../pack/parser.js';
import { decodePackBytes } from '../pack/decode.js';
import { parseStatsForm, verifyCode } from './verify.js';
import { packOverview } from './overview.js';

// ---------- Statistik prüfen ----------

const form = document.getElementById('stats-form');
const statsResult = document.getElementById('stats-result');

form.addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(form);
  const raw = Object.fromEntries(['name', 'packId', 'level', 'stage', 'wins', 'accuracy', 'playTime', 'trainers'].map(k => [k, f.get(k) ?? '']));
  raw.boss = f.get('boss') === 'on';
  clear(statsResult);
  const parsed = parseStatsForm(raw);
  if (!parsed.ok) {
    statsResult.append(el('ul', { class: 'problems' }, parsed.problems.map(p => el('li', {}, p))));
    return;
  }
  const r = verifyCode(parsed.stats, f.get('code'));
  if (!r.ok) statsResult.append(el('ul', { class: 'problems' }, el('li', {}, r.problem)));
  else if (r.match) statsResult.append(el('p', { class: 'result ok' }, el('span', { 'aria-hidden': 'true' }, '✓ '), 'Die Angaben sind echt.'));
  else statsResult.append(el('p', { class: 'result bad' }, el('span', { 'aria-hidden': 'true' }, '✗ '), 'Die Angaben passen nicht zum Prüfcode.'));
});

// ---------- Lernpaket prüfen ----------

const fileInput = document.getElementById('pack-file');
const packResult = document.getElementById('pack-result');
const probe = document.getElementById('probe');
const probeTitle = document.getElementById('probe-title');
const frame = document.getElementById('probe-frame');
let current = null; // { text, trainer }

function list(cls, icon, items) {
  return el('ul', { class: cls }, items.map(m => el('li', {}, el('span', { 'aria-hidden': 'true' }, `${icon} `), m)));
}

function showPack(text, parsed) {
  clear(packResult);
  if (!parsed.ok) {
    packResult.append(el('p', { class: 'result bad' }, '✗ Das Paket hat Fehler. Kinder können es so nicht laden.'), list('errors', '✗', parsed.errors.map(e => e.message)));
    if (parsed.warnings.length) packResult.append(el('h3', {}, 'Hinweise'), list('warnings', '⚠', parsed.warnings.map(w => w.message)));
    return;
  }
  const o = packOverview(parsed.pack);
  appendAll(packResult,
    el('p', { class: 'result ok' }, '✓ Das Paket lässt sich laden.'),
    el('p', {}, el('b', {}, o.title), ` (${o.subject}) · Kennung `, el('b', {}, o.shortId)),
    o.hasKennung ? null : el('p', { class: 'warn' }, '⚠ Keine KENNUNG angegeben. Jede Änderung an der Datei setzt die Statistik der Kinder zurück.'),
  );
  if (parsed.warnings.length) packResult.append(el('h3', {}, 'Hinweise'), list('warnings', '⚠', parsed.warnings.map(w => w.message)));
  packResult.append(
    el('div', { class: 'table-wrap' }, el('table', {},
      el('thead', {}, el('tr', {}, ['Nr.', 'Name', 'Thema', 'Fragen', 'Auswahl', 'Eintippen', 'Kärtchen', ''].map(h => el('th', {}, h)))),
      el('tbody', {}, o.trainers.map(t => el('tr', {},
        el('td', {}, String(t.number)), el('td', {}, t.name ?? '–'), el('td', {}, t.topic ?? '–'),
        el('td', {}, String(t.questions)), el('td', {}, String(t.choice)), el('td', {}, String(t.typing)), el('td', {}, String(t.tiles)),
        el('td', {}, el('button', { class: 'btn', type: 'button', onclick: () => startProbe(text, t) }, 'Probefrage')),
      ))),
    )),
    el('p', {}, `Zettel: ${o.notes} · Endgegner: ${o.boss ? 'ja' : 'nein'}`),
  );
}

function startProbe(text, trainer) {
  current = { text, trainer: trainer.number };
  probe.hidden = false;
  probeTitle.textContent = `Probefrage: Trainer ${trainer.number}${trainer.topic ? ` · ${trainer.topic}` : ''}`;
  frame.src = `index.html?probe&t=${Date.now()}`;
  probe.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

window.addEventListener('message', e => {
  if (e.origin !== location.origin || e.source !== frame.contentWindow || e.data?.type !== 'lumara-probe-ready' || !current) return;
  frame.contentWindow.postMessage({ type: 'lumara-probe', packText: current.text, trainer: current.trainer }, location.origin);
});

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  fileInput.value = '';
  if (!file) return;
  probe.hidden = true;
  frame.removeAttribute('src');
  // Selbst lesen statt readPackFile: Die Lehrkraft braucht auch bei Fehlern die Hinweise.
  const failed = message => showPack(null, { ok: false, errors: [{ message }], warnings: [] });
  if (file.size > CONFIG.pack.maxBytes) return failed('Die Datei ist größer als 1 MB.');
  let text;
  try {
    text = decodePackBytes(await file.arrayBuffer());
  } catch {
    return failed('Die Datei konnte nicht gelesen werden.');
  }
  showPack(text, parsePack(text));
});
