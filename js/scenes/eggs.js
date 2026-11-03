// Eiwahl (Design 4, Schritt 5): fünf leuchtende Eier am Strand, Beschreibung und Besonderheit,
// dann schlüpft das Wesen, und es darf einen Spitznamen bekommen.

import { STARTERS, SPECIES } from '../data/species.js';
import { eggRows, EGG_GLOW } from '../gfx/art/eggs.js';
import { creatureRows } from '../gfx/art/creatures.js';
import { spriteFrom } from '../gfx/canvasSprites.js';
import { say, choose, closeDialogs } from '../ui/dialog.js';
import { el, clear } from '../ui/dom.js';
import { createFreshGuard, guardClicks } from '../ui/freshGuard.js';
import { askName } from './name.js';
import { t, tl } from '../i18n/i18n.js';

const EGG_Y = 50;
const eggX = i => 24 + i * 42;

function drawBeach(ctx, t) {
  const sky = ctx.createLinearGradient(0, 0, 0, 30);
  sky.addColorStop(0, '#4fa3c4');
  sky.addColorStop(1, '#a7dde8');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 240, 30);
  ctx.fillStyle = '#2f6f9c';
  ctx.fillRect(0, 22, 240, 12);
  ctx.fillStyle = '#4fa3c4';
  for (let x = (Math.floor(t / 140) % 14) - 14; x < 240; x += 14) ctx.fillRect(x, 27, 7, 1);
  ctx.fillStyle = '#a7dde8';
  for (let x = (Math.floor(t / 200) % 10) - 10; x < 240; x += 10) ctx.fillRect(x, 33, 5, 1);
  ctx.fillStyle = '#f1ddb0';
  ctx.fillRect(0, 34, 240, 126);
  ctx.fillStyle = '#e2c48f';
  for (let i = 0; i < 90; i++) ctx.fillRect((i * 37) % 240, 36 + ((i * 23) % 120), 1, 1);
}

export function createEggScene(game, playerName, next) {
  let selected = 0;
  let t = 0;
  let phase = 'talk'; // talk → pick → hatch → done
  let hatchStart = 0;
  let info = null;
  const hitAreas = [];
  const offs = [];
  let active = true;
  const pickGuard = createFreshGuard();

  function showInfo() {
    if (!info) return;
    clear(info);
    const sp = SPECIES[STARTERS[selected]];
    info.append(
      el('h3', { class: 'egg-name' }, sp.names[0]),
      el('p', {}, sp.description),
      el('p', { class: 'egg-special' }, el('b', {}, t('creature.specialLabel', { name: sp.special.name })), sp.special.text),
      el(
        'div',
        { class: 'row' },
        el('button', { class: 'btn', type: 'button', 'aria-label': t('eggs.prev'), onclick: () => move(-1) }, '◀'),
        el('button', { class: 'btn primary', type: 'button', onclick: confirm }, t('eggs.choose')),
        el('button', { class: 'btn', type: 'button', 'aria-label': t('eggs.next'), onclick: () => move(1) }, '▶'),
      ),
    );
  }

  function move(d) {
    if (phase !== 'pick') return;
    selected = (selected + d + STARTERS.length) % STARTERS.length;
    showInfo();
  }

  function select(i) {
    if (phase !== 'pick') return;
    selected = i;
    showInfo();
  }

  async function confirm() {
    if (phase !== 'pick') return;
    phase = 'confirm';
    info.remove();
    const yes = (await choose(game, t('eggs.sure'), [t('common.yes'), t('common.no')])) === 0;
    if (!active) return;
    if (!yes) {
      phase = 'pick';
      game.panel.append(info);
      return;
    }
    phase = 'hatch';
    hatchStart = t;
    await new Promise(r => setTimeout(r, game.reducedMotion ? 600 : 1500));
    if (!active) return;
    const species = STARTERS[selected];
    const name = SPECIES[species].names[0];
    await say(game, tl('eggs.hatched', { name }));
    if (!active) return;
    const wants = (await choose(game, t('eggs.askNickname', { name }), [t('common.yes'), t('common.no')])) === 0;
    let nickname = null;
    if (wants && active) nickname = await askName(game, { prompt: t('eggs.nickname'), allowEmpty: true, skipLabel: t('eggs.noNickname') });
    if (!active) return;
    phase = 'done';
    next(species, nickname);
  }

  async function intro() {
    await say(game, tl('eggs.welcome', { name: playerName }), { speaker: 'Ilvy' });
    if (!active) return;
    phase = 'pick';
    info = el('div', { class: 'box egg-info' });
    pickGuard.reset();
    game.panel.append(info);
    guardClicks(info, pickGuard);
    showInfo();
  }

  return {
    enter() {
      game.mode = 'screen';
      STARTERS.forEach((_, i) => {
        const hit = el('button', {
          class: 'egg-hit',
          type: 'button',
          'aria-label': SPECIES[STARTERS[i]].names[0],
          style: {
            left: `calc(var(--gpx) * ${eggX(i) - 6})`,
            top: `calc(var(--gpx) * ${EGG_Y - 8})`,
            width: `calc(var(--gpx) * 28)`,
            height: `calc(var(--gpx) * 34)`,
          },
          onclick: () => select(i),
        });
        hitAreas.push(hit);
        game.ui.append(hit);
      });
      offs.push(game.input.on('left', () => move(-1)), game.input.on('right', () => move(1)), game.input.on('a', () => {
        if (phase === 'pick' && !pickGuard.isFresh()) confirm();
      }));
      intro();
    },
    exit() {
      active = false;
      hitAreas.forEach(h => h.remove());
      offs.forEach(off => off());
      info?.remove();
      closeDialogs();
    },
    update(dt) {
      t += dt;
    },
    render(ctx) {
      drawBeach(ctx, t);
      STARTERS.forEach((id, i) => {
        const x = eggX(i);
        let y = EGG_Y + (i === selected && phase === 'pick' ? -3 : 0);
        const pulse = game.reducedMotion ? 0.35 : 0.25 + 0.15 * Math.sin(t / 700 + i);
        const isHatching = phase === 'hatch' && i === selected;
        const since = t - hatchStart;

        if (phase === 'hatch' || phase === 'done') {
          if (i !== selected) {
            ctx.globalAlpha = 0.35;
          }
        }
        const glow = ctx.createRadialGradient(x + 8, y + 10, 2, x + 8, y + 10, 20);
        glow.addColorStop(0, `rgba(${EGG_GLOW[id]}, ${isHatching ? Math.min(0.9, 0.3 + since / 1500) : pulse})`);
        glow.addColorStop(1, `rgba(${EGG_GLOW[id]}, 0)`);
        ctx.fillStyle = glow;
        ctx.fillRect(x - 12, y - 10, 40, 40);

        const hatched = (phase === 'hatch' && since > 1100) || phase === 'done';
        if (i === selected && hatched) {
          const rows = creatureRows(id, 1);
          ctx.drawImage(spriteFrom(`creature:${id}:1`, rows), x - 8, y - 10);
        } else {
          let wobble = 0;
          if (isHatching && !game.reducedMotion && since < 1000) wobble = Math.round(Math.sin(since / 55) * 2);
          ctx.drawImage(spriteFrom(`egg:${id}`, eggRows(id)), x + wobble, y);
          if (isHatching && since > 900 && since < 1200) {
            ctx.fillStyle = `rgba(255, 250, 240, ${1 - Math.abs(since - 1050) / 150})`;
            ctx.fillRect(x - 6, y - 6, 28, 32);
          }
        }
        ctx.globalAlpha = 1;
        if (i === selected && phase === 'pick') {
          ctx.fillStyle = '#1b1a2e';
          const ay = EGG_Y - 10 + (game.reducedMotion ? 0 : Math.round(Math.sin(t / 250)));
          ctx.fillRect(x + 6, ay, 4, 1);
          ctx.fillRect(x + 7, ay + 1, 2, 1);
        }
      });
    },
  };
}
