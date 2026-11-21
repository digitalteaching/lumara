// Tagebuch (Design 5.4, 13): ganz oben der Aushang von heute und die offenen Wünsche der Bewohner
// (Lumara 1.3), dann die Aufträge, darunter die gefundenen Geschichtsstücke nach Gebiet.
// Fehlende Stücke stehen als „Noch nicht gefunden“ da.

import { el } from '../ui/dom.js';
import { STORY, storyPieces, secretStory } from '../data/story.js';
import { SECRET_PLACES } from '../data/secrets.js';
import { mapOfArea, areaName as nameOf } from '../world/network.js';
import { t } from '../i18n/i18n.js';
import { questLog } from '../world/quests.js';
import { boardView } from '../world/board.js';
import { WISH_GIVERS, wishOf, wishHint, wisherName } from '../world/wishes.js';
import { treasureName } from '../items/treasures.js';
import { boardTaskList } from './boardPage.js';

const areaName = area => (mapOfArea(area) ? nameOf(mapOfArea(area)) : t('diary.area', { n: area }));

// Offene Wünsche nach Gebiet: Name des Bewohners (aus seiner Karte), Schatz und wo man ihn findet.
function openWishes(state) {
  return Object.values(WISH_GIVERS).flatMap(({ npc }) => {
    const w = wishOf(state, npc);
    if (!w || w.done !== false) return [];
    return [{ text: t('wish.diary', { name: wisherName(npc), treasure: treasureName(w.treasure) }), hint: wishHint(w.treasure) }];
  });
}

export function diaryPage(game) {
  return {
    title: t('menu.diary'),
    render(body) {
      const found = game.state.story;
      const areas = Object.keys(STORY).map(Number).sort((a, b) => a - b);
      const log = questLog(game.state);
      const board = boardView(game.state);
      const wishes = openWishes(game.state);
      body.append(
        el('div', { class: 'sheet-section diary-board' },
          el('h3', {}, t('diary.board')),
          board.tasks.length ? boardTaskList(board) : el('p', { class: 'small' }, t('diary.noBoard'))),
        el('div', { class: 'sheet-section diary-wishes' },
          el('h3', {}, t('diary.wishes')),
          wishes.length
            ? el('ul', { class: 'quest-log' }, wishes.map(w => el('li', { class: 'open' }, el('b', {}, w.text), el('span', { class: 'quest-hint' }, w.hint))))
            : el('p', { class: 'small' }, t('diary.noWishes'))),
        el('div', { class: 'sheet-section diary-quests' },
          el('h3', {}, t('diary.quests')),
          log.length
            ? el('ul', { class: 'quest-log' }, log.map(q => el('li', { class: q.done ? 'done' : 'open' },
              el('b', {}, `${q.done ? '✓' : '○'} ${q.title}`), q.hint ? el('span', { class: 'quest-hint' }, q.hint) : null)))
            : el('p', { class: 'small' }, t('diary.noQuests'))),
        el('div', { class: 'sheet-section diary' },
          el('h3', {}, t('diary.story')),
          areas.map(area =>
            el('div', { class: 'diary-area' },
              el('h4', {}, areaName(area)),
              storyPieces(area).map((text, i) =>
                i < (found[area] ?? 0)
                  ? el('p', { class: 'diary-piece' }, text)
                  : el('p', { class: 'diary-piece missing' }, t('diary.missing'))),
            )),
        ),
        // Die Geheimstücke der Geschichte (Design 5.5), je geheimem Ort eines
        el('div', { class: 'sheet-section diary' },
          el('h3', {}, t('diary.secrets')),
          Object.keys(SECRET_PLACES).map(place =>
            el('div', { class: 'diary-area' },
              el('h4', {}, game.state.secrets?.[place]?.story ? t(`secret.name.${place}`) : '???'),
              game.state.secrets?.[place]?.story
                ? el('p', { class: 'diary-piece' }, secretStory(place))
                : el('p', { class: 'diary-piece missing' }, t('diary.missing'))))),
      );
    },
  };
}
