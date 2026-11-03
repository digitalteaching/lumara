// Die Wesen auf Englisch (Design 10.6): eigene, kindgerechte Namen wie im Deutschen, dazu die
// Beschreibungen und die Besonderheiten der Startwesen. Gleiche Anzahl Stufennamen wie in SPECIES.

export const EN_SPECIES = {
  funki: {
    names: ['Funki', 'Sparkwing', 'Lanternmoth', 'Auroramoth'],
    description: 'A little glow moth. Its body glows like a tiny lantern.',
    special: {
      name: 'Enlightenment',
      text: 'Once per duel, Funki’s light helps you: two wrong answers disappear, you see the first letter, or the first word card is already in place.',
    },
  },
  kiesel: {
    names: ['Pebble', 'Boulderling', 'Rockwarden', 'Mountainheart'],
    description: 'A round stone goblin with tufts of moss. It is calm and nothing can knock it over.',
    special: { name: 'Steadfast', text: 'Pebble is tough and always has 1 more energy than the others.' },
  },
  nixi: {
    names: ['Nixi', 'Springnix', 'Swirlnix', 'Tidenix'],
    description: 'An axolotl with a fin crest. When Nixi is happy, it blows bubbles.',
    special: { name: 'Spring', text: 'After 3 right answers in a row, Nixi gets 1 energy back.' },
  },
  flausch: {
    names: ['Fluff', 'Cloudhoot', 'Stormowl', 'Skyhoot'],
    description: 'A cloud owl with feathers as soft as cotton wool. It floats more than it flies.',
    special: {
      name: 'Tailwind',
      text: 'Once per duel, you can swap a question for another one. With a clock, you also get more time.',
    },
  },
  pieks: {
    names: ['Prickle', 'Thornhog', 'Bloomhog', 'Woodwarden'],
    description: 'A seed hedgehog with spikes made of leaves. Where Prickle sleeps, clover grows the next morning.',
    special: {
      name: 'Green Thumb',
      text: 'Berries give Prickle twice as much energy. After a win, Prickle often finds a berry.',
    },
  },

  // Gebiet 1
  gischtling: { names: ['Sprayling', 'Surfspirit'], description: 'A little wave spirit made of sea foam. It wears a crown of spray.' },
  haeuschel: { names: ['Shellhut', 'Shelltower'], description: 'A hermit crab in a snail shell. When it grows, its shell looks like a little lighthouse.' },
  glimmqualle: { names: ['Glimmerjelly'], description: 'A jellyfish that floats above the water at night. Its dots glow like stars.' },
  // Gebiet 2
  moosling: { names: ['Mossling', 'Mossgrump'], description: 'A round ball of moss with a mushroom hat. It likes rolling more than walking.' },
  eichhuscher: { names: ['Oakscamper', 'Crownscamper'], description: 'A squirrel made of autumn leaves with an acorn as a hat. It hides food everywhere.' },
  rindenwicht: { names: ['Barkimp'], description: 'A little spirit made of bark. Its eyes glow like two lanterns in the dark wood.' },
  // Gebiet 3
  tupfling: { names: ['Dotling', 'Parasolling'], description: 'A little mushroom with glowing dots. When it hops, it throws spores like glitter.' },
  irrfunke: { names: ['Wispark'], description: 'A spark of green light. It dances over the marsh and wants to show everyone the way.' },
  nebelunke: { names: ['Fogtoad'], description: 'A shy toad with skin like morning mist. It only calls when everything is very quiet.' },
  // Gebiet 4
  glaskaefer: { names: ['Glassbeetle', 'Mirrorbeetle'], description: 'A beetle with wing cases made of glass. The midday sun shines in them.' },
  duenenhuepfer: { names: ['Dunehopper'], description: 'A quick hopper with huge ears. It never stands still on the hot sand for long.' },
  flimmerfuchs: { names: ['Shimmerfox'], description: 'A fox made of shimmering air. You only see it when you do not look too closely.' },
  // Gebiet 5
  drachling: { names: ['Kiteling', 'Skykiteling'], description: 'A little dragon with wings like paper kites. It loves flying against the wind.' },
  klippbock: { names: ['Cliffgoat'], description: 'A mountain goat with curly horns. It keeps its balance on the narrowest rocks.' },
  wolkenwal: { names: ['Cloudwhale'], description: 'A little whale made of clouds. It swims slowly under the rope bridges.' },
  // Gebiet 6
  zahnmaus: { names: ['Cogmouse', 'Clockmouse'], description: 'A mouse with ears like cogs. On its back it carries a little wind-up key.' },
  dampfkobold: { names: ['Steamsprite'], description: 'A copper goblin, round like a kettle. When it is happy, steam whistles out of its hat.' },
  messingeule: { names: ['Brassowl'], description: 'An owl made of brass with eyes like magnifying glasses. It sees every little wheel in the ruins.' },
  // Gebiet 7
  frostrobbe: { names: ['Frostseal', 'Glacierseal'], description: 'A white seal that loves sliding on the ice. When it grows, ice crystals grow on its back.' },
  flockenhase: { names: ['Flakehare'], description: 'A hare with fur as white as fresh snow. It has a snowflake on its forehead.' },
  aurorafink: { names: ['Aurorafinch'], description: 'A little finch. Its long tail feathers shine in the colours of the northern lights.' },
  // Gebiet 8
  schnuppling: { names: ['Wishling', 'Cometling'], description: 'A little star that fell from the sky. A tail of stardust glows behind it.' },
  nachtschaf: { names: ['Nightsheep'], description: 'A sheep with wool like a summer night. Little stars sparkle in its fur.' },
  sternhirsch: { names: ['Starstag'], description: 'A deer with antlers made of starlight. You only see it on clear nights.' },
};
