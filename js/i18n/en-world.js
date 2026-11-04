// Die Gebiete auf Englisch (Design 10.6): Namen und alle Texte der Karten, Zeile für Zeile nach dem
// Deutschen. areas: name (Reisemenü, Karte), of (im Satz „The light stone of …“), the (auf dem
// Nebelschild „Beyond the mist lies …“). objects: je Karte und Objekt-id die Textfelder; Trainer
// heißen „trainer“. tests/i18n.test.js prüft, dass zu jedem deutschen Text der englische da ist.

const FOG_CLOSED = 'The mist is too thick here.';
const FOG_GONE = 'The mist has moved back. The way is free.';

export const EN_WORLD = {
  areas: {
    bucht: { name: 'Lighthouse Bay', of: 'of Lighthouse Bay', the: 'Lighthouse Bay' },
    wald: { name: 'Whispering Woods', of: 'of the Whispering Woods', the: 'the Whispering Woods' },
    moor: { name: 'Mushroom Marsh', of: 'of the Mushroom Marsh', the: 'the Mushroom Marsh' },
    duenen: { name: 'Mirror Dunes', of: 'of the Mirror Dunes', the: 'the Mirror Dunes' },
    klippen: { name: 'Windy Cliffs', of: 'of the Windy Cliffs', the: 'the Windy Cliffs' },
    ruinen: { name: 'Clockwork Ruins', of: 'of the Clockwork Ruins', the: 'the Clockwork Ruins' },
    see: { name: 'Aurora Lake', of: 'of Aurora Lake', the: 'Aurora Lake' },
    wiese: { name: 'Starlight Meadow', of: 'of the Starlight Meadow', the: 'the Starlight Meadow' },
    eiche: { name: 'Hollow Oak', of: 'of the Hollow Oak', the: 'the Hollow Oak' },
    glasturm: { name: 'Glass Tower', of: 'of the Glass Tower', the: 'the Glass Tower' },
    gezeiten: { name: 'Tide Island', of: 'of Tide Island', the: 'Tide Island' },
    irrlicht: { name: 'Wisp Island', of: 'of Wisp Island', the: 'Wisp Island' },
    eisgrotte: { name: 'Ice Cave', of: 'of the Ice Cave', the: 'the Ice Cave' },
  },

  objects: {
    bucht: {
      'steg-gezeiten': {
        lines: ['At the end of the pier stands a post with an old rope.', 'Out there lies a little island. With a boat you could get across.'],
        linesOpen: ['You put the nutshell on the water and row to Tide Island.'],
      },
      'haus-oda': { lines: ['Oda’s house. The door is locked.'] },
      'haus-ilvy': { lines: ['Ilvy’s house. The door is locked.'] },
      'haus-bram': { lines: ['Bram’s house. The door is locked.'] },
      boot: { lines: ['The boat rocks gently on the water.'] },
      ilvy: {
        lines: [
          'Welcome to Lighthouse Bay! I look after the lighthouse here.',
          'The Mist of Forgetting lies over the island. Only knowledge can drive it away.',
          'Is your creature tired? Come to the lighthouse door. Its light gives new strength.',
          'The keeper of the bay waits up on the north path. Show her what you have learned!',
        ],
        linesLit: ['The light stone of the bay shines again! I knew you could do it.'],
        linesOpen: [
          'The light stone of the bay shines again! I knew you could do it.',
          'North of the bay are the Whispering Woods. Listen well to what the trees whisper.',
        ],
      },
      bram: {
        lines: [
          'Ahoy! The boats stop here at the pier.',
          'The keeper of the bay stands up on the north path, just before the mist.',
          'If you want to get past her, you must answer her questions.',
        ],
        linesLit: ['The light stone is shining! Now I can catch fish at night again.'],
        linesOpen: ['Have you seen the mist in the north? It is gone!'],
      },
      pim: {
        lines: ['Watch out! Wild creatures live in the tall grass.', 'If one is too strong for you, press B to run.'],
        linesLit: ['I saw the stone light up. It was so bright!'],
      },
      oda: {
        lines: [
          'Long ago, eight light stones glowed over the island.',
          'Since they went dark, the mist comes a little closer every year.',
          'Maybe you can make them glow again?',
        ],
        linesLit: ['A light stone is glowing again. Maybe the others will come back too.'],
      },
      trainer: { afterWin: 'Your light stone is shining. The way to the Whispering Woods is free.' },
      'nebel-nord': {
        lines: [FOG_CLOSED, 'Maybe it moves back when the light stone of the bay glows again.'],
        linesOpen: ['North: Whispering Woods', FOG_GONE],
      },
      'nebel-ost': {
        lines: ['A steep path leads up, but the mist is too thick.', 'People say it only moves back when the last light stone glows again.'],
        linesOpen: ['East: Starlight Meadow', 'The mist has moved back. The path is free.'],
      },
      'schild-dorf': { lines: ['Lighthouse Bay', 'North: Whispering Woods · East: Lighthouse'] },
    },

    wald: {
      trainer: { afterWin: 'Your light stone is shining. The woods thank you.' },
      birk: {
        lines: [
          'Welcome to the Whispering Woods! I carve figures from fallen wood.',
          'Do you see the stones with the bright mark? There are notes with tasks under them.',
          'If you solve them, you sometimes find a piece of the old story.',
        ],
        linesLit: ['The light stone of the woods is shining! My figures have shadows again.'],
      },
      fenna: {
        lines: [
          'Wild creatures live in the ferns. Watch where you step!',
          'The red berries on the bushes give your creature strength. They grow back.',
        ],
        linesLit: ['Since the stone is shining again, my herbs smell twice as strong.'],
      },
      lio: {
        lines: [
          'I am looking for fireflies for my jar.',
          'The old trees whisper when you walk past them. Have you heard them yet?',
          'The ranger lives up in the clearing by the light stone. A light stone gives you strength!',
        ],
        linesLit: ['The fireflies are dancing around the light stone! Come and look!'],
      },
      'baum-sued': { lines: ['… so many words, forgotten … we keep them for you …', '… learn, little light, learn …'] },
      'baum-mitte': { lines: ['… the ranger waits in the clearing … he tests what you know …', '… a light stone gives your creature new strength …'] },
      'baum-nord': { lines: ['… once the woods were bright … then the mist came from the mountain …', '… someone in the mountain is very lonely …'] },
      'baum-farn': { lines: ['… sometimes something sparkles in the ferns … look closely …', '… berries grow back if you are patient …'] },
      'hohle-eiche': {
        lines: ['There is a hole in the old oak, as big as a door.', 'It is pitch dark inside. With a lantern you could go in.'],
        linesOpen: ['You light the lantern and climb into the oak.'],
      },
      'schild-eingang': { lines: ['Whispering Woods', 'Stay on the path, and you will hear the old trees whisper.'] },
      'nebel-nord': {
        lines: [FOG_CLOSED, 'Maybe it moves back when the light stone of the woods glows again.'],
        linesOpen: ['North: Mushroom Marsh', FOG_GONE],
      },
    },

    moor: {
      'pfahl-irrlicht': {
        lines: ['A post with an old rope sticks out of the marsh.', 'The will-o’-the-wisps dance over there. With a little boat you could row across.'],
        linesOpen: ['You put the nutshell on the water and row to Wisp Island.'],
      },
      trainer: { afterWin: 'Your light stone is shining. The mushrooms glow brighter than ever.' },
      wenke: {
        lines: [
          'Welcome to the Mushroom Marsh! I cook the best mushroom soup on the whole island.',
          'You do not eat the glowing mushrooms. They only show the way in the dark.',
          'Berries grow in the marsh too. Look at the bushes at the edge!',
        ],
        linesLit: ['The light stone of the marsh is shining! Today I am cooking a party soup.'],
      },
      jasper: {
        lines: [
          'I build the boardwalks over the marsh. Always stay on the wood!',
          'Do you see the little island in the west? Will-o’-the-wisps dance there at night.',
          'Nobody can get there without a boat. Maybe one will turn up one day.',
        ],
        linesLit: [
          'Since the stone is shining again, my boardwalks creak very happily.',
          'From the post on the south shore, it is not far to Wisp Island. By boat, of course.',
        ],
      },
      nele: {
        lines: [
          'Have you seen the will-o’-the-wisps? They flicker when you wave at them!',
          'There are notes under the stones with the bright mark. I have solved two!',
        ],
        linesLit: ['The will-o’-the-wisps are dancing around the light stone now. Come, let’s watch!'],
        linesOpen: [
          'The will-o’-the-wisps are dancing around the light stone now!',
          'The mist in the north is gone. They say there are dunes made of glass behind it!',
        ],
      },
      'schild-eingang': { lines: ['Mushroom Marsh', 'Stay on the peat and the boardwalks. The marsh water is deep.'] },
      'nebel-nord': {
        lines: [FOG_CLOSED, 'Maybe it moves back when the light stone of the marsh glows again.'],
        linesOpen: ['North: Mirror Dunes', FOG_GONE],
      },
    },

    duenen: {
      trainer: { afterWin: 'Your light stone is shining. The mirrors show real paths again.' },
      samir: {
        lines: [
          'Welcome to the Mirror Dunes! I blow glasses from the sand here.',
          'Be careful: some paths only shine. They are mirages.',
          'If you walk into one, you notice it at once. Then just look for another way!',
        ],
        linesLit: ['The light stone is shining! Now my glasses shine like they used to.'],
      },
      talia: {
        lines: [
          'I draw maps of the dunes. They look a little different every day.',
          'Karim waits in the east. He is fast, and there is a clock in his duels!',
          'A time stone stops the clock for one question. Sometimes one sparkles in the grass.',
          'I only know the glass tower in the north-west from far away. It is too high to climb.',
        ],
        linesNoClock: [
          'I draw maps of the dunes. They look a little different every day.',
          'Karim waits in the east. He is fast and knows lots of words!',
          'I only know the glass tower in the north-west from far away. It is too high to climb.',
        ],
        linesLit: ['You beat Karim! I am putting that on my map right now.'],
        linesOpen: [
          'You beat Karim! I am putting that on my map right now.',
          'The Windy Cliffs are in the east. Hold on to your hat, it is windy there!',
        ],
      },
      'statue-sued-west': { lines: ['A statue made of glass. On the base it says:', '“If you look closely, you find the real path.”'] },
      'statue-sued-ost': { lines: ['A statue made of glass. On the base it says:', '“Nobody can take away what you know.”'] },
      'statue-platz': { lines: ['A statue made of glass. On the base it says:', '“Long ago, the knowledge of the whole island shone here.”'] },
      'oese-glasturm': {
        lines: ['An old metal ring hangs on the glass wall.', 'With a climbing hook you could climb up here, all the way to the glass tower.'],
        linesOpen: ['You hook the climbing hook in and climb up the glass wall.'],
      },
      'statue-west': { lines: ['A statue made of glass. On the base it says:', '“Not every path that shines is a path.”'] },
      'schild-eingang': { lines: ['Mirror Dunes', 'Not every shiny path is real. Stay on the trail!'] },
      'nebel-ost': {
        lines: [FOG_CLOSED, 'Maybe it moves back when the light stone of the dunes glows again.'],
        linesOpen: ['East: Windy Cliffs', FOG_GONE],
      },
    },

    klippen: {
      trainer: { afterWin: 'Your light stone is shining. Can you feel the wind? It carries greetings again.' },
      ole: {
        lines: [
          'Hello! I am Ole, and I look after the windmills.',
          'For a long time the wind was still here. My wheels stood still for almost a year.',
          'Now they are turning a little again. Can you hear them creak?',
        ],
        linesLit: ['The light stone is shining, and my windmills are turning like never before!'],
      },
      ina: {
        lines: [
          'I study the clouds under the bridges. Each one looks different!',
          'On the rope bridges: look straight ahead, not down.',
          'Sometimes a cloud whale swims past. With a bit of luck, you will see one.',
        ],
        linesLit: ['Since the stone is shining, the clouds are as white as fresh washing.'],
      },
      tamo: {
        lines: [
          'My kite dragon flies almost as high as Skye’s! But only almost.',
          'Skye waits up on the peak in the east. In her duels the clock runs even faster.',
          'If you have a time stone, take it with you. It stops the time for a moment!',
        ],
        linesNoClock: [
          'My kite dragon flies almost as high as Skye’s! But only almost.',
          'Skye waits up on the peak in the east. She asks really tricky questions.',
        ],
        linesLit: ['You beat Skye? Wow! Then you are faster than the wind!'],
      },
      'schild-eingang': { lines: ['Windy Cliffs', 'Hold on to the ropes and look ahead when you walk.'] },
      'nebel-ost': {
        lines: [FOG_CLOSED, 'Maybe it moves back when the light stone of the cliffs glows again.'],
        linesOpen: ['East: Clockwork Ruins', FOG_GONE],
      },
    },

    ruinen: {
      trainer: { afterWin: 'Your light stone is shining. Can you hear it? All the cogs tick in time again.' },
      greta: {
        lines: [
          'I am Greta, a mechanic. I oil the cogs that still turn.',
          'Nobody knows what makes them move. But when one stops, it gets cold here.',
          'Be careful near the canals. The water is deep and still.',
        ],
        linesLit: ['The stone is shining! Can you hear the ticking? The wheels are in time again.'],
      },
      pino: {
        lines: [
          'I am Pino, the ferryman. But my boat has floated away.',
          'Do you see the observatory behind the canal? Star pictures shine on its plaque.',
          'Whoever can read the stars there finds the way across. I cannot, sadly.',
        ],
        linesLit: [
          'Since the stone is shining, the dome of the observatory shines again. Nice, isn’t it?',
          'With the nutshell you can reach the little islands: off the bay and in the marsh.',
        ],
      },
      bo: {
        lines: [
          'Have you seen the sparks on the cogs? I count them every day!',
          'There are notes under some stones. If you solve the task, you find something.',
        ],
        linesLit: ['Today the cogs throw twice as many sparks. That was you, wasn’t it?'],
      },
      'schild-eingang': { lines: ['Clockwork Ruins', 'Please do not fall into the canals. Do not touch the cogs.'] },
      'nebel-sued': {
        lines: [FOG_CLOSED, 'Maybe it moves back when the light stone of the ruins glows again.'],
        linesOpen: ['South: Aurora Lake', FOG_GONE],
      },
    },

    see: {
      'eiskante-grotte': {
        lines: ['The solid ice ends here. Behind it, the entrance of the cave sparkles.', 'With ice skates you could glide across the smooth ice.'],
        linesOpen: ['You strap on the ice skates and glide across to the ice cave.'],
      },
      trainer: { afterWin: 'Your light stone is shining. Look, the northern lights are brighter!' },
      sven: {
        lines: [
          'I am Sven. I have fished on this lake for forty winters.',
          'It is warm in my tent. Outside, I drill holes in the ice and wait.',
          'Freya is the best of us all. She stands in the middle of the ice.',
        ],
        linesLit: ['The stone is shining! The fish will bite today, I can feel it in my knees.'],
      },
      mira: {
        lines: [
          'I am Mira, and I make figures out of snow. Do you like my kingfisher?',
          'Do you see the ice cave behind the open water?',
          'Only someone who can glide over the ice can get there. I cannot, sadly.',
        ],
        linesLit: [
          'Since the stone is shining, the ice cave sparkles like a crystal.',
          'With ice skates, you could glide across from the ice edge next to me.',
        ],
      },
      ari: {
        lines: [
          'At night the northern lights dance over the lake. Green and purple! Have you seen them?',
          'There are notes under some stones. I have found two!',
        ],
        linesLit: ['The northern lights are so bright today that I can read without a lantern!'],
      },
      zelt: { lines: ['Sven’s fishing tent. It is warm inside and smells of tea.'] },
      'schild-eingang': { lines: ['Aurora Lake', 'The ice is safe. Please walk around the holes.'] },
      'nebel-sued': {
        lines: [FOG_CLOSED, 'Maybe it moves back when the light stone of the lake glows again.'],
        linesOpen: ['South: Starlight Meadow', FOG_GONE],
      },
    },

    wiese: {
      trainer: { afterWin: 'Your light stone is shining. The path down to the bay is free.' },
      selma: {
        lines: [
          'I am Selma. I collect shooting stars that fall into the grass.',
          'When you see one fall, you can make a wish. I always wish for the same thing.',
          'That nobody ever forgets something that is important to them.',
        ],
        linesLit: ['The stone is shining! Tonight more stars are falling than in many years.'],
      },
      kai: {
        lines: [
          'I am Kai, and I look after the night sheep. They never sleep when the stars shine.',
          'Do you see the gate in the mountain? It has eight sockets, one for each light stone.',
          'My grandmother says it only opens when all eight glow again.',
        ],
        linesLit: ['All eight sockets? I have to see that! My sheep are coming too.'],
      },
      'schild-eingang': { lines: ['Starlight Meadow', 'Please be quiet. The night sheep never sleep, but they love to dream.'] },
      'nebel-west': {
        lines: ['A path leads down to the bay, but the mist is too thick.', 'Maybe it moves back when the light stone of the meadow glows again.'],
        linesOpen: ['West: Lighthouse Bay', 'The mist has moved back. The path leads down to the bay.'],
      },
    },
  },
};
