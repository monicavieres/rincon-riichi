import { FELT, type TableCallout, type TableFocus, type TablePoint } from '../../../shared/table/geometry';

export * from '../../../shared/table/geometry';

export type ExplorerTab = 'summary' | 'observe' | 'practice';

export type TableExplorerStop = {
  id: string;
  eyebrow: string;
  title: string;
  shortTitle: string;
  description: string;
  observe: string[];
  practicePrompt: string;
  actionLabel: string;
  route: string;
  hotspot: TablePoint;
  focus: TableFocus;
  callouts: TableCallout[];
};


export const tableExplorerStops: TableExplorerStop[] = [
  {
    id: 'mesa',
    eyebrow: 'Empieza aquí',
    title: 'Una partida ocurre alrededor de una mesa compartida',
    shortTitle: 'La mesa',
    description: 'Cuatro personas construyen su propia mano usando las mismas fichas del muro. Lo que cada una descarta queda visible y también te entrega información.',
    observe: [
      'Cada asiento tiene un viento; el compass del centro muestra cuál es cuál.',
      'El centro ordena los vientos y muestra la ronda actual.',
      'Muros, manos y descartes ocupan zonas distintas.',
    ],
    practicePrompt: 'Recorre los pasos de la mesa. No necesitas memorizarlo todo: primero ubica de dónde se roba, dónde se descarta y dónde miras la ronda.',
    actionLabel: 'Abrir tutorial desde cero',
    route: 'aprender/tutorial.html',
    hotspot: [26, 26, 122],
    focus: { boxes: [{ x: 0, y: 0, z: 92, w: 600, d: 600, h: 29 }], zoom: 1 },
    callouts: [],
  },
  {
    id: 'muro',
    eyebrow: 'De aquí se roba',
    title: 'El muro guarda las fichas que todavía no entran en juego',
    shortTitle: 'El muro',
    description: 'Al comenzar se levantan cuatro lados, uno frente a cada jugador. Durante la partida se roba del muro, ficha por ficha, en orden.',
    observe: [
      'Cada lado se arma con 17 pilas de dos fichas: 34 fichas.',
      'Los cuatro lados suman las 136 fichas del juego.',
      'Las fichas del muro van boca abajo: nadie sabe qué viene.',
    ],
    practicePrompt: 'Cuenta las pilas de un lado: 17. Multiplica por dos fichas y por cuatro lados y llegas a 136.',
    actionLabel: 'Ver cómo se prepara la mesa',
    route: 'aprender/tutorial.html',
    hotspot: [116, 470, 151],
    focus: { boxes: [{ x: 103, y: 130, z: FELT, w: 27, d: 340, h: 30 }], zoom: 2 },
    callouts: [
      { label: '17 pilas por lado', at: [103, 130, FELT + 30], dx: -40, dy: -46 },
      { label: '2 fichas de alto', at: [103, 300, FELT + 15], dx: -86, dy: 20 },
    ],
  },
  {
    id: 'muro-muerto',
    eyebrow: 'Reservado',
    title: 'El muro muerto guarda la dora y las fichas de reemplazo',
    shortTitle: 'Muro muerto',
    description: 'Junto al corte del muro se separan 7 pilas: 14 fichas que nunca se roban en un turno normal. Ahí se voltea el indicador de dora.',
    observe: [
      'El corte del muro marca dónde empieza a robarse y dónde termina el muro vivo.',
      'La ficha volteada es el indicador: la dora es la siguiente en orden.',
      'Tras un kan, se roba un reemplazo desde el muro muerto.',
    ],
    practicePrompt: 'Mira el indicador: un 4 de círculos. Eso hace que el 5 de círculos sea dora y valga un han extra.',
    actionLabel: 'Aprender dora',
    route: 'aprender/dora.html',
    hotspot: [483, 246, 151],
    focus: { boxes: [{ x: 470, y: 236, z: FELT, w: 27, d: 140, h: 30 }], zoom: 2.8 },
    callouts: [
      { label: 'Indicador de dora', at: [497, 326, FELT + 30], dx: 70, dy: -54 },
      { label: 'Corte del muro', at: [483, 400, FELT], dx: 64, dy: 30 },
      { label: '7 pilas apartadas: 14 fichas', at: [470, 246, FELT + 30], dx: -30, dy: -96 },
    ],
  },
  {
    id: 'mano',
    eyebrow: 'Solo tú la ves',
    title: 'Tu mano son 13 fichas de pie frente a ti',
    shortTitle: 'Tu mano',
    description: 'Cada jugador mantiene 13 fichas paradas, con la cara hacia sí. El objetivo es convertirlas en cuatro grupos y una pareja.',
    observe: [
      'Ordenarlas por palo ayuda a ver los grupos.',
      'Las manos rivales solo se ven por detrás.',
      'Una mano ganadora tiene 14 fichas: 4 grupos + 1 pareja.',
    ],
    practicePrompt: 'Busca en esta mano los grupos ya formados: 2-3-4 de caracteres, 3-4-5 de círculos y 6-7-8 de bambúes.',
    actionLabel: 'Conocer las fichas',
    route: 'aprender/tiles.html',
    hotspot: [170, 541, 148],
    focus: { boxes: [{ x: 170, y: 534, z: FELT, w: 260, d: 15, h: 27 }], zoom: 2.6 },
    callouts: [
      { label: '13 fichas, cara hacia ti', at: [220, 552, FELT], dx: -40, dy: 54 },
      { label: 'Grupos de 3 + pareja', at: [330, 552, FELT], dx: 30, dy: 58 },
    ],
  },
  {
    id: 'turno',
    eyebrow: 'La acción principal',
    title: 'Tu turno es una decisión: roba una, descarta una',
    shortTitle: 'Tu turno',
    description: 'La mayor parte del juego alterna ese ritmo sencillo. Con 13 fichas esperas; al robar tienes 14 y eliges qué conservar para acercarte a una mano ganadora.',
    observe: [
      'Normalmente solo una ficha entra y una sale en cada turno.',
      'Chi, pon y kan pueden interrumpir el orden normal.',
      'Ganar exige completar la forma y tener al menos un yaku.',
    ],
    practicePrompt: 'Antes de descartar, pregunta qué grupos ya tienes, qué fichas te faltan y cuántas fichas diferentes mejoran tu mano.',
    actionLabel: 'Ver tipos de espera',
    route: 'aprender/machi.html',
    hotspot: [448, 541, 148],
    focus: { boxes: [{ x: 330, y: 534, z: FELT, w: 128, d: 15, h: 27 }], zoom: 3.2 },
    callouts: [
      { label: 'Ficha 14: la que robaste', at: [448, 552, FELT], dx: 40, dy: 50 },
      { label: 'Eliges una para descartar', at: [360, 533, FELT + 27], dx: -60, dy: -56 },
    ],
  },
  {
    id: 'descartes',
    eyebrow: 'Información pública',
    title: 'Los descartes cuentan la historia de la mano',
    shortTitle: 'Descartes',
    description: 'Cada ficha descartada se deja boca arriba frente a quien la jugó. Se ordenan en filas de seis para que todos puedan leer la partida.',
    observe: [
      'Cada jugador mantiene su propio río de descartes.',
      'Las filas de seis permiten contar los turnos de un vistazo.',
      'Tus propios descartes importan para determinar furiten.',
    ],
    practicePrompt: 'Mira primero qué honores y terminales ya salieron. Después compara esos descartes con las fichas que completarían tu mano.',
    actionLabel: 'Practicar furiten',
    route: 'practicar/furiten.html',
    hotspot: [360, 380, 136],
    focus: { boxes: [{ x: 240, y: 366, z: FELT, w: 120, d: 27, h: 15 }, { x: 240, y: 393, z: FELT, w: 47, d: 27, h: 15 }], zoom: 3.6 },
    callouts: [
      { label: 'Fila de 6', at: [361, 380, FELT + 7], dx: 56, dy: 40 },
      { label: 'Boca arriba, a la vista', at: [236, 372, FELT], dx: -40, dy: -50 },
    ],
  },
  {
    id: 'riichi',
    eyebrow: 'Declaración',
    title: 'Riichi: una ficha girada y un palito en el compass',
    shortTitle: 'Riichi',
    description: 'Cuando te falta una ficha para ganar y no has llamado fichas, puedes declarar riichi. Giras el descarte de ese turno y dejas un palito de 1000 puntos en tu ranura del compass.',
    observe: [
      'La ficha girada marca el turno en que declaraste.',
      'El palito queda en la ranura de tu lado del compass y se lo lleva quien gane la mano.',
      'Desde ese momento ya no puedes cambiar tu mano.',
    ],
    practicePrompt: 'Busca en los ríos de la mesa una ficha acostada: ese jugador está en riichi y te conviene defenderte.',
    actionLabel: 'Aprender defensa',
    route: 'aprender/defensa.html',
    hotspot: [253, 410, 136],
    focus: { boxes: [{ x: 240, y: 400, z: FELT, w: 27, d: 20, h: 15 }, { x: 277, y: 347.5, z: FELT, w: 46, d: 8, h: 10 }], zoom: 2.8 },
    callouts: [
      { label: 'Ficha girada', at: [238, 410, FELT + 6], dx: -60, dy: 40 },
      { label: 'Palito de 1000 en tu ranura del compass', at: [323, 352, FELT + 7], dx: -20, dy: 74 },
    ],
  },
  {
    id: 'puntos',
    eyebrow: 'Tu marcador',
    title: 'Los puntos se guardan en palitos, en tu cajón',
    shortTitle: 'Puntos',
    description: 'Cada jugador tiene un cajón bajo la mesa con sus palitos de puntos. Cuando alguien gana una mano, los palitos pasan de un cajón a otro.',
    observe: [
      'Cada valor tiene su propio compartimento.',
      'El palito de 1000 es el mismo que se apuesta al declarar riichi.',
      'Los palitos de 100 sirven para el honba y los pagos pequeños.',
    ],
    practicePrompt: 'Cuenta tu cajón: 1 de 10 000, 2 de 5 000, 9 de 1 000, 1 de 500 y 4 de 100.',
    actionLabel: 'Aprender puntajes',
    route: 'aprender/score.html',
    hotspot: [300, 702, 76],
    focus: { boxes: [{ x: 190, y: 598, z: 69, w: 220, d: 104, h: 23 }], zoom: 2.5 },
    callouts: [
      { label: '1 × 10 000', at: [204, 600, 90], dx: -20, dy: -70 },
      { label: '2 × 5 000', at: [228, 702, 92], dx: -50, dy: 56 },
      { label: '9 × 1 000', at: [290, 600, 90], dx: 10, dy: -84 },
      { label: '1 × 500', at: [348, 702, 92], dx: 20, dy: 66 },
      { label: '4 × 100', at: [382, 600, 90], dx: 44, dy: -56 },
    ],
  },
  {
    id: 'vientos',
    eyebrow: 'Orientación y ronda',
    title: 'El compass te dice quién es quién',
    shortTitle: 'Compass',
    description: 'El compass marca el viento de cada asiento: Este abajo (tú, el dealer), Sur a la derecha, Oeste arriba y Norte a la izquierda. Cada lado tiene su ranura para el palito de riichi. El viento de ronda lo indica la placa naranja junto al borde.',
    observe: [
      'Este es el dealer: juega y descarta primero.',
      'El turno avanza en sentido antihorario: Este, Sur, Oeste, Norte.',
      'El viento de asiento y el de ronda pueden dar yaku.',
    ],
    practicePrompt: 'Ubica tu asiento y luego el viento de ronda. Son dos datos diferentes y ambos pueden convertir un trío de viento en una mano válida.',
    actionLabel: 'Aprender los honores',
    route: 'aprender/tiles.html',
    hotspot: [300, 300, FELT + 8],
    focus: { boxes: [{ x: 240, y: 240, z: FELT, w: 120, d: 120, h: 6 }], zoom: 3 },
    callouts: [
      { label: 'Este: tú, el dealer', at: [300, 339, FELT + 6], dx: -100, dy: 30 },
      { label: 'Sur, a tu derecha', at: [339, 300, FELT + 6], dx: 60, dy: 50 },
      { label: 'Ranura vacía para el palito de riichi', at: [352, 277, FELT + 6], dx: 30, dy: -70 },
    ],
  },
  {
    id: 'ronda',
    eyebrow: 'Viento de ronda',
    title: 'La placa naranja marca la ronda',
    shortTitle: 'Ronda',
    description: 'Quien empieza como dealer deja la placa del viento de ronda pegada al borde de la mesa, a su derecha. Muestra 東 durante la ronda Este y se da vuelta a 南 cuando empieza la ronda Sur.',
    observe: [
      'La placa se queda junto al primer dealer toda la partida.',
      'Una partida completa (hanchan) juega la ronda Este y la ronda Sur.',
      'El viento de ronda puede dar yaku a cualquier jugador.',
    ],
    practicePrompt: 'Mira la placa: 東. Un trío de Este te da yaku por viento de ronda y, si tu asiento es Este, también por asiento.',
    actionLabel: 'Ver yaku de vientos',
    route: 'aprender/yaku-reference.html',
    hotspot: [551, 560, FELT + 6],
    focus: { boxes: [{ x: 534, y: 551, z: FELT, w: 34, d: 18, h: 6 }], zoom: 3 },
    callouts: [
      { label: 'Viento de ronda: Este', at: [534, 560, FELT + 3], dx: -90, dy: -50 },
      { label: 'Pegada al borde, a la derecha del dealer', at: [568, 568, FELT + 3], dx: -60, dy: 56 },
    ],
  },
];
