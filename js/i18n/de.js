// Texte der Oberfläche auf Deutsch (Design 10.6). Das ist die Quelle: Jeder Schlüssel hier braucht
// einen in jeder anderen Sprache (tests/i18n.test.js). Platzhalter stehen in {geschweiften Klammern}.

export const DE = {
  // Allgemein
  'app.title': 'Lumara – Das Land unter dem Nebel',
  'common.yes': 'Ja',
  'common.no': 'Nein',
  'common.next': 'Weiter',
  'creature.specialLabel': 'Besonderheit: {name}. ',

  // Titel und Start
  'title.sub': 'Das Land unter dem Nebel',
  'title.tapStart': 'Tippe, um zu beginnen',
  'title.tapContinue': 'Tippe, um weiterzuspielen',
  'start.loadBackupFile': 'Spielstand-Datei laden',

  // Intro
  'intro.lines': [
    'Da bist du ja! Willkommen auf Lumara.',
    'Ich bin Ilvy. Ich passe auf den Leuchtturm hier in der Bucht auf.',
    'Früher leuchteten auf der Insel acht Leuchtsteine. Sie bewahrten alles, was die Menschen lernten.',
    'Dann sind sie erloschen. Seitdem liegt ein Nebel des Vergessens über dem Land.',
    'Aber sag mal … wie heißt du eigentlich?',
  ],
  'intro.skip': 'Überspringen',

  // Name
  'name.ask': 'Wie heißt du?',
  'name.empty': 'Bitte gib einen Namen ein.',
  'name.tooLong': 'Höchstens {max} Zeichen.',

  // Eier
  'eggs.welcome': [
    'Schön, dich kennenzulernen, {name}!',
    'Heute Morgen hat das Meer fünf leuchtende Eier an den Strand gespült.',
    'Eines davon gehört zu dir. Such dir eins aus!',
  ],
  'eggs.prev': 'Voriges Ei',
  'eggs.next': 'Nächstes Ei',
  'eggs.choose': 'Dieses Ei wählen',
  'eggs.sure': 'Bist du sicher?',
  'eggs.hatched': ['{name} ist geschlüpft!', '{name} schaut dich neugierig an.'],
  'eggs.askNickname': 'Möchtest du {name} einen Spitznamen geben?',
  'eggs.nickname': 'Spitzname',
  'eggs.noNickname': 'Ohne Spitznamen',

  // Spielstand retten
  'recover.newGameAsk': 'Neues Spiel beginnen? Dein bisheriges Spiel ist dann weg.',
  'recover.newGameSure': 'Wirklich? Das lässt sich nicht rückgängig machen.',
  'recover.yesNew': 'Ja, neu beginnen',
  'recover.newer': 'Dieser Spielstand stammt aus einer neueren Fassung von Lumara.',
  'recover.reloadHint': 'Lade die Seite neu, dann geht es weiter.',
  'recover.reload': 'Neu laden',
  'recover.damaged': 'Dein Spielstand ist beschädigt.',
  'recover.backupInfo': 'Auf diesem Gerät gibt es noch eine Sicherung: {name}, Level {level}, gespeichert am {date}.',
  'recover.useBackup': 'Sicherung laden',
  'recover.newGame': 'Neues Spiel beginnen',
  'recover.broken': 'Dein Spielstand ist beschädigt und lässt sich nicht laden.',
  'recover.fileHint': 'Wenn du eine Sicherungsdatei hast, kannst du sie laden.',

  // Home-Bildschirm
  'install.title': 'Bevor es losgeht',
  'install.text': 'Leg Lumara auf deinen Home-Bildschirm. Dann bleibt dein Spielstand sicher gespeichert.',
  'install.browser': 'Trotzdem im Browser spielen',
};
