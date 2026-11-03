// Schild am Nebelrand (Design 10.4, 17): Was es sagt, hängt davon ab, ob der Trainer davor besiegt
// ist, ob das Paket das nächste Thema hat und ob das Gebiet in dieser Spielfassung schon gebaut ist.
// null heißt: Der Weg ist offen (ab Plan 3); dann zeigt fogSignLines den Wegweiser-Text.

const TEACHER_LINE = 'Dieser Weg öffnet sich, sobald deine Lehrkraft das nächste Thema freigibt.';

export function fogEdgeLines(sign, { gateBeaten, packHasNext, builtAreas }) {
  if (!gateBeaten) return sign.lines;
  if (!packHasNext) return [TEACHER_LINE];
  if (sign.leadsTo > builtAreas) {
    return [`Hinter dem Nebel liegt ${sign.leadsToName}.`, 'Der Weg dorthin entsteht gerade. In einer der nächsten Spielfassungen kannst du hindurch.'];
  }
  return null;
}

// Was das Schild wirklich sagt: Ist der Weg offen, sein Wegweiser-Text (linesOpen).
export const fogSignLines = (sign, ctx) => fogEdgeLines(sign, ctx) ?? sign.linesOpen ?? sign.lines;
