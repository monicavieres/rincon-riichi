/* The dora guide: ten ideas, each with a short text and example tiles. */
export type Lang3 = { es: string; en: string; pt: string };
export type DoraEntry = { title: Lang3; value: Lang3; glyph: string; es: string; en: string; pt: string; tiles: string[]; note: string };

export const DORA_LIST: DoraEntry[] = [
  {
    "title": {
      "es": "Indicador de dora",
      "en": "Dora indicator",
      "pt": "Indicador de dora"
    },
    "value": {
      "es": "1 ficha levantada",
      "en": "1 tile flipped",
      "pt": "1 peça virada"
    },
    "glyph": "指",
    "es": "Ficha boca arriba al final del muro muerto. Marca cuál es la ficha dora.",
    "en": "Tile flipped up at the end of the dead wall. It marks which tile is the dora.",
    "pt": "Peça virada no final do muro morto. Marca qual é a peça dora.",
    "tiles": [
      "4m"
    ],
    "note": "El dora real es la ficha SIGUIENTE al indicador."
  },
  {
    "title": {
      "es": "El dora es el siguiente",
      "en": "Dora is the next one",
      "pt": "A dora é a seguinte"
    },
    "value": {
      "es": "suma han",
      "en": "adds han",
      "pt": "soma han"
    },
    "glyph": "次",
    "es": "Si el indicador es 4m, el dora es 5m (el siguiente número en el mismo palo).",
    "en": "If the indicator is 4m, the dora is 5m (the next number in the same suit).",
    "pt": "Se o indicador é 4m, a dora é 5m (o próximo número no mesmo naipe).",
    "tiles": [
      "4m",
      "5m"
    ],
    "note": "Cada copia de la ficha dora que tengas suma +1 han."
  },
  {
    "title": {
      "es": "El ciclo 9 → 1",
      "en": "The 9 → 1 cycle",
      "pt": "O ciclo 9 → 1"
    },
    "value": {
      "es": "suma han",
      "en": "adds han",
      "pt": "soma han"
    },
    "glyph": "循",
    "es": "Tras el 9 el ciclo vuelve al 1: indicador 9m → dora 1m.",
    "en": "After 9 the cycle wraps to 1: indicator 9m → dora 1m.",
    "pt": "Depois do 9 o ciclo volta ao 1: indicador 9m → dora 1m.",
    "tiles": [
      "9m",
      "1m"
    ],
    "note": ""
  },
  {
    "title": {
      "es": "El ciclo de vientos",
      "en": "The wind cycle",
      "pt": "O ciclo dos ventos"
    },
    "value": {
      "es": "suma han",
      "en": "adds han",
      "pt": "soma han"
    },
    "glyph": "風",
    "es": "Los vientos siguen Este → Sur → Oeste → Norte. Norte vuelve a Este.",
    "en": "Winds follow East → South → West → North. North wraps to East.",
    "pt": "Ventos seguem Leste → Sul → Oeste → Norte. Norte volta a Leste.",
    "tiles": [
      "1z",
      "2z",
      "3z",
      "4z"
    ],
    "note": ""
  },
  {
    "title": {
      "es": "El ciclo de dragones",
      "en": "The dragon cycle",
      "pt": "O ciclo dos dragões"
    },
    "value": {
      "es": "suma han",
      "en": "adds han",
      "pt": "soma han"
    },
    "glyph": "龍",
    "es": "El orden de dragones es verde → rojo → blanco (no vuelve).",
    "en": "The dragon order is green → red → white (it does not wrap).",
    "pt": "A ordem dos dragões é verde → vermelho → branco (não volta).",
    "tiles": [
      "5z",
      "6z",
      "7z"
    ],
    "note": ""
  },
  {
    "title": {
      "es": "Aka dora",
      "en": "Aka dora",
      "pt": "Aka dora"
    },
    "value": {
      "es": "5 rojo = +1",
      "en": "red 5 = +1",
      "pt": "5 vermelho = +1"
    },
    "glyph": "赤",
    "es": "Uno de los 5 de cada palo es rojo (aka). Cuenta como dora y es un 5.",
    "en": "One of the 5s in each suit is red (aka). It counts as dora and is a 5.",
    "pt": "Um dos 5 de cada naipe é vermelho (aka). Conta como dora e é um 5.",
    "tiles": [
      "0p"
    ],
    "note": "Se indica con 0 (0p, 0s, 0m)."
  },
  {
    "title": {
      "es": "Ura dora",
      "en": "Ura dora",
      "pt": "Ura dora"
    },
    "value": {
      "es": "tras riichi",
      "en": "after riichi",
      "pt": "após riichi"
    },
    "glyph": "裏",
    "es": "El dora oculto que se revela solo si ganas con riichi. Está debajo del dora indicator.",
    "en": "The hidden dora revealed only if you win with riichi. It sits under the dora indicator.",
    "pt": "A dora oculta revelada só se vencer com riichi. Fica sob o indicador.",
    "tiles": [],
    "note": "No es yaku; sin riichi no se ve."
  },
  {
    "title": {
      "es": "Kan dora",
      "en": "Kan dora",
      "pt": "Kan dora"
    },
    "value": {
      "es": "al hacer kan",
      "en": "when you kan",
      "pt": "ao fazer kan"
    },
    "glyph": "槓",
    "es": "Declarar un kan levanta una nueva ficha en el muro muerto y añade una dora extra.",
    "en": "Declaring a kan flips a new tile in the dead wall and adds an extra dora.",
    "pt": "Declarar um kan vira uma nova peça no muro morto e adiciona uma dora extra.",
    "tiles": [],
    "note": "Cada kan añade una nuevo indicador."
  },
  {
    "title": {
      "es": "El dora no es yaku",
      "en": "Dora is not a yaku",
      "pt": "A dora não é yaku"
    },
    "value": {
      "es": "no gana sin yaku",
      "en": "no win without yaku",
      "pt": "sem yaku não ganha"
    },
    "glyph": "役",
    "es": "El dora suma han PERO no cuenta como yaku: sin yaku real no puedes ganar aunque tengas dora.",
    "en": "Dora adds han BUT does not count as yaku: without a real yaku you cannot win even with dora.",
    "pt": "Dora soma han MAS não conta como yaku: sem yaku real não pode vencer mesmo com dora.",
    "tiles": [],
    "note": ""
  },
  {
    "title": {
      "es": "Contar el dora",
      "en": "Counting dora",
      "pt": "Contar a dora"
    },
    "value": {
      "es": "sumar han",
      "en": "add han",
      "pt": "somar han"
    },
    "glyph": "数",
    "es": "Cuenta cuántas copias de la ficha dora tienes en total (mano + melds) y sumalas al han.",
    "en": "Count how many copies of the dora tile you own in total (hand + melds) and add them to the han.",
    "pt": "Conte quantas cópias da peça dora você tem no total (mão + chamadas) e some ao han.",
    "tiles": [
      "5p",
      "5p",
      "5p"
    ],
    "note": "Tener 3 dora = +3 han."
  }
];
