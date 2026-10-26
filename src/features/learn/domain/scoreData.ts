/* Score tables, limits and fu, as taught in the scoring guide. */
export const SCORE_UI = {
  "es": {
    "pageTitle": "Puntajes",
    "back": "← Volver",
    "language": "Idioma",
    "eyebrow": "Referencia rápida",
    "title": "Puntajes",
    "honbaLabel": "Honba",
    "honbaValue": "+300 Ron / +100 a cada rival en Tsumo",
    "honbaHelp": "La honba se suma después del puntaje base.",
    "tabDealer": "Dealer",
    "tabNonDealer": "No dealer",
    "tabFu": "Fu",
    "dealerTitle": "Dealer",
    "nonDealerTitle": "No dealer",
    "ron": "Ron",
    "tsumo": "Tsumo",
    "fu": "fu",
    "han": "han",
    "dealerAll": "",
    "nonDealerOrder": "",
    "limitTitle": "Límites",
    "limitHan": "Han",
    "empty": "—",
    "over70": "Más de 70 fu: combina valores con 50. Ej: 80 = 50 + 30, 90 = 50 + 40.",
    "fuTitle": "Tabla de fu",
    "fuHelp": "Fu son minipuntos. Suma, redondea hacia arriba a la decena siguiente y luego consulta el torpedo.",
    "fuBaseNoteTitle": "Todas las manos parten en 20 fu",
    "fuBaseNoteText": "Luego suma solo los bonos que realmente aplican y redondea hacia arriba.",
    "setHeaders": [
      "Tipo",
      "Simples 2–8",
      "Terminales / Honores"
    ]
  },
  "en": {
    "pageTitle": "Scores",
    "back": "← Back",
    "language": "Language",
    "eyebrow": "Quick reference",
    "title": "Scores",
    "honbaLabel": "Honba",
    "honbaValue": "+300 Ron / +100 from each opponent on Tsumo",
    "honbaHelp": "Honba is added after the base score.",
    "tabDealer": "Dealer",
    "tabNonDealer": "Non-dealer",
    "tabFu": "Fu",
    "dealerTitle": "Dealer",
    "nonDealerTitle": "Non-dealer",
    "ron": "Ron",
    "tsumo": "Tsumo",
    "fu": "fu",
    "han": "han",
    "dealerAll": "",
    "nonDealerOrder": "",
    "limitTitle": "Limits",
    "limitHan": "Han",
    "empty": "—",
    "over70": "Over 70 fu: combine values with 50. Ex: 80 = 50 + 30, 90 = 50 + 40.",
    "fuTitle": "Fu table",
    "fuHelp": "Fu are minipoints. Add, round up to the next ten, then check the torpedo.",
    "fuBaseNoteTitle": "Every hand starts at 20 fu",
    "fuBaseNoteText": "Then add only the bonuses that actually apply and round up.",
    "setHeaders": [
      "Type",
      "Simple 2–8",
      "Terminals / Honors"
    ]
  },
  "pt": {
    "pageTitle": "Pontuação",
    "back": "← Voltar",
    "language": "Idioma",
    "eyebrow": "Referência rápida",
    "title": "Pontuação",
    "honbaLabel": "Honba",
    "honbaValue": "+300 Ron / +100 de cada rival no Tsumo",
    "honbaHelp": "Honba é somada depois da pontuação base.",
    "tabDealer": "Dealer",
    "tabNonDealer": "Não-dealer",
    "tabFu": "Fu",
    "dealerTitle": "Dealer",
    "nonDealerTitle": "Não-dealer",
    "ron": "Ron",
    "tsumo": "Tsumo",
    "fu": "fu",
    "han": "han",
    "dealerAll": "",
    "nonDealerOrder": "",
    "limitTitle": "Limites",
    "limitHan": "Han",
    "empty": "—",
    "over70": "Mais de 70 fu: combine valores com 50. Ex: 80 = 50 + 30, 90 = 50 + 40.",
    "fuTitle": "Tabela de fu",
    "fuHelp": "Fu são minipontos. Some, arredonde para a próxima dezena e consulte o torpedo.",
    "fuBaseNoteTitle": "Toda mão começa com 20 fu",
    "fuBaseNoteText": "Depois some só os bônus que realmente se aplicam e arredonde para cima.",
    "setHeaders": [
      "Tipo",
      "Simples 2–8",
      "Terminais / Honras"
    ]
  }
} as const;

export const FU_COLUMNS: number[] = [20, 25, 30, 40, 50, 60, 70];
export type Cell = string | string[];
export const DEALER_MATRIX: Array<{ han: number; cells: Cell[] }> = [{"han": 1, "cells": ["", "", ["1,500", "500"], ["2,000", "700"], ["2,400", "800"], ["2,900", "1000"], ["3,400", "1200"]]}, {"han": 2, "cells": [["", "700"], ["2,400", "800"], ["2,900", "1000"], ["3,900", "1300"], ["4,800", "1600"], ["5,800", "2000"], ["6,800", "2300"]]}, {"han": 3, "cells": [["", "1300"], ["4,800", "1600"], ["5,800", "2000"], ["7,700", "2600"], ["9,600", "3200"], ["11,600", "3900"], ["12,000", "4000"]]}, {"han": 4, "cells": [["", "2600"], ["9,600", "3200"], ["11,600", "3900"], ["12,000", "4000"], ["12,000", "4000"], ["12,000", "4000"], ["12,000", "4000"]]}];
export const NON_DEALER_MATRIX: Array<{ han: number; cells: Cell[] }> = [{"han": 1, "cells": ["", "", ["1,000", "500/300"], ["1,300", "700/400"], ["1,600", "800/400"], ["2,000", "1000/500"], ["2,300", "1200/600"]]}, {"han": 2, "cells": [["", "700/400"], ["1,600", "800/400"], ["2,000", "1000/500"], ["2,600", "1300/700"], ["3,200", "1600/800"], ["3,900", "2000/1000"], ["4,500", "2300/1200"]]}, {"han": 3, "cells": [["", "1300/700"], ["3,200", "1600/800"], ["3,900", "2000/1000"], ["5,200", "2600/1300"], ["6,400", "3200/1600"], ["7,700", "3900/2000"], ["8,000", "4000/2000"]]}, {"han": 4, "cells": [["", "2600/1300"], ["6,400", "3200/1600"], ["7,700", "3900/2000"], ["8,000", "4000/2000"], ["8,000", "4000/2000"], ["8,000", "4000/2000"], ["8,000", "4000/2000"]]}];
export const LIMITS: Record<'dealer' | 'nonDealer', string[][]> = {"dealer": [["Mangan", "満貫", "5", "12,000", "4000"], ["Haneman", "跳満", "6–7", "18,000", "6000"], ["Baiman", "倍満", "8–10", "24,000", "8000"], ["Sanbaiman", "三倍満", "11–12", "36,000", "12000"], ["Yakuman", "役満", "13+", "48,000", "16000"]], "nonDealer": [["Mangan", "満貫", "5", "8,000", "4000/2000"], ["Haneman", "跳満", "6–7", "12,000", "6000/3000"], ["Baiman", "倍満", "8–10", "16,000", "8000/4000"], ["Sanbaiman", "三倍満", "11–12", "24,000", "12000/6000"], ["Yakuman", "役満", "13+", "32,000", "16000/8000"]]};
export type Tile = string | { id: string; side?: boolean; back?: boolean };
export type FuItem = { name: string; amount: string; description: { es: string; en: string; pt: string }; tiles: Tile[] };
export type FuSection = { id: string; title: { es: string; en: string; pt: string }; items: FuItem[] };
export const FU_SECTIONS: FuSection[] = [{"id": "base", "title": {"es": "Base y cierre", "en": "Base and win", "pt": "Base e vitória"}, "items": [{"name": "Ron cerrado", "amount": "+10", "description": {"es": "Si tu mano estaba cerrada y ganas por Ron.", "en": "Closed hand won by Ron.", "pt": "Mão fechada vencida por Ron."}, "tiles": ["6p"]}, {"name": "Tsumo", "amount": "+2", "description": {"es": "Ganar robando tu propia ficha.", "en": "Winning by drawing your own tile.", "pt": "Vencer comprando a própria peça."}, "tiles": ["7s"]}, {"name": "Chiitoitsu", "amount": "25 fijo", "description": {"es": "Siete pares usa 25 fu fijos.", "en": "Seven pairs uses fixed 25 fu.", "pt": "Sete pares usa 25 fu fixos."}, "tiles": ["1m", "1m", "3p", "3p"]}]}, {"id": "pairs", "title": {"es": "Pares que valen", "en": "Valuable pairs", "pt": "Pares que valem"}, "items": [{"name": "Par de dragón", "amount": "+2", "description": {"es": "Verde, rojo o blanco.", "en": "Green, red, or white dragon pair.", "pt": "Par de dragão verde, vermelho ou branco."}, "tiles": ["5z", "5z"]}, {"name": "Par de viento", "amount": "+2", "description": {"es": "Tu viento o el viento de ronda.", "en": "Your seat wind or the round wind.", "pt": "Seu vento ou o vento da rodada."}, "tiles": ["1z", "1z"]}, {"name": "Doble viento", "amount": "+4", "description": {"es": "Si tu viento y el viento de ronda son el mismo.", "en": "When seat wind and round wind match.", "pt": "Quando seu vento e o vento da rodada coincidem."}, "tiles": ["2z", "2z"]}]}, {"id": "waits", "title": {"es": "Esperas difíciles", "en": "Difficult waits", "pt": "Esperas difíceis"}, "items": [{"name": "Tanki", "amount": "+2", "description": {"es": "Esperas la ficha del par.", "en": "Waiting to complete the pair.", "pt": "Espera para completar o par."}, "tiles": ["3z"]}, {"name": "Kanchan", "amount": "+2", "description": {"es": "Esperas el centro de una secuencia.", "en": "Waiting for the middle tile.", "pt": "Espera pela peça do meio."}, "tiles": ["2m", "4m"]}, {"name": "Penchan", "amount": "+2", "description": {"es": "Esperas 3 con 1-2, o 7 con 8-9.", "en": "Waiting on 3 from 1-2, or 7 from 8-9.", "pt": "Espera 3 com 1-2, ou 7 com 8-9."}, "tiles": ["8p", "9p"]}]}, {"id": "sets", "title": {"es": "Conjuntos", "en": "Groups", "pt": "Conjuntos"}, "items": []}];
export type FuSetRow = { label: { es: string; en: string; pt: string }; simpleTiles: Tile[]; simpleFu: string; honorTiles: Tile[]; honorFu: string };
export const FU_SET_ROWS: FuSetRow[] = [{"label": {"es": "Pon abierto", "en": "Open pon", "pt": "Pon aberto"}, "simpleTiles": ["3p", "3p", {"id": "3p", "side": true}], "simpleFu": "2", "honorTiles": ["9m", "9m", {"id": "9m", "side": true}], "honorFu": "4"}, {"label": {"es": "Anko cerrado", "en": "Closed triplet", "pt": "Trio fechado"}, "simpleTiles": ["6s", "6s", "6s"], "simpleFu": "4", "honorTiles": ["6z", "6z", "6z"], "honorFu": "8"}, {"label": {"es": "Kan abierto", "en": "Open kan", "pt": "Kan aberto"}, "simpleTiles": ["4p", "4p", "4p", {"id": "4p", "side": true}], "simpleFu": "8", "honorTiles": ["1m", "1m", "1m", {"id": "1m", "side": true}], "honorFu": "16"}, {"label": {"es": "Kan cerrado", "en": "Closed kan", "pt": "Kan fechado"}, "simpleTiles": [{"id": "back", "back": true}, "8s", "8s", {"id": "back", "back": true}], "simpleFu": "16", "honorTiles": [{"id": "back", "back": true}, "5z", "5z", {"id": "back", "back": true}], "honorFu": "32"}];
