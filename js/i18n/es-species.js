// Die Wesen auf Spanisch (Design 10.6): eigene, kindgerechte Namen wie im Deutschen, dazu die
// Beschreibungen und die Besonderheiten der Startwesen. Gleiche Anzahl Stufennamen wie in SPECIES.
// gender passt zum spanischen Namen („Un Bellotín salvaje“, „Una Ballenube salvaje“).

export const ES_SPECIES = {
  funki: {
    names: ['Funki', 'Alachispa', 'Farolilla', 'Polilla Aurora'],
    gender: 'f',
    description: 'Una pequeña polilla de luz. Su barriga brilla como una linterna muy pequeña.',
    special: {
      name: 'Iluminación',
      text: 'Una vez por duelo, la luz de Funki te ayuda: desaparecen dos respuestas incorrectas, ves la primera letra o la primera tarjeta ya está en su sitio.',
    },
  },
  kiesel: {
    names: ['Piedrín', 'Pedrusco', 'Guardarrocas', 'Corazón de Monte'],
    gender: 'm',
    description: 'Un duende de piedra, redondo, con musgo por encima. Es tranquilo y nada lo puede tirar.',
    special: { name: 'Roca firme', text: 'Piedrín es muy fuerte y siempre tiene 1 de energía más que los demás.' },
  },
  nixi: {
    names: ['Nixi', 'Fuentenix', 'Remolinix', 'Mareanix'],
    gender: 'm',
    description: 'Un ajolote con una cresta de aletas. Cuando Nixi se alegra, hace burbujas de agua.',
    special: { name: 'Fuente', text: 'Después de 3 respuestas correctas seguidas, Nixi recupera 1 de energía.' },
  },
  flausch: {
    names: ['Pelusa', 'Lechunube', 'Lechutormenta', 'Lechuza Celeste'],
    gender: 'f',
    description: 'Una lechuza de nube con plumas tan suaves como el algodón. Flota más que vuela.',
    special: {
      name: 'Viento a favor',
      text: 'Una vez por duelo puedes cambiar una pregunta por otra. Si hay reloj, además tienes más tiempo.',
    },
  },
  pieks: {
    names: ['Pincho', 'Espinerizo', 'Florerizo', 'Rey del Bosque'],
    gender: 'm',
    description: 'Un erizo de semillas con pinchos de hojas. Donde duerme Pincho, a la mañana siguiente crece trébol.',
    special: {
      name: 'Mano verde',
      text: 'Las bayas le dan a Pincho el doble de energía. Después de ganar, Pincho encuentra muchas veces una baya.',
    },
  },

  // Gebiet 1
  gischtling: { names: ['Espumín', 'Rompeolas'], gender: 'm', description: 'Un pequeño espíritu de las olas, hecho de espuma de mar. Lleva una corona de gotas de agua.' },
  haeuschel: { names: ['Casacol', 'Cangrefaro'], gender: 'm', description: 'Un cangrejo ermitaño en una concha de caracol. Cuando crece, su casa parece un pequeño faro.' },
  glimmqualle: { names: ['Medusa Estrella'], gender: 'f', description: 'Una medusa que flota sobre el agua por la noche. Sus puntos brillan como estrellas.' },
  // Gebiet 2
  moosling: { names: ['Musguito', 'Musgruñón'], gender: 'm', description: 'Una bola redonda de musgo con un sombrero de seta. Prefiere rodar a caminar.' },
  eichhuscher: { names: ['Bellotín', 'Correcopas'], gender: 'm', description: 'Una ardilla de hojas de otoño con una bellota como gorro. Esconde comida por todas partes.' },
  rindenwicht: { names: ['Duende Tronco'], gender: 'm', description: 'Un pequeño espíritu de corteza de árbol. Sus ojos brillan como dos linternas en el bosque oscuro.' },
  // Gebiet 3
  tupfling: { names: ['Lunarín', 'Sombrillín'], gender: 'm', description: 'Una seta pequeña con lunares que brillan. Cuando salta, suelta esporas que brillan como purpurina.' },
  irrfunke: { names: ['Chispa Loca'], gender: 'f', description: 'Una chispa de luz verde que baila sobre el pantano. Quiere enseñar el camino a todo el mundo.' },
  nebelunke: { names: ['Sapo Niebla'], gender: 'm', description: 'Un sapo tímido con la piel como la niebla de la mañana. Solo canta cuando todo está en silencio.' },
  // Gebiet 4
  glaskaefer: { names: ['Bicho Cristal', 'Bicho Espejo'], gender: 'm', description: 'Un escarabajo con alas de cristal. En ellas brilla el sol del mediodía.' },
  duenenhuepfer: { names: ['Saltadunas'], gender: 'm', description: 'Un saltarín rápido con orejas enormes. Nunca se queda quieto mucho tiempo sobre la arena caliente.' },
  flimmerfuchs: { names: ['Zorro Espejismo'], gender: 'm', description: 'Un zorro de aire que tiembla y brilla. Solo lo ves si no lo miras muy de cerca.' },
  // Gebiet 5
  drachling: { names: ['Dragoncito', 'Dragón Cometa'], gender: 'm', description: 'Un pequeño dragón con alas como cometas de papel. Le encanta volar contra el viento.' },
  klippbock: { names: ['Cabrarroca'], gender: 'f', description: 'Una cabra de montaña con cuernos curvos. No se cae ni en las rocas más estrechas.' },
  wolkenwal: { names: ['Ballenube'], gender: 'f', description: 'Una pequeña ballena de nubes. Nada despacio por debajo de los puentes colgantes.' },
  // Gebiet 6
  zahnmaus: { names: ['Ratón Rueda', 'Ratón Reloj'], gender: 'm', description: 'Un ratón con orejas como ruedas dentadas. En la espalda lleva una pequeña llave de reloj.' },
  dampfkobold: { names: ['Teterín'], gender: 'm', description: 'Un duende de cobre, redondo como una tetera. Cuando se alegra, su sombrero silba y echa vapor.' },
  messingeule: { names: ['Búho Lupa'], gender: 'm', description: 'Un búho de metal dorado con ojos como lupas. Ve cada ruedecita que gira en las ruinas.' },
  // Gebiet 7
  frostrobbe: { names: ['Foca Helada', 'Foca Glaciar'], gender: 'f', description: 'Una foca blanca a la que le encanta resbalar por el hielo. Cuando crece, le salen cristales de hielo en la espalda.' },
  flockenhase: { names: ['Liebre Copito'], gender: 'f', description: 'Una liebre con el pelo tan blanco como la nieve nueva. En la frente tiene un copo de nieve.' },
  aurorafink: { names: ['Pajarito Aurora'], gender: 'm', description: 'Un pájaro pequeño. Las plumas largas de su cola brillan con los colores de la aurora boreal.' },
  // Gebiet 8
  schnuppling: { names: ['Estrellín', 'Cometín'], gender: 'm', description: 'Una pequeña estrella que se ha caído del cielo. Detrás de ella brilla una cola de polvo de estrellas.' },
  nachtschaf: { names: ['Oveja Nocturna'], gender: 'f', description: 'Una oveja con la lana como una noche de verano. En su lana brillan pequeñas estrellas.' },
  sternhirsch: { names: ['Ciervo Estrella'], gender: 'm', description: 'Un ciervo con cuernos de luz de estrellas. Solo se ve en las noches claras.' },
  // Geheime Orte
  wurzelgeist: { names: ['Espíritu Raíz'], gender: 'm', description: 'Un pequeño espíritu de raíces. En la cabeza lleva una flor que brilla en la oscuridad.' },
  prismalibelle: { names: ['Libélula Prisma'], gender: 'f', description: 'Una libélula con alas de cristal. Donde vuela, la luz se rompe en todos los colores del arcoíris.' },
  perlkrabbe: { names: ['Cangrejo Perla'], gender: 'm', description: 'Un cangrejo pequeño con un caparazón como una perla. Cuando baja la marea, corre por los charcos y limpia las piedras hasta que brillan.' },
  echomaus: { names: ['Ratón Eco'], gender: 'm', description: 'Un ratón pequeño con orejas grandes. Repite muy bajito cada sonido que oye.' },
  kristallraupe: { names: ['Oruga Joya'], gender: 'f', description: 'Una oruga con la espalda de cristales de colores. Solo come piedras que brillan en la oscuridad.' },
  morrow: { names: ['Morrow', 'Morrow', 'Morrow'], gender: 'm', description: 'Una pequeña criatura de niebla y polvo de estrellas. Recogía los ecos de las palabras olvidadas, hasta que alguien dijo su nombre.' },
  zeitschnecke: { names: ['Caracol Reloj'], gender: 'm', description: 'Un caracol con una concha que parece un reloj. Es lento, pero nunca llega tarde.' },
  kristallotter: { names: ['Nutria Cristal'], gender: 'f', description: 'Una nutria con el pelo blanco como el hielo. En la espalda le crecen pequeños cristales de hielo que brillan con la aurora boreal.' },
  irrlichtfee: { names: ['Hadita de Luz'], gender: 'f', description: 'Un hada muy pequeña, hecha de luz. Baila sobre el pantano y enseña el camino a casa a todos los que se han perdido.' },
};
