// Schild am Nebelrand (Design 10.4, 17): Was es sagt, hängt davon ab, ob der Trainer davor besiegt
// ist, ob das Paket das nächste Thema hat und ob das Gebiet in dieser Spielfassung schon gebaut ist.
// null heißt: Der Weg ist offen (ab Plan 3); dann zeigt fogSignLines den Wegweiser-Text.

import { t } from '../i18n/i18n.js';

// Ist das Gebiet noch nicht gebaut, hilft auch ein neues Thema nicht: Dann sagt das Schild das,
// bevor es auf die Lehrkraft verweist.
export function fogEdgeLines(sign, { gateBeaten, packHasNext, builtAreas }) {
  if (!gateBeaten) return sign.lines;
  if (sign.leadsTo > builtAreas) {
    // „die Spiegeldünen“ sind Mehrzahl
    return [t(sign.leadsToPlural ? 'fog.beyondMany' : 'fog.beyondOne', { name: sign.leadsToName }), t('fog.building')];
  }
  if (!packHasNext) return [t('fog.teacher')];
  return null;
}

// Was das Schild wirklich sagt: Ist der Weg offen, sein Wegweiser-Text (linesOpen).
export const fogSignLines = (sign, ctx) => fogEdgeLines(sign, ctx) ?? sign.linesOpen ?? sign.lines;

// Das Nebelschild, dessen Tor zu diesem Trainer gehört. Eine Karte kann mehrere haben (die Bucht).
export const fogSignFor = (def, trainerNumber) =>
  (def.objects ?? []).find(o => o.type === 'sign' && o.role === 'fogEdge' && o.gate === trainerNumber) ?? null;
