// Startablauf (Design 4, 11): Titel, dann je nach Spielstand weiterspielen, wiederherstellen
// oder ein neues Spiel mit Lernpaket, Intro, Name und Eiwahl.

import { routeAfterTitle } from '../app/flow.js';
import { parsePack } from '../pack/parser.js';
import { newGameState } from '../state.js';
import { createTitleScene } from './title.js';
import { createPackScene } from './pack.js';
import { createIntroScene } from './intro.js';
import { createNameScene } from './name.js';
import { createEggScene } from './eggs.js';
import { createRecoverScene } from './recover.js';
import { createInstallScene } from './install.js';
import { readPlatform } from '../app/platform.js';
import { createGameWorld, RELOCATED } from './worldEvents.js';
import { resolveStart } from '../world/network.js';
import { say } from '../ui/dialog.js';
import { el } from '../ui/dom.js';
import { openSheet } from '../ui/sheet.js';
import { loadBackupPage } from '../menu/backupPages.js';

function storedPack(game) {
  const text = game.packStore.load();
  const r = text ? parsePack(text) : null;
  return r?.ok ? { text, data: r.pack } : null;
}

export function startFlow(game, loaded) {
  const enterWorld = () => game.go(createGameWorld(game));

  // In die Welt an einem Ort, der mit diesem Paket offen ist (Design 10.4). Musste das Kind
  // umziehen, sagt Ilvy kurz Bescheid.
  function enterWorldSafely() {
    const target = resolveStart(game.state, game.pack.data);
    const p = game.state.position;
    const moved = target.map !== p.map || target.x !== p.x || target.y !== p.y;
    if (moved) game.state.position = { ...target };
    const world = createGameWorld(game);
    game.go(world);
    if (moved) world.lock(() => say(game, [RELOCATED], { speaker: 'Ilvy' }));
  }

  // Mit vorhandenem Spielstand in die Welt, vorher bei Bedarf ein Paket laden.
  // fromBackup: Die Sicherung wird sofort zum Hauptstand, damit der kaputte Stand ersetzt ist.
  function continueWith(state, { fromBackup = false } = {}) {
    game.state = state;
    game.saveEnabled = true;
    if (fromBackup) game.save();
    const pack = storedPack(game);
    if (pack) {
      game.pack = pack;
      return enterWorldSafely();
    }
    game.go(createPackScene(game, enterWorldSafely));
  }

  function newGame() {
    game.state = null;
    game.saveEnabled = false;
    const afterPack = () =>
      game.go(createIntroScene(game, () =>
        game.go(createNameScene(game, name =>
          game.go(createEggScene(game, name, (species, nickname) => {
            game.state = newGameState({ name, species, nickname });
            game.saveEnabled = true;
            game.save();
            enterWorld();
          })),
        )),
      ));
    game.go(createPackScene(game, afterPack, { offerRestore: true }));
  }

  function afterTitle() {
    const p = readPlatform();
    const route = routeAfterTitle({ status: loaded.status, storedPackOk: !!storedPack(game), installFirst: p.appleMobile && !p.standalone });
    if (route === 'install') return game.go(createInstallScene(game, newGame));
    if (route === 'world' || route === 'pack-world') return continueWith(loaded.state);
    if (route === 'recover' || route === 'newer') {
      return game.go(createRecoverScene(game, {
        loaded,
        onUseBackup: state => continueWith(state, { fromBackup: true }),
        onNewGame: () => {
          game.store.clear();
          newGame();
        },
        extraButtons: () => loaded.status === 'newer' ? [] : [
          el('button', { class: 'btn', type: 'button', onclick: () => openSheet(game, loadBackupPage(game)) }, 'Spielstand-Datei laden'),
        ],
      }));
    }
    newGame();
  }

  const hint = loaded.status === 'ok' ? 'Tippe, um weiterzuspielen' : 'Tippe, um zu beginnen';
  game.go(createTitleScene(game, afterTitle, { hint }));
}
