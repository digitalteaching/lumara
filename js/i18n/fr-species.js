// Die Wesen auf Französisch (Design 10.6): eigene, kindgerechte Namen wie im Deutschen, dazu die
// Beschreibungen und die Besonderheiten der Startwesen. Gleiche Anzahl Stufennamen wie in SPECIES.
// gender passt zum französischen Namen (Un/Une … sauvage). Kein Name beginnt mit Vokal oder h.

export const FR_SPECIES = {
  funki: {
    names: ['Funki', 'Scintillon', 'Papilanterne', 'Papillaurore'],
    gender: 'm',
    description: 'Un petit papillon de nuit lumineux. Son ventre brille comme une toute petite lanterne.',
    special: {
      name: 'Illumination',
      text: 'Une fois par duel, la lumière de Funki t’aide : deux mauvaises réponses disparaissent, tu vois la première lettre, ou la première carte est déjà à la bonne place.',
    },
  },
  kiesel: {
    names: ['Caillou', 'Rocaillou', 'Gardiroc', 'Cœur-de-Mont'],
    gender: 'm',
    description: 'Un lutin de pierre tout rond, avec des touffes de mousse. Il est calme, et rien ne peut le faire tomber.',
    special: { name: 'Solide', text: 'Caillou est très solide. Il a toujours 1 énergie de plus que les autres.' },
  },
  nixi: {
    names: ['Nixi', 'Sourcinix', 'Tourbinix', 'Marénix'],
    gender: 'm',
    description: 'Un axolotl avec une crête de nageoires. Quand Nixi est content, il fait des bulles dans l’eau.',
    special: { name: 'Source', text: 'Après 3 bonnes réponses de suite, Nixi reprend 1 énergie.' },
  },
  flausch: {
    names: ['Doudou', 'Nuagibou', 'Tempêtibou', 'Duc-du-Ciel'],
    gender: 'm',
    description: 'Un hibou-nuage avec des plumes douces comme du coton. Il aime mieux flotter que voler.',
    special: {
      name: 'Vent arrière',
      text: 'Une fois par duel, tu peux échanger une question contre une autre. Avec un chrono, tu as aussi plus de temps.',
    },
  },
  pieks: {
    names: ['Piquou', 'Ronçisson', 'Fleurisson', 'Gardebois'],
    gender: 'm',
    description: 'Un hérisson-graine avec des piquants en feuilles. Là où Piquou dort, du trèfle pousse le lendemain matin.',
    special: {
      name: 'Main verte',
      text: 'Les baies donnent deux fois plus d’énergie à Piquou. Après une victoire, Piquou trouve souvent une baie.',
    },
  },

  // Gebiet 1
  gischtling: { names: ['Vaguelin', 'Fantôvague'], gender: 'm', description: 'Un petit esprit des vagues, fait d’écume de mer. Il porte une couronne de gouttes d’eau.' },
  haeuschel: { names: ['Coquillou', 'Coquiphare'], gender: 'm', description: 'Un petit crabe qui habite dans une coquille d’escargot. Quand il grandit, sa maison ressemble à un petit phare.' },
  glimmqualle: { names: ['Lumiméduse'], gender: 'f', description: 'Une méduse qui flotte au-dessus de l’eau, la nuit. Ses points brillent comme des étoiles.' },
  // Gebiet 2
  moosling: { names: ['Moussu', 'Ronchomousse'], gender: 'm', description: 'Un ballon de mousse tout rond, avec un chapeau de champignon. Il aime mieux rouler que marcher.' },
  eichhuscher: { names: ['Filegland', 'Filecouronne'], gender: 'm', description: 'Un écureuil fait de feuilles d’automne, avec un gland comme bonnet. Il cache de la nourriture partout.' },
  rindenwicht: { names: ['Lutécorce'], gender: 'm', description: 'Un petit esprit fait d’écorce. Ses yeux brillent comme deux lanternes dans la forêt sombre.' },
  // Gebiet 3
  tupfling: { names: ['Pointillon', 'Parasolin'], gender: 'm', description: 'Un petit champignon avec des points qui brillent. Quand il saute, il jette des spores comme des paillettes.' },
  irrfunke: { names: ['Folletin'], gender: 'm', description: 'Un petit feu de lumière verte. Il danse au-dessus du marais et veut montrer le chemin à tout le monde.' },
  nebelunke: { names: ['Brumouille'], gender: 'f', description: 'Une grenouille timide, avec une peau comme le brouillard du matin. Elle chante seulement quand tout est très calme.' },
  // Gebiet 4
  glaskaefer: { names: ['Scaraverre', 'Scaramiroir'], gender: 'm', description: 'Un scarabée avec des ailes en verre. Le soleil de midi brille dedans comme dans un miroir.' },
  duenenhuepfer: { names: ['Sautedune'], gender: 'm', description: 'Un petit sauteur rapide avec d’énormes oreilles. Sur le sable chaud, il ne reste jamais longtemps au même endroit.' },
  flimmerfuchs: { names: ['Mirenard'], gender: 'm', description: 'Un renard fait d’air qui scintille. On le voit seulement quand on ne regarde pas de trop près.' },
  // Gebiet 5
  drachling: { names: ['Dragonnet', 'Dragon-Volant'], gender: 'm', description: 'Un petit dragon avec des ailes comme des cerfs-volants en papier. Il adore voler contre le vent.' },
  klippbock: { names: ['Bouc-Falaise'], gender: 'm', description: 'Un bouc de montagne avec des cornes enroulées. Il garde l’équilibre sur les rochers les plus étroits.' },
  wolkenwal: { names: ['Baleinuage'], gender: 'f', description: 'Une petite baleine faite de nuages. Elle nage lentement sous les ponts de corde.' },
  // Gebiet 6
  zahnmaus: { names: ['Sourouage', 'Souris-Horloge'], gender: 'f', description: 'Une souris avec des oreilles comme des roues dentées. Sur son dos, elle porte une petite clé pour la remonter.' },
  dampfkobold: { names: ['Bouillotin'], gender: 'm', description: 'Un lutin en cuivre, rond comme une bouilloire. Quand il est content, de la vapeur sort de son chapeau en sifflant.' },
  messingeule: { names: ['Chouette-Loupe'], gender: 'f', description: 'Une chouette en métal jaune, avec des yeux comme des loupes. Elle voit chaque petite roue qui tourne dans les ruines.' },
  // Gebiet 7
  frostrobbe: { names: ['Givrophoque', 'Glaciphoque'], gender: 'm', description: 'Un phoque blanc qui aime glisser sur la glace. Quand il grandit, des cristaux de glace poussent sur son dos.' },
  flockenhase: { names: ['Lapiflocon'], gender: 'm', description: 'Un lapin tout blanc, comme la neige fraîche. Sur le front, il a un flocon de neige.' },
  aurorafink: { names: ['Pinsaurore'], gender: 'm', description: 'Un petit pinson. Ses longues plumes de queue brillent avec les couleurs de l’aurore boréale.' },
  // Gebiet 8
  schnuppling: { names: ['Filantine', 'Cométine'], gender: 'f', description: 'Une petite étoile tombée du ciel. Derrière elle brille une queue de poussière d’étoiles.' },
  nachtschaf: { names: ['Moutonuit'], gender: 'm', description: 'Un mouton avec une laine comme une nuit d’été. Des petites étoiles brillent dans sa laine.' },
  sternhirsch: { names: ['Cerf-Étoile'], gender: 'm', description: 'Un cerf avec des cornes en lumière d’étoiles. On le voit seulement pendant les nuits claires.' },
  // Geheime Orte
  wurzelgeist: { names: ['Racinou'], gender: 'm', description: 'Un petit esprit fait de racines. Sur la tête, il a une fleur qui brille dans le noir.' },
  prismalibelle: { names: ['Prismellule'], gender: 'f', description: 'Une libellule avec des ailes en verre. Là où elle vole, la lumière se sépare en toutes les couleurs de l’arc-en-ciel.' },
  perlkrabbe: { names: ['Crabe-Perle'], gender: 'm', description: 'Un petit crabe avec une carapace comme une perle. À marée basse, il court dans les flaques et fait briller les pierres.' },
  echomaus: { names: ['Souris-Écho'], gender: 'f', description: 'Une petite souris avec de grandes oreilles. Elle répète tout doucement chaque bruit qu’elle entend.' },
  kristallraupe: { names: ['Chenicristal'], gender: 'f', description: 'Une chenille avec un dos fait de cristaux de toutes les couleurs. Elle mange seulement des pierres qui brillent dans le noir.' },
  morrow: { names: ['Morrow', 'Morrow', 'Morrow'], gender: 'm', description: 'Un petit être de brouillard et de poussière d’étoiles. Il a collectionné les échos des mots oubliés, jusqu’au jour où quelqu’un a dit son nom.' },
  zeitschnecke: { names: ['Tic-Tacargot'], gender: 'm', description: 'Un escargot avec une coquille comme une horloge. Il est lent, mais il n’est jamais en retard.' },
  kristallotter: { names: ['Cristaloutre'], gender: 'f', description: 'Une loutre avec une fourrure comme du givre. De petits cristaux de glace poussent sur son dos et brillent sous l’aurore boréale.' },
  irrlichtfee: { names: ['Fée-Follette'], gender: 'f', description: 'Une toute petite fée de lumière. Elle danse au-dessus du marais et montre le chemin de la maison à ceux qui sont perdus.' },
  flaschling: { names: ['Mini-Flacon'], gender: 'f', description: 'Un petit être qui vit dans des bouteilles échouées sur la plage. Il collectionne les lettres qui sont dedans.' },
  wipfelwusel: { names: ['Cimeron'], gender: 'm', description: 'Un minuscule être des cimes des arbres. Ses oreilles sont deux feuilles vertes.' },
  glimmwurz: { names: ['Racinelampe'], gender: 'f', description: 'Une racine avec une fleur comme une lanterne. Elle vit dans les tunnels sombres des racines.' },
  spiegelechse: { names: ['Lézard-Miroir'], gender: 'm', description: 'Un lézard qu’on voit seulement quand on regarde à travers un mirage. Sinon, il est invisible.' },
  klingfeder: { names: ['Plume-Grelot'], gender: 'f', description: 'Un oiseau fait de plumes et de petits grelots. Il construit son nid sur une haute aiguille de roche.' },
  rostbold: { names: ['Rouillin'], gender: 'm', description: 'Un petit lutin qui vit dans des caisses rouillées. Il collectionne les vis et les compte chaque soir.' },
  eisflosse: { names: ['Glaçofin'], gender: 'm', description: 'Un poisson avec une nageoire comme une lanterne. Il nage tout doucement sous la glace.' },
  kometwiesel: { names: ['Belette-Comète'], gender: 'f', description: 'Une belette rapide qui laisse des traces de pattes lumineuses quand elle court.' },
};
