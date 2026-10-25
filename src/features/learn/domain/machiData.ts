/* The sixteen wait types (machi), as taught in the wait-types guide. */
export type MachiWait = { romaji: string; kanji: string; sides: string; fu: string; tiles: string; pattern: string[]; waits: string[]; es: string; en: string; pt: string; rare: boolean };

export const MACHI_WAITS: MachiWait[] = [
  {
    "romaji": "Ryanmen",
    "kanji": "両面",
    "sides": "2 lados",
    "fu": "0 fu",
    "tiles": "8 fichas",
    "pattern": [
      "4m",
      "5m"
    ],
    "waits": [
      "3m",
      "6m"
    ],
    "es": "Espera abierta a dos lados: dos fichas consecutivas que se completan por ambos extremos.",
    "en": "Open two-sided wait: two consecutive tiles that complete from either end.",
    "pt": "Espera aberta de dois lados: duas peças consecutivas completam dos dois lados.",
    "rare": false
  },
  {
    "romaji": "Shanpon",
    "kanji": "双碰",
    "sides": "2 lados",
    "fu": "0 fu",
    "tiles": "4 fichas",
    "pattern": [
      "2m",
      "2m",
      "5p",
      "5p"
    ],
    "waits": [
      "2m",
      "5p"
    ],
    "es": "Doble par: esperas en dos pares; cualquiera que se complete forma un trío.",
    "en": "Dual pair: waiting on two pairs; whichever completes forms a triplet.",
    "pt": "Par duplo: espera em dois pares; qualquer um vira um trio.",
    "rare": false
  },
  {
    "romaji": "Kanchan",
    "kanji": "嵌張",
    "sides": "1 lado",
    "fu": "2 fu",
    "tiles": "4 fichas",
    "pattern": [
      "4m",
      "6m"
    ],
    "waits": [
      "5m"
    ],
    "es": "Espera cerrada al medio: dos fichas separadas por una, esperas la del centro.",
    "en": "Closed middle wait: two tiles spaced by one, waiting on the middle tile.",
    "pt": "Espera fechada no meio: duas peças espaçadas por uma, espera a do centro.",
    "rare": false
  },
  {
    "romaji": "Penchan",
    "kanji": "辺張",
    "sides": "1 lado",
    "fu": "2 fu",
    "tiles": "4 fichas",
    "pattern": [
      "1m",
      "2m"
    ],
    "waits": [
      "3m"
    ],
    "es": "Espera al borde: solo 12 o 89, esperas únicamente la ficha del extremo.",
    "en": "Edge wait: only 12 or 89, waiting only on the terminal-end tile.",
    "pt": "Espera na borda: só 12 ou 89, espera apenas a peça do fim.",
    "rare": false
  },
  {
    "romaji": "Tanki",
    "kanji": "単騎",
    "sides": "1 lado",
    "fu": "2 fu",
    "tiles": "3 fichas",
    "pattern": [
      "5z"
    ],
    "waits": [
      "5z"
    ],
    "es": "Espera al par: cuatro grupos listos y una ficha suelta esperando emparejar.",
    "en": "Pair wait: four complete groups plus one lone tile to pair.",
    "pt": "Espera ao par: quatro grupos prontos e uma peça solta para formar o par.",
    "rare": false
  },
  {
    "romaji": "Nobetan",
    "kanji": "延べ単 / ノベタン",
    "sides": "2 lados",
    "fu": "2 fu",
    "tiles": "6 fichas",
    "pattern": [
      "2m",
      "3m",
      "4m",
      "5m"
    ],
    "waits": [
      "2m",
      "5m"
    ],
    "es": "Doble tanki: cuatro continuas; esperas en ambos extremos de la corrida.",
    "en": "Double tanki: four in a row; waits on both ends of the run.",
    "pt": "Tanki duplo: quatro seguidas; espera nas duas pontas da sequência.",
    "rare": false
  },
  {
    "romaji": "Sanmenchan",
    "kanji": "三面張",
    "sides": "3 lados",
    "fu": "0 fu",
    "tiles": "11 fichas",
    "pattern": [
      "2m",
      "3m",
      "4m",
      "5m",
      "6m"
    ],
    "waits": [
      "1m",
      "4m",
      "7m"
    ],
    "es": "Espera de tres lados: cinco continuas que dan tres fichas distintas de victoria.",
    "en": "Three-sided wait: five in a row giving three different winning tiles.",
    "pt": "Espera de três lados: cinco seguidas com três peças de vitória diferentes.",
    "rare": false
  },
  {
    "romaji": "Sanmentan",
    "kanji": "三面単",
    "sides": "3 lados",
    "fu": "2 fu",
    "tiles": "9 fichas",
    "pattern": [
      "1m",
      "2m",
      "3m",
      "4m",
      "5m",
      "6m",
      "7m"
    ],
    "waits": [
      "1m",
      "4m",
      "7m"
    ],
    "es": "Triple tanki: siete continuas, esperas en tres fichas a saltos.",
    "en": "Triple tanki: seven in a row, waiting on three every-three tiles.",
    "pt": "Tanki triplo: sete seguidas, espera em três peças espaçadas.",
    "rare": false
  },
  {
    "romaji": "Entotsu",
    "kanji": "煙突 / エントツ",
    "sides": "3 lados",
    "fu": "0 fu",
    "tiles": "7 fichas",
    "pattern": [
      "2p",
      "2p",
      "4s",
      "5s",
      "6s",
      "6s",
      "6s"
    ],
    "waits": [
      "2p",
      "3s",
      "6s"
    ],
    "es": "Ryanmen + shanpon: una secuencia abierta unida a un par, espera doble.",
    "en": "Ryanmen + shanpon: an open run fused to a pair, double wait.",
    "pt": "Ryanmen + shanpon: sequência aberta fundida a um par, espera dupla.",
    "rare": false
  },
  {
    "romaji": "Ryantan",
    "kanji": "両単",
    "sides": "3 lados",
    "fu": "0 o 2 fu",
    "tiles": "11 fichas",
    "pattern": [
      "4m",
      "5m",
      "5m",
      "5m"
    ],
    "waits": [
      "3m",
      "4m",
      "6m"
    ],
    "es": "Ryanmen + tanki alrededor de un trío oculto; espera en tres fichas.",
    "en": "Ryanmen + tanki around a concealed triplet; three-tile wait.",
    "pt": "Ryanmen + tanki em torno de um trio fechado; espera de três peças.",
    "rare": false
  },
  {
    "romaji": "Kantan",
    "kanji": "嵌単",
    "sides": "2 lados",
    "fu": "2 fu",
    "tiles": "7 fichas",
    "pattern": [
      "3m",
      "5m",
      "5m",
      "5m"
    ],
    "waits": [
      "3m",
      "4m"
    ],
    "es": "Kanchan + tanki: un trío oculto con hueco al medio y suelta al canto.",
    "en": "Kanchan + tanki: a concealed triplet with a middle gap and a lone edge.",
    "pt": "Kanchan + tanki: trio fechado com vão no meio e solta na ponta.",
    "rare": false
  },
  {
    "romaji": "Aryanmen",
    "kanji": "亜両面",
    "sides": "2 lados",
    "fu": "0 o 2 fu",
    "tiles": "6 fichas",
    "pattern": [
      "4m",
      "5m",
      "6m",
      "6m"
    ],
    "waits": [
      "3m",
      "6m"
    ],
    "es": "Pseudo-ryanmen: un extremo del ryanmen fundido al par, espera reducida.",
    "en": "Pseudo-ryanmen: one end of the ryanmen fused into the pair, reduced wait.",
    "pt": "Pseudo-ryanmen: uma ponta do ryanmen fundida ao par, espera reduzida.",
    "rare": false
  },
  {
    "romaji": "Pentan",
    "kanji": "辺単",
    "sides": "2 lados",
    "fu": "2 fu",
    "tiles": "7 fichas",
    "pattern": [
      "1m",
      "2m",
      "2m",
      "2m"
    ],
    "waits": [
      "1m",
      "3m"
    ],
    "es": "Penchan + tanki: borde fundido a un trío oculto.",
    "en": "Penchan + tanki: edge fused to a concealed triplet.",
    "pt": "Penchan + tanki: borda fundida a um trio fechado.",
    "rare": false
  },
  {
    "romaji": "Tatsumaki",
    "kanji": "竜巻",
    "sides": "5 lados",
    "fu": "0 o 2 fu",
    "tiles": "13 fichas",
    "pattern": [
      "4m",
      "4m",
      "4m",
      "5m",
      "6m",
      "6m",
      "6m"
    ],
    "waits": [
      "3m",
      "4m",
      "5m",
      "6m",
      "7m"
    ],
    "es": "Torbellino: combinación de dos ryantans espejados que abren una espera muy amplia. Rarísima.",
    "en": "Whirlwind: two mirrored ryantans forming a very wide wait. Extremely rare.",
    "pt": "Redemoinho: dois ryantans espelhados formando espera muito ampla. Extremamente rara.",
    "rare": true
  },
  {
    "romaji": "Happoubijin",
    "kanji": "八方美人",
    "sides": "8 lados",
    "fu": "0 o 2 fu",
    "tiles": "22 fichas",
    "pattern": [
      "2m",
      "2m",
      "2m",
      "3m",
      "4m",
      "5m",
      "6m",
      "7m",
      "7m",
      "7m"
    ],
    "waits": [
      "1m",
      "2m",
      "3m",
      "4m",
      "5m",
      "6m",
      "7m",
      "8m"
    ],
    "es": "Espera de ocho tipos: una belleza de ocho caras, casi imposible de leer.",
    "en": "Eight-tile wait: an eight-sided beauty, almost impossible to read.",
    "pt": "Espera de oito tipos: uma beleza de oito faces, quase impossível de ler.",
    "rare": true
  },
  {
    "romaji": "Hadaka tanki",
    "kanji": "裸単騎",
    "sides": "1 lado",
    "fu": "2 fu",
    "tiles": "3 fichas",
    "pattern": [
      "5z"
    ],
    "waits": [
      "5z"
    ],
    "es": "Tanki con la mano totalmente abierta (tras 4 llamadas): expone todo tu juego.",
    "en": "Fully-open tanki (after 4 calls): exposes your whole hand.",
    "pt": "Tanki com a mão totalmente aberta (após 4 chamadas): expõe todo o seu jogo.",
    "rare": false
  }
];
