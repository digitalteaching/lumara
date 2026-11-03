// Schild am Nebelrand (Design 10.4, 17): Was es sagt, hängt davon ab, ob der Trainer davor besiegt
// ist, ob das Paket das nächste Thema hat und ob das Gebiet in dieser Spielfassung schon gebaut ist.
// null heißt: Der Weg ist offen (ab Plan 3); dann zeigt fogSignLines den Wegweiser-Text.

const TEACHER_LINE = 'Dieser Weg öffnet sich, sobald deine Lehrkraft das nächste Thema freigibt.';

// Ist das Gebiet noch nicht gebaut, hilft auch ein neues Thema nicht: Dann sagt das Schild das,
// bevor es auf die Lehrkraft verweist.
export function fogEdgeLines(sign, { gateBeaten, packHasNext, builtAreas }) {
  if (!gateBeaten) return sign.lines;
  if (sign.leadsTo > builtAreas) {
    const verb = sign.leadsToPlural ? 'liegen' : 'liegt'; // „die Spiegeldünen“ sind Mehrzahl
    return [`Hinter dem Nebel ${verb} ${sign.leadsToName}.`, 'Der Weg dorthin entsteht gerade. In einer der nächsten Spielfassungen kannst du hindurch.'];
  }
  if (!packHasNext) return [TEACHER_LINE];
  return null;
}

// Was das Schild wirklich sagt: Ist der Weg offen, sein Wegweiser-Text (linesOpen).
export const fogSignLines = (sign, ctx) => fogEdgeLines(sign, ctx) ?? sign.linesOpen ?? sign.lines;

// Das Nebelschild, dessen Tor zu diesem Trainer gehört. Eine Karte kann mehrere haben (die Bucht).
export const fogSignFor = (def, trainerNumber) =>
  (def.objects ?? []).find(o => o.type === 'sign' && o.role === 'fogEdge' && o.gate === trainerNumber) ?? null;
