// Das Finale (Design 5.4, 9): Nach dem Sieg über Morrow und seinem Namen löst sich der Nebel, die
// Bewohner sagen neue Sätze, und Morrow wohnt am Leuchtturm. Dieser Zustand gehört dem Kind und
// bleibt auch bei einem Paketwechsel (Design 10.4). DOM-frei.

export const finaleDone = state => state?.finale?.done === true;
