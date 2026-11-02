// Übergänge zwischen Welt und Duell (Design 7.1). Erst wird das Bild abgedeckt, dann aufgedeckt.
// Bei reduzierter Bewegung gibt es immer eine einfache Überblendung.

const COLOR = '18, 17, 31';

function draw(ctx, style, p) {
  if (style === 'wild') {
    ctx.fillStyle = `rgb(${COLOR})`;
    for (let i = 0; i < 10; i++) {
      const w = Math.round(p * 240);
      ctx.fillRect(i % 2 ? 240 - w : 0, i * 16, w, 16);
    }
  } else if (style === 'trainer') {
    ctx.fillStyle = `rgb(${COLOR})`;
    ctx.beginPath();
    ctx.rect(0, 0, 240, 160);
    ctx.arc(120, 80, Math.max(0, (1 - p) * 150), 0, Math.PI * 2, true);
    ctx.fill('evenodd');
  } else {
    ctx.fillStyle = `rgba(${COLOR}, ${p})`;
    ctx.fillRect(0, 0, 240, 160);
  }
}

// Deckt das Bild in 500 ms ab und bleibt abgedeckt, bis reveal() kommt.
export function playTransition(game, style, ms = 500) {
  const s = game.reducedMotion ? 'fade' : style;
  return new Promise(resolve => {
    const start = performance.now();
    let done = false;
    game.overlay = {
      render(ctx) {
        const p = Math.min(1, (performance.now() - start) / ms);
        draw(ctx, s, p);
        if (p >= 1 && !done) {
          done = true;
          resolve();
        }
      },
    };
  });
}

// Deckt das Bild wieder auf.
export function reveal(game, ms = 300) {
  return new Promise(resolve => {
    const start = performance.now();
    game.overlay = {
      render(ctx) {
        const p = Math.min(1, (performance.now() - start) / ms);
        ctx.fillStyle = `rgba(${COLOR}, ${1 - p})`;
        ctx.fillRect(0, 0, 240, 160);
        if (p >= 1) {
          game.overlay = null;
          resolve();
        }
      },
    };
  });
}
