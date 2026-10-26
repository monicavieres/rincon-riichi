/* The defence guide. */
import type { GuideEntry } from './guideTypes';

export const DEFENSA_LIST: GuideEntry[] = [
  {
    "title": {
      "es": "Genbutsu",
      "en": "Genbutsu",
      "pt": "Genbutsu"
    },
    "value": "100% segura",
    "glyph": "現",
    "es": "Una ficha que ya está en los descartes del rival en tenpai: no puede ronearte por ella (furiten).",
    "en": "A tile already in the tenpai opponent's discards: they cannot ron it (furiten).",
    "pt": "Uma peça que já está nos descartes do adversário em tenpai: não pode roná-la (furiten).",
    "tiles": [],
    "note": "La ficha más segura que existe."
  },
  {
    "title": {
      "es": "Suji",
      "en": "Suji",
      "pt": "Suji"
    },
    "value": "probable segura",
    "glyph": "筋",
    "es": "Con 1-4-7, 2-5-8, 3-6-9: si el rival descartó el 4, es probable que no espere 1 o 7.",
    "en": "With 1-4-7, 2-5-8, 3-6-9: if the opponent discarded the 4, they likely don't wait on 1 or 7.",
    "pt": "Com 1-4-7, 2-5-8, 3-6-9: se o adversário descartou o 4, provavelmente não espera 1 ou 7.",
    "tiles": [
      "4m",
      "1m",
      "7m"
    ],
    "note": "Pista de seguridad por ryanmen."
  },
  {
    "title": {
      "es": "Kabe",
      "en": "Kabe",
      "pt": "Kabe"
    },
    "value": "cortar esperas",
    "glyph": "壁",
    "es": "Si ves 4 copias de una ficha, ciertas esperas (ej. 5 en 4-6) se vuelven imposibles.",
    "en": "If all 4 copies of a tile are visible, certain waits (e.g. 5 in 4-6) become impossible.",
    "pt": "Se as 4 cópias de uma peça estão visíveis, certas esperas (ex. 5 em 4-6) ficam impossíveis.",
    "tiles": [
      "5p",
      "5p",
      "4p",
      "6p"
    ],
    "note": ""
  },
  {
    "title": {
      "es": "One-chance",
      "en": "One-chance",
      "pt": "One-chance"
    },
    "value": "casi segura",
    "glyph": "一",
    "es": "Cuando una ficha que completa una espera enemiga se ve 3 veces (la última está contenida).",
    "en": "When a tile that completes an enemy wait is seen 3 times (the last one is contained).",
    "pt": "Quando uma peça que completa a espera inimiga aparece 3 vezes (a última está contida).",
    "tiles": [],
    "note": "Más segura que una ficha libre."
  },
  {
    "title": {
      "es": "Honores",
      "en": "Honors",
      "pt": "Honras"
    },
    "value": "seguros temprano",
    "glyph": "字",
    "es": "Los honores (vientos/dragones) suelen descartarse temprano y son relativamente seguros en defensa.",
    "en": "Honors (winds/dragons) are usually discarded early and are relatively safe when defending.",
    "pt": "Honras (ventos/dragões) costumam ser descartadas cedo e são relativamente seguras na defesa.",
    "tiles": [
      "1z",
      "2z",
      "3z"
    ],
    "note": ""
  },
  {
    "title": {
      "es": "Terminales",
      "en": "Terminals",
      "pt": "Terminais"
    },
    "value": "seguros temprano",
    "glyph": "端",
    "es": "Los 1 y 9 se descartan temprano; son seguros en las primeras rondas.",
    "en": "The 1s and 9s are discarded early; they are safe in the early rounds.",
    "pt": "Os 1 e 9 são descartados cedo; são seguros nas primeiras rodadas.",
    "tiles": [
      "1m",
      "9m"
    ],
    "note": ""
  },
  {
    "title": {
      "es": "El río de descartes",
      "en": "The river of discards",
      "pt": "O rio de descartes"
    },
    "value": "leer mesa",
    "glyph": "河",
    "es": "Los descartes de cada jugador revelan su mano: qué palos evita, qué grupos probables tiene.",
    "en": "Each player's discards reveal their hand: which suits they avoid, what groups they likely hold.",
    "pt": "Os descartes de cada jogador revelam sua mão: quais naipes evita, que grupos provavelmente tem.",
    "tiles": [],
    "note": ""
  },
  {
    "title": {
      "es": "Defender contra riichi",
      "en": "Defending against riichi",
      "pt": "Defender contra riichi"
    },
    "value": "fold",
    "glyph": "守",
    "es": "Cuando el rival declara riichi, prioriza descartar fichas seguras (genbutsu, suji, honores).",
    "en": "When the opponent declares riichi, prioritise discarding safe tiles (genbutsu, suji, honors).",
    "pt": "Quando o adversário declara riichi, priorize descartar peças seguras (genbutsu, suji, honras).",
    "tiles": [],
    "note": ""
  },
  {
    "title": {
      "es": "Estimar el peligro",
      "en": "Estimating danger",
      "pt": "Estimar o perigo"
    },
    "value": "probabilidad",
    "glyph": "危",
    "es": "Combina suji, kabe, one-chance y descartes para juzgar qué tan probable es dar ron.",
    "en": "Combine suji, kabe, one-chance and discards to judge how likely you are to deal in.",
    "pt": "Combine suji, kabe, one-chance e descartes para julgar a chance de dar ron.",
    "tiles": [],
    "note": "Defensa es probabilidad, no certeza."
  },
  {
    "title": {
      "es": "Push / Fold",
      "en": "Push / Fold",
      "pt": "Push / Fold"
    },
    "value": "decidir",
    "glyph": "押",
    "es": "Push = seguir atacando. Fold = abandonar y defender. Decides según valor de mano, turno y riesgo.",
    "en": "Push = keep attacking. Fold = give up and defend. You decide based on hand value, turn and risk.",
    "pt": "Push = continuar atacando. Fold = desistir e defender. Decida pelo valor da mão, turno e risco.",
    "tiles": [],
    "note": "La decisión clave en riichi."
  },
  {
    "title": {
      "es": "Genbutsu tardío",
      "en": "Late genbutsu",
      "pt": "Genbutsu tardio"
    },
    "value": "segura",
    "glyph": "遅",
    "es": "Las fichas seguras se agotan; los descartes de rondas previas también sirven como referencia.",
    "en": "Safe tiles run out; discards from earlier rounds also serve as reference.",
    "pt": "Peças seguras acabam; descartes de rodadas anteriores também servem de referência.",
    "tiles": [],
    "note": ""
  }
];
