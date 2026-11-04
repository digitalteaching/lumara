// Spielsprache aus dem Lernpaket (Design 10.6). SPIELSPRACHE gilt vor FACH. Nennt das Fach eine
// Sprache, die das Spiel kann, läuft es darin, sonst auf Deutsch. Hinweise sind für die Lehrkraft
// und deshalb Deutsch. DOM-frei.

export const LANGUAGES = ['de', 'en', 'fr', 'es'];
// Sprachen, deren Texte vollständig sind (seit Plan 7 alle vier).
export const READY = ['de', 'en', 'fr', 'es'];

const WORDS = {
  de: ['deutsch', 'german', 'de', 'allemand', 'aleman'],
  en: ['englisch', 'english', 'en', 'anglais', 'ingles'],
  fr: ['franzosisch', 'franzoesisch', 'french', 'fr', 'francais', 'frances'],
  es: ['spanisch', 'spanish', 'es', 'espanol', 'espagnol'],
};
const NAMES = { de: 'Deutsch', en: 'Englisch', fr: 'Französisch', es: 'Spanisch' };

// Sprachfächer, die das Spiel nicht kann: Wort → Name im Hinweis.
const UNSUPPORTED = {
  latein: 'Latein', latin: 'Latein',
  italienisch: 'Italienisch', italian: 'Italienisch',
  niederlandisch: 'Niederländisch', niederlaendisch: 'Niederländisch', dutch: 'Niederländisch',
  russisch: 'Russisch', russian: 'Russisch',
  turkisch: 'Türkisch', tuerkisch: 'Türkisch', turkish: 'Türkisch',
  polnisch: 'Polnisch', polish: 'Polnisch',
  portugiesisch: 'Portugiesisch', portuguese: 'Portugiesisch',
  griechisch: 'Griechisch', greek: 'Griechisch',
  chinesisch: 'Chinesisch', chinese: 'Chinesisch',
  japanisch: 'Japanisch', japanese: 'Japanisch',
  arabisch: 'Arabisch', arabic: 'Arabisch',
};

// Klein, ohne Akzente: „Französisch“ → „franzosisch“, „Español“ → „espanol“.
const plain = s => String(s ?? '').normalize('NFD').replace(/\p{M}/gu, '').replace(/ß/g, 'ss').toLowerCase();
const words = s => plain(s).split(/[^a-z]+/).filter(Boolean);
const codeOf = word => LANGUAGES.find(l => WORDS[l].includes(word)) ?? null;

// Im Fach zählen ganze Sprachnamen. Ein Kürzel wie „de“ oder „en“ zählt nur, wenn es das ganze Fach
// ist, sonst würde „Englisch Vokabeln DE-EN“ deutsch. Nur „Deutsch“ geht vor, damit „Deutsch als
// Zweitsprache“ deutsch bleibt; sonst gilt die erste Sprache im Fach.
const nameOf = w => (w.length > 2 ? codeOf(w) : null);
function fromSubject(subject) {
  const list = words(subject);
  if (list.includes('deutsch')) return { code: 'de', unsupported: null };
  if (list.length === 1 && codeOf(list[0])) return { code: codeOf(list[0]), unsupported: null };
  for (const w of list) {
    const code = nameOf(w);
    if (code) return { code, unsupported: null };
  }
  const other = list.find(w => UNSUPPORTED[w]);
  return { code: 'de', unsupported: other ? UNSUPPORTED[other] : null };
}

export function packLanguage({ subject, gameLanguage = null, gameLanguageLine = null }) {
  const hints = [];
  let requested = null;
  let unsupported = null;
  if (gameLanguage != null && String(gameLanguage).trim()) {
    requested = codeOf(plain(gameLanguage).trim());
    if (!requested) {
      const where = gameLanguageLine ? `Zeile ${gameLanguageLine}: ` : '';
      hints.push({
        line: gameLanguageLine,
        message: `${where}Unbekannte SPIELSPRACHE „${String(gameLanguage).trim()}“. Möglich sind deutsch, englisch, französisch und spanisch.`,
      });
    }
  }
  if (!requested) ({ code: requested, unsupported } = fromSubject(subject));
  if (unsupported) hints.push({ line: null, message: `Das Spiel gibt es noch nicht auf ${unsupported}. Es läuft auf Deutsch.` });
  const ready = READY.includes(requested);
  if (!ready) {
    hints.push({ line: null, message: `Das Spiel auf ${NAMES[requested]} kommt in einer späteren Spielfassung. Bis dahin läuft es auf Deutsch.` });
  }
  return { language: ready ? requested : 'de', requested, hints };
}
