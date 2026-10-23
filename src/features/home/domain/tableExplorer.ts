export type ExplorerTab = 'summary' | 'observe' | 'practice';

export type TableArt = 'mesa' | 'muro' | 'riichi' | 'dealer' | 'dados' | 'palitos' | 'consola';

export const tableArtPath = (art: TableArt, theme: 'light' | 'dark') => `assets/illustrations/${art}-${theme}.svg`;

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
  hotspot: { x: number; y: number };
  art: TableArt;
};

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
    hotspot: { x: 24.6, y: 26.4 },
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
    hotspot: { x: 65.1, y: 26.4 },
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
    hotspot: { x: 41.8, y: 51.2 },
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
    hotspot: { x: 50, y: 42.8 },
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
    hotspot: { x: 27, y: 58.4 },
    art: 'dados',
  },
];
