// Die Gebiete auf Französisch (Design 10.6): Namen und alle Texte der Karten, Zeile für Zeile nach dem
// Deutschen. areas: name (Reisemenü, Karte), of (im Satz „La pierre de lumière … brille à nouveau“, mit
// Präposition und Artikel), the (auf dem Nebelschild „Derrière le brouillard se trouve(nt) …“; die
// Mehrzahl-Gebiete beginnen mit „les“). objects: je Karte und Objekt-id die Textfelder; Trainer heißen „trainer“.

const FOG_CLOSED = 'Le brouillard est trop épais ici.';
const FOG_GONE = 'Le brouillard a reculé. Le chemin est libre.';

export const FR_WORLD = {
  areas: {
    bucht: { name: 'Baie du Phare', of: 'de la Baie du Phare', the: 'la Baie du Phare', at: 'dans la Baie du Phare' },
    wald: { name: 'Forêt des Murmures', of: 'de la Forêt des Murmures', the: 'la Forêt des Murmures', at: 'dans la Forêt des Murmures' },
    moor: { name: 'Marais aux Champignons', of: 'du Marais aux Champignons', the: 'le Marais aux Champignons', at: 'dans le Marais aux Champignons' },
    duenen: { name: 'Dunes Miroirs', of: 'des Dunes Miroirs', the: 'les Dunes Miroirs', at: 'dans les Dunes Miroirs' },
    klippen: { name: 'Falaises du Vent', of: 'des Falaises du Vent', the: 'les Falaises du Vent', at: 'sur les Falaises du Vent' },
    ruinen: { name: 'Ruines des Horloges', of: 'des Ruines des Horloges', the: 'les Ruines des Horloges', at: 'dans les Ruines des Horloges' },
    see: { name: 'Lac de l’Aurore', of: 'du Lac de l’Aurore', the: 'le Lac de l’Aurore', at: 'au bord du Lac de l’Aurore' },
    wiese: { name: 'Prairie des Étoiles', of: 'de la Prairie des Étoiles', the: 'la Prairie des Étoiles', at: 'dans la Prairie des Étoiles' },
    eiche: { name: 'Chêne Creux', of: 'du Chêne Creux', the: 'le Chêne Creux' },
    glasturm: { name: 'Tour de Verre', of: 'de la Tour de Verre', the: 'la Tour de Verre' },
    gezeiten: { name: 'Île des Marées', of: 'de l’Île des Marées', the: 'l’Île des Marées' },
    irrlicht: { name: 'Île des Feux Follets', of: 'de l’Île des Feux Follets', the: 'l’Île des Feux Follets' },
    eisgrotte: { name: 'Grotte de Glace', of: 'de la Grotte de Glace', the: 'la Grotte de Glace' },
    sternwarte: { name: 'Observatoire', of: 'de l’Observatoire', the: 'l’Observatoire' },
    hoehle1: { name: 'Grotte de la Montagne', of: 'de la grotte', the: 'la grotte' },
    hoehle2: { name: 'Grotte de la Montagne', of: 'de la grotte', the: 'la grotte' },
    hoehle3: { name: 'Grotte de la Montagne', of: 'de la grotte', the: 'la grotte' },
    garten: { name: 'Jardin', of: 'du jardin', the: 'le jardin' },
  },

  objects: {
    bucht: {
      morrow: {
        lines: ['D’ici, je vois toute l’île. Et chaque jour, quelqu’un vient me voir !', 'Merci de te souvenir de moi.'],
      },
      'steg-gezeiten': {
        lines: ['Au bout du ponton, il y a un poteau avec une vieille corde.', 'Là-bas, il y a une petite île. Avec un bateau, on pourrait y aller.'],
        linesOpen: ['Tu poses la coquille de noix sur l’eau et tu rames jusqu’à l’Île des Marées.'],
      },
      gartentor: { lines: ['Une porte en branches de saule, pleine de fleurs. Derrière, il y a le jardin de tes amis.'] },
      'haus-oda': { lines: ['La maison d’Oda. La porte est fermée à clé.'] },
      'haus-ilvy': { lines: ['La maison d’Ilvy. La porte est fermée à clé.'] },
      'haus-bram': { lines: ['La maison de Bram. La porte est fermée à clé.'] },
      boot: { lines: ['Le bateau se balance doucement sur l’eau.'] },
      ilvy: {
        linesAfter: ['Maintenant, Morrow habite avec nous, près du phare. Chaque soir, je lui apporte du thé.'],
        lines: [
          'Bienvenue à la Baie du Phare ! Ici, je garde le phare.',
          'Le brouillard de l’oubli couvre l’île. Seul le savoir peut le chasser.',
          'Ta créature n’a plus d’énergie ? Viens à la porte du phare. Sa lumière donne de nouvelles forces.',
          'La gardienne de la baie attend en haut, sur le chemin du nord. Montre-lui ce que tu as appris !',
        ],
        linesLit: ['La pierre de lumière de la baie brille à nouveau ! Je savais que tu allais réussir.'],
        linesOpen: [
          'La pierre de lumière de la baie brille à nouveau ! Je savais que tu allais réussir.',
          'Au nord de la baie, il y a la Forêt des Murmures. Écoute bien ce que les arbres murmurent.',
        ],
      },
      bram: {
        linesAfter: ['Plus de brouillard sur l’eau ! Je vois jusqu’à l’horizon.'],
        lines: [
          'Ohé ! Ici, au ponton, les bateaux s’arrêtent.',
          'La gardienne de la baie est en haut, sur le chemin du nord, juste avant le brouillard.',
          'Pour passer, il faut répondre à ses questions.',
        ],
        linesLit: ['La pierre de lumière brille fort ! Maintenant, je peux de nouveau pêcher la nuit.'],
        linesOpen: ['Tu as vu le brouillard au nord ? Il est parti !'],
      },
      pim: {
        linesAfter: ['Morrow m’a montré comment attraper les échos. Coucou-ou-ou !'],
        lines: ['Attention ! Des créatures sauvages vivent dans les hautes herbes.', 'Si une créature est trop forte pour toi, tu peux fuir avec B.'],
        linesLit: ['J’ai vu la pierre s’allumer. Quelle lumière !'],
      },
      oda: {
        linesAfter: ['Je me souviens de nouveau de toutes les chansons de ma grand-mère. Merci !'],
        lines: [
          'Autrefois, huit pierres de lumière brillaient sur l’île.',
          'Depuis qu’elles sont éteintes, le brouillard vient un peu plus près chaque année.',
          'Peut-être que tu peux les rallumer ?',
        ],
        linesLit: ['Une pierre de lumière brille à nouveau. Peut-être que les autres vont revenir aussi.'],
      },
      trainer: { afterWin: 'Ta pierre de lumière brille fort. Le chemin vers la Forêt des Murmures est libre.' },
      'nebel-nord': {
        lines: [FOG_CLOSED, 'Peut-être qu’il recule quand la pierre de lumière de la baie brille à nouveau.'],
        linesOpen: ['Nord : Forêt des Murmures', FOG_GONE],
      },
      'nebel-ost': {
        lines: ['Un sentier raide monte, mais le brouillard est trop épais.', 'On dit qu’il recule seulement quand la dernière pierre de lumière brille à nouveau.'],
        linesOpen: ['Est : Prairie des Étoiles', 'Le brouillard a reculé. Le sentier est libre.'],
      },
      'schild-dorf': { lines: ['Baie du Phare', 'Nord : Forêt des Murmures · Est : Phare'] },
    },

    wald: {
      trainer: { afterWin: 'Ta pierre de lumière brille fort. La forêt te dit merci.' },
      birk: {
        linesAfter: ['Les arbres ne murmurent plus. Ils chantent !'],
        lines: [
          'Bienvenue dans la Forêt des Murmures ! Ici, je fais des figurines avec du bois tombé.',
          'Tu vois les pierres avec le signe clair ? Dessous, il y a des papiers avec des exercices.',
          'Si tu les réussis, tu trouves parfois un morceau de la vieille histoire.',
        ],
        linesLit: ['La pierre de lumière de la forêt brille ! Mes figurines ont de nouveau une ombre.'],
      },
      fenna: {
        linesAfter: ['Sans le brouillard, mes herbes poussent jusqu’au ciel.'],
        lines: [
          'Des créatures sauvages vivent dans les fougères. Fais attention où tu marches !',
          'Les baies rouges des buissons donnent de la force à ta créature. Elles repoussent.',
        ],
        linesLit: ['Depuis que la pierre brille à nouveau, mes herbes sentent deux fois plus fort.'],
      },
      lio: {
        linesAfter: ['J’ai donné une luciole à Morrow. Maintenant, elle brille au phare.'],
        lines: [
          'Je cherche des lucioles pour mon bocal.',
          'Les vieux arbres murmurent quand on passe à côté. Tu les as déjà entendus ?',
          'Le garde forestier habite en haut, dans la clairière, près de la pierre de lumière. Elle donne des forces !',
        ],
        linesLit: ['Les lucioles dansent autour de la pierre de lumière ! Viens voir !'],
      },
      'baum-sued': { lines: ['… tant de mots oubliés … nous les gardons pour vous …', '… apprends, petite lumière, apprends …'] },
      'baum-mitte': { lines: ['… le garde forestier attend dans la clairière … il teste ce que tu sais …', '… une pierre de lumière donne une nouvelle force à ta créature …'] },
      'baum-nord': { lines: ['… avant, la forêt était claire … puis le brouillard est venu de la montagne …', '… quelqu’un dans la montagne est très seul …'] },
      'baum-farn': { lines: ['… parfois, quelque chose brille dans les fougères … regarde bien …', '… les baies repoussent, si on est patient …'] },
      'hohle-eiche': {
        lines: ['Dans le vieux chêne, il y a un trou, grand comme une porte.', 'Dedans, il fait tout noir. Avec une lanterne, tu pourrais entrer.'],
        linesOpen: ['Tu allumes la lanterne et tu grimpes dans le chêne.'],
      },
      'schild-eingang': { lines: ['Forêt des Murmures', 'Reste sur le chemin, et tu entendras les vieux arbres murmurer.'] },
      'nebel-nord': {
        lines: [FOG_CLOSED, 'Peut-être qu’il recule quand la pierre de lumière de la forêt brille à nouveau.'],
        linesOpen: ['Nord : Marais aux Champignons', FOG_GONE],
      },
    },

    moor: {
      'pfahl-irrlicht': {
        lines: ['Un poteau avec une vieille corde sort du marais.', 'Là-bas, les feux follets dansent. Avec un petit bateau, on pourrait aller jusqu’à l’île.'],
        linesOpen: ['Tu poses la coquille de noix sur l’eau et tu rames jusqu’à l’Île des Feux Follets.'],
      },
      trainer: { afterWin: 'Ta pierre de lumière brille fort. Les champignons brillent plus que jamais.' },
      wenke: {
        linesAfter: ['Aujourd’hui, je fais de la soupe pour toute l’île. Morrow a la première assiette !'],
        lines: [
          'Bienvenue au Marais aux Champignons ! Je fais la meilleure soupe aux champignons de toute l’île.',
          'Les champignons qui brillent, on ne les mange pas. Ils montrent seulement le chemin dans le noir.',
          'Dans le marais aussi, il y a des baies. Regarde les buissons au bord !',
        ],
        linesLit: ['La pierre de lumière du marais brille fort ! Aujourd’hui, je fais une soupe de fête.'],
      },
      jasper: {
        linesAfter: ['Sans le brouillard, je vois chaque planche. Mes passerelles n’ont jamais été aussi sûres.'],
        lines: [
          'Je construis les passerelles sur le marais. Reste toujours bien sur le bois !',
          'Tu vois la petite île à l’ouest ? La nuit, les feux follets y dansent.',
          'Sans bateau, personne ne peut y aller. Peut-être qu’un jour, on en trouvera un.',
        ],
        linesLit: [
          'Depuis que la pierre brille à nouveau, mes passerelles craquent très joyeusement.',
          'Du poteau sur la rive sud, l’Île des Feux Follets n’est pas loin. En bateau, bien sûr.',
        ],
      },
      nele: {
        linesAfter: ['Les feux follets sont allés voir Morrow. Maintenant, ils sont amis !'],
        lines: [
          'Tu as vu les feux follets ? Ils clignotent quand on leur fait coucou !',
          'Sous les pierres avec le signe clair, il y a des papiers. J’en ai déjà réussi deux !',
        ],
        linesLit: ['Maintenant, les feux follets dansent autour de la pierre de lumière. Viens, on regarde !'],
        linesOpen: [
          'Maintenant, les feux follets dansent autour de la pierre de lumière !',
          'Au nord, le brouillard est parti. On dit qu’il y a des dunes de verre derrière !',
        ],
      },
      'schild-eingang': { lines: ['Marais aux Champignons', 'Reste sur la terre sèche et sur les passerelles. L’eau du marais est profonde.'] },
      'nebel-nord': {
        lines: [FOG_CLOSED, 'Peut-être qu’il recule quand la pierre de lumière du marais brille à nouveau.'],
        linesOpen: ['Nord : Dunes Miroirs', FOG_GONE],
      },
    },

    duenen: {
      trainer: { afterWin: 'Ta pierre de lumière brille fort. Les miroirs montrent de nouveau les vrais chemins.' },
      samir: {
        linesAfter: ['Dans mes verres, je vois maintenant toute l’île, claire et lumineuse.'],
        lines: [
          'Bienvenue dans les Dunes Miroirs ! Ici, je fabrique des verres avec le sable.',
          'Attention : certains chemins brillent seulement. Ce sont des mirages.',
          'Si tu essaies d’y passer, tu le remarques tout de suite. Alors, cherche simplement un autre chemin !',
        ],
        linesLit: ['La pierre de lumière brille fort ! Maintenant, mes verres brillent comme avant.'],
      },
      talia: {
        linesAfter: ['Ma nouvelle carte n’a plus de brouillard. Seulement des chemins !'],
        lines: [
          'Je dessine des cartes des dunes. Chaque jour, elles sont un peu différentes.',
          'Karim attend à l’est. Il est rapide, et dans ses duels, il y a un chrono !',
          'Une pierre du temps arrête le chrono pendant une question. Parfois, il y en a une qui brille dans l’herbe.',
          'La Tour de Verre, au nord-ouest, je la connais seulement de loin. Elle est trop haute pour grimper.',
        ],
        linesNoClock: [
          'Je dessine des cartes des dunes. Chaque jour, elles sont un peu différentes.',
          'Karim attend à l’est. Il est rapide, et il connaît beaucoup de mots !',
          'La Tour de Verre, au nord-ouest, je la connais seulement de loin. Elle est trop haute pour grimper.',
        ],
        linesLit: ['Tu as battu Karim ! Je le note tout de suite sur ma carte.'],
        linesOpen: [
          'Tu as battu Karim ! Je le note tout de suite sur ma carte.',
          'À l’est, il y a les Falaises du Vent. Tiens bien ton bonnet, il y a du vent là-bas !',
        ],
      },
      'statue-sued-west': { lines: ['Une statue en verre. En bas, on peut lire :', '« Qui regarde bien trouve le vrai chemin. »'] },
      'statue-sued-ost': { lines: ['Une statue en verre. En bas, on peut lire :', '« Ce que tu sais, personne ne peut te le prendre. »'] },
      'statue-platz': { lines: ['Une statue en verre. En bas, on peut lire :', '« Autrefois, ici, on voyait le savoir de toute l’île comme dans un miroir. »'] },
      'oese-glasturm': {
        lines: ['Sur le mur de verre, il y a un vieil anneau en métal.', 'Avec un grappin, on pourrait monter ici, jusqu’à la Tour de Verre.'],
        linesOpen: ['Tu accroches le grappin, et tu montes le long du mur de verre.'],
      },
      'statue-west': { lines: ['Une statue en verre. En bas, on peut lire :', '« Un chemin qui brille n’est pas toujours un chemin. »'] },
      'schild-eingang': { lines: ['Dunes Miroirs', 'Un chemin qui brille n’est pas toujours un vrai chemin. Reste sur le sentier !'] },
      'nebel-ost': {
        lines: [FOG_CLOSED, 'Peut-être qu’il recule quand la pierre de lumière des dunes brille à nouveau.'],
        linesOpen: ['Est : Falaises du Vent', FOG_GONE],
      },
    },

    klippen: {
      trainer: { afterWin: 'Ta pierre de lumière brille fort. Tu sens le vent ? Il porte de nouveau des bonjours.' },
      ole: {
        linesAfter: ['Le vent porte de nouveau des chansons sur toute l’île. Tu les entends ?'],
        lines: [
          'Bonjour ! Je suis Ole, et je m’occupe des moulins à vent.',
          'Pendant longtemps, il n’y avait pas de vent ici. Mes moulins n’ont pas tourné pendant presque un an.',
          'Maintenant, ils tournent de nouveau un peu. Tu les entends grincer ?',
        ],
        linesLit: ['La pierre de lumière brille fort, et mes moulins tournent comme jamais !'],
      },
      ina: {
        linesAfter: ['D’ici, on voit même le phare maintenant. Fais coucou à Morrow !'],
        lines: [
          'J’étudie les nuages sous les ponts. Chaque nuage est différent !',
          'Sur les ponts de corde, une règle : regarde devant toi, pas en bas.',
          'Parfois, une Baleinuage passe en nageant. Avec un peu de chance, tu en vois une.',
        ],
        linesLit: ['Depuis que la pierre brille, les nuages sont blancs comme du linge propre.'],
      },
      tamo: {
        linesAfter: ['Mon cerf-volant vole jusqu’à la montagne et revient. Aucun brouillard ne l’arrête !'],
        lines: [
          'Mon cerf-volant vole presque aussi haut que celui de Skye ! Mais seulement presque.',
          'Skye attend en haut, sur le sommet, à l’est. Dans ses duels, le chrono va encore plus vite.',
          'Si tu as une pierre du temps, prends-la avec toi. Elle arrête le temps un moment !',
        ],
        linesNoClock: [
          'Mon cerf-volant vole presque aussi haut que celui de Skye ! Mais seulement presque.',
          'Skye attend en haut, sur le sommet, à l’est. Elle pose des questions vraiment difficiles.',
        ],
        linesLit: ['Tu as battu Skye ? Waouh ! Alors tu es plus rapide que le vent !'],
      },
      'schild-eingang': { lines: ['Falaises du Vent', 'Tiens-toi bien aux cordes, et regarde devant toi quand tu marches.'] },
      'nebel-ost': {
        lines: [FOG_CLOSED, 'Peut-être qu’il recule quand la pierre de lumière des falaises brille à nouveau.'],
        linesOpen: ['Est : Ruines des Horloges', FOG_GONE],
      },
    },

    hoehle1: {
      'echo-1': { lines: ['Du cristal sort un petit écho : « … et puis elle a chanté la chanson de la mer … »'] },
      'echo-2': { lines: ['Du cristal sort un petit écho : « … comment ça s’appelait déjà ? … »'] },
    },
    hoehle2: {
      'echo-3': { lines: ['Du cristal sort un petit écho : « … ne m’oublie pas … »'] },
      'echo-4': { lines: ['Du cristal sort un petit écho : « … demain, je te raconte la suite … »'] },
    },
    hoehle3: {
      'morrows-kristall': { lines: ['Avant, Morrow habitait ici. Maintenant, le cristal chante tout bas une chanson joyeuse.'] },
    },
    ruinen: {
      'tafel-sternwarte': {
        lines: ['Une plaque en pierre avec des dessins d’étoiles. Derrière le canal, l’Observatoire attend.', 'Avec une carte des étoiles, on pourrait lire la plaque.'],
        linesOpen: ['Tu tiens la carte des étoiles devant la plaque. Les étoiles dessus s’allument.', 'Un pont étroit glisse au-dessus du canal.'],
      },
      trainer: { afterWin: 'Ta pierre de lumière brille fort. Tu entends ? Toutes les roues dentées tournent de nouveau en rythme.' },
      greta: {
        linesAfter: ['J’ai chaud, les roues tournent, et le brouillard est parti. Quelle journée !'],
        lines: [
          'Je suis Greta, mécanicienne. Je mets de l’huile sur les roues dentées qui tournent encore.',
          'Personne ne sait ce qui les fait tourner. Mais quand une roue s’arrête, il fait froid ici.',
          'Fais attention près des canaux. L’eau est profonde et calme.',
        ],
        linesLit: ['La pierre brille ! Tu entends le tic-tac ? Les roues tournent de nouveau en rythme.'],
      },
      pino: {
        linesAfter: ['Avec mon nouveau ferry, j’emmène les gens au phare, chez Morrow.'],
        lines: [
          'Je suis Pino, le passeur. Mais mon bateau est parti tout seul sur l’eau.',
          'Tu vois l’Observatoire derrière le canal ? Sur sa plaque, des dessins d’étoiles brillent.',
          'Qui sait lire les étoiles là-bas trouve le chemin pour traverser. Moi, malheureusement, je ne sais pas.',
        ],
        linesLit: [
          'Depuis que la pierre brille, le dôme de l’Observatoire brille de nouveau. C’est beau, non ?',
          'Avec la coquille de noix, tu peux aller sur les petites îles : devant la baie et dans le marais.',
        ],
      },
      bo: {
        linesAfter: ['Les roues dentées tournent au rythme d’une chanson. Morrow me l’a chantée tout bas.'],
        lines: [
          'Tu as vu les étincelles sur les roues dentées ? Je les compte chaque jour !',
          'Sous certaines pierres, il y a des papiers. Si tu fais l’exercice, tu trouves quelque chose.',
        ],
        linesLit: ['Aujourd’hui, les roues dentées font deux fois plus d’étincelles. C’est grâce à toi, non ?'],
      },
      'schild-eingang': { lines: ['Ruines des Horloges', 'Ne tombe pas dans les canaux, s’il te plaît. Ne touche pas les roues dentées.'] },
      'nebel-sued': {
        lines: [FOG_CLOSED, 'Peut-être qu’il recule quand la pierre de lumière des ruines brille à nouveau.'],
        linesOpen: ['Sud : Lac de l’Aurore', FOG_GONE],
      },
    },

    see: {
      'eiskante-grotte': {
        lines: ['Ici, la glace solide s’arrête. Derrière, l’entrée de la grotte brille.', 'Avec des patins à glace, on pourrait glisser sur la glace lisse jusque là-bas.'],
        linesOpen: ['Tu mets les patins à glace, et tu glisses jusqu’à la Grotte de Glace.'],
      },
      trainer: { afterWin: 'Ta pierre de lumière brille fort. Regarde, l’aurore boréale brille plus fort !' },
      sven: {
        linesAfter: ['Quarante hivers, et la glace n’a jamais été aussi claire.'],
        lines: [
          'Je suis Sven. Je pêche sur ce lac depuis quarante hivers.',
          'Dans ma tente, il fait chaud. Dehors, je fais des trous dans la glace, et j’attends.',
          'Freya est la meilleure de nous tous. Elle est au milieu de la glace.',
        ],
        linesLit: ['La pierre brille ! Aujourd’hui, les poissons vont mordre, je le sens dans mes genoux.'],
      },
      mira: {
        linesAfter: ['Je fais un Morrow en neige. Il sourit même !'],
        lines: [
          'Je suis Mira, et je fais des figurines en neige. Tu aimes mon oiseau de glace ?',
          'Tu vois la Grotte de Glace, là-bas, derrière l’eau libre ?',
          'Pour y aller, il faut glisser sur la glace. Moi, malheureusement, je ne sais pas.',
        ],
        linesLit: [
          'Depuis que la pierre brille, la Grotte de Glace brille comme un cristal.',
          'Avec des patins à glace, tu pourrais glisser jusque là-bas, depuis le bord de la glace, à côté de moi.',
        ],
      },
      ari: {
        linesAfter: ['J’écris tout ce que j’apprends. Comme ça, plus personne n’oublie jamais rien.'],
        lines: [
          'La nuit, l’aurore boréale danse au-dessus du lac. Vert et violet ! Tu l’as déjà vue ?',
          'Sous certaines pierres, il y a des papiers. J’en ai déjà trouvé deux !',
        ],
        linesLit: ['Aujourd’hui, l’aurore boréale est si claire que je peux lire sans lanterne !'],
      },
      zelt: { lines: ['La tente de pêche de Sven. Dedans, il fait chaud, et ça sent le thé.'] },
      'schild-eingang': { lines: ['Lac de l’Aurore', 'La glace est solide. Fais le tour des trous, s’il te plaît.'] },
      'nebel-sued': {
        lines: [FOG_CLOSED, 'Peut-être qu’il recule quand la pierre de lumière du lac brille à nouveau.'],
        linesOpen: ['Sud : Prairie des Étoiles', FOG_GONE],
      },
    },

    wiese: {
      trainer: { afterWin: 'Ta pierre de lumière brille fort. Le sentier qui descend vers la baie est libre.' },
      selma: {
        linesAfter: ['Mon vœu s’est réalisé. Plus personne n’oublie ce qui est important pour lui.'],
        lines: [
          'Je suis Selma. Je ramasse les étoiles filantes qui tombent dans l’herbe.',
          'Quand on voit une étoile tomber, on peut faire un vœu. Moi, je fais toujours le même vœu.',
          'Que plus personne n’oublie ce qui est important pour lui.',
        ],
        linesLit: ['La pierre brille ! Cette nuit, il tombe plus d’étoiles que depuis des années.'],
      },
      kai: {
        linesAfter: ['Maintenant, mes Moutonuits mangent de l’herbe jusqu’à la montagne. Ils veulent même entrer dans la grotte !'],
        lines: [
          'Je suis Kai, et je garde les Moutonuits. Ils ne dorment jamais quand les étoiles brillent.',
          'Tu vois la grande porte dans la montagne ? Elle a huit lampes, une pour chaque pierre de lumière.',
          'Ma grand-mère dit qu’elle s’ouvre seulement quand les huit brillent à nouveau.',
        ],
        linesLit: ['Les huit lampes ? Je dois voir ça ! Mes Moutonuits viennent aussi.'],
      },
      'schild-eingang': { lines: ['Prairie des Étoiles', 'Silence, s’il te plaît. Les Moutonuits ne dorment jamais, mais ils adorent rêver.'] },
      'nebel-west': {
        lines: ['Un sentier descend vers la baie, mais le brouillard est trop épais.', 'Peut-être qu’il recule quand la pierre de lumière de la prairie brille à nouveau.'],
        linesOpen: ['Ouest : Baie du Phare', 'Le brouillard a reculé. Le sentier descend vers la baie.'],
      },
    },
    garten: {
      'garten-schild': { lines: ['Jardin du Phare', 'Tes amis habitent ici.'] },
    },
  },
};
