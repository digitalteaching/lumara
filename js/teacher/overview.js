// Übersicht über ein Lernpaket für die Lehrkraft (Design 12.3): Fragen und mögliche Antwortformen je Trainer.

const count = (questions, form) => questions.filter(q => q.forms.includes(form)).length;

export function packOverview(pack) {
  return {
    title: pack.title,
    subject: pack.subject,
    shortId: pack.shortId,
    hasKennung: !!pack.kennung,
    trainers: pack.trainers.map(t => ({
      number: t.number,
      name: t.name,
      topic: t.topic,
      questions: t.questions.length,
      choice: count(t.questions, 'choice'),
      typing: count(t.questions, 'typing'),
      tiles: count(t.questions, 'tiles'),
    })),
    notes: pack.notes.length,
    boss: !!pack.boss,
  };
}
