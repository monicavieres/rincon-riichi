export type ExplorerTab = 'summary' | 'observe' | 'practice';

export type TableArt = 'mesa' | 'muro' | 'riichi' | 'dealer' | 'dados' | 'palitos' | 'consola';


export const tableArtPath = (art: TableArt, theme: 'light' | 'dark') => `assets/illustrations/${art}-${theme}.svg`;

/** A point on the table illustration, in the generator's table units (x, y on the felt, z up). */
export type TablePoint = [number, number, number];

/** An axis-aligned block on the table: a wall, a pond, a hand, the console. */
export type TableBox = { x: number; y: number; z: number; w: number; d: number; h: number };

export type TableFocus = {
  boxes: TableBox[];
  zoom: number;
};

/** A label tied to a point by a leader line; dx/dy is where the label sits, in screen px from the point. */
export type TableCallout = {
  label: string;
  at: TablePoint;
  dx: number;
  dy: number;
};

// Must match the viewBox that tools/design/generate-illustrations.py writes for mesa-*.svg.
const TABLE_VIEWBOX = { x: -527.6, y: -126, w: 1055.2, h: 694 };
const COS30 = Math.cos(Math.PI / 6);

/** Isometric projection of a table point into % of the illustration. */
export function projectToPercent([x, y, z]: TablePoint): [number, number] {
  const sx = (x - y) * COS30;
  const sy = (x + y) / 2 - z;
  return [((sx - TABLE_VIEWBOX.x) / TABLE_VIEWBOX.w) * 100, ((sy - TABLE_VIEWBOX.y) / TABLE_VIEWBOX.h) * 100];
}

/** Outline of a box as seen on screen: the convex hull of its eight projected corners. */
export function boxOutline({ x, y, z, w, d, h }: TableBox): Array<[number, number]> {
  const corners: Array<[number, number]> = [];
  for (const cx of [x, x + w]) for (const cy of [y, y + d]) for (const cz of [z, z + h]) corners.push(projectToPercent([cx, cy, cz]));
  const pts = corners.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: [number, number], a: [number, number], b: [number, number]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (seq: Array<[number, number]>) => {
    const out: Array<[number, number]> = [];
    for (const p of seq) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], p) <= 0) out.pop();
      out.push(p);
    }
    return out.slice(0, -1);
  };
  return [...half(pts), ...half([...pts].reverse())];
}

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

const FELT = 121;

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
    hotspot: [585, 585, 122],
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
      { label: '17 pilas por lado', at: [116, 140, FELT + 30], dx: -40, dy: -46 },
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
      { label: 'Indicador de dora', at: [483, 326, FELT + 30], dx: 70, dy: -54 },
      { label: 'Corte del muro', at: [483, 400, FELT], dx: 64, dy: 30 },
      { label: '7 pilas apartadas: 14 fichas', at: [483, 250, FELT + 30], dx: -30, dy: -96 },
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
      { label: '13 fichas, cara hacia ti', at: [220, 549, FELT + 20], dx: -40, dy: 54 },
      { label: 'Grupos de 3 + pareja', at: [330, 549, FELT + 20], dx: 30, dy: 58 },
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
    actionLabel: 'Practicar eficiencia',
    route: 'aprender/eficiencia.html',
    hotspot: [448, 541, 148],
    focus: { boxes: [{ x: 330, y: 534, z: FELT, w: 128, d: 15, h: 27 }], zoom: 3.2 },
    callouts: [
      { label: 'Ficha 14: la que robaste', at: [448, 549, FELT + 20], dx: 40, dy: 50 },
      { label: 'Eliges una para descartar', at: [360, 534, FELT + 27], dx: -60, dy: -56 },
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
      { label: 'Fila de 6', at: [350, 393, FELT + 15], dx: 56, dy: 40 },
      { label: 'Boca arriba, a la vista', at: [250, 366, FELT + 15], dx: -40, dy: -50 },
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
    focus: { boxes: [{ x: 240, y: 400, z: FELT, w: 27, d: 20, h: 15 }, { x: 270, y: 320, z: FELT, w: 60, d: 7, h: 10 }], zoom: 2.8 },
    callouts: [
      { label: 'Ficha girada', at: [240, 410, FELT + 15], dx: -60, dy: 40 },
      { label: 'Palito de 1000 en tu ranura del compass', at: [330, 323, FELT + 10], dx: 60, dy: -46 },
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
      { label: '1 × 10 000', at: [204, 612, 82], dx: -20, dy: -70 },
      { label: '2 × 5 000', at: [228, 690, 82], dx: -50, dy: 56 },
      { label: '9 × 1 000', at: [290, 612, 82], dx: 10, dy: -84 },
      { label: '1 × 500', at: [348, 690, 82], dx: 20, dy: 66 },
      { label: '4 × 100', at: [382, 612, 82], dx: 44, dy: -56 },
    ],
  },
  {
    id: 'vientos',
    eyebrow: 'Orientación y ronda',
    title: 'El compass te dice quién es quién',
    shortTitle: 'Compass',
    description: 'Tu viento de asiento cambia durante la partida. Este es el dealer; el viento de ronda, en cambio, es compartido por toda la mesa.',
    observe: [
      'Este es el dealer: juega y descarta primero.',
      'El turno avanza en sentido antihorario: Este, Sur, Oeste, Norte.',
      'El viento de asiento y el de ronda pueden dar yaku.',
    ],
    practicePrompt: 'Ubica tu asiento y luego el viento de ronda. Son dos datos diferentes y ambos pueden convertir un trío de viento en una mano válida.',
    actionLabel: 'Aprender los honores',
    route: 'aprender/tiles.html',
    hotspot: [300, 300, FELT + 8],
    focus: { boxes: [{ x: 246, y: 246, z: FELT, w: 108, d: 108, h: 8 }], zoom: 3.2 },
    callouts: [
      { label: 'Viento de ronda: Este', at: [300, 288, FELT + 9], dx: 110, dy: -40 },
      { label: 'Este: el dealer, luz encendida', at: [252.5, 300, FELT + 9], dx: -40, dy: -90 },
      { label: 'Tu asiento: Sur', at: [300, 349.5, FELT + 9], dx: -110, dy: 40 },
      { label: 'Ranura para el palito de riichi', at: [300, 276.5, FELT + 9], dx: 40, dy: -96 },
    ],
  },
];
