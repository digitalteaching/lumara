// Der Tonweg: Szenen und Oberfläche spielen Töne, ohne das Audio selbst zu kennen. main.js meldet das
// Audio an (setAudio); ohne Audio (Tests, Probefrage) passiert nichts.

let current = null;

export const setAudio = audio => {
  current = audio;
};
export const sound = id => current?.sfx(id);
export const jingle = id => current?.jingle(id);
export const musicTo = id => current?.music(id);
