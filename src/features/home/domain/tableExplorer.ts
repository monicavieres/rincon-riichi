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

export type TableCallout = {
  label: string;
  at: TablePoint;
  /** Which side of the dot the label sits on (default: right). */
  side?: 'left' | 'right';
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
  art: TableArt;
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
      'Cada asiento tiene un viento: Este, Sur, Oeste o Norte.',
      'El centro ordena los vientos y muestra la ronda actual.',
      'Muros, manos y descartes ocupan zonas distintas.',
    ],
    practicePrompt: 'Recorre los puntos de la mesa. No necesitas memorizarlo todo: primero ubica de dónde se roba, dónde se descarta y dónde miras la ronda.',
    actionLabel: 'Abrir tutorial desde cero',
    route: 'aprender/tutorial.html',
    hotspot: [585, 585, 122],
    focus: { boxes: [{ x: 0, y: 0, z: 92, w: 600, d: 600, h: 29 }], zoom: 1 },
    callouts: [
      { label: 'Sur · tu asiento', at: [180, 541, FELT + 27], side: 'left' },
      { label: 'Este', at: [541, 420, FELT + 27] },
      { label: 'Norte', at: [300, 58, FELT + 27] },
      { label: 'Oeste', at: [58, 300, FELT + 27], side: 'left' },
    ],
    art: 'mesa',
  },
  {
    id: 'muro',
    eyebrow: 'De aquí se roba',
    title: 'El muro guarda las fichas que todavía no entran en juego',
    shortTitle: 'El muro',
    description: 'Al comenzar se levantan cuatro lados. Normalmente robas una ficha del extremo abierto del muro y luego descartas una de tu mano.',
    observe: [
      'Cada lado se arma con 17 pilas de dos fichas: 34 fichas.',
      'Los cuatro lados suman las 136 fichas del juego.',
      'Una sección de 14 fichas queda reservada como muro muerto.',
    ],
    practicePrompt: 'Sigue un turno con la vista: roba del muro, lleva temporalmente 14 fichas y descarta para volver a 13.',
    actionLabel: 'Ver cómo se prepara la mesa',
    route: 'aprender/tutorial.html',
    hotspot: [483, 200, FELT + 30],
    focus: { boxes: [{ x: 470, y: 130, z: FELT, w: 27, d: 340, h: 30 }], zoom: 1.9 },
    callouts: [
      { label: '17 pilas de 2 fichas', at: [483, 160, FELT + 30] },
      { label: 'Muro muerto: 7 pilas', at: [483, 300, FELT + 30] },
      { label: 'Corte del muro', at: [483, 390, FELT + 30] },
      { label: 'Se roba desde aquí', at: [483, 440, FELT + 30] },
    ],
    art: 'muro',
  },
  {
    id: 'descartes',
    eyebrow: 'Información pública',
    title: 'Los descartes cuentan la historia de la mano',
    shortTitle: 'Descartes',
    description: 'Cada ficha descartada se deja boca arriba frente a quien la jugó. Se ordenan en filas de seis para que todos puedan leer la partida.',
    observe: [
      'Cada jugador mantiene su propio río de descartes.',
      'Un descarte girado puede señalar una declaración de riichi.',
      'Tus propios descartes importan para determinar furiten.',
    ],
    practicePrompt: 'Mira primero qué honores y terminales ya salieron. Después compara esos descartes con las fichas que completarían tu mano.',
    actionLabel: 'Practicar furiten',
    route: 'practicar/furiten.html',
    hotspot: [330, 393, FELT + 15],
    focus: { boxes: [{ x: 240, y: 366, z: FELT, w: 120, d: 54, h: 15 }, { x: 254, y: 350, z: FELT, w: 92, d: 9, h: 5 }], zoom: 2.6 },
    callouts: [
      { label: 'Fila de 6 descartes', at: [356, 372, FELT + 15] },
      { label: 'La 2ª fila sigue debajo', at: [262, 406, FELT + 15] },
      { label: 'Palito de riichi: 1000 pts', at: [258, 354, FELT + 5], side: 'left' },
    ],
    art: 'riichi',
  },
  {
    id: 'vientos',
    eyebrow: 'Orientación y ronda',
    title: 'El indicador central te dice quién es quién',
    shortTitle: 'Vientos',
    description: 'Tu viento de asiento cambia durante la partida. Este es el dealer; el viento de ronda, en cambio, es compartido por toda la mesa.',
    observe: [
      'Este juega y descarta primero.',
      'Los vientos avanzan cuando cambia el dealer.',
      'El viento de asiento y el de ronda pueden dar yaku.',
    ],
    practicePrompt: 'Ubica tu asiento y luego el viento de ronda. Son dos datos diferentes y ambos pueden convertir un trío de viento en una mano válida.',
    actionLabel: 'Aprender los honores',
    route: 'aprender/tiles.html',
    hotspot: [300, 300, FELT + 8],
    focus: { boxes: [{ x: 260, y: 260, z: FELT, w: 80, d: 80, h: 8 }], zoom: 2.8 },
    callouts: [
      { label: 'Viento de ronda: Este', at: [312, 306, FELT + 8] },
      { label: 'Puntos de cada jugador', at: [300, 319, FELT + 8], side: 'left' },
      { label: 'Dados para abrir el muro', at: [272, 277, FELT + 19], side: 'left' },
      { label: 'Luz del dealer', at: [300, 264, FELT + 8] },
    ],
    art: 'consola',
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
    hotspot: [300, 541, FELT + 27],
    focus: { boxes: [{ x: 170, y: 534, z: FELT, w: 260, d: 15, h: 27 }], zoom: 2.2 },
    callouts: [
      { label: '13 fichas en tu mano', at: [190, 541, FELT + 27] },
      { label: 'Robas la 14ª', at: [420, 541, FELT + 27] },
      { label: 'Descartas una al río', at: [330, 470, FELT + 30] },
    ],
    art: 'dados',
  },
];
