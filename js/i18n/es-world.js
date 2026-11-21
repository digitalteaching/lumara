// Die Gebiete auf Spanisch (Design 10.6): Namen und alle Texte der Karten, Zeile für Zeile nach dem
// Deutschen. areas: name (Reisemenü, Karte), of (im Satz „La piedra de luz … vuelve a brillar“), the
// (auf dem Nebelschild „Detrás de la niebla está/están …“; Mehrzahl beginnt mit „los“/„las“).
// objects: je Karte und Objekt-id die Textfelder; Trainer heißen „trainer“.

const FOG_CLOSED = 'Aquí la niebla es demasiado espesa.';
const FOG_GONE = 'La niebla se ha ido. El camino está libre.';

export const ES_WORLD = {
  areas: {
    bucht: { name: 'Bahía del Faro', of: 'de la Bahía del Faro', the: 'la Bahía del Faro', at: 'en la Bahía del Faro' },
    wald: { name: 'Bosque Susurrante', of: 'del Bosque Susurrante', the: 'el Bosque Susurrante', at: 'en el Bosque Susurrante' },
    moor: { name: 'Pantano de las Setas', of: 'del Pantano de las Setas', the: 'el Pantano de las Setas', at: 'en el Pantano de las Setas' },
    duenen: { name: 'Dunas Espejo', of: 'de las Dunas Espejo', the: 'las Dunas Espejo', at: 'en las Dunas Espejo' },
    klippen: { name: 'Acantilados del Viento', of: 'de los Acantilados del Viento', the: 'los Acantilados del Viento', at: 'en los Acantilados del Viento' },
    ruinen: { name: 'Ruinas del Reloj', of: 'de las Ruinas del Reloj', the: 'las Ruinas del Reloj', at: 'en las Ruinas del Reloj' },
    see: { name: 'Lago de la Aurora', of: 'del Lago de la Aurora', the: 'el Lago de la Aurora', at: 'junto al Lago de la Aurora' },
    wiese: { name: 'Prado de las Estrellas', of: 'del Prado de las Estrellas', the: 'el Prado de las Estrellas', at: 'en el Prado de las Estrellas' },
    eiche: { name: 'Roble Hueco', of: 'del Roble Hueco', the: 'el Roble Hueco' },
    glasturm: { name: 'Torre de Cristal', of: 'de la Torre de Cristal', the: 'la Torre de Cristal' },
    gezeiten: { name: 'Isla de las Mareas', of: 'de la Isla de las Mareas', the: 'la Isla de las Mareas' },
    irrlicht: { name: 'Isla de las Lucecitas', of: 'de la Isla de las Lucecitas', the: 'la Isla de las Lucecitas' },
    eisgrotte: { name: 'Gruta de Hielo', of: 'de la Gruta de Hielo', the: 'la Gruta de Hielo' },
    sternwarte: { name: 'Observatorio', of: 'del Observatorio', the: 'el Observatorio' },
    hoehle1: { name: 'Cueva de la Montaña', of: 'de la cueva', the: 'la cueva' },
    hoehle2: { name: 'Cueva de la Montaña', of: 'de la cueva', the: 'la cueva' },
    hoehle3: { name: 'Cueva de la Montaña', of: 'de la cueva', the: 'la cueva' },
    garten: { name: 'Jardín', of: 'del jardín', the: 'el jardín' },
  },

  objects: {
    bucht: {
      morrow: {
        lines: ['Desde aquí veo toda la isla. ¡Y cada día pasa alguien por aquí!', 'Gracias por acordarte de mí.'],
      },
      'steg-gezeiten': {
        lines: ['Al final del muelle hay un poste con una cuerda vieja.', 'Allí fuera hay una isla pequeña. Con una barca podrías llegar hasta allí.'],
        linesOpen: ['Pones la cáscara de nuez en el agua y remas hasta la Isla de las Mareas.'],
      },
      gartentor: { lines: ['Una puerta de ramas de sauce, llena de flores. Detrás está el jardín de tus amigos.'] },
      'haus-oda': { lines: ['La casa de Oda. La puerta está cerrada con llave.'] },
      'haus-ilvy': { lines: ['La casa de Ilvy. La puerta está cerrada con llave.'] },
      'haus-bram': { lines: ['La casa de Bram. La puerta está cerrada con llave.'] },
      boot: { lines: ['La barca se mueve despacio sobre el agua.'] },
      ilvy: {
        linesAfter: ['Ahora Morrow vive con nosotros en el faro. Cada noche le llevo un té.'],
        lines: [
          '¡Te doy la bienvenida a la Bahía del Faro! Aquí cuido el faro.',
          'La niebla del olvido cubre la isla. Solo el saber la puede hacer desaparecer.',
          '¿Tu criatura está cansada? Ven a la puerta del faro. Su luz da nuevas fuerzas.',
          'La guardiana de la bahía espera arriba, en el camino del norte. ¡Enséñale lo que has aprendido!',
        ],
        linesLit: ['¡La piedra de luz de la bahía vuelve a brillar! Sabía que podías hacerlo.'],
        linesOpen: [
          '¡La piedra de luz de la bahía vuelve a brillar! Sabía que podías hacerlo.',
          'Al norte de la bahía está el Bosque Susurrante. Escucha bien lo que susurran allí los árboles.',
        ],
      },
      bram: {
        linesAfter: ['¡Ya no hay niebla sobre el agua! Veo hasta el horizonte.'],
        lines: [
          '¡Buenas! Aquí, en el muelle, paran las barcas.',
          'La guardiana de la bahía está arriba, en el camino del norte, justo antes de la niebla.',
          'Si quieres pasar, tienes que responder a sus preguntas.',
        ],
        linesLit: ['¡La piedra de luz brilla! Ahora puedo pescar otra vez de noche.'],
        linesOpen: ['¿Has visto la niebla del norte? ¡Ya no está!'],
      },
      pim: {
        linesAfter: ['Morrow me ha enseñado a cazar ecos. ¡Hola-a-a!'],
        lines: ['¡Cuidado! En la hierba alta viven criaturas salvajes.', 'Si una es demasiado fuerte para ti, puedes huir con B.'],
        linesLit: ['¡He visto cómo se encendía la piedra! ¡Qué luz!'],
      },
      oda: {
        linesAfter: ['Ya recuerdo otra vez todas las canciones de mi abuela. ¡Gracias!'],
        lines: [
          'Antes brillaban ocho piedras de luz sobre la isla.',
          'Desde que se apagaron, la niebla se acerca un poco más cada año.',
          '¿Quizás tú puedes encenderlas otra vez?',
        ],
        linesLit: ['Una piedra de luz vuelve a brillar. Quizás las otras también vuelven.'],
      },
      trainer: { afterWin: 'Tu piedra de luz brilla. El camino al Bosque Susurrante está libre.' },
      'nebel-nord': {
        lines: [FOG_CLOSED, 'Quizás se va si la piedra de luz de la bahía vuelve a brillar.'],
        linesOpen: ['Norte: Bosque Susurrante', FOG_GONE],
      },
      'nebel-ost': {
        lines: ['Un sendero sube hacia lo alto, pero la niebla es demasiado espesa.', 'Dicen que solo se va si la última piedra de luz vuelve a brillar.'],
        linesOpen: ['Este: Prado de las Estrellas', 'La niebla se ha ido. El sendero está libre.'],
      },
      'schild-dorf': { lines: ['Bahía del Faro', 'Norte: Bosque Susurrante · Este: Faro'] },
    },

    wald: {
      trainer: { afterWin: 'Tu piedra de luz brilla. El bosque te da las gracias.' },
      birk: {
        linesAfter: ['Los árboles ya no susurran. ¡Cantan!'],
        lines: [
          '¡Te doy la bienvenida al Bosque Susurrante! Aquí hago figuras de madera con ramas caídas.',
          '¿Ves las piedras con la marca brillante? Debajo hay notas con tareas.',
          'Si las resuelves, a veces encuentras un trozo de la historia antigua.',
        ],
        linesLit: ['¡La piedra de luz del bosque brilla! Mis figuras vuelven a tener sombra.'],
      },
      fenna: {
        linesAfter: ['Sin niebla, mis hierbas crecen hasta el cielo.'],
        lines: [
          'En los helechos viven criaturas salvajes. ¡Mira bien dónde pisas!',
          'Las bayas rojas de los arbustos dan fuerza a tu criatura. Vuelven a crecer.',
        ],
        linesLit: ['Desde que la piedra brilla otra vez, mis hierbas huelen el doble.'],
      },
      lio: {
        linesAfter: ['Le he regalado una luciérnaga a Morrow. Ahora brilla en el faro.'],
        lines: [
          'Busco luciérnagas para mi tarro.',
          'Los árboles viejos susurran cuando pasas a su lado. ¿Ya los has oído?',
          'El guardabosques vive arriba, en el claro, junto a la piedra de luz. ¡Una piedra de luz da fuerza!',
        ],
        linesLit: ['¡Las luciérnagas bailan alrededor de la piedra de luz! ¡Ven a verlo!'],
      },
      'baum-sued': { lines: ['… tantas palabras olvidadas … las guardamos para ti …', '… aprende, pequeña luz, aprende …'] },
      'baum-mitte': { lines: ['… el guardabosques espera en el claro … quiere ver lo que sabes …', '… una piedra de luz da nuevas fuerzas a tu criatura …'] },
      'baum-nord': { lines: ['… antes el bosque tenía luz … luego vino la niebla de la montaña …', '… alguien en la montaña está muy solo …'] },
      'baum-farn': { lines: ['… a veces algo brilla en los helechos … mira bien …', '… las bayas vuelven a crecer si tienes paciencia …'] },
      'hohle-eiche': {
        lines: ['En el viejo roble hay un agujero tan grande como una puerta.', 'Dentro está muy, muy oscuro. Con una linterna podrías entrar.'],
        linesOpen: ['Enciendes la linterna y te metes en el roble.'],
      },
      'schild-eingang': { lines: ['Bosque Susurrante', 'Quédate en el camino y oirás susurrar a los árboles viejos.'] },
      'nebel-nord': {
        lines: [FOG_CLOSED, 'Quizás se va si la piedra de luz del bosque vuelve a brillar.'],
        linesOpen: ['Norte: Pantano de las Setas', FOG_GONE],
      },
    },

    moor: {
      'pfahl-irrlicht': {
        lines: ['Un poste con una cuerda vieja sale del pantano.', 'Allí bailan las lucecitas. Con una barca pequeña podrías llegar a la isla.'],
        linesOpen: ['Pones la cáscara de nuez en el agua y remas hasta la Isla de las Lucecitas.'],
      },
      trainer: { afterWin: 'Tu piedra de luz brilla. Las setas dan más luz que nunca.' },
      wenke: {
        linesAfter: ['Hoy hago sopa para toda la isla. ¡El primer plato es para Morrow!'],
        lines: [
          '¡Te doy la bienvenida al Pantano de las Setas! Hago la mejor sopa de setas de toda la isla.',
          'Las setas que brillan no se comen. Solo muestran el camino en la oscuridad.',
          'En el pantano también crecen bayas. ¡Mira en los arbustos del borde!',
        ],
        linesLit: ['¡La piedra de luz del pantano brilla! Hoy hago una sopa de fiesta.'],
      },
      jasper: {
        linesAfter: ['Sin niebla veo cada tabla. Mis pasarelas nunca han sido tan seguras.'],
        lines: [
          'Construyo las pasarelas del pantano. ¡Quédate siempre sobre la madera!',
          '¿Ves la isla pequeña del oeste? Allí bailan las lucecitas por la noche.',
          'Sin barca nadie puede llegar. Quizás algún día aparece una.',
        ],
        linesLit: [
          'Desde que la piedra brilla otra vez, mis pasarelas crujen de alegría.',
          'Desde el poste de la orilla sur, la Isla de las Lucecitas está cerca. En barca, claro.',
        ],
      },
      nele: {
        linesAfter: ['Las lucecitas han visitado a Morrow. ¡Ahora son amigos!'],
        lines: [
          '¿Has visto las lucecitas? ¡Parpadean cuando las saludas con la mano!',
          'Debajo de las piedras con la marca brillante hay notas. ¡Ya he resuelto dos!',
        ],
        linesLit: ['Ahora las lucecitas bailan alrededor de la piedra de luz. ¡Ven, vamos a mirar!'],
        linesOpen: [
          '¡Ahora las lucecitas bailan alrededor de la piedra de luz!',
          'En el norte ya no hay niebla. ¡Dicen que detrás hay dunas de cristal!',
        ],
      },
      'schild-eingang': { lines: ['Pantano de las Setas', 'Quédate en la tierra firme y en las pasarelas. El agua del pantano es profunda.'] },
      'nebel-nord': {
        lines: [FOG_CLOSED, 'Quizás se va si la piedra de luz del pantano vuelve a brillar.'],
        linesOpen: ['Norte: Dunas Espejo', FOG_GONE],
      },
    },

    duenen: {
      trainer: { afterWin: 'Tu piedra de luz brilla. Los espejos vuelven a mostrar caminos de verdad.' },
      samir: {
        linesAfter: ['Ahora en mis vasos veo toda la isla, clara y llena de luz.'],
        lines: [
          '¡Te doy la bienvenida a las Dunas Espejo! Aquí hago vasos de cristal con la arena.',
          'Ten cuidado: algunos caminos solo brillan. Son espejismos.',
          'Si chocas con uno, lo notas enseguida. ¡Entonces busca otro camino!',
        ],
        linesLit: ['¡La piedra de luz brilla! Ahora mis vasos brillan otra vez como antes.'],
      },
      talia: {
        linesAfter: ['Mi nuevo mapa ya no tiene niebla. ¡Solo caminos!'],
        lines: [
          'Dibujo mapas de las dunas. Cada día son un poco diferentes.',
          'Karim espera en el este. Es muy rápido, ¡y en sus duelos hay un reloj!',
          'Una piedra del tiempo para el reloj durante una pregunta. A veces brilla una en la hierba.',
          'La Torre de Cristal del noroeste solo la conozco de lejos. Es demasiado alta para subir.',
        ],
        linesNoClock: [
          'Dibujo mapas de las dunas. Cada día son un poco diferentes.',
          'Karim espera en el este. ¡Es muy rápido y sabe muchas palabras!',
          'La Torre de Cristal del noroeste solo la conozco de lejos. Es demasiado alta para subir.',
        ],
        linesLit: ['¡Has vencido a Karim! Lo voy a poner ahora mismo en mi mapa.'],
        linesOpen: [
          '¡Has vencido a Karim! Lo voy a poner ahora mismo en mi mapa.',
          'Al este están los Acantilados del Viento. ¡Sujeta bien tu gorro, allí hace mucho viento!',
        ],
      },
      'statue-sued-west': { lines: ['Una estatua de cristal. En la base dice:', '«Quien mira bien encuentra el camino de verdad.»'] },
      'statue-sued-ost': { lines: ['Una estatua de cristal. En la base dice:', '«Lo que sabes, nadie te lo puede quitar.»'] },
      'statue-platz': { lines: ['Una estatua de cristal. En la base dice:', '«Antes, aquí brillaba el saber de toda la isla.»'] },
      'oese-glasturm': {
        lines: ['En la pared de cristal hay una vieja anilla de metal.', 'Con un gancho de escalada podrías subir por aquí hasta la Torre de Cristal.'],
        linesOpen: ['Pones el gancho de escalada en la anilla y subes por la pared de cristal.'],
      },
      'statue-west': { lines: ['Una estatua de cristal. En la base dice:', '«No todo camino que brilla es un camino.»'] },
      'schild-eingang': { lines: ['Dunas Espejo', 'No todo camino que brilla es de verdad. ¡Quédate en el sendero!'] },
      'nebel-ost': {
        lines: [FOG_CLOSED, 'Quizás se va si la piedra de luz de las dunas vuelve a brillar.'],
        linesOpen: ['Este: Acantilados del Viento', FOG_GONE],
      },
    },

    klippen: {
      trainer: { afterWin: 'Tu piedra de luz brilla. ¿Sientes el viento? Lleva saludos otra vez.' },
      ole: {
        linesAfter: ['El viento lleva otra vez canciones por la isla. ¿Las oyes?'],
        lines: [
          '¡Hola! Soy Ole y cuido los molinos de viento.',
          'Durante mucho tiempo aquí no ha hecho viento. Mis molinos han estado parados casi un año.',
          'Ahora vuelven a girar un poco. ¿Oyes cómo crujen?',
        ],
        linesLit: ['¡La piedra de luz brilla y mis molinos giran como nunca!'],
      },
      ina: {
        linesAfter: ['Desde aquí arriba ahora se ve hasta el faro. ¡Saluda a Morrow!'],
        lines: [
          'Estudio las nubes que hay debajo de los puentes. ¡Cada una es diferente!',
          'En los puentes colgantes: mira hacia delante, no hacia abajo.',
          'A veces pasa nadando una Ballenube. Con un poco de suerte, verás una.',
        ],
        linesLit: ['Desde que la piedra brilla, las nubes están blancas como la ropa limpia.'],
      },
      tamo: {
        linesAfter: ['Mi cometa vuela hasta la montaña y vuelve. ¡Ninguna niebla la para!'],
        lines: [
          '¡Mi cometa de dragón vuela casi tan alto como la de Skye! Pero solo casi.',
          'Skye espera arriba, en la cima del este. En sus duelos, el reloj va todavía más rápido.',
          'Si tienes una piedra del tiempo, llévala. ¡Para el tiempo un momento!',
        ],
        linesNoClock: [
          '¡Mi cometa de dragón vuela casi tan alto como la de Skye! Pero solo casi.',
          'Skye espera arriba, en la cima del este. Hace preguntas muy difíciles.',
        ],
        linesLit: ['¿Has vencido a Skye? ¡Guau! ¡Entonces corres más que el viento!'],
      },
      'schild-eingang': { lines: ['Acantilados del Viento', 'Agárrate a las cuerdas y mira hacia delante al caminar.'] },
      'nebel-ost': {
        lines: [FOG_CLOSED, 'Quizás se va si la piedra de luz de los acantilados vuelve a brillar.'],
        linesOpen: ['Este: Ruinas del Reloj', FOG_GONE],
      },
    },

    hoehle1: {
      'echo-1': { lines: ['Del cristal sale un eco suave: «… y entonces ella cantó la canción del mar …»'] },
      'echo-2': { lines: ['Del cristal sale un eco suave: «… ¿cómo se llamaba? …»'] },
    },
    hoehle2: {
      'echo-3': { lines: ['Del cristal sale un eco suave: «… no me olvides …»'] },
      'echo-4': { lines: ['Del cristal sale un eco suave: «… mañana te cuento el resto …»'] },
    },
    hoehle3: {
      'morrows-kristall': { lines: ['Aquí vivía Morrow. Ahora el cristal canta bajito una canción alegre.'] },
    },
    ruinen: {
      'tafel-sternwarte': {
        lines: ['Una placa de piedra con dibujos de estrellas. Detrás del canal espera el observatorio.', 'Con un mapa de estrellas podrías leer la placa.'],
        linesOpen: ['Pones el mapa de estrellas junto a la placa. Sus estrellas se encienden.', 'Un puente estrecho aparece sobre el canal.'],
      },
      trainer: { afterWin: 'Tu piedra de luz brilla. ¿Lo oyes? Todas las ruedas vuelven a hacer tic-tac juntas.' },
      greta: {
        linesAfter: ['Ya no tengo frío, las ruedas giran y la niebla se ha ido. ¡Qué día!'],
        lines: [
          'Soy Greta, mecánica. Pongo aceite a las ruedas dentadas que todavía giran.',
          'Nadie sabe qué las mueve. Pero cuando una se para, aquí hace frío.',
          'Ten cuidado cerca de los canales. El agua es profunda y está quieta.',
        ],
        linesLit: ['¡La piedra brilla! ¿Oyes el tic-tac? Las ruedas vuelven a girar al mismo ritmo.'],
      },
      pino: {
        linesAfter: ['Con mi barco nuevo llevo a la gente al faro, a ver a Morrow.'],
        lines: [
          'Soy Pino, el barquero. Pero mi barca se ha ido flotando.',
          '¿Ves el observatorio detrás del canal? En su placa brillan dibujos de estrellas.',
          'Quien sabe leer allí las estrellas encuentra el camino para cruzar. Yo no sé, ¡qué pena!',
        ],
        linesLit: [
          'Desde que la piedra brilla, la cúpula del observatorio brilla otra vez. Qué bonito, ¿verdad?',
          'Con la cáscara de nuez llegas a las islas pequeñas: delante de la bahía y en el pantano.',
        ],
      },
      bo: {
        linesAfter: ['Las ruedas hacen tic-tac al ritmo de una canción. Morrow me la ha cantado bajito.'],
        lines: [
          '¿Has visto las chispas en las ruedas? ¡Las cuento cada día!',
          'Debajo de algunas piedras hay notas. Si resuelves la tarea, encuentras algo.',
        ],
        linesLit: ['Hoy las ruedas echan el doble de chispas. Has sido tú, ¿verdad?'],
      },
      'schild-eingang': { lines: ['Ruinas del Reloj', 'Por favor, no te caigas a los canales. No toques las ruedas.'] },
      'nebel-sued': {
        lines: [FOG_CLOSED, 'Quizás se va si la piedra de luz de las ruinas vuelve a brillar.'],
        linesOpen: ['Sur: Lago de la Aurora', FOG_GONE],
      },
    },

    see: {
      'eiskante-grotte': {
        lines: ['Aquí termina el hielo firme. Detrás brilla la entrada de la gruta.', 'Con patines de hielo podrías patinar hasta allí sobre el hielo liso.'],
        linesOpen: ['Te pones los patines de hielo y patinas hasta la Gruta de Hielo.'],
      },
      trainer: { afterWin: 'Tu piedra de luz brilla. ¡Mira, la aurora boreal tiene más luz!' },
      sven: {
        linesAfter: ['Cuarenta inviernos, y el hielo nunca ha estado tan claro.'],
        lines: [
          'Soy Sven. Pesco en este lago desde hace cuarenta inviernos.',
          'En mi tienda hace calor. Fuera hago agujeros en el hielo y espero.',
          'Freya es la mejor de todos. Está en el centro del hielo.',
        ],
        linesLit: ['¡La piedra brilla! Hoy voy a pescar mucho, lo noto en las rodillas.'],
      },
      mira: {
        linesAfter: ['Estoy haciendo un Morrow de nieve. ¡Hasta sonríe!'],
        lines: [
          'Soy Mira y hago figuras de nieve. ¿Te gusta mi pájaro de hielo?',
          '¿Ves la Gruta de Hielo, allí detrás del agua sin hielo?',
          'Solo puede llegar quien sabe patinar sobre el hielo. Yo no sé, ¡qué pena!',
        ],
        linesLit: [
          'Desde que la piedra brilla, la Gruta de Hielo brilla como un cristal.',
          'Con patines de hielo podrías patinar hasta allí desde el borde del hielo, aquí a mi lado.',
        ],
      },
      ari: {
        linesAfter: ['Escribo todo lo que aprendo. Así nadie olvida nada nunca más.'],
        lines: [
          'Por la noche, la aurora boreal baila sobre el lago. ¡Verde y lila! ¿La has visto?',
          'Debajo de algunas piedras hay notas. ¡Ya he encontrado dos!',
        ],
        linesLit: ['¡Hoy la aurora boreal tiene tanta luz que puedo leer sin linterna!'],
      },
      zelt: { lines: ['La tienda de pesca de Sven. Dentro hace calor y huele a té.'] },
      'schild-eingang': { lines: ['Lago de la Aurora', 'El hielo es seguro. Por favor, no pases cerca de los agujeros.'] },
      'nebel-sued': {
        lines: [FOG_CLOSED, 'Quizás se va si la piedra de luz del lago vuelve a brillar.'],
        linesOpen: ['Sur: Prado de las Estrellas', FOG_GONE],
      },
    },

    wiese: {
      trainer: { afterWin: 'Tu piedra de luz brilla. El sendero que baja a la bahía está libre.' },
      selma: {
        linesAfter: ['Mi deseo se ha hecho realidad. Nadie olvida ya lo que le importa.'],
        lines: [
          'Soy Selma. Recojo estrellas fugaces que caen en la hierba.',
          'Si ves caer una, puedes pedir un deseo. Yo siempre pido lo mismo.',
          'Que nadie olvide nunca más lo que le importa.',
        ],
        linesLit: ['¡La piedra brilla! Esta noche caen más estrellas que en muchos años.'],
      },
      kai: {
        linesAfter: ['Ahora mis ovejas comen hierba hasta la montaña. ¡Hasta quieren entrar en la cueva!'],
        lines: [
          'Soy Kai y cuido las ovejas nocturnas. Nunca duermen cuando brillan las estrellas.',
          '¿Ves la puerta de la montaña? Tiene ocho huecos, uno para cada piedra de luz.',
          'Mi abuela dice que solo se abre cuando las ocho vuelven a brillar.',
        ],
        linesLit: ['¿Los ocho huecos? ¡Tengo que verlo! Mis ovejas también vienen.'],
      },
      'schild-eingang': { lines: ['Prado de las Estrellas', 'Por favor, no hagas ruido. Las ovejas nocturnas nunca duermen, pero les encanta soñar.'] },
      'nebel-west': {
        lines: ['Un sendero baja a la bahía, pero la niebla es demasiado espesa.', 'Quizás se va si la piedra de luz del prado vuelve a brillar.'],
        linesOpen: ['Oeste: Bahía del Faro', 'La niebla se ha ido. El sendero baja a la bahía.'],
      },
    },
    garten: {
      'garten-schild': { lines: ['Jardín del Faro', 'Aquí viven tus amigos.'] },
    },
  },
};
