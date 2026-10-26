/* The special rules guide. */
import type { GuideEntry } from './guideTypes';

export const REGLAS_LIST: GuideEntry[] = [
  {
    "title": {
      "es": "Empate por muro agotado",
      "en": "Exhaustive draw",
      "pt": "Empate por muro esgotado"
    },
    "value": "fin de ronda",
    "glyph": "流",
    "es": "Cuando el muro se agota sin que nadie gane. Se comprueba quién está en tenpai o noten.",
    "en": "When the wall runs out with no win. Checks who is tenpai or noten.",
    "pt": "Quando o muro acaba sem vitória. Verifica quem está em tenpai ou noten.",
    "tiles": [],
    "note": ""
  },
  {
    "title": {
      "es": "Pagos tenpai / noten",
      "en": "Tenpai / noten payments",
      "pt": "Pagamentos tenpai / noten"
    },
    "value": "pagos",
    "glyph": "聴",
    "es": "En un empate, los que están tenpai cobran de los noten (típicamente 3000 de base).",
    "en": "In a draw, tenpai players collect from noten ones (typically 3000 base).",
    "pt": "No empate, quem está em tenpai recebe dos noten (normalmente 3000 de base).",
    "tiles": [],
    "note": ""
  },
  {
    "title": {
      "es": "Kyuushu kyuuhai",
      "en": "Kyuushu kyuuhai",
      "pt": "Kyuushu kyuuhai"
    },
    "value": "empate anulado",
    "glyph": "九",
    "es": "Nueve o más honores distintos al inicio: puedes declarar empate anulado.",
    "en": "Nine or more different honors at the start: you may declare an abortive draw.",
    "pt": "Nove ou mais honras distintas no início: pode declarar empate anulado.",
    "tiles": [],
    "note": ""
  },
  {
    "title": {
      "es": "Suufon renda",
      "en": "Suufon renda",
      "pt": "Suufon renda"
    },
    "value": "empate anulado",
    "glyph": "風",
    "es": "Los cuatro vientos se descartan como llamadas en el primer turno sin llamadas: empate.",
    "en": "All four winds discarded as calls on the first turn without calls: draw.",
    "pt": "Os quatro ventos descartados como chamadas no primeiro turno sem chamadas: empate.",
    "tiles": [],
    "note": ""
  },
  {
    "title": {
      "es": "Suucha riichi",
      "en": "Suucha riichi",
      "pt": "Suucha riichi"
    },
    "value": "empate anulado",
    "glyph": "四",
    "es": "Los cuatro jugadores declaran riichi en la misma ronda: empate anulado.",
    "en": "All four players declare riichi in the same round: abortive draw.",
    "pt": "Os quatro jogadores declaram riichi na mesma rodada: empate anulado.",
    "tiles": [],
    "note": ""
  },
  {
    "title": {
      "es": "Suukaikan",
      "en": "Suukaikan",
      "pt": "Suukaikan"
    },
    "value": "empate anulado",
    "glyph": "槓",
    "es": "Cuatro kan declarados en total entre los jugadores: empate.",
    "en": "Four kan total declared among the players: draw.",
    "pt": "Quatro kan declarados no total entre os jogadores: empate.",
    "tiles": [],
    "note": ""
  },
  {
    "title": {
      "es": "Chombo",
      "en": "Chombo",
      "pt": "Chombo"
    },
    "value": "penalización",
    "glyph": "罰",
    "es": "Error grave (mano ilegal o ron falso): se paga una penalización equivalente a un mangan y la ronda se reinicia.",
    "en": "Serious mistake (illegal hand or false ron): pays a mangan-level penalty and the round restarts.",
    "pt": "Erro grave (mão ilegal ou ron falso): paga penalidade de mangan e a rodada reinicia.",
    "tiles": [],
    "note": ""
  },
  {
    "title": {
      "es": "Pao",
      "en": "Pao",
      "pt": "Pao"
    },
    "value": "responsabilidad",
    "glyph": "包",
    "es": "Quien alimenta el kan o pon que permite un yakuman de tripletes paga por todos.",
    "en": "Whoever feeds the kan or pon that enables a triplet yakuman pays for everyone.",
    "pt": "Quem alimenta o kan ou pon que permite um yakuman de trios paga por todos.",
    "tiles": [],
    "note": "Raro, pero cambiar puntos de golpe."
  },
  {
    "title": {
      "es": "Doble ron",
      "en": "Double ron",
      "pt": "Ron duplo"
    },
    "value": "dos ganadores",
    "glyph": "双",
    "es": "Dos jugadores ronean el mismo descarte: el primero en orden cobra (o a veces ambos).",
    "en": "Two players ron the same discard: the first in order collects (or sometimes both).",
    "pt": "Dois jogadores ronam o mesmo descarte: o primeiro na ordem recebe (ou às vezes ambos).",
    "tiles": [],
    "note": ""
  },
  {
    "title": {
      "es": "Nagashi mangan",
      "en": "Nagashi mangan",
      "pt": "Nagashi mangan"
    },
    "value": "mangan especial",
    "glyph": "満",
    "es": "Si todos tus descartes son terminales/honores y nadie los llama, y no ganan, cobras mangan.",
    "en": "If all your discards are terminals/honors and nobody calls them, and nobody wins, you collect mangan.",
    "pt": "Se todos os seus descartes são terminais/honras e ninguém os chama, e ninguém vence, você recebe mangan.",
    "tiles": [],
    "note": ""
  },
  {
    "title": {
      "es": "Kuikae",
      "en": "Kuikae",
      "pt": "Kuikae"
    },
    "value": "restricción",
    "glyph": "替",
    "es": "No puedes llamar y descartar una ficha que cambia la misma secuencia recién llamada.",
    "en": "You cannot call and discard a tile that swaps the same sequence you just called.",
    "pt": "Não pode chamar e descartar uma peça que troca a mesma sequência recém-chamada.",
    "tiles": [],
    "note": ""
  },
  {
    "title": {
      "es": "Kuitan / Atozuke",
      "en": "Kuitan / Atozuke",
      "pt": "Kuitan / Atozuke"
    },
    "value": "variantes",
    "glyph": "断",
    "es": "Reglas según plataforma: kuitan permite tanyao abierto; atozuke exige yaku antes de la última ficha.",
    "en": "Rules vary by platform: kuitan allows open tanyao; atozuke requires yaku before the last tile.",
    "pt": "Regras variam por plataforma: kuitan permite tanyao aberto; atozuke exige yaku antes da última peça.",
    "tiles": [],
    "note": ""
  }
];
